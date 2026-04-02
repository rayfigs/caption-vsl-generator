import type { CaptionSegment, WordTimestamp } from './types'

interface TranscriptLayout {
  maxCharsPerLine: number
  maxLines: number
  wordPause: number
  sentencePause: number
}

function stripParagraphMarkers(word: string) {
  return word.replace(/[\r\n]+/g, '').trim()
}

function hasParagraphBreak(word: string) {
  return /[\r\n]{2,}/.test(word)
}

function endsSentence(word: string) {
  return /[.!?]["')\]]*$/.test(word.trim())
}

function wrapWords(words: string[], maxCharsPerLine: number): string[] {
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
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function buildSegment(words: WordTimestamp[], nextStartTime?: number): CaptionSegment {
  return {
    text: words.map((word) => stripParagraphMarkers(word.word)).join(' '),
    words: words.map((word) => ({
      ...word,
      word: stripParagraphMarkers(word.word),
    })),
    startTime: words[0]?.start ?? 0,
    endTime: nextStartTime ?? words[words.length - 1]?.end ?? 0,
    activeWordIndex: 0,
  }
}

export function findActiveWordIndex(segment: CaptionSegment, currentTime: number) {
  return segment.words.findIndex((word) => currentTime >= word.start && currentTime < word.end)
}

export function parseTranscript(
  wordTimestamps: WordTimestamp[],
  layout: TranscriptLayout
): CaptionSegment[] {
  const sanitizedWords = wordTimestamps.filter((word) => stripParagraphMarkers(word.word).length > 0)
  const segments: CaptionSegment[] = []
  let currentSegmentWords: WordTimestamp[] = []

  for (let index = 0; index < sanitizedWords.length; index++) {
    const word = sanitizedWords[index]
    const previousWord = currentSegmentWords[currentSegmentWords.length - 1]

    if (previousWord) {
      const pause = word.start - previousWord.end
      const candidateWords = [...currentSegmentWords, word]
      const candidateLines = wrapWords(
        candidateWords.map((entry) => stripParagraphMarkers(entry.word)),
        layout.maxCharsPerLine
      )

      const sentenceBoundary = endsSentence(previousWord.word) && pause >= layout.sentencePause
      const paragraphBoundary = hasParagraphBreak(word.word)
      const wordPauseBoundary = pause >= layout.wordPause
      const overflowBoundary = candidateLines.length > layout.maxLines

      if (sentenceBoundary || paragraphBoundary || wordPauseBoundary || overflowBoundary) {
        segments.push(buildSegment(currentSegmentWords, word.start))
        currentSegmentWords = []
      }
    }

    currentSegmentWords.push(word)
  }

  if (currentSegmentWords.length > 0) {
    segments.push(buildSegment(currentSegmentWords))
  }

  return segments
}
