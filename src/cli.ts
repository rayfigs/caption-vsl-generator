import path from 'node:path'
import { readFile, readdir } from 'node:fs/promises'
import { renderCaptionVSL, renderRemotionComposition } from '../render'
import { VOICES } from './lib/elevenlabs'
import { getBrandProfile, listBrandProfiles } from './brands'
import { reframeToPortrait } from './lib/reframe'
import { assessVideoQuality } from './lib/quality-check'
import { verifyLayout } from './lib/layout-verifier'
import { listRecipes, recommendRecipe } from './lib/recipe-selector'
import { SCENES } from './showreel/data/showreel.config'
import type { BrandedTemplateProps } from './lib/types'
import { templates } from './templates'

type CliCommand =
  | 'generate'
  | 'templates'
  | 'recipes'
  | 'recommend'
  | 'voices'
  | 'preview'
  | 'batch'
  | 'brands'
  | 'reframe'
  | 'check'
  | 'layout-check'

function parseArgs(argv: string[]) {
  const [command, ...rest] = argv
  const flags: Record<string, string> = {}

  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index]
    const value = rest[index + 1]

    if (!key?.startsWith('--')) {
      continue
    }

    flags[key.slice(2)] = value
  }

  return {
    command: command as CliCommand | undefined,
    flags,
  }
}

type CompositionAlias = 'title-card' | 'lower-third' | 'explainer' | 'end-card'

const COMPOSITION_IDS: Record<CompositionAlias, string> = {
  'title-card': 'TitleCard',
  'lower-third': 'LowerThird',
  explainer: 'ExplainerScene',
  'end-card': 'EndCard',
}

export function parseBrandJson(value?: string): BrandedTemplateProps | undefined {
  if (!value) {
    return undefined
  }

  try {
    return JSON.parse(value) as BrandedTemplateProps
  } catch (error) {
    throw new Error(`Invalid --brand-json payload: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function resolveBrand(flags: Record<string, string>) {
  const inlineBrand = parseBrandJson(flags['brand-json'])
  const namedBrand = flags.brand ? getBrandProfile(flags.brand) : undefined

  if (!inlineBrand && !namedBrand) {
    return undefined
  }

  return {
    ...namedBrand,
    ...inlineBrand,
  }
}

function resolveOutputPath(flags: Record<string, string>, fallbackName: string) {
  return flags.output ?? path.join(process.cwd(), 'output', `${fallbackName}.mp4`)
}

async function parsePointsInput(value?: string) {
  if (!value) {
    throw new Error('--points <points.json> is required for explainer composition')
  }

  const payload = value.trim().startsWith('[')
    ? value
    : await readFile(path.resolve(value), 'utf8')

  try {
    return JSON.parse(payload) as Array<{ icon?: string; heading: string; body?: string }>
  } catch (error) {
    throw new Error(`Invalid --points payload: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function buildCompositionRequest(flags: Record<string, string>) {
  const compositionFlag = flags.composition as CompositionAlias | undefined
  if (!compositionFlag || !(compositionFlag in COMPOSITION_IDS)) {
    throw new Error(`Unknown composition: ${compositionFlag || 'missing'}`)
  }

  const brand = resolveBrand(flags)
  const canvas = flags.canvas as 'portrait' | 'square' | 'landscape' | undefined
  const compositionId = COMPOSITION_IDS[compositionFlag]

  switch (compositionFlag) {
    case 'title-card':
      if (!flags.title) throw new Error('--title is required for title-card composition')
      return {
        compositionId,
        outputPath: resolveOutputPath(flags, compositionFlag),
        canvas,
        duration: flags.duration ? Number(flags.duration) : 3,
        props: {
          title: flags.title,
          subtitle: flags.subtitle,
          brand,
          duration: flags.duration ? Number(flags.duration) : 3,
          style: flags.style ?? 'scale-in',
        },
      }
    case 'lower-third':
      if (!flags.name) throw new Error('--name is required for lower-third composition')
      return {
        compositionId,
        outputPath: resolveOutputPath(flags, compositionFlag),
        canvas,
        duration: flags.duration ? Number(flags.duration) : 5,
        props: {
          name: flags.name,
          title: flags.title,
          brand,
          position: flags.position ?? 'left',
          enterAt: flags['enter-at'] ? Number(flags['enter-at']) : 0.5,
          exitAt: flags['exit-at'] ? Number(flags['exit-at']) : 4,
          style: flags.style ?? 'slide-up',
        },
      }
    case 'explainer':
      return {
        compositionId,
        outputPath: resolveOutputPath(flags, compositionFlag),
        canvas,
        duration: flags.duration
          ? Number(flags.duration)
          : undefined,
        props: {
          points: await parsePointsInput(flags.points),
          brand,
          style: flags.style ?? 'list-reveal',
          secondsPerPoint: flags['seconds-per-point'] ? Number(flags['seconds-per-point']) : 3,
        },
      }
    case 'end-card':
      if (!flags['cta-text']) throw new Error('--cta-text is required for end-card composition')
      return {
        compositionId,
        outputPath: resolveOutputPath(flags, compositionFlag),
        canvas,
        duration: flags.duration ? Number(flags.duration) : 3,
        props: {
          logoUrl: flags['logo-url'],
          ctaText: flags['cta-text'],
          contactLine: flags['contact-line'],
          brand,
          duration: flags.duration ? Number(flags.duration) : 3,
        },
      }
  }
}

async function expandTranscriptGlob(pattern: string) {
  if (!pattern.includes('*')) {
    return [pattern]
  }

  const directory = path.dirname(pattern)
  const extension = path.extname(pattern)
  const files = await readdir(directory)

  return files
    .filter((file) => file.endsWith(extension))
    .map((file) => path.join(directory, file))
}

export async function runCli(argv = process.argv.slice(2)) {
  const { command, flags } = parseArgs(argv)

  switch (command) {
    case 'templates':
      return templates.map((template) => ({ id: template.id, name: template.name }))
    case 'recipes':
      return listRecipes()
    case 'recommend':
      if (!flags['client-type']) throw new Error('--client-type is required for recommend')
      if (!flags['video-type']) throw new Error('--video-type is required for recommend')
      if (!flags.energy) throw new Error('--energy is required for recommend')

      return recommendRecipe({
        clientType: flags['client-type'] as Parameters<typeof recommendRecipe>[0]['clientType'],
        platform: flags.platform as Parameters<typeof recommendRecipe>[0]['platform'],
        videoType: flags['video-type'] as Parameters<typeof recommendRecipe>[0]['videoType'],
        energy: flags.energy as Parameters<typeof recommendRecipe>[0]['energy'],
      })
    case 'voices':
      return Object.entries(VOICES).map(([id, voiceId]) => ({ id, voiceId }))
    case 'brands': {
      const names = listBrandProfiles()
      if (names.length === 0) {
        return { message: 'No brand profiles registered. Add them to src/brands/index.ts.' }
      }
      return names.map((name) => ({ name, profile: getBrandProfile(name) }))
    }
    case 'preview':
      return {
        command: 'npm run dev',
        transcript: flags.transcript,
        template: flags.template || 'classic-purple',
      }
    case 'reframe': {
      if (!flags.input) throw new Error('--input <video.mp4> is required for reframe')
      if (!flags.output) throw new Error('--output <portrait.mp4> is required for reframe')
      return reframeToPortrait({
        input: path.resolve(flags.input),
        output: path.resolve(flags.output),
        verticalBias: flags['vertical-bias'] ? Number(flags['vertical-bias']) : 0.1,
        useFaceDetect: flags['face-detect'] === 'true',
      })
    }
    case 'generate': {
      if (flags.composition) {
        const request = await buildCompositionRequest(flags)
        return renderRemotionComposition(request)
      }

      // Support canvas presets: --canvas portrait | square | landscape
      // Or explicit: --width 1920 --height 1080
      // If neither is passed, canvas is undefined and render.ts will use the template's own canvas.
      const canvasPreset = flags.canvas as 'portrait' | 'square' | 'landscape' | undefined
      const canvas = canvasPreset
        || (flags.width || flags.height
          ? { width: Number(flags.width || 1080), height: Number(flags.height || 1080) }
          : undefined)

      // Support brand kit JSON: --brand-kit '{"name":"Exodus","primaryColor":"#33CCFF",...}'
      const brandKit = flags['brand-kit'] ? JSON.parse(flags['brand-kit']) : undefined

      // --brand <name>: look up named profile from src/brands/index.ts
      const brandName = flags['brand'] || undefined

      // --transcriber whisper: use Whisper instead of ElevenLabs
      const transcriber = (flags['transcriber'] as 'elevenlabs' | 'whisper' | undefined) ?? 'elevenlabs'

      return renderCaptionVSL({
        transcript: flags.transcript,
        templateId: flags.template || 'rorick-bold',
        voiceId: flags.voice || 'adam',
        outputPath: flags.output,
        canvas,
        brand: parseBrandJson(flags['brand-json']),
        brandName,
        brandKit,
        inputVideo: flags['input-video'] ? path.resolve(flags['input-video']) : undefined,
        transcriber,
        autoReframe: flags['auto-reframe'] === 'true',
      })
    }
    case 'batch': {
      const transcripts = await expandTranscriptGlob(flags.transcripts)
      const outputDir = flags['output-dir']
      const canvasPreset = flags.canvas as 'portrait' | 'square' | 'landscape' | undefined
      const canvas = canvasPreset
        || (flags.width || flags.height
          ? { width: Number(flags.width || 1080), height: Number(flags.height || 1080) }
          : undefined)
      const brandKit = flags['brand-kit'] ? JSON.parse(flags['brand-kit']) : undefined
      const brandName = flags['brand'] || undefined
      const transcriber = (flags['transcriber'] as 'elevenlabs' | 'whisper' | undefined) ?? 'elevenlabs'
      const results = []

      for (const transcript of transcripts) {
        const baseName = path.basename(transcript, path.extname(transcript))
        results.push(
          await renderCaptionVSL({
            transcript,
            templateId: flags.template || 'rorick-bold',
            voiceId: flags.voice || 'adam',
            outputPath: path.join(outputDir, `${baseName}.mp4`),
            canvas,
            brand: parseBrandJson(flags['brand-json']),
            brandName,
            brandKit,
            inputVideo: flags['input-video'] ? path.resolve(flags['input-video']) : undefined,
            transcriber,
          })
        )
      }

      return results
    }
    /**
     * check — assess source video quality before committing to a full render.
     *
     * Usage:
     *   tsx src/cli.ts check --input /path/to/testimonial.mp4
     *
     * Prints a quality report + alternative asset suggestions.
     * Exit code 0 = pass/warning, exit code 2 = fail (serious issues).
     */
    case 'check': {
      const inputPath = flags['input']
      if (!inputPath) throw new Error('--input <video> is required for the check command')

      process.stderr.write(`Checking source video quality: ${path.basename(inputPath)}\n`)
      const report = await assessVideoQuality(inputPath)

      // Always print the full report to stdout
      process.stdout.write(`\n${report.summary}\n`)

      if (report.severity === 'fail') {
        process.stderr.write('\n⚠️  Serious issues found — review alternatives before rendering.\n')
        process.exit(2)
      }

      return report
    }

    /**
     * layout-check — verify a Remotion composition for safe-zone bleed
     * and layer collisions before running the full-quality render.
     *
     * Usage (showreel):
     *   tsx src/cli.ts layout-check
     *   tsx src/cli.ts layout-check --composition AgencyShowreel --output /tmp/layout-review
     *
     * Outputs a contact sheet PNG that can be sent to Telegram for sign-off.
     */
    case 'layout-check': {
      const compositionId = flags['composition'] ?? 'AgencyShowreel'
      const outputDir     = flags['output'] ?? path.join(process.cwd(), 'output/layout-review')
      const entryPoint    = path.join(process.cwd(), 'src/index.ts')

      // Build key frames: midpoint of each scene
      const keyFrames = SCENES.map(s => ({
        id:    s.id,
        frame: s.from + Math.floor(s.duration / 2),
      }))

      process.stderr.write(`Layout check: ${compositionId} — ${keyFrames.length} scenes\n`)
      const report = await verifyLayout({ entryPoint, compositionId, scenes: keyFrames, outputDir })

      process.stdout.write(`\n${report.summary}\n`)

      if (report.contactSheetPath) {
        process.stdout.write(`\nContact sheet: ${report.contactSheetPath}\n`)
      }

      if (report.overallSeverity === 'error') {
        process.stderr.write('\n⚠️  Layout errors found — fix before full render.\n')
        process.exit(2)
      }

      return report
    }

    default:
      throw new Error(`Unknown command: ${command || 'missing'}`)
  }
}

if (require.main === module) {
  runCli().then((result) => {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  }).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
