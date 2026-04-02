import type { TTSResult } from './types'

export const VOICES = {
  'warm-male': 'pNInz6obpgDQGcFmaJgB',
  'warm-female': '21m00Tcm4TlvDq8ikWAM',
  'authoritative-male': 'VR6AewLTigWG4xSOukaG',
  'calm-female': 'EXAVITQu4vr4xnSDxMaL',
} as const

export async function generateSpeech(): Promise<TTSResult> {
  throw new Error('generateSpeech is not implemented yet')
}
