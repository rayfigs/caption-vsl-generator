import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'

const outputPath = path.resolve(process.cwd(), 'output/showreel.mp4')

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true })

  process.stderr.write('Bundling...\n')
  const entryPoint = path.join(process.cwd(), 'src/index.ts')
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  process.stderr.write('Selecting AgencyShowreel composition...\n')
  const composition = await selectComposition({
    serveUrl,
    id: 'AgencyShowreel',
    inputProps: {},
  })

  process.stderr.write(`Rendering ${composition.durationInFrames} frames at ${composition.fps}fps → ${outputPath}\n`)
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outputPath,
    timeoutInMilliseconds: 300_000,
    inputProps: {},
    onProgress: ({ progress }) => {
      process.stderr.write(`  ${Math.round(progress * 100)}%\r`)
    },
  })

  process.stderr.write(`\nDone: ${outputPath}\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
