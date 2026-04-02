import type { LayoutConfig } from './types'

export function calculateLayout(config: LayoutConfig) {
  const effectiveWidth = Math.max(config.boxWidth - config.padding * 2, 1)
  const effectiveHeight = Math.max(config.boxHeight - config.padding * 2, 1)

  return {
    effectiveWidth,
    effectiveHeight,
    maxCharsPerLine: Math.max(Math.floor(effectiveWidth / Math.max(config.fontSize * 0.58, 1)), 1),
    maxLines: Math.max(
      Math.floor(effectiveHeight / Math.max(config.fontSize * config.lineHeight, 1)),
      1
    ),
  }
}

export function fitTextToBox(text: string, config: LayoutConfig): string[] {
  const { maxCharsPerLine, maxLines } = calculateLayout(config)
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length <= maxCharsPerLine) {
      currentLine = nextLine
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word

    if (lines.length >= maxLines) {
      break
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  return lines
}
