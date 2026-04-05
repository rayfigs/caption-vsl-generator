/**
 * Batch Render — render multiple segments from an EDL sequentially.
 */

import { extractSegment } from './ffmpeg-segments'
import { renderCaptionVSL } from '../../render'
import type { RenderJob } from './edl-generator'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

export interface BatchRenderResult {
  completed: Array<{ segmentId: string; outputPath: string; duration: number }>
  failed: Array<{ segmentId: string; error: string }>
  totalDuration: number
  totalTime: number
}

/**
 * Render all jobs from a render job list.
 * For each job:
 * 1. Extract the video segment via ffmpeg
 * 2. Run the caption VSL pipeline on the segment
 * 3. Track success/failure
 */
export async function batchRender(
  jobs: RenderJob[],
  options?: {
    onProgress?: (completed: number, total: number, segmentId: string) => void
    segmentsDir?: string  // where to store extracted segments (default: alongside output)
  }
): Promise<BatchRenderResult> {
  const startTime = Date.now()
  const completed: BatchRenderResult['completed'] = []
  const failed: BatchRenderResult['failed'] = []

  const segmentsDir = options?.segmentsDir || path.join(path.dirname(jobs[0]?.outputPath || '.'), '_segments')
  await mkdir(segmentsDir, { recursive: true })

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]
    options?.onProgress?.(i, jobs.length, job.segmentId)

    try {
      // Step 1: Extract segment from source video
      const segmentPath = path.join(segmentsDir, `${job.segmentId}.mp4`)
      process.stderr.write(`[${i + 1}/${jobs.length}] Extracting ${job.segmentId} (${job.duration.toFixed(1)}s)...\n`)

      await extractSegment({
        inputVideo: job.sourceVideo,
        inTime: job.inTime,
        outTime: job.outTime,
        outputPath: segmentPath,
      })

      // Step 2: Render with caption overlay
      process.stderr.write(`[${i + 1}/${jobs.length}] Rendering ${job.segmentId} with ${job.template}...\n`)

      await renderCaptionVSL({
        transcript: '', // not needed in whisper mode
        templateId: job.template,
        voiceId: '',    // not needed in whisper mode
        outputPath: job.outputPath,
        canvas: job.canvas,
        brandName: job.brand,
        inputVideo: segmentPath,
        transcriber: 'whisper',
        autoReframe: job.canvas === 'portrait',
      })

      completed.push({
        segmentId: job.segmentId,
        outputPath: job.outputPath,
        duration: job.duration,
      })

      process.stderr.write(`[${i + 1}/${jobs.length}] ${job.segmentId} complete ✓\n`)
    } catch (err: any) {
      const errorMsg = err.message || String(err)
      failed.push({ segmentId: job.segmentId, error: errorMsg })
      process.stderr.write(`[${i + 1}/${jobs.length}] ${job.segmentId} FAILED: ${errorMsg}\n`)
    }
  }

  const totalDuration = completed.reduce((sum, c) => sum + c.duration, 0)
  const totalTime = (Date.now() - startTime) / 1000

  process.stderr.write(`\nBatch complete: ${completed.length}/${jobs.length} rendered, ${totalDuration.toFixed(0)}s of video in ${totalTime.toFixed(0)}s\n`)

  return { completed, failed, totalDuration, totalTime }
}
