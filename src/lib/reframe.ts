/**
 * Auto-reframe: converts landscape video to portrait (9:16) using FFmpeg.
 *
 * Strategy:
 * - Crops to 9:16 aspect ratio from the landscape source
 * - Default: center-biased crop with a slight upward bias (faces tend to sit
 *   above center in talking-head footage)
 * - Optional face-centering: uses FFmpeg's facedetect filter when available
 *   to dynamically track the subject across the clip
 *
 * Usage (CLI): tsx src/cli.ts reframe --input clip.mp4 --output clip-portrait.mp4
 * Usage (code): await reframeToPortrait({ input, output })
 */

import { execFile } from 'node:child_process'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface ReframeOptions {
  /** Source video — any landscape MP4 */
  input: string
  /** Output path for the portrait MP4 */
  output: string
  /**
   * Target aspect ratio. Default: 9/16 (portrait).
   * Pass 1 for square, or any custom ratio (width/height).
   */
  targetRatio?: number
  /**
   * Vertical crop bias: 0 = centered, positive = shift up, negative = shift down.
   * Default: 0.1 (slight upward bias — keeps faces in frame for talking-head clips).
   */
  verticalBias?: number
  /**
   * Use OpenCV face detection to center the crop on the subject's face.
   * Samples 5 frames from the video, takes the median face center X, and
   * uses that as the crop center instead of the frame's geometric center.
   * Default: true (skips if OpenCV isn't available, falls back to center crop).
   */
  useFaceDetect?: boolean
  /** Overwrite output file if it exists. Default: true */
  overwrite?: boolean
}

export interface ReframeResult {
  outputPath: string
  inputWidth: number
  inputHeight: number
  cropWidth: number
  cropHeight: number
  cropX: number
  cropY: number
}

/**
 * Get video dimensions using ffprobe.
 */
async function getVideoDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=s=x:p=0',
    filePath,
  ])
  const [w, h] = stdout.trim().split('x').map(Number)
  if (!w || !h) {
    throw new Error(`Could not read dimensions from ${path.basename(filePath)}`)
  }
  return { width: w, height: h }
}

/**
 * Detect the horizontal center of the main face in a video using OpenCV.
 *
 * Extracts 5 frames spread across the middle of the video, runs Haar cascade
 * face detection on each, and returns the median face center X position
 * (as a 0–1 fraction of the frame width).
 *
 * Falls back to 0.5 (true center) if no faces are detected or OpenCV fails.
 */
async function detectFaceCenterX(videoPath: string, srcW: number, srcH: number): Promise<number> {
  const script = `
import sys, json, subprocess, tempfile, os
import cv2
import numpy as np

video_path = sys.argv[1]
src_w = int(sys.argv[2])
src_h = int(sys.argv[3])

cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Get video duration via ffprobe
result = subprocess.run(
  ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video_path],
  capture_output=True, text=True
)
duration = float(result.stdout.strip() or '10')

# Sample 5 frames from the middle 60% of the video
centers_x = []
sample_times = [duration * t for t in [0.2, 0.35, 0.5, 0.65, 0.8]]

with tempfile.TemporaryDirectory() as tmpdir:
  for i, t in enumerate(sample_times):
    frame_path = os.path.join(tmpdir, f'frame_{i}.jpg')
    subprocess.run(
      ['ffmpeg', '-ss', str(t), '-i', video_path, '-vframes', '1', '-q:v', '2', '-y', frame_path],
      capture_output=True
    )
    if not os.path.exists(frame_path):
      continue
    img = cv2.imread(frame_path)
    if img is None:
      continue
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
    if len(faces) > 0:
      # Filter out background false positives: reject faces whose vertical center
      # is in the top 30% of the frame. Testimonial subjects sitting/standing
      # close to camera always have their face in the lower 70% of a landscape frame.
      fg_faces = [f for f in faces if (f[1] + f[3]/2) > src_h * 0.30]
      if not fg_faces:
        fg_faces = list(faces)  # nothing passed filter, use all
      # Among foreground candidates, prefer the one closest to vertical center of frame
      def face_score(f):
        fx, fy, fw, fh = f
        center_y_norm = abs((fy + fh/2) / src_h - 0.5)  # distance from frame vertical center
        return fw * fh / (1 + center_y_norm * 10)  # bigger + closer to center wins
      largest = max(fg_faces, key=face_score)
      x, y, w, h = largest
      center_x = (x + w / 2) / src_w
      centers_x.append(center_x)

if centers_x:
  result_x = float(np.median(centers_x))
  print(json.dumps({"faceX": result_x, "samples": len(centers_x)}))
else:
  print(json.dumps({"faceX": 0.5, "samples": 0}))
`

  try {
    const { stdout } = await execFileAsync('python3', ['-c', script, videoPath, String(srcW), String(srcH)], {
      timeout: 30_000,
    })
    const parsed = JSON.parse(stdout.trim())
    process.stderr.write(`Face detection: center_x=${parsed.faceX.toFixed(3)} from ${parsed.samples} samples\n`)
    return parsed.faceX as number
  } catch (err) {
    process.stderr.write(`Face detection failed, falling back to center: ${err}\n`)
    return 0.5
  }
}

/**
 * Reframe a landscape video to portrait using FFmpeg crop.
 */
export async function reframeToPortrait(options: ReframeOptions): Promise<ReframeResult> {
  const {
    input,
    output,
    targetRatio = 9 / 16,
    verticalBias = 0.1,
    useFaceDetect = true,
    overwrite = true,
  } = options

  // Check input exists
  await stat(input)

  await mkdir(path.dirname(output), { recursive: true })

  // Skip if output already exists and overwrite is off
  if (!overwrite) {
    try {
      await stat(output)
      process.stderr.write(`Reframe output already exists, skipping: ${output}\n`)
      const { width, height } = await getVideoDimensions(input)
      const cropWidth = Math.floor(height * targetRatio)
      return {
        outputPath: output,
        inputWidth: width,
        inputHeight: height,
        cropWidth,
        cropHeight: height,
        cropX: Math.floor((width - cropWidth) / 2),
        cropY: 0,
      }
    } catch {}
  }

  const { width: srcW, height: srcH } = await getVideoDimensions(input)

  // Calculate crop dimensions
  // Portrait target: height stays the same, width = height * targetRatio
  const cropW = Math.floor(srcH * targetRatio)
  const cropH = srcH

  if (cropW > srcW) {
    throw new Error(
      `Input video (${srcW}x${srcH}) is too narrow to crop to ${targetRatio.toFixed(2)} ratio. ` +
      `Need at least ${cropW}px wide.`
    )
  }

  // X: use OpenCV face detection to find where the subject actually sits in the frame.
  // Falls back to geometric center (0.5) if detection fails or is disabled.
  let faceCenterFraction = 0.5
  if (useFaceDetect) {
    faceCenterFraction = await detectFaceCenterX(input, srcW, srcH)
  }
  const faceCenterPx = Math.round(srcW * faceCenterFraction)
  const cropX = Math.max(0, Math.min(srcW - cropW, faceCenterPx - Math.floor(cropW / 2)))

  // Y: apply vertical bias (positive = shift crop window up)
  const biasPixels = Math.floor(srcH * verticalBias)
  const cropY = Math.max(0, Math.min(srcH - cropH, 0 - biasPixels))

  const result: ReframeResult = {
    outputPath: output,
    inputWidth: srcW,
    inputHeight: srcH,
    cropWidth: cropW,
    cropHeight: cropH,
    cropX,
    cropY,
  }

  const vf = `crop=${cropW}:${cropH}:${cropX}:${cropY}`

  process.stderr.write(
    `Reframing ${path.basename(input)} (${srcW}x${srcH}) → portrait (${cropW}x${cropH})...\n`
  )

  const ffmpegArgs = [
    '-i', input,
    '-vf', vf,
    '-c:a', 'aac',        // re-encode audio for compatibility
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-g', '30',           // keyframe every second (at 30fps) — required for fast random
                          // access when OffthreadVideo seeks to arbitrary timestamps
    '-keyint_min', '30',
    '-sc_threshold', '0', // disable scene-change keyframes so interval is consistent
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    ...(overwrite ? ['-y'] : ['-n']),
    output,
  ]

  const { stderr } = await execFileAsync('ffmpeg', ffmpegArgs)
  if (stderr && stderr.includes('Error')) {
    throw new Error(`FFmpeg error during reframe: ${stderr}`)
  }

  process.stderr.write(`Reframe done: ${output}\n`)
  return result
}
