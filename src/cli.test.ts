import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { renderCaptionVSLMock, renderRemotionCompositionMock } = vi.hoisted(() => ({
  renderCaptionVSLMock: vi.fn(),
  renderRemotionCompositionMock: vi.fn(),
}))

vi.mock('../render', () => ({
  renderCaptionVSL: renderCaptionVSLMock,
  renderRemotionComposition: renderRemotionCompositionMock,
}))

vi.mock('./lib/reframe', () => ({
  reframeToPortrait: vi.fn(),
}))

vi.mock('./lib/quality-check', () => ({
  assessVideoQuality: vi.fn(),
}))

vi.mock('./lib/layout-verifier', () => ({
  verifyLayout: vi.fn(),
}))

import { runCli } from './cli'

describe('cli', () => {
  beforeEach(() => {
    renderCaptionVSLMock.mockReset()
    renderRemotionCompositionMock.mockReset()
  })

  it('lists templates, recipes, and voices', async () => {
    const templates = await runCli(['templates'])
    const recipes = await runCli(['recipes'])
    const voices = await runCli(['voices'])

    expect(templates).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'classic-purple' })]))
    expect(recipes).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'recipe-clean-caption' })]))
    expect(voices).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'warm-female' })]))
  })

  it('recommends a recipe from CLI flags', async () => {
    const result = await runCli([
      'recommend',
      '--client-type', 'medical',
      '--video-type', 'testimonial',
      '--energy', 'low',
    ])

    expect(result).toEqual(expect.objectContaining({
      templateId: 'recipe-clean-caption',
    }))
  })

  it('parses generate arguments and calls the render pipeline', async () => {
    renderCaptionVSLMock.mockResolvedValue({ outputPath: '/tmp/out.mp4', duration: 1, segments: 2 })

    await runCli([
      'generate',
      '--transcript', 'script.txt',
      '--template', 'classic-purple',
      '--voice', 'warm-female',
      '--output', '/tmp/out.mp4',
      '--width', '1080',
      '--height', '1350',
      '--brand-json', '{"highlightColor":"#ff00aa","logoPlacement":"watermark"}',
    ])

    expect(renderCaptionVSLMock).toHaveBeenCalledWith({
      transcript: 'script.txt',
      templateId: 'classic-purple',
      voiceId: 'warm-female',
      outputPath: '/tmp/out.mp4',
      canvas: { width: 1080, height: 1350 },
      brand: {
        highlightColor: '#ff00aa',
        logoPlacement: 'watermark',
      },
      brandKit: undefined,
      brandName: undefined,
      inputVideo: undefined,
      transcriber: 'elevenlabs',
      autoReframe: false,
    })
  })

  it('renders standalone compositions from CLI flags', async () => {
    renderRemotionCompositionMock.mockResolvedValue({ outputPath: '/tmp/title-card.mp4', compositionId: 'TitleCard' })

    await runCli([
      'generate',
      '--composition', 'title-card',
      '--title', 'The Problem',
      '--subtitle', 'What was going wrong',
      '--brand', 'fitness_doctor',
      '--canvas', 'portrait',
      '--style', 'wipe',
      '--output', '/tmp/title-card.mp4',
    ])

    expect(renderRemotionCompositionMock).toHaveBeenCalledWith({
      compositionId: 'TitleCard',
      outputPath: '/tmp/title-card.mp4',
      canvas: 'portrait',
      duration: 3,
      props: expect.objectContaining({
        title: 'The Problem',
        subtitle: 'What was going wrong',
        style: 'wipe',
        brand: expect.objectContaining({
          highlightColor: '#9003F1',
        }),
      }),
    })
  })

  it('processes multiple transcripts in batch mode', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'caption-vsl-batch-'))
    const transcriptsDir = path.join(outDir, 'transcripts')
    await mkdir(transcriptsDir, { recursive: true })
    await writeFile(path.join(transcriptsDir, 'one.txt'), 'One')
    await writeFile(path.join(transcriptsDir, 'two.txt'), 'Two')

    renderCaptionVSLMock.mockResolvedValue({ outputPath: '/tmp/out.mp4', duration: 1, segments: 1 })

    const result = await runCli([
      'batch',
      '--transcripts', path.join(transcriptsDir, '*.txt'),
      '--template', 'classic-purple',
      '--voice', 'warm-female',
      '--output-dir', outDir,
    ])

    expect(renderCaptionVSLMock).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
  })

  it('rejects invalid brand json', async () => {
    await expect(runCli([
      'generate',
      '--transcript', 'script.txt',
      '--output', '/tmp/out.mp4',
      '--brand-json', '{invalid',
    ])).rejects.toThrow('Invalid --brand-json payload')
  })

  it('rejects incomplete recommend arguments', async () => {
    await expect(runCli([
      'recommend',
      '--client-type', 'medical',
      '--energy', 'low',
    ])).rejects.toThrow('--video-type is required for recommend')
  })
})
