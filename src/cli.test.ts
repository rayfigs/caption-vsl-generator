import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { renderCaptionVSLMock } = vi.hoisted(() => ({
  renderCaptionVSLMock: vi.fn(),
}))

vi.mock('../render', () => ({
  renderCaptionVSL: renderCaptionVSLMock,
}))

import { runCli } from './cli'

describe('cli', () => {
  beforeEach(() => {
    renderCaptionVSLMock.mockReset()
  })

  it('lists templates and voices', async () => {
    const templates = await runCli(['templates'])
    const voices = await runCli(['voices'])

    expect(templates).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'classic-purple' })]))
    expect(voices).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'warm-female' })]))
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
})
