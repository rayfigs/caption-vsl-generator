import path from 'node:path'
import { readdir } from 'node:fs/promises'
import { renderCaptionVSL } from '../render'
import { VOICES } from './lib/elevenlabs'
import type { BrandedTemplateProps } from './lib/types'
import { templates } from './templates'

type CliCommand = 'generate' | 'templates' | 'voices' | 'preview' | 'batch'

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
    case 'voices':
      return Object.entries(VOICES).map(([id, voiceId]) => ({ id, voiceId }))
    case 'preview':
      return {
        command: 'npm run dev',
        transcript: flags.transcript,
        template: flags.template || 'classic-purple',
      }
    case 'generate':
      return renderCaptionVSL({
        transcript: flags.transcript,
        templateId: flags.template || 'classic-purple',
        voiceId: flags.voice || 'warm-female',
        outputPath: flags.output,
        canvas: {
          width: Number(flags.width || 1080),
          height: Number(flags.height || 1080),
        },
        brand: parseBrandJson(flags['brand-json']),
      })
    case 'batch': {
      const transcripts = await expandTranscriptGlob(flags.transcripts)
      const outputDir = flags['output-dir']
      const results = []

      for (const transcript of transcripts) {
        const baseName = path.basename(transcript, path.extname(transcript))
        results.push(
          await renderCaptionVSL({
            transcript,
            templateId: flags.template || 'classic-purple',
            voiceId: flags.voice || 'warm-female',
            outputPath: path.join(outputDir, `${baseName}.mp4`),
            canvas: {
              width: Number(flags.width || 1080),
              height: Number(flags.height || 1080),
            },
            brand: parseBrandJson(flags['brand-json']),
          })
        )
      }

      return results
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
