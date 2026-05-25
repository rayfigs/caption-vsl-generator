/**
 * Layout verifier for Remotion compositions.
 *
 * How it works:
 *   1. Renders a low-resolution preview (25% scale, ~270×480) for one key frame
 *      per scene — fast, typically 10–20 seconds for the full showreel.
 *   2. Analyses each frame for bleed (content in the edge danger zone) and
 *      potential layer collisions (regions with unexpectedly high variance
 *      suggesting two overlapping elements).
 *   3. Exports a contact sheet (PNG grid) with safe-zone guides drawn over
 *      each frame so a human can scan it in one look.
 *   4. Returns a structured report usable by the CLI or Telegram bot.
 *
 * The contact sheet can be sent as a Telegram attachment for human sign-off
 * before the full-resolution render runs.
 */

import { execFile, spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'

const execFileAsync = promisify(execFile)

// ─── Types ────────────────────────────────────────────────────────────────────

export type LayoutIssueSeverity = 'ok' | 'warning' | 'error'

export interface LayoutIssue {
  code: string
  severity: LayoutIssueSeverity
  message: string
  /** Which edge or region triggered this */
  region?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right'
}

export interface SceneLayoutResult {
  sceneId: string
  frameNumber: number
  issues: LayoutIssue[]
  severity: LayoutIssueSeverity
  /** Path to the preview frame (before annotation) */
  framePath?: string
}

export interface LayoutReport {
  compositionId: string
  canvasWidth: number
  canvasHeight: number
  /** Preview scale used — 0.25 means 270×480 for a 1080×1920 canvas */
  previewScale: number
  scenes: SceneLayoutResult[]
  overallSeverity: LayoutIssueSeverity
  /** Path to the contact sheet PNG — send this to Telegram for human review */
  contactSheetPath?: string
  summary: string
}

export interface SceneKeyFrame {
  id: string
  /** Frame number within the full composition */
  frame: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Render at 25% scale for speed. 1080×1920 → 270×480. */
const PREVIEW_SCALE = 0.25

/**
 * Safe zone as a fraction of the FULL canvas.
 * These match the SAFE constants in showreel.config.ts.
 *   left/right: 44px out of 1080 = 4.1%
 *   top:        160px out of 1920 = 8.3%
 *   bottom:     300px out of 1920 = 15.6%
 */
const SAFE_FRAC = {
  top:    160 / 1920,
  bottom: 300 / 1920,
  left:   44  / 1080,
  right:  44  / 1080,
}

/**
 * How bright a pixel must be (0–255) to count as "non-background" content.
 * Dark navy background pixels score < 30; visible UI elements typically > 60.
 */
const CONTENT_BRIGHTNESS_THRESHOLD = 55

/**
 * Minimum fraction of pixels in a danger zone that must be "bright" before
 * we report a bleed warning. Low threshold catches real bleeds without
 * false-positives from gradient edges.
 */
const BLEED_PIXEL_FRACTION = 0.08

// ─── Python pixel analysis script ─────────────────────────────────────────────

/**
 * Given a frame image path, canvas size, and safe-zone fractions,
 * checks each edge danger zone for bright pixels and returns findings.
 */
const PIXEL_ANALYSIS_SCRIPT = `
import sys, json
import cv2
import numpy as np

frame_path = sys.argv[1]
canvas_w   = int(sys.argv[2])   # preview width (scaled)
canvas_h   = int(sys.argv[3])   # preview height (scaled)
top_frac   = float(sys.argv[4])
bot_frac   = float(sys.argv[5])
left_frac  = float(sys.argv[6])
right_frac = float(sys.argv[7])
threshold  = int(sys.argv[8])
min_frac   = float(sys.argv[9])

img  = cv2.imread(frame_path)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
h, w = gray.shape

top_px   = max(1, int(h * top_frac))
bot_px   = max(1, int(h * bot_frac))
left_px  = max(1, int(w * left_frac))
right_px = max(1, int(w * right_frac))

def bright_frac(region):
    bright = np.sum(region > threshold)
    return float(bright) / max(region.size, 1)

zones = {
  'top':   bright_frac(gray[:top_px, :]),
  'bottom':bright_frac(gray[h-bot_px:, :]),
  'left':  bright_frac(gray[:, :left_px]),
  'right': bright_frac(gray[:, w-right_px:]),
}

# Collision detection: divide the safe zone into a 4x8 grid,
# measure colour variance in each cell. High variance in a small
# cell suggests overlapping coloured elements.
collisions = []
safe_top  = top_px
safe_bot  = h - bot_px
safe_left = left_px
safe_right = w - right_px
grid_cols, grid_rows = 4, 8
cell_w = (safe_right - safe_left) // grid_cols
cell_h = (safe_bot   - safe_top)  // grid_rows
img_bgr = img  # use colour for collision detection
for row in range(grid_rows):
  for col in range(grid_cols):
    x0 = safe_left + col * cell_w
    y0 = safe_top  + row * cell_h
    cell = img_bgr[y0:y0+cell_h, x0:x0+cell_w]
    # High variance in hue channel = multiple saturated colours overlapping
    hsv  = cv2.cvtColor(cell, cv2.COLOR_BGR2HSV)
    hue  = hsv[:,:,0].astype(float)
    sat  = hsv[:,:,1].astype(float)
    # Only flag cells that have meaningful saturation (i.e. not just noise)
    if sat.mean() > 30 and hue.std() > 45:
      cx = (x0 + cell_w//2) / w
      cy = (y0 + cell_h//2) / h
      collisions.append({'cx': round(cx,2), 'cy': round(cy,2), 'hue_std': round(float(hue.std()),1)})

print(json.dumps({'zones': zones, 'collisions': collisions}))
`

// ─── Contact sheet builder ────────────────────────────────────────────────────

const CONTACT_SHEET_SCRIPT = `
import sys, json
import cv2
import numpy as np

data      = json.loads(sys.argv[1])  # { frames: [{path,label,issues},...], cols, out }
cols      = data['cols']
out_path  = data['out']
frame_infos = data['frames']

images = []
for fi in frame_infos:
    img = cv2.imread(fi['path'])
    if img is None:
        img = np.zeros((480,270,3), dtype=np.uint8)
    h, w = img.shape[:2]

    # Draw safe zone rectangle
    top_px   = int(h * float(data['safe_top']))
    bot_px   = int(h * float(data['safe_bot']))
    left_px  = int(w * float(data['safe_left']))
    right_px = int(w * float(data['safe_right']))
    color    = (0, 200, 0)  # green guide lines
    cv2.rectangle(img, (left_px, top_px), (w-right_px, h-bot_px), color, 1)

    # Issue indicator: red border if errors, orange if warnings
    severity = fi.get('severity', 'ok')
    if severity == 'error':
        cv2.rectangle(img, (0,0), (w-1,h-1), (0,0,255), 4)
    elif severity == 'warning':
        cv2.rectangle(img, (0,0), (w-1,h-1), (0,140,255), 3)

    # Label at bottom
    label = fi.get('label', '')
    cv2.rectangle(img, (0, h-22), (w, h), (0,0,0), -1)
    cv2.putText(img, label, (3, h-6), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255,255,255), 1)

    images.append(img)

# Pad to full grid
rows  = (len(images) + cols - 1) // cols
while len(images) < rows * cols:
    images.append(np.zeros_like(images[0]))

h0, w0 = images[0].shape[:2]
grid_rows = [np.hstack(images[i*cols:(i+1)*cols]) for i in range(rows)]
contact = np.vstack(grid_rows)
cv2.imwrite(out_path, contact)
print(f'Contact sheet written to {out_path} ({contact.shape[1]}x{contact.shape[0]})')
`

// ─── Main exports ─────────────────────────────────────────────────────────────

/**
 * Run a full layout verification pass for a Remotion composition.
 *
 * @param entryPoint  Path to the Remotion entry (src/index.ts)
 * @param compositionId  Which composition to check (e.g. 'AgencyShowreel')
 * @param scenes  Array of { id, frame } — one sample frame per scene
 * @param outputDir  Where to write preview frames + contact sheet
 */
export async function verifyLayout(options: {
  entryPoint: string
  compositionId: string
  scenes: SceneKeyFrame[]
  outputDir: string
}): Promise<LayoutReport> {
  const { entryPoint, compositionId, scenes, outputDir } = options

  await mkdir(outputDir, { recursive: true })

  process.stderr.write(`Layout verifier: bundling ${compositionId}...\n`)
  const serveUrl = await bundle({ entryPoint, webpackOverride: (c) => c })

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps: {},
  })

  const { width: canvasW, height: canvasH } = composition
  const previewW = Math.round(canvasW * PREVIEW_SCALE)
  const previewH = Math.round(canvasH * PREVIEW_SCALE)

  process.stderr.write(`Rendering ${scenes.length} preview frames at ${previewW}×${previewH}...\n`)

  // Render each key frame as a still
  const frameResults: SceneLayoutResult[] = []
  const frameInfos: Array<{ path: string; label: string; severity: string }> = []

  for (const scene of scenes) {
    const framePath = path.join(outputDir, `${scene.id}-f${scene.frame}.png`)

    try {
      await renderMedia({
        composition: { ...composition, durationInFrames: scene.frame + 1 },
        serveUrl,
        codec: 'png',
        outputLocation: framePath,
        scale: PREVIEW_SCALE,
        timeoutInMilliseconds: 60_000,
        inputProps: {},
        // Render only this single frame
        frameRange: [scene.frame, scene.frame],
      })
    } catch (err) {
      process.stderr.write(`  Warning: could not render frame ${scene.frame} for ${scene.id}: ${err}\n`)
      frameResults.push({
        sceneId: scene.id,
        frameNumber: scene.frame,
        issues: [{ code: 'RENDER_FAILED', severity: 'error', message: `Frame render failed: ${err}` }],
        severity: 'error',
      })
      frameInfos.push({ path: framePath, label: scene.id, severity: 'error' })
      continue
    }

    // Pixel analysis
    const { stdout } = await execFileAsync('python3', [
      '-c', PIXEL_ANALYSIS_SCRIPT,
      framePath,
      String(previewW), String(previewH),
      String(SAFE_FRAC.top),
      String(SAFE_FRAC.bottom),
      String(SAFE_FRAC.left),
      String(SAFE_FRAC.right),
      String(CONTENT_BRIGHTNESS_THRESHOLD),
      String(BLEED_PIXEL_FRACTION),
    ], { timeout: 15_000 })

    const analysis = JSON.parse(stdout.trim()) as {
      zones: Record<string, number>
      collisions: Array<{ cx: number; cy: number; hue_std: number }>
    }

    const issues: LayoutIssue[] = []

    // Check each danger zone
    for (const [edge, frac] of Object.entries(analysis.zones) as Array<[string, number]>) {
      if (frac > BLEED_PIXEL_FRACTION) {
        issues.push({
          code: 'BLEED',
          severity: frac > 0.25 ? 'error' : 'warning',
          message: `Content in ${edge} danger zone (${(frac * 100).toFixed(0)}% of zone pixels are bright)`,
          region: edge as LayoutIssue['region'],
        })
      }
    }

    // Check collision candidates
    if (analysis.collisions.length >= 3) {
      issues.push({
        code: 'LAYER_COLLISION',
        severity: 'warning',
        message: `${analysis.collisions.length} grid cells show mixed hues — possible overlapping elements`,
        region: analysis.collisions[0]?.cy > 0.7 ? 'bottom' : 'bottom-left',
      })
    }

    const severity: LayoutIssueSeverity = issues.some(i => i.severity === 'error')
      ? 'error'
      : issues.some(i => i.severity === 'warning')
        ? 'warning'
        : 'ok'

    frameResults.push({
      sceneId: scene.id,
      frameNumber: scene.frame,
      issues,
      severity,
      framePath,
    })

    frameInfos.push({ path: framePath, label: scene.id, severity })
    process.stderr.write(`  ${scene.id}: ${severity} (${issues.length} issue${issues.length !== 1 ? 's' : ''})\n`)
  }

  // Generate contact sheet
  const contactSheetPath = path.join(outputDir, 'layout-review.png')
  try {
    const sheetData = JSON.stringify({
      frames: frameInfos,
      cols: 3,
      out: contactSheetPath,
      safe_top:   SAFE_FRAC.top,
      safe_bot:   SAFE_FRAC.bottom,
      safe_left:  SAFE_FRAC.left,
      safe_right: SAFE_FRAC.right,
    })
    const { stdout: sheetOut } = await execFileAsync('python3', ['-c', CONTACT_SHEET_SCRIPT, sheetData], {
      timeout: 30_000,
    })
    process.stderr.write(`  ${sheetOut.trim()}\n`)
  } catch (err) {
    process.stderr.write(`  Contact sheet generation failed: ${err}\n`)
  }

  // Overall severity
  const overallSeverity: LayoutIssueSeverity = frameResults.some(r => r.severity === 'error')
    ? 'error'
    : frameResults.some(r => r.severity === 'warning')
      ? 'warning'
      : 'ok'

  // Summary text
  const errorScenes   = frameResults.filter(r => r.severity === 'error').map(r => r.sceneId)
  const warningScenes = frameResults.filter(r => r.severity === 'warning').map(r => r.sceneId)

  const summaryLines = [
    `Layout review: ${overallSeverity.toUpperCase()} — ${compositionId}`,
    `${scenes.length} scenes checked at ${PREVIEW_SCALE * 100}% preview scale`,
  ]
  if (errorScenes.length)   summaryLines.push(`  ERRORS:   ${errorScenes.join(', ')}`)
  if (warningScenes.length) summaryLines.push(`  WARNINGS: ${warningScenes.join(', ')}`)
  if (overallSeverity === 'ok') summaryLines.push('  All scenes within safe zones. Ready to render.')
  if (contactSheetPath) summaryLines.push(`  Contact sheet: ${contactSheetPath}`)

  return {
    compositionId,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
    previewScale: PREVIEW_SCALE,
    scenes: frameResults,
    overallSeverity,
    contactSheetPath,
    summary: summaryLines.join('\n'),
  }
}
