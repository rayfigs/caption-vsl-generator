import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import axios from 'axios'
import type { TTSResult, WordTimestamp } from './types'

// Top 10 ElevenLabs voices (most popular defaults + community favorites)
// Top 5 are the primary rotation, remaining 5 are alternates
export const VOICES = {
  // Top 5 (primary rotation)
  'adam': 'pNInz6obpgDQGcFmaJgB',           // Adam - deep, warm male narrator
  'rachel': '21m00Tcm4TlvDq8ikWAM',         // Rachel - calm, clear female
  'drew': '29vD33N1CtxCmqQRPOHJ',           // Drew - confident male, news anchor style
  'clyde': '2EiwWnXFnvU5JabPnv8n',          // Clyde - authoritative older male
  'domi': 'AZnzlk1XvdvUeBnXmlld',           // Domi - strong, assertive female

  // Alternates (6-10)
  'bella': 'EXAVITQu4vr4xnSDxMaL',          // Bella - soft, gentle female
  'antoni': 'ErXwobaYiN019PkySvjV',         // Antoni - warm, friendly male
  'elli': 'MF3mGyEYCl7XYWbV9V6O',           // Elli - young, energetic female
  'josh': 'TxGEqnHWrfWFTfGW9XjX',           // Josh - deep, young male
  'sam': 'yoZ06aMxZJJ28mfd3POQ',            // Sam - raspy, dynamic male

  // Personal clones
  'ray': 'uhI18lp2kSQHa5dX4ehN',             // Reinaldo (Ray) — voice clone, multilingual v2

  // Legacy aliases (backward compatible)
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

interface VoiceSettingsInput {
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
  speed?: number
}

interface GenerateSpeechOptions {
  voiceId: string
  model?: string
  speed?: number
  /**
   * Expressive delivery controls. When provided, sent as ElevenLabs
   * voice_settings. Lower stability = more variation/emphasis.
   */
  voiceSettings?: VoiceSettingsInput
  outputPath: string
}

/** Map our camelCase settings to ElevenLabs' snake_case voice_settings body. */
function buildVoiceSettings(
  voiceSettings: VoiceSettingsInput | undefined,
  speed: number | undefined,
): Record<string, number | boolean> | undefined {
  const out: Record<string, number | boolean> = {}
  if (voiceSettings) {
    if (voiceSettings.stability !== undefined) out.stability = voiceSettings.stability
    if (voiceSettings.similarityBoost !== undefined) out.similarity_boost = voiceSettings.similarityBoost
    if (voiceSettings.style !== undefined) out.style = voiceSettings.style
    if (voiceSettings.useSpeakerBoost !== undefined) out.use_speaker_boost = voiceSettings.useSpeakerBoost
    if (voiceSettings.speed !== undefined) out.speed = voiceSettings.speed
  }
  if (speed !== undefined && out.speed === undefined) out.speed = speed
  return Object.keys(out).length > 0 ? out : undefined
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
  const voiceSettings = buildVoiceSettings(options.voiceSettings, options.speed)
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/with-timestamps`,
    {
      text,
      model_id: options.model || 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      voice_settings: voiceSettings,
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
