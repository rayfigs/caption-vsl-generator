import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import axios from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __internal, generateSpeech } from './elevenlabs'

vi.mock('axios')

const mockedAxios = vi.mocked(axios, true)

describe('elevenlabs generateSpeech', () => {
  const originalApiKey = process.env.ELEVENLABS_API_KEY

  beforeEach(() => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    mockedAxios.post.mockReset()
  })

  afterEach(() => {
    process.env.ELEVENLABS_API_KEY = originalApiKey
  })

  it('calls ElevenLabs and returns audio with word timestamps', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'caption-vsl-'))
    const outputPath = path.join(outDir, 'speech.mp3')

    mockedAxios.post.mockResolvedValue({
      data: {
        audio_base64: Buffer.from('mock audio').toString('base64'),
        normalized_alignment: {
          characters: ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd'],
          character_start_times_seconds: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5],
          character_end_times_seconds: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
        },
      },
    } as never)

    const result = await generateSpeech('Hello world', {
      voiceId: 'warm-female',
      outputPath,
    })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/with-timestamps',
      expect.objectContaining({
        text: 'Hello world',
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'xi-api-key': 'test-key',
        }),
      })
    )

    expect(result.wordTimestamps).toEqual([
      { word: 'Hello', start: 0, end: 0.25 },
      { word: 'world', start: 0.3, end: 0.55 },
    ])
    expect(result.duration).toBe(0.55)
    await expect(readFile(outputPath, 'utf8')).resolves.toBe('mock audio')
  })

  it('builds sequential word timestamps from character alignment', () => {
    const words = __internal.buildWordTimestamps({
      characters: ['O', 'n', 'e', ' ', 't', 'w', 'o'],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
    })

    expect(words).toEqual([
      { word: 'One', start: 0, end: 0.3 },
      { word: 'two', start: 0.4, end: 0.7 },
    ])
    expect(words[0].end).toBeLessThan(words[1].start)
  })

  it('throws when the API key is missing', async () => {
    delete process.env.ELEVENLABS_API_KEY

    await expect(
      generateSpeech('Hello world', {
        voiceId: 'warm-male',
        outputPath: '/tmp/voice.mp3',
      })
    ).rejects.toThrow('ELEVENLABS_API_KEY is required')
  })
})
