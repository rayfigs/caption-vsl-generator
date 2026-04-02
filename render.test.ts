import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  generateSpeechMock,
  bundleMock,
  selectCompositionMock,
  renderMediaMock,
} = vi.hoisted(() => ({
  generateSpeechMock: vi.fn(),
  bundleMock: vi.fn(),
  selectCompositionMock: vi.fn(),
  renderMediaMock: vi.fn(),
}))

vi.mock('./src/lib/elevenlabs', () => ({
  generateSpeech: generateSpeechMock,
}))

vi.mock('@remotion/bundler', () => ({
  bundle: bundleMock,
}))

vi.mock('@remotion/renderer', () => ({
  selectComposition: selectCompositionMock,
  renderMedia: renderMediaMock,
}))

import { renderCaptionVSL } from './render'

describe('renderCaptionVSL', () => {
  beforeEach(() => {
    generateSpeechMock.mockReset()
    bundleMock.mockReset()
    selectCompositionMock.mockReset()
    renderMediaMock.mockReset()
  })

  it('bundles Remotion and renders an MP4 file', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'caption-vsl-render-'))
    const transcriptPath = path.join(outDir, 'script.txt')
    const outputPath = path.join(outDir, 'video.mp4')
    await writeFile(transcriptPath, 'Hello world')

    generateSpeechMock.mockResolvedValue({
      audioUrl: path.join(outDir, 'voice.mp3'),
      duration: 1.2,
      wordTimestamps: [
        { word: 'Hello', start: 0, end: 0.5 },
        { word: 'world', start: 0.55, end: 1.2 },
      ],
    })
    bundleMock.mockResolvedValue('serve-url')
    selectCompositionMock.mockResolvedValue({ id: 'CaptionVSL', durationInFrames: 36, fps: 30 })
    renderMediaMock.mockImplementation(async ({ outputLocation }: { outputLocation: string }) => {
      await writeFile(outputLocation, 'mock-video')
    })

    const result = await renderCaptionVSL({
      transcript: transcriptPath,
      templateId: 'classic-purple',
      voiceId: 'warm-female',
      outputPath,
      canvas: { width: 1080, height: 1080 },
      brand: { logoPlacement: 'corner-badge', logoUrl: 'https://example.com/logo.png' },
    })

    expect(bundleMock).toHaveBeenCalled()
    expect(selectCompositionMock).toHaveBeenCalledWith(expect.objectContaining({
      inputProps: expect.objectContaining({
        brand: { logoPlacement: 'corner-badge', logoUrl: 'https://example.com/logo.png' },
      }),
    }))
    expect(renderMediaMock).toHaveBeenCalledWith(expect.objectContaining({
      inputProps: expect.objectContaining({
        brand: { logoPlacement: 'corner-badge', logoUrl: 'https://example.com/logo.png' },
      }),
    }))
    await expect(readFile(outputPath, 'utf8')).resolves.toBe('mock-video')
    expect(result).toEqual({
      outputPath,
      duration: 1.2,
      segments: 1,
    })
  })
})
