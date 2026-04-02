import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { generateSpeech } from './src/lib/elevenlabs'
import { calculateLayout } from './src/lib/layout-engine'
import { parseTranscript } from './src/lib/transcript-parser'
import { getTemplate } from './src/templates'
import type { RenderCaptionVSLOptions, Template } from './src/lib/types'

function isTranscriptPath(input: string) {
  return /\.(txt|md|text)$/i.test(input) || input.includes(path.sep)
}

async function resolveTranscriptText(transcript: string) {
  if (!isTranscriptPath(transcript)) {
    return transcript
  }

  return readFile(transcript, 'utf8')
}

function mergeTemplate(template: Template, overrides?: Partial<Template>): Template {
  if (!overrides) {
    return template
  }

  return {
    ...template,
    ...overrides,
    background: { ...template.background, ...overrides.background },
    captionBox: { ...template.captionBox, ...overrides.captionBox },
    text: { ...template.text, ...overrides.text },
    highlight: { ...template.highlight, ...overrides.highlight },
    canvas: { ...template.canvas, ...overrides.canvas },
    transitions: { ...template.transitions, ...overrides.transitions },
  }
}

export async function renderCaptionVSL(options: RenderCaptionVSLOptions) {
  const transcriptText = await resolveTranscriptText(options.transcript)
  const outputDir = path.dirname(options.outputPath)
  await mkdir(outputDir, { recursive: true })

  const template = mergeTemplate(
    getTemplate(options.templateId),
    options.overrides
      ? { ...options.overrides, canvas: options.canvas }
      : { canvas: options.canvas }
  )

  const audioPath = options.outputPath.replace(/\.[^.]+$/, '.mp3')
  const speech = await generateSpeech(transcriptText, {
    voiceId: options.voiceId,
    outputPath: audioPath,
  })

  const layout = calculateLayout({
    boxWidth: template.captionBox.width,
    boxHeight: template.captionBox.height,
    fontSize: template.text.fontSize,
    lineHeight: template.text.lineHeight,
    fontFamily: template.text.fontFamily,
    padding: template.captionBox.padding,
  })

  const segments = parseTranscript(speech.wordTimestamps, {
    maxCharsPerLine: layout.maxCharsPerLine,
    maxLines: layout.maxLines,
    wordPause: 0.45,
    sentencePause: 0.2,
  })

  const entryPoint = path.join(process.cwd(), 'src/index.ts')
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  const composition = await selectComposition({
    serveUrl,
    id: 'CaptionVSL',
    inputProps: {
      template,
      brand: options.brand,
      segments,
      audioUrl: speech.audioUrl,
      audioDuration: speech.duration,
    },
  })

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: options.outputPath,
    inputProps: {
      template,
      brand: options.brand,
      segments,
      audioUrl: speech.audioUrl,
      audioDuration: speech.duration,
    },
  })

  return {
    outputPath: options.outputPath,
    duration: speech.duration,
    segments: segments.length,
  }
}
