import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { generateSpeech } from './src/lib/elevenlabs'
import { transcribeWithWhisper } from './src/lib/whisper'
import { reframeToPortrait } from './src/lib/reframe'
import { assessVideoQuality } from './src/lib/quality-check'
import { calculateLayout } from './src/lib/layout-engine'
import { parseTranscript } from './src/lib/transcript-parser'
import { splitDualTrackScript } from './src/lib/dual-track'
import { getTemplate } from './src/templates'
import { getBrandProfile } from './src/brands/index'
import type { BrandKit, RenderCaptionVSLOptions, Template, WordTimestamp } from './src/lib/types'

function isTranscriptPath(input: string) {
  return /\.(txt|md|text)$/i.test(input) || input.includes(path.sep)
}

async function resolveTranscriptText(transcript: string) {
  if (!isTranscriptPath(transcript)) {
    return transcript
  }

  return readFile(transcript, 'utf8')
}

function resolveCanvas(canvas: { width: number; height: number } | string): { width: number; height: number } {
  if (typeof canvas === 'string') {
    const presets: Record<string, { width: number; height: number }> = {
      landscape: { width: 1920, height: 1080 },
      portrait: { width: 1080, height: 1920 },
      square: { width: 1080, height: 1080 },
    }
    return presets[canvas] || presets.landscape
  }
  return canvas
}

export interface RenderCompositionOptions {
  compositionId: string
  outputPath: string
  props: Record<string, unknown>
  canvas?: { width: number; height: number } | 'portrait' | 'square' | 'landscape'
  duration?: number
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

/** Apply brand kit colors/fonts/logo to a template */
function applyBrandKit(template: Template, brandKit: BrandKit): Template {
  const updated = { ...template }

  // Apply text styling
  updated.text = {
    ...updated.text,
    color: brandKit.textColor || updated.text.color,
    fontFamily: brandKit.fontFamily || updated.text.fontFamily,
    fontWeight: brandKit.fontWeight || updated.text.fontWeight,
  }

  // Apply highlight color from brand primary
  updated.highlight = {
    ...updated.highlight,
    backgroundColor: brandKit.primaryColor || updated.highlight.backgroundColor,
  }

  // Apply background
  if (brandKit.gradient?.enabled) {
    updated.background = {
      type: 'gradient',
      gradient: {
        from: brandKit.gradient.from,
        to: brandKit.gradient.to,
        angle: brandKit.gradient.angle,
      },
    }
  } else {
    updated.background = {
      ...updated.background,
      color: brandKit.backgroundColor || updated.background.color,
    }
  }

  // Apply brand defaults for logo
  updated.brandDefaults = {
    ...updated.brandDefaults,
    logoUrl: brandKit.logoUrl || updated.brandDefaults.logoUrl,
    logoPosition: brandKit.logoPosition || updated.brandDefaults.logoPosition,
    logoScale: brandKit.logoScale || updated.brandDefaults.logoScale,
    background: brandKit.backgroundColor,
    textColor: brandKit.textColor,
    highlightColor: brandKit.primaryColor,
    secondaryColor: brandKit.secondaryColor,
    headingFont: brandKit.fontFamily,
    bodyFont: brandKit.fontFamily,
  }

  return updated
}

export async function renderCaptionVSL(options: RenderCaptionVSLOptions) {
  // Resolve named brand profile → BrandedTemplateProps (merges on top of any inline brand)
  const resolvedBrand = options.brandName
    ? { ...getBrandProfile(options.brandName), ...options.brand }
    : options.brand

  // In Whisper mode, transcript is optional (the video IS the transcript source).
  // In ElevenLabs mode, transcript is required.
  const isWhisperMode = options.transcriber === 'whisper' && !!options.inputVideo
  const rawText = isWhisperMode ? '' : await resolveTranscriptText(options.transcript)
  const outputDir = path.dirname(options.outputPath)
  await mkdir(outputDir, { recursive: true })

  // If no canvas was explicitly passed, use the template's own canvas dimensions.
  const baseTemplate = getTemplate(options.templateId)
  const resolvedCanvas = options.canvas
    ? resolveCanvas(options.canvas)
    : baseTemplate.canvas

  let template = mergeTemplate(
    baseTemplate,
    options.overrides
      ? { ...options.overrides, canvas: resolvedCanvas }
      : { canvas: resolvedCanvas }
  )

  // Apply brand kit if provided
  if (options.brandKit) {
    template = applyBrandKit(template, options.brandKit)
  }

  // Scale caption box for different aspect ratios
  // Portrait and square need a narrower box
  const safeZoneRatio = 0.6 // 20% bleed on each side = 60% usable
  template.captionBox = {
    ...template.captionBox,
    width: Math.round(resolvedCanvas.width * safeZoneRatio),
  }

  // Only override captionBox.y for portrait if the template hasn't set an explicit numeric position.
  // Templates like portrait-kinetic and portrait-tumble use a fixed y (bottom-third) by design.
  if (resolvedCanvas.height > resolvedCanvas.width && template.captionBox.y === 'center') {
    // Already center — leave it alone. Template explicitly requested center.
    // (No-op: preserving existing center value)
  }

  // Dual-track: split visual and audio versions of the script
  const { visual: visualText, audio: audioText } = splitDualTrackScript(rawText)

  const audioPath = path.resolve(options.outputPath.replace(/\.[^.]+$/, '.mp3'))
  const cachePath = audioPath.replace(/\.mp3$/, '.cache.json')

  // Reuse existing audio + timestamps if the MP3 and cache exist
  let speech: { audioUrl: string; duration: number; wordTimestamps: WordTimestamp[] }

  // ── Source video quality check ──────────────────────────────────────────────
  // Runs before reframing. Warnings go to stderr so they surface in the CLI
  // and Telegram bot. A 'fail' result doesn't block the render — it just
  // gives the team the information they need to decide what to do.
  if (options.inputVideo) {
    try {
      const qualityReport = await assessVideoQuality(options.inputVideo)
      if (qualityReport.severity !== 'pass') {
        process.stderr.write(`\n──────────────────────────────────────────────\n`)
        process.stderr.write(qualityReport.summary)
        process.stderr.write(`\n──────────────────────────────────────────────\n\n`)
      }
    } catch (qErr) {
      // Quality check is non-blocking — log and continue
      process.stderr.write(`Quality check skipped: ${qErr}\n`)
    }
  }

  // ── Auto-reframe ────────────────────────────────────────────────────────────
  // If autoReframe is set and inputVideo is landscape, crop to portrait first.
  // The reframed file lives alongside the output so it can be served by Remotion.
  let effectiveInputVideo = options.inputVideo
  if (options.autoReframe && options.inputVideo) {
    const reframedPath = options.inputVideo.replace(/(\.[^.]+)$/, '-portrait$1')
    const reframeResult = await reframeToPortrait({
      input: options.inputVideo,
      output: reframedPath,
      verticalBias: 0.12,
    })
    effectiveInputVideo = reframeResult.outputPath
    process.stderr.write(`Auto-reframed: ${path.basename(effectiveInputVideo)} (${reframeResult.cropWidth}x${reframeResult.cropHeight})\n`)
  }
  // ───────────────────────────────────────────────────────────────────────────

  if (options.transcriber === 'whisper' && effectiveInputVideo) {
    // Whisper flow: transcribe the original video/audio, use its timestamps directly
    process.stderr.write(`Using Whisper transcription for: ${path.basename(effectiveInputVideo)}\n`)
    speech = await transcribeWithWhisper(effectiveInputVideo, outputDir, audioPath.replace(/\.mp3$/, ''))
  } else {
    // ElevenLabs flow (default): generate TTS from text
    let audioExists = false
    try { await stat(audioPath); await stat(cachePath); audioExists = true } catch {}

    if (audioExists) {
      const cached = JSON.parse(await readFile(cachePath, 'utf8'))
      speech = { audioUrl: audioPath, duration: cached.duration, wordTimestamps: cached.wordTimestamps }
      process.stderr.write('Reusing cached audio + timestamps\n')
    } else {
      // Send the AUDIO version to ElevenLabs (with pronunciation overrides)
      speech = await generateSpeech(audioText, {
        voiceId: options.voiceId,
        voiceSettings: options.voiceSettings,
        outputPath: audioPath,
      })
      // Save timestamps for future renders
      await writeFile(cachePath, JSON.stringify({ duration: speech.duration, wordTimestamps: speech.wordTimestamps }))
    }
  }

  const layout = calculateLayout({
    boxWidth: template.captionBox.width,
    boxHeight: template.captionBox.height,
    fontSize: template.text.fontSize,
    lineHeight: template.text.lineHeight,
    fontFamily: template.text.fontFamily,
    padding: template.captionBox.padding,
  })

  // Cap words per screen: use layout calculation but enforce max 1 line
  const maxChars = Math.min(layout.maxCharsPerLine, 25)
  const segments = parseTranscript(speech.wordTimestamps, {
    maxCharsPerLine: maxChars,
    maxLines: 1,
    wordPause: 0.45,
    sentencePause: 0.2,
  })

  const entryPoint = path.join(process.cwd(), 'src/index.ts')
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  // ── Video overlay mode ──────────────────────────────────────────────────────
  // When inputVideo is provided with Whisper transcription, the original footage
  // becomes the background. The video's own audio track plays via the <Video>
  // component in Background.tsx, so no separate <Audio> TTS track is needed.
  let servedAudioUrl: string
  if (options.transcriber === 'whisper' && effectiveInputVideo) {
    // Copy the (reframed) video into the bundle so Remotion can serve it
    const videoFileName = path.basename(effectiveInputVideo)
    await copyFile(effectiveInputVideo, path.join(serveUrl, videoFileName))
    // Point the template background at the served video
    template = {
      ...template,
      background: {
        type: 'video',
        videoUrl: videoFileName,
        // Slight darken so caption text stays readable over bright footage
        darken: template.background.darken ?? 0.25,
      },
    }
    // No separate audio — the video component handles it
    servedAudioUrl = ''
  } else {
    // ElevenLabs TTS flow: copy the MP3 into the bundle
    const audioFileName = path.basename(audioPath)
    await copyFile(audioPath, path.join(serveUrl, audioFileName))
    servedAudioUrl = audioFileName
  }
  // ───────────────────────────────────────────────────────────────────────────

  // ── Background slides ──────────────────────────────────────────────────────
  // Copy slide images into the bundle and build the props array
  let backgroundSlides: Array<{ imageUrl: string; startTime: number; endTime: number }> | undefined
  if (options.backgroundSlides && options.backgroundSlides.length > 0) {
    backgroundSlides = []
    for (const slide of options.backgroundSlides) {
      const imgFileName = path.basename(slide.imagePath)
      await copyFile(slide.imagePath, path.join(serveUrl, imgFileName))
      backgroundSlides.push({
        imageUrl: imgFileName,
        startTime: slide.startTime,
        endTime: slide.endTime,
      })
    }
    process.stderr.write(`Background slides: ${backgroundSlides.length} images loaded\n`)
  }
  // ───────────────────────────────────────────────────────────────────────────

  const fps = 30
  // Add 0.5s padding at the end so the last words don't get cut off
  const totalDurationFrames = Math.ceil((speech.duration + 0.5) * fps)

  const inputProps = {
    template,
    brand: resolvedBrand,
    segments,
    audioUrl: servedAudioUrl,
    audioDuration: speech.duration,
    backgroundSlides,
  }

  const composition = await selectComposition({
    serveUrl,
    id: 'CaptionVSL',
    inputProps,
  })

  // Override the hardcoded duration with the actual audio length
  composition.durationInFrames = totalDurationFrames
  composition.width = template.canvas.width
  composition.height = template.canvas.height

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: options.outputPath,
    // Increase timeout for video-overlay renders — OffthreadVideo needs time
    // to decode frames at arbitrary seek positions. Default 30s is too short
    // for longer testimonial clips.
    timeoutInMilliseconds: 120_000,
    inputProps,
  })

  return {
    outputPath: options.outputPath,
    duration: speech.duration,
    segments: segments.length,
    canvas: resolvedCanvas,
  }
}

export async function renderRemotionComposition(options: RenderCompositionOptions) {
  await mkdir(path.dirname(options.outputPath), { recursive: true })

  const entryPoint = path.join(process.cwd(), 'src/index.ts')
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  const composition = await selectComposition({
    serveUrl,
    id: options.compositionId,
    inputProps: options.props,
  })

  if (options.canvas) {
    const resolvedCanvas = resolveCanvas(options.canvas)
    composition.width = resolvedCanvas.width
    composition.height = resolvedCanvas.height
  }

  if (options.duration) {
    composition.durationInFrames = Math.ceil(options.duration * composition.fps)
  }

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: options.outputPath,
    timeoutInMilliseconds: 120_000,
    inputProps: options.props,
  })

  return {
    outputPath: options.outputPath,
    compositionId: options.compositionId,
    duration: composition.durationInFrames / composition.fps,
    canvas: {
      width: composition.width,
      height: composition.height,
    },
  }
}
