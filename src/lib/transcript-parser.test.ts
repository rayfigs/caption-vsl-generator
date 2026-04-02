import { describe, expect, it } from 'vitest'
import { findActiveWordIndex, parseTranscript } from './transcript-parser'
import type { WordTimestamp } from './types'

const baseLayout = {
  maxCharsPerLine: 12,
  maxLines: 2,
  wordPause: 0.4,
  sentencePause: 0.2,
}

describe('transcript-parser', () => {
  it('aligns segment boundaries with sentence endings', () => {
    const words: WordTimestamp[] = [
      { word: 'Hello.', start: 0, end: 0.2 },
      { word: 'Again', start: 0.5, end: 0.7 },
      { word: 'friend', start: 0.75, end: 1 },
    ]

    const segments = parseTranscript(words, baseLayout)

    expect(segments).toHaveLength(2)
    expect(segments[0].text).toBe('Hello.')
    expect(segments[0].endTime).toBe(0.5)
    expect(segments[1].text).toBe('Again friend')
  })

  it('creates different segment counts when the box size changes', () => {
    const words: WordTimestamp[] = [
      { word: 'This', start: 0, end: 0.2 },
      { word: 'caption', start: 0.21, end: 0.4 },
      { word: 'needs', start: 0.41, end: 0.55 },
      { word: 'more', start: 0.56, end: 0.7 },
      { word: 'room', start: 0.71, end: 0.85 },
    ]

    const narrow = parseTranscript(words, { ...baseLayout, maxCharsPerLine: 8, maxLines: 1 })
    const wide = parseTranscript(words, { ...baseLayout, maxCharsPerLine: 20, maxLines: 2 })

    expect(narrow.length).toBeGreaterThan(wide.length)
  })

  it('advances the active highlighted word correctly', () => {
    const segments = parseTranscript(
      [
        { word: 'One', start: 0, end: 0.2 },
        { word: 'two', start: 0.21, end: 0.4 },
        { word: 'three', start: 0.41, end: 0.7 },
      ],
      { ...baseLayout, maxCharsPerLine: 30, maxLines: 2 }
    )

    expect(findActiveWordIndex(segments[0], 0.1)).toBe(0)
    expect(findActiveWordIndex(segments[0], 0.35)).toBe(1)
    expect(findActiveWordIndex(segments[0], 0.55)).toBe(2)
  })

  it('creates segment boundaries for paragraph breaks', () => {
    const segments = parseTranscript(
      [
        { word: 'First', start: 0, end: 0.2 },
        { word: 'paragraph', start: 0.21, end: 0.5 },
        { word: '\n\nSecond', start: 0.6, end: 0.8 },
        { word: 'paragraph', start: 0.81, end: 1.1 },
      ],
      { ...baseLayout, maxCharsPerLine: 40, maxLines: 2 }
    )

    expect(segments).toHaveLength(2)
    expect(segments[0].text).toBe('First paragraph')
    expect(segments[1].text).toBe('Second paragraph')
  })
})
