/**
 * EDL Generator — produces render-ready job lists from analyzed segments.
 */

import path from 'node:path'
import type { EDL, AnalyzedSegment } from './segment-analyzer'

export interface RenderJob {
  segmentId: string
  sourceVideo: string
  inTime: number
  outTime: number
  duration: number
  template: string
  brand: string
  canvas: 'portrait' | 'square' | 'landscape'
  outputPath: string
  isHook: boolean
  text: string
  score: number
}

export interface RenderJobOptions {
  template: string
  brand: string
  canvas: 'portrait' | 'square' | 'landscape'
  outputDir: string
  maxSegments?: number
  targetDuration?: number    // filter to segments close to this duration (+/- 10s)
  prefix?: string            // filename prefix (default: segment ID)
}

/**
 * Generate render jobs from an EDL.
 * Each job represents one segment ready to be rendered as a standalone video.
 */
export function generateRenderJobs(edl: EDL, options: RenderJobOptions): RenderJob[] {
  let segments = [...edl.segments]

  // Filter by target duration if specified
  if (options.targetDuration) {
    const target = options.targetDuration
    const tolerance = 10 // +/- 10 seconds
    segments = segments.filter(s =>
      s.duration >= target - tolerance && s.duration <= target + tolerance
    )
  }

  // Limit count
  if (options.maxSegments && segments.length > options.maxSegments) {
    segments = segments.slice(0, options.maxSegments)
  }

  const prefix = options.prefix || ''

  return segments.map(segment => {
    const fileName = prefix
      ? `${prefix}_${segment.id}_${options.template}.mp4`
      : `${segment.id}_${options.template}.mp4`

    return {
      segmentId: segment.id,
      sourceVideo: edl.sourceVideo,
      inTime: segment.inTime,
      outTime: segment.outTime,
      duration: segment.duration,
      template: options.template,
      brand: options.brand,
      canvas: options.canvas,
      outputPath: path.join(options.outputDir, fileName),
      isHook: segment.id === edl.recommendedHookId,
      text: segment.text,
      score: segment.score.overall,
    }
  })
}

/**
 * Export an EDL as a JSON file for inspection or later use.
 */
export function serializeEDL(edl: EDL): string {
  return JSON.stringify(edl, null, 2)
}

/**
 * Print a human-readable summary of an EDL.
 */
export function formatEDLSummary(edl: EDL): string {
  const lines: string[] = [
    `Source: ${path.basename(edl.sourceVideo)}`,
    `Total duration: ${formatDuration(edl.totalDuration)}`,
    `Segments: ${edl.segments.length}`,
    `Analyzed: ${edl.analyzedAt}`,
    '',
    'ID       | Time           | Score | Hook | Tags',
    '---------|----------------|-------|------|-----',
  ]

  for (const seg of edl.segments) {
    const isHook = seg.id === edl.recommendedHookId ? '  *' : '   '
    const time = `${formatDuration(seg.inTime)} - ${formatDuration(seg.outTime)}`
    const tags = seg.tags.slice(0, 3).join(', ')
    lines.push(`${seg.id} | ${time.padEnd(14)} | ${seg.score.overall.toFixed(1).padStart(5)} |${isHook} | ${tags}`)
  }

  lines.push('')
  lines.push(`Hook: ${edl.recommendedHookId}`)

  const hookSeg = edl.segments.find(s => s.id === edl.recommendedHookId)
  if (hookSeg) {
    lines.push(`  "${hookSeg.hookSentence}"`)
  }

  return lines.join('\n')
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
