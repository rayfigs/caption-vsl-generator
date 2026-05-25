/**
 * Whisper transcription via OpenAI API.
 *
 * Takes a video or audio file, extracts the audio track with FFmpeg if needed,
 * sends it to Whisper, and returns word-level timestamps in the same shape
 * as the ElevenLabs TTSResult so the rest of render.ts doesn't need to branch.
 *
 * Requires: OPENAI_API_KEY in env, ffmpeg on PATH.
 */

import { execFile } from 'node:child_process'
import { mkdir, stat, unlink, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import OpenAI from 'openai'
import { createReadStream } from 'node:fs'
import type { TTSResult, WordTimestamp } from './types'

const execFileAsync = promisify(execFile)

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'])

function isAudioFile(filePath: string): boolean {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

/**
 * Extract audio from a video file using FFmpeg.
 * Returns the path to the extracted MP3.
 */
async function extractAudio(videoPath: string, outputDir: string): Promise<string> {
  const baseName = path.basename(videoPath, path.extname(videoPath))
  const audioPath = path.join(outputDir, `${baseName}_extracted.mp3`)

  // Skip extraction if already done
  try {
    await stat(audioPath)
    process.stderr.write(`Reusing extracted audio: ${audioPath}\n`)
    return audioPath
  } catch {}

  process.stderr.write(`Extracting audio from ${path.basename(videoPath)}...\n`)

  await execFileAsync('ffmpeg', [
    '-i', videoPath,
    '-vn',            // drop video track
    '-ar', '16000',   // Whisper works best at 16kHz
    '-ac', '1',       // mono
    '-q:a', '0',
    '-y',             // overwrite
    audioPath,
  ])

  return audioPath
}

/**
 * Transcribe an audio/video file using OpenAI Whisper.
 * Returns TTSResult with word timestamps and duration.
 *
 * @param filePath - path to MP4, MP3, WAV, etc.
 * @param outputDir - where to write the extracted audio (if needed)
 * @param cacheBasePath - if provided, cache Whisper results here to avoid re-transcribing
 */
export async function transcribeWithWhisper(
  filePath: string,
  outputDir: string,
  cacheBasePath?: string,
): Promise<TTSResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Whisper transcription requires an OpenAI API key.')
  }

  await mkdir(outputDir, { recursive: true })

  // Check cache
  const cachePath = cacheBasePath
    ? `${cacheBasePath}.whisper-cache.json`
    : path.join(outputDir, `${path.basename(filePath, path.extname(filePath))}.whisper-cache.json`)

  try {
    const cached = JSON.parse(await readFile(cachePath, 'utf8'))
    process.stderr.write('Reusing cached Whisper transcription\n')
    return cached as TTSResult
  } catch {}

  // Extract audio if input is a video
  const audioPath = isAudioFile(filePath)
    ? filePath
    : await extractAudio(filePath, outputDir)

  process.stderr.write('Sending to Whisper API...\n')

  const client = new OpenAI({ apiKey })

  const transcription = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  })

  // OpenAI returns words in verbose_json with word-level timestamps
  const rawWords = (transcription as unknown as {
    words?: Array<{ word: string; start: number; end: number }>
  }).words ?? []

  const wordTimestamps: WordTimestamp[] = rawWords.map((w) => ({
    word: w.word.trim(),
    start: w.start,
    end: w.end,
  }))

  const duration: number = (transcription as unknown as { duration?: number }).duration
    ?? (wordTimestamps.length > 0 ? wordTimestamps[wordTimestamps.length - 1].end + 0.1 : 0)

  const result: TTSResult = {
    audioUrl: audioPath,
    duration,
    wordTimestamps,
  }

  // Save cache
  await writeFile(cachePath, JSON.stringify(result, null, 2))
  process.stderr.write(`Whisper done — ${wordTimestamps.length} words, ${duration.toFixed(1)}s\n`)

  return result
}

/**
 * Get the duration of a video/audio file using ffprobe.
 * Used to set total composition length when rendering over original footage.
 */
export async function getMediaDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    filePath,
  ])
  return parseFloat(stdout.trim())
}
