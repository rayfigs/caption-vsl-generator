/**
 * Source video quality checker.
 *
 * Runs before the render pipeline and flags videos where:
 *   - The subject can't be reliably detected
 *   - Resolution is too low to hold up in the final output
 *   - The video is too blurry to be usable
 *   - The subject is off-centre even after best-effort reframing
 *
 * When issues are found the checker also returns a ranked list of
 * alternative asset strategies so the team has something actionable
 * to discuss or act on immediately.
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// ─── Types ────────────────────────────────────────────────────────────────────

export type QualitySeverity = 'pass' | 'warning' | 'fail'

export interface QualityIssue {
  code: string
  severity: QualitySeverity
  message: string
  detail?: string
}

export type AlternativeAssetType =
  | 'soundwave_caption'     // Animated waveform + captions on brand background
  | 'vo_recreation'         // ElevenLabs reads the transcript, motion graphics behind it
  | 'ai_face_disclaimer'    // AI-generated face sync with explicit "AI-enhanced" disclaimer
  | 'text_card'             // Quote card — no video, just animated typography
  | 'audio_photo_mix'       // Static photo (if available) + animated captions + audio

export interface AlternativeAsset {
  type: AlternativeAssetType
  label: string
  rationale: string
  /** Estimated effort to produce */
  effort: 'low' | 'medium' | 'high'
  /** Compliance note — some types need legal sign-off */
  complianceNote?: string
  /** Suggested CLI flags to kick off this path */
  cliHint?: string
}

export interface QualityReport {
  videoPath: string
  severity: QualitySeverity   // worst severity across all issues
  issues: QualityIssue[]
  metrics: {
    widthPx: number
    heightPx: number
    durationSec: number
    faceDetectedFrames: number   // out of SAMPLE_COUNT
    sampleCount: number
    medianFaceCenterX: number | null  // null if no faces found
    /** Laplacian variance — lower = blurrier. Rule of thumb: < 50 is blurry */
    blurScore: number | null
    /** Face bounding box as % of frame area (median across detected frames) */
    faceAreaPct: number | null
  }
  alternatives: AlternativeAsset[]
  /** Human-readable summary for Telegram / CLI output */
  summary: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_COUNT = 5
const MIN_WIDTH  = 720
const MIN_HEIGHT = 480
const MIN_BLUR_SCORE = 50        // Laplacian variance threshold
const MIN_FACE_AREA_PCT = 1.5    // face < 1.5% of frame = subject too small/far
const MIN_FACE_DETECTION_RATE = 0.4  // need faces in at least 2/5 frames

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getVideoInfo(filePath: string): Promise<{
  width: number; height: number; duration: number
}> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-show_entries', 'format=duration',
    '-of', 'json',
    filePath,
  ])
  const parsed = JSON.parse(stdout)
  return {
    width:    parsed.streams?.[0]?.width    ?? 0,
    height:   parsed.streams?.[0]?.height   ?? 0,
    duration: parseFloat(parsed.format?.duration ?? '0'),
  }
}

/**
 * Python script that:
 *   1. Samples SAMPLE_COUNT frames
 *   2. Runs Haar cascade face detection on each
 *   3. Returns face data + Laplacian blur score per frame
 */
const DETECTION_SCRIPT = `
import sys, json, subprocess, tempfile, os
import cv2
import numpy as np

video_path = sys.argv[1]
src_w      = int(sys.argv[2])
src_h      = int(sys.argv[3])
n_samples  = int(sys.argv[4])

cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

result = subprocess.run(
  ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
   '-of', 'csv=p=0', video_path],
  capture_output=True, text=True
)
duration = float(result.stdout.strip() or '10')

samples = []
sample_times = [duration * t for t in [0.1, 0.25, 0.5, 0.65, 0.8]][:n_samples]

with tempfile.TemporaryDirectory() as tmpdir:
  for i, t in enumerate(sample_times):
    fp = os.path.join(tmpdir, f'f{i}.jpg')
    subprocess.run(
      ['ffmpeg', '-ss', str(t), '-i', video_path,
       '-vframes', '1', '-q:v', '2', '-y', fp],
      capture_output=True
    )
    if not os.path.exists(fp):
      samples.append({'t': t, 'face': None, 'blur': None})
      continue

    img  = cv2.imread(fp)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Blur score: Laplacian variance — high = sharp, low = blurry
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Face detection with foreground filter (bottom 70% of frame)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
    fg_faces = [f for f in faces if (f[1] + f[3]/2) > src_h * 0.30]
    if not fg_faces and len(faces) > 0:
      fg_faces = list(faces)

    if fg_faces:
      def score(f):
        fx,fy,fw,fh = f
        cy_norm = abs((fy + fh/2) / src_h - 0.5)
        return fw*fh / (1 + cy_norm * 10)
      best = max(fg_faces, key=score)
      x, y, w, h = best
      samples.append({
        't':           t,
        'face': {
          'cx_frac':  (x + w/2) / src_w,
          'cy_frac':  (y + h/2) / src_h,
          'area_pct': (w * h) / (src_w * src_h) * 100,
        },
        'blur': blur_score,
      })
    else:
      samples.append({'t': t, 'face': None, 'blur': blur_score})

print(json.dumps({'samples': samples, 'duration': duration}))
`

// ─── Main export ─────────────────────────────────────────────────────────────

export async function assessVideoQuality(videoPath: string): Promise<QualityReport> {
  const { width, height, duration } = await getVideoInfo(videoPath)

  // Run Python detection + blur scoring
  const { stdout } = await execFileAsync(
    'python3',
    ['-c', DETECTION_SCRIPT, videoPath, String(width), String(height), String(SAMPLE_COUNT)],
    { timeout: 60_000 }
  )
  const parsed = JSON.parse(stdout.trim()) as {
    samples: Array<{
      t: number
      blur: number | null
      face: { cx_frac: number; cy_frac: number; area_pct: number } | null
    }>
    duration: number
  }

  const detectedFrames = parsed.samples.filter(s => s.face !== null)
  const blurScores     = parsed.samples.map(s => s.blur).filter((b): b is number => b !== null)
  const medianBlur     = blurScores.length
    ? blurScores.sort((a, b) => a - b)[Math.floor(blurScores.length / 2)]
    : null

  const faceAreas   = detectedFrames.map(s => s.face!.area_pct)
  const medianFaceArea = faceAreas.length
    ? faceAreas.sort((a, b) => a - b)[Math.floor(faceAreas.length / 2)]
    : null

  const faceCenterXs = detectedFrames.map(s => s.face!.cx_frac)
  const medianFaceX  = faceCenterXs.length
    ? faceCenterXs.sort((a, b) => a - b)[Math.floor(faceCenterXs.length / 2)]
    : null

  const detectionRate = detectedFrames.length / SAMPLE_COUNT

  // ── Build issues list ──────────────────────────────────────────────────────

  const issues: QualityIssue[] = []

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    issues.push({
      code: 'LOW_RESOLUTION',
      severity: 'warning',
      message: `Source resolution ${width}×${height} is below recommended ${MIN_WIDTH}×${MIN_HEIGHT}`,
      detail: 'The rendered portrait crop will be soft. Consider sourcing a higher-res file.',
    })
  }

  if (detectionRate === 0) {
    issues.push({
      code: 'NO_FACE_DETECTED',
      severity: 'fail',
      message: 'No face detected in any sampled frame',
      detail: 'The subject may be out of frame, facing away, or obscured. Auto-reframe will fall back to center crop which may not frame the subject well.',
    })
  } else if (detectionRate < MIN_FACE_DETECTION_RATE) {
    issues.push({
      code: 'LOW_FACE_DETECTION_RATE',
      severity: 'warning',
      message: `Face detected in ${detectedFrames.length}/${SAMPLE_COUNT} sampled frames`,
      detail: 'Subject may move in and out of frame or the camera angle is difficult. Crop may be unstable.',
    })
  }

  if (medianFaceArea !== null && medianFaceArea < MIN_FACE_AREA_PCT) {
    issues.push({
      code: 'SUBJECT_TOO_SMALL',
      severity: 'warning',
      message: `Subject occupies only ${medianFaceArea.toFixed(1)}% of the frame (minimum ${MIN_FACE_AREA_PCT}%)`,
      detail: 'Subject is too far from camera. After portrait crop they will appear very small on screen.',
    })
  }

  if (medianBlur !== null && medianBlur < MIN_BLUR_SCORE) {
    issues.push({
      code: 'VIDEO_BLURRY',
      severity: medianBlur < 20 ? 'fail' : 'warning',
      message: `Video sharpness score ${medianBlur.toFixed(0)} is below threshold ${MIN_BLUR_SCORE}`,
      detail: 'Video may be out of focus, compressed heavily, or captured on a low-quality camera.',
    })
  }

  if (medianFaceX !== null && (medianFaceX < 0.15 || medianFaceX > 0.85)) {
    issues.push({
      code: 'EXTREME_EDGE_FRAMING',
      severity: 'warning',
      message: `Subject center X is at ${(medianFaceX * 100).toFixed(0)}% of frame width — very close to edge`,
      detail: 'Even with face-centered crop, parts of the subject may be cut off.',
    })
  }

  // ── Determine overall severity ─────────────────────────────────────────────

  const severity: QualitySeverity = issues.some(i => i.severity === 'fail')
    ? 'fail'
    : issues.some(i => i.severity === 'warning')
      ? 'warning'
      : 'pass'

  // ── Build alternatives based on issues ────────────────────────────────────

  const alternatives = buildAlternatives(issues, severity)

  // ── Summary ───────────────────────────────────────────────────────────────

  const issueSummary = issues.length === 0
    ? 'No issues found.'
    : issues.map(i => `  [${i.severity.toUpperCase()}] ${i.message}`).join('\n')

  const altSummary = alternatives.length > 0
    ? `\nRecommended alternatives:\n` +
      alternatives.map(a => `  • ${a.label} (${a.effort} effort) — ${a.rationale}`).join('\n')
    : ''

  const summary = [
    `Quality check: ${severity.toUpperCase()} — ${path.basename(videoPath)}`,
    `Resolution: ${width}×${height} | Duration: ${duration.toFixed(1)}s`,
    `Face detection: ${detectedFrames.length}/${SAMPLE_COUNT} frames | Blur score: ${medianBlur?.toFixed(0) ?? 'n/a'}`,
    issueSummary,
    altSummary,
  ].join('\n')

  return {
    videoPath,
    severity,
    issues,
    metrics: {
      widthPx: width,
      heightPx: height,
      durationSec: duration,
      faceDetectedFrames: detectedFrames.length,
      sampleCount: SAMPLE_COUNT,
      medianFaceCenterX: medianFaceX,
      blurScore: medianBlur,
      faceAreaPct: medianFaceArea,
    },
    alternatives,
    summary,
  }
}

// ─── Alternative asset builder ────────────────────────────────────────────────

function buildAlternatives(issues: QualityIssue[], severity: QualitySeverity): AlternativeAsset[] {
  const alts: AlternativeAsset[] = []
  const codes = new Set(issues.map(i => i.code))

  // Always offer soundwave + caption — it works for any audio quality
  if (severity !== 'pass') {
    alts.push({
      type: 'soundwave_caption',
      label: 'Soundwave + animated captions',
      rationale: 'Plays the actual client audio with a live waveform visualisation and word-synced captions on a branded background. No face needed.',
      effort: 'low',
      cliHint: '--template soundwave-caption --transcriber whisper',
    })
  }

  // VO recreation — good when the audio is also poor
  if (codes.has('NO_FACE_DETECTED') || codes.has('VIDEO_BLURRY') || codes.has('LOW_RESOLUTION')) {
    alts.push({
      type: 'vo_recreation',
      label: 'VO recreation with motion graphics',
      rationale: 'An ElevenLabs voice reads the client\'s actual words. Pair with brand motion graphics and the transcript as captions. The testimonial is preserved verbatim.',
      effort: 'low',
      cliHint: '--template caption-vsl --transcriber elevenlabs --voice adam',
      complianceNote: 'Confirm with client that AI voice recreation of their words is approved. Add "voice recreated with client approval" if required.',
    })
  }

  // AI face disclaimer — when video exists but is low quality
  if (codes.has('LOW_RESOLUTION') || codes.has('VIDEO_BLURRY')) {
    alts.push({
      type: 'ai_face_disclaimer',
      label: 'AI-enhanced with disclaimer',
      rationale: 'Use an AI face-sync tool (e.g. HeyGen, D-ID) to up-res the testimonial with a generated face while keeping the actual client audio. Add an on-screen disclaimer.',
      effort: 'medium',
      complianceNote: 'Requires: explicit client consent, on-screen text such as "Original testimonial audio. Visual enhanced with AI." FTC guidelines apply for health/fitness claims.',
    })
  }

  // Text card — always an option, simplest fallback
  if (severity !== 'pass') {
    alts.push({
      type: 'text_card',
      label: 'Animated quote card',
      rationale: 'Pull the strongest quote from the transcript and build a motion graphic around it. No video, no face — just the words with brand styling.',
      effort: 'low',
      cliHint: '--template authority-dark --transcriber whisper',
    })
  }

  // Photo mix — suggest only if the issue is video-specific (not audio)
  if (codes.has('NO_FACE_DETECTED') || codes.has('EXTREME_EDGE_FRAMING')) {
    alts.push({
      type: 'audio_photo_mix',
      label: 'Static photo + audio + captions',
      rationale: 'Use a good photo of the client (from their intake form, social profile, or a quick photo shoot) as the background. Play the original audio with synced captions over it.',
      effort: 'medium',
      complianceNote: 'Ensure photo is approved for commercial use.',
    })
  }

  return alts
}
