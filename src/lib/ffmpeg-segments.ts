/**
 * FFmpeg Segment Extraction — extract video clips by timecode.
 */

import { execFile } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface ExtractSegmentOptions {
  inputVideo: string
  inTime: number    // seconds
  outTime: number   // seconds
  outputPath: string
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`
}

/**
 * Extract a video segment using ffmpeg.
 * Uses -ss before -i for fast seeking, re-encodes to ensure clean cuts.
 */
export async function extractSegment(options: ExtractSegmentOptions): Promise<string> {
  await mkdir(path.dirname(options.outputPath), { recursive: true })

  const duration = options.outTime - options.inTime
  const args = [
    '-y',                              // overwrite
    '-ss', formatTime(options.inTime), // seek before input (fast)
    '-i', options.inputVideo,
    '-t', duration.toFixed(3),         // duration
    '-c:v', 'libx264',                // re-encode for clean cuts
    '-c:a', 'aac',
    '-preset', 'fast',
    '-crf', '18',                     // high quality
    '-movflags', '+faststart',
    options.outputPath,
  ]

  try {
    await execFileAsync('ffmpeg', args, { timeout: 120000 })
  } catch (err: any) {
    throw new Error(`FFmpeg segment extraction failed: ${err.stderr || err.message}`)
  }

  return options.outputPath
}

/**
 * Extract multiple segments from a single source video.
 */
export async function extractSegments(
  inputVideo: string,
  segments: Array<{ id: string; inTime: number; outTime: number }>,
  outputDir: string
): Promise<Array<{ id: string; path: string; duration: number }>> {
  await mkdir(outputDir, { recursive: true })

  const results: Array<{ id: string; path: string; duration: number }> = []

  for (const segment of segments) {
    const outputPath = path.join(outputDir, `${segment.id}.mp4`)
    await extractSegment({
      inputVideo,
      inTime: segment.inTime,
      outTime: segment.outTime,
      outputPath,
    })
    results.push({
      id: segment.id,
      path: outputPath,
      duration: segment.outTime - segment.inTime,
    })
  }

  return results
}
