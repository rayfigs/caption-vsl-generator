/**
 * Dual-Track Transcript Parser
 *
 * Separates visual text (what shows on screen) from audio text (what gets spoken).
 *
 * Markup syntax:
 *   Plain text          → same for both visual and audio
 *   {audio: alt text}   → display the preceding word(s) visually, speak "alt text"
 *   {skip}              → display visually but don't speak
 *   {speak: text}       → speak but don't display on screen
 *
 * Examples:
 *   "$400/mo {audio: four hundred dollars a month} target"
 *     Visual: "$400/mo target"
 *     Audio:  "four hundred dollars a month target"
 *
 *   "NODE_ENV=production {audio: node env equals production} broke installs"
 *     Visual: "NODE_ENV=production broke installs"
 *     Audio:  "node env equals production broke installs"
 *
 *   "10/s {audio: ten seconds} each"
 *     Visual: "10/s each"
 *     Audio:  "ten seconds each"
 *
 *   "== SECTION TITLE == {skip}"
 *     Visual: "== SECTION TITLE =="
 *     Audio:  (nothing)
 */

export interface DualTrackResult {
  visualText: string
  audioText: string
  /** Map of visual word index → audio replacement (for display sync) */
  replacements: Map<number, string>
}

const AUDIO_TAG = /\{audio:\s*([^}]+)\}/g
const SKIP_TAG = /\{skip\}/g
const SPEAK_TAG = /\{speak:\s*([^}]+)\}/g

export function parseDualTrack(input: string): DualTrackResult {
  const replacements = new Map<number, string>()
  let visualText = input
  let audioText = input

  // Process {speak: ...} tags first (audio only, not visual)
  visualText = visualText.replace(SPEAK_TAG, '')
  audioText = audioText.replace(SPEAK_TAG, (_, spoken) => spoken)

  // Process {skip} tags (visual only, not audio)
  // Find the word before {skip} and remove it from audio
  audioText = audioText.replace(/(\S+)\s*\{skip\}/g, '')
  visualText = visualText.replace(SKIP_TAG, '')

  // Process {audio: ...} tags
  // In visual: remove the tag, keep the preceding word
  // In audio: replace the preceding word with the tag content
  audioText = audioText.replace(/(\S+)\s*\{audio:\s*([^}]+)\}/g, (_, _word, spoken) => spoken)
  visualText = visualText.replace(AUDIO_TAG, '')

  // Clean up extra whitespace
  visualText = visualText.replace(/\s+/g, ' ').trim()
  audioText = audioText.replace(/\s+/g, ' ').trim()

  return { visualText, audioText, replacements }
}

/**
 * Split a full script into dual-track, returning separate visual and audio strings.
 * Process line by line to preserve paragraph structure.
 */
export function splitDualTrackScript(script: string): { visual: string; audio: string } {
  const lines = script.split('\n')
  const visualLines: string[] = []
  const audioLines: string[] = []

  for (const line of lines) {
    if (line.trim() === '') {
      visualLines.push('')
      audioLines.push('')
      continue
    }

    const { visualText, audioText } = parseDualTrack(line)
    visualLines.push(visualText)
    audioLines.push(audioText)
  }

  return {
    visual: visualLines.join('\n'),
    audio: audioLines.join('\n'),
  }
}
