import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import axios from 'axios'
import type { TTSResult, WordTimestamp } from './types'

export const VOICES = {
  'warm-male': 'pNInz6obpgDQGcFmaJgB',
  'warm-female': '21m00Tcm4TlvDq8ikWAM',
  'authoritative-male': 'VR6AewLTigWG4xSOukaG',
  'calm-female': 'EXAVITQu4vr4xnSDxMaL',
} as const

interface ElevenLabsAlignment {
  characters: string[]
  character_start_times_seconds: number[]
  character_end_times_seconds: number[]
}

interface GenerateSpeechOptions {
  voiceId: string
  model?: string
  speed?: number
  outputPath: string
}

function resolveVoiceId(voiceId: string) {
  return VOICES[voiceId as keyof typeof VOICES] || voiceId
}

function buildWordTimestamps(alignment: ElevenLabsAlignment | null | undefined): WordTimestamp[] {
  if (!alignment) {
    return []
  }

  const words: WordTimestamp[] = []
  let currentWord = ''
  let currentStart = 0
  let currentEnd = 0

  alignment.characters.forEach((character, index) => {
    const start = alignment.character_start_times_seconds[index] ?? currentEnd
    const end = alignment.character_end_times_seconds[index] ?? start

    if (/\s/.test(character)) {
      if (currentWord) {
        words.push({ word: currentWord, start: currentStart, end: currentEnd })
        currentWord = ''
      }
      return
    }

    if (!currentWord) {
      currentStart = start
    }

    currentWord += character
    currentEnd = end
  })

  if (currentWord) {
    words.push({ word: currentWord, start: currentStart, end: currentEnd })
  }

  return words
}

export async function generateSpeech(
  text: string,
  options: GenerateSpeechOptions
): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is required')
  }

  const resolvedVoiceId = resolveVoiceId(options.voiceId)
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/with-timestamps`,
    {
      text,
      model_id: options.model || 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      voice_settings: options.speed
        ? {
            speed: options.speed,
          }
        : undefined,
    },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    }
  )

  const audioBase64 = response.data?.audio_base64

  if (!audioBase64) {
    throw new Error('ElevenLabs response did not include audio_base64')
  }

  await mkdir(path.dirname(options.outputPath), { recursive: true })
  await writeFile(options.outputPath, Buffer.from(audioBase64, 'base64'))

  const alignment = response.data?.normalized_alignment || response.data?.alignment
  const wordTimestamps = buildWordTimestamps(alignment)
  const duration = wordTimestamps[wordTimestamps.length - 1]?.end ?? 0

  return {
    audioUrl: options.outputPath,
    duration,
    wordTimestamps,
  }
}

export const __internal = {
  buildWordTimestamps,
  resolveVoiceId,
}
