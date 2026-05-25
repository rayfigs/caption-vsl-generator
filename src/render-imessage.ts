import { readFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { selectComposition, renderMedia } from '@remotion/renderer'
import { calculateConversationDuration } from './imessage/duration.ts'
import type { Message } from './imessage/types.ts'

interface IMessageProps {
  contactName?: string
  subtitle?: string
  is3D?: boolean
  brand?: Record<string, string>
  conversation: Message[]
}

export interface RenderIMessageOptions {
  conversationPath: string
  outputPath: string
  onProgress?: (progress: number) => void
}

export async function renderIMessage(opts: RenderIMessageOptions): Promise<{
  outputPath: string
  durationInFrames: number
  messageCount: number
}> {
  const raw = await readFile(opts.conversationPath, 'utf8')
  const props: IMessageProps = JSON.parse(raw)

  if (!Array.isArray(props.conversation) || props.conversation.length === 0) {
    throw new Error(`No conversation messages found in ${opts.conversationPath}`)
  }

  const durationInFrames = calculateConversationDuration(props.conversation)

  await mkdir(path.dirname(opts.outputPath), { recursive: true })

  const entryPoint = path.resolve(__dirname, '../src/index.ts')

  const serveUrl = await bundle({
    entryPoint,
    onProgress: (p) => {
      if (opts.onProgress) opts.onProgress(p / 100)
    },
  })

  const composition = await selectComposition({
    serveUrl,
    id: 'IosMessenger',
    inputProps: props as unknown as Record<string, unknown>,
  })

  await renderMedia({
    serveUrl,
    composition: { ...composition, durationInFrames },
    codec: 'h264',
    outputLocation: opts.outputPath,
    inputProps: props as unknown as Record<string, unknown>,
    pixelFormat: 'yuv420p',
    onProgress: ({ progress }) => {
      if (opts.onProgress) opts.onProgress(progress)
    },
  })

  return {
    outputPath: opts.outputPath,
    durationInFrames,
    messageCount: props.conversation.length,
  }
}

// CLI entry: node tsx src/render-imessage.ts <conversation.json> <output.mp4>
async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('Usage: tsx src/render-imessage.ts <conversation.json> <output.mp4>')
    process.exit(1)
  }
  const [conversationPath, outputPath] = args
  console.log(`[iMessage] Bundling and rendering ${conversationPath} -> ${outputPath}`)
  const result = await renderIMessage({
    conversationPath,
    outputPath,
    onProgress: (p) => {
      if (Math.round(p * 100) % 10 === 0) {
        process.stdout.write(`\r[iMessage] ${Math.round(p * 100)}%   `)
      }
    },
  })
  console.log('')
  console.log(JSON.stringify(result, null, 2))
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
