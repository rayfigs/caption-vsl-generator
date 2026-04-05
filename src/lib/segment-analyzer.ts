/**
 * Segment Analyzer — identifies the strongest segments from a long-form transcript.
 *
 * Uses Whisper word timestamps to find natural breaks, then scores each segment
 * using Claude for quality assessment.
 *
 * Requires ANTHROPIC_API_KEY in .env
 */

import type { WordTimestamp } from './types'

export interface SegmentScore {
  clarity: number      // 1-10
  emotion: number      // 1-10
  quotability: number  // 1-10
  pacing: number       // 1-10
  overall: number      // weighted average
}

export interface AnalyzedSegment {
  id: string
  inTime: number
  outTime: number
  duration: number
  text: string
  hookSentence: string
  score: SegmentScore
  tags: string[]
  fillerRemoved: string[]
}

export interface EDL {
  sourceVideo: string
  totalDuration: number
  segments: AnalyzedSegment[]
  recommendedHookId: string
  analyzedAt: string
}

// Filler words/phrases to strip before scoring
const FILLER_PATTERNS = [
  /\b(um|uh|uhm|umm)\b/gi,
  /\b(you know)\b/gi,
  /\b(I mean)\b/gi,
  /\b(so basically)\b/gi,
  /\b(like)\b(?=\s+(I|we|they|he|she|it|the|a|an|my|your)\b)/gi, // "like" as filler, not comparison
  /(\b\w+)\s+\1\b/gi, // repeated words ("I I I")
]

function removeFiller(text: string): { cleaned: string; removed: string[] } {
  const removed: string[] = []
  let cleaned = text

  for (const pattern of FILLER_PATTERNS) {
    const matches = cleaned.match(pattern)
    if (matches) {
      removed.push(...matches)
      cleaned = cleaned.replace(pattern, '').replace(/\s{2,}/g, ' ').trim()
    }
  }

  return { cleaned, removed }
}

/**
 * Find natural segment boundaries from word timestamps.
 * Splits at pauses > pauseThreshold seconds.
 */
function findSegmentBoundaries(
  words: WordTimestamp[],
  pauseThreshold: number = 0.8,
  minDuration: number = 8,
  maxDuration: number = 90
): Array<{ inTime: number; outTime: number; words: WordTimestamp[] }> {
  const rawSegments: Array<{ words: WordTimestamp[] }> = []
  let current: WordTimestamp[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const prev = current[current.length - 1]

    if (prev && word.start - prev.end > pauseThreshold) {
      if (current.length > 0) rawSegments.push({ words: [...current] })
      current = []
    }

    current.push(word)
  }

  if (current.length > 0) rawSegments.push({ words: current })

  // Merge segments that are too short, split segments that are too long
  const merged: Array<{ inTime: number; outTime: number; words: WordTimestamp[] }> = []
  let accumulator: WordTimestamp[] = []

  for (const seg of rawSegments) {
    accumulator.push(...seg.words)
    const duration = accumulator[accumulator.length - 1].end - accumulator[0].start

    if (duration >= minDuration) {
      // If over max, split at sentence boundaries
      if (duration > maxDuration) {
        const splits = splitAtSentences(accumulator, maxDuration)
        for (const split of splits) {
          merged.push({
            inTime: split[0].start,
            outTime: split[split.length - 1].end,
            words: split,
          })
        }
      } else {
        merged.push({
          inTime: accumulator[0].start,
          outTime: accumulator[accumulator.length - 1].end,
          words: accumulator,
        })
      }
      accumulator = []
    }
  }

  // Handle remaining accumulator
  if (accumulator.length > 0) {
    const duration = accumulator[accumulator.length - 1].end - accumulator[0].start
    if (duration >= minDuration / 2) {
      merged.push({
        inTime: accumulator[0].start,
        outTime: accumulator[accumulator.length - 1].end,
        words: accumulator,
      })
    }
  }

  return merged
}

function splitAtSentences(words: WordTimestamp[], maxDuration: number): WordTimestamp[][] {
  const result: WordTimestamp[][] = []
  let current: WordTimestamp[] = []

  for (const word of words) {
    current.push(word)
    const duration = current[current.length - 1].end - current[0].start
    const isSentenceEnd = /[.!?]$/.test(word.word.trim())

    if (duration >= maxDuration * 0.7 && isSentenceEnd) {
      result.push([...current])
      current = []
    }
  }

  if (current.length > 0) {
    if (result.length > 0 && current.length < 5) {
      // Merge tiny remainder with previous
      result[result.length - 1].push(...current)
    } else {
      result.push(current)
    }
  }

  return result
}

/**
 * Score segments using Claude API.
 * Falls back to heuristic scoring if ANTHROPIC_API_KEY is not set.
 */
async function scoreSegments(
  segments: Array<{ text: string; duration: number }>,
): Promise<Array<{ score: SegmentScore; hookSentence: string; tags: string[] }>> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    process.stderr.write('ANTHROPIC_API_KEY not set, using heuristic scoring\n')
    return segments.map(seg => heuristicScore(seg.text, seg.duration))
  }

  const results: Array<{ score: SegmentScore; hookSentence: string; tags: string[] }> = []

  // Batch scoring: send all segments in one API call for efficiency
  const prompt = segments.map((seg, i) =>
    `SEGMENT ${i + 1} (${seg.duration.toFixed(1)}s):\n${seg.text}`
  ).join('\n\n---\n\n')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are scoring testimonial video segments for ad potential. For each segment, provide a JSON array with one object per segment:

${prompt}

Return ONLY a JSON array. Each object:
{
  "clarity": 1-10,
  "emotion": 1-10,
  "quotability": 1-10,
  "pacing": 1-10,
  "hookSentence": "the single best opening sentence from this segment",
  "tags": ["result", "pain", "transformation", "social-proof", "authority", "before-after", "objection"]
}

Score strictly. A 10 is exceptional. Most segments should be 4-7.`
        }],
      }),
    })

    const data = await response.json() as any
    const text = data.content?.[0]?.text || '[]'
    const jsonStr = text.replace(/```json?\n?/g, '').replace(/```\s*$/g, '').trim()
    const scored = JSON.parse(jsonStr) as Array<{
      clarity: number; emotion: number; quotability: number; pacing: number;
      hookSentence: string; tags: string[]
    }>

    for (let i = 0; i < segments.length; i++) {
      const s = scored[i] || { clarity: 5, emotion: 5, quotability: 5, pacing: 5, hookSentence: '', tags: [] }
      results.push({
        score: {
          clarity: s.clarity,
          emotion: s.emotion,
          quotability: s.quotability,
          pacing: s.pacing,
          overall: Math.round((s.clarity * 0.25 + s.emotion * 0.3 + s.quotability * 0.25 + s.pacing * 0.2) * 10) / 10,
        },
        hookSentence: s.hookSentence || segments[i].text.split(/[.!?]/)[0] + '.',
        tags: s.tags || [],
      })
    }
  } catch (err) {
    process.stderr.write(`Claude scoring failed, falling back to heuristic: ${err}\n`)
    return segments.map(seg => heuristicScore(seg.text, seg.duration))
  }

  return results
}

function heuristicScore(text: string, duration: number): { score: SegmentScore; hookSentence: string; tags: string[] } {
  const words = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).filter(Boolean).length
  const avgWordsPerSentence = words / Math.max(sentences, 1)

  // Simple heuristics
  const clarity = Math.min(10, Math.max(3, 10 - Math.abs(avgWordsPerSentence - 15) * 0.3))
  const pacing = Math.min(10, Math.max(3, duration > 10 && duration < 45 ? 7 : 4))
  const emotion = text.match(/\b(feel|felt|life|changed|amazing|incredible|struggle|pain|hope|love|fear)\b/gi)?.length || 0
  const emotionScore = Math.min(10, 4 + emotion)
  const quotability = sentences <= 3 ? 7 : 5

  return {
    score: {
      clarity: Math.round(clarity),
      emotion: emotionScore,
      quotability,
      pacing: Math.round(pacing),
      overall: Math.round((clarity * 0.25 + emotionScore * 0.3 + quotability * 0.25 + pacing * 0.2) * 10) / 10,
    },
    hookSentence: text.split(/[.!?]/)[0] + '.',
    tags: [],
  }
}

/**
 * Analyze a full transcript and produce an EDL with scored segments.
 */
export async function analyzeTranscript(
  wordTimestamps: WordTimestamp[],
  sourceVideo: string,
  options?: {
    maxSegments?: number
    minDuration?: number
    maxDuration?: number
    pauseThreshold?: number
  }
): Promise<EDL> {
  const maxSegments = options?.maxSegments || 10
  const totalDuration = wordTimestamps.length > 0
    ? wordTimestamps[wordTimestamps.length - 1].end
    : 0

  // Find natural segment boundaries
  const boundaries = findSegmentBoundaries(
    wordTimestamps,
    options?.pauseThreshold || 0.8,
    options?.minDuration || 8,
    options?.maxDuration || 90
  )

  // Build text for each segment and remove filler
  const segmentsWithText = boundaries.map((b, i) => {
    const rawText = b.words.map(w => w.word).join(' ')
    const { cleaned, removed } = removeFiller(rawText)
    return {
      ...b,
      text: cleaned,
      rawText,
      fillerRemoved: removed,
      duration: b.outTime - b.inTime,
    }
  })

  // Score all segments
  const scores = await scoreSegments(
    segmentsWithText.map(s => ({ text: s.text, duration: s.duration }))
  )

  // Build analyzed segments
  const analyzed: AnalyzedSegment[] = segmentsWithText.map((seg, i) => ({
    id: `seg_${String(i + 1).padStart(3, '0')}`,
    inTime: seg.inTime,
    outTime: seg.outTime,
    duration: seg.duration,
    text: seg.text,
    hookSentence: scores[i].hookSentence,
    score: scores[i].score,
    tags: scores[i].tags,
    fillerRemoved: seg.fillerRemoved,
  }))

  // Sort by overall score, take top N
  analyzed.sort((a, b) => b.score.overall - a.score.overall)
  const topSegments = analyzed.slice(0, maxSegments)

  // Re-sort by timecode for chronological order
  topSegments.sort((a, b) => a.inTime - b.inTime)

  // Find the best hook
  const bestHook = [...topSegments].sort((a, b) => b.score.quotability - a.score.quotability)[0]

  return {
    sourceVideo,
    totalDuration,
    segments: topSegments,
    recommendedHookId: bestHook?.id || topSegments[0]?.id || '',
    analyzedAt: new Date().toISOString(),
  }
}
