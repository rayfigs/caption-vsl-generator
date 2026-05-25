#!/usr/bin/env node
/**
 * vo-segmented.mjs — intentional, non-flat VO for the Caption VSL.
 *
 * The single-shot TTS reads the whole script in one call at one stability,
 * so the model picks its own emphasis and it lands wrong ("very AI"). This
 * builds the voiceover the way Ray's VO SOP wants it:
 *   - punchy, declarative OPENERS: high stability, low style
 *   - expressive BODY lines: lower stability, higher style
 *   - a ~350ms breath between sentences (sentence breathing)
 * Each line is generated on its own so prosody is correct per sentence, then
 * the segments are stitched with silence and the word timestamps are offset to
 * the combined timeline. It writes <output>.mp3 + <output>.cache.json so the
 * existing renderer reuses them (no core changes).
 *
 * Usage:
 *   node scripts/vo-segmented.mjs --transcript path.txt --output out.mp4 [--voice ray]
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const VOICES = { ray: 'uhI18lp2kSQHa5dX4ehN', adam: 'pNInz6obpgDQGcFmaJgB' }

// Per-role ElevenLabs voice_settings (the SOP). High stability = grounded/punchy;
// lower stability + higher style = expressive. similarity high so it stays Ray.
const ROLE = {
  punchy:     { stability: 0.6, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true },
  expressive: { stability: 0.4, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true },
}

// Phonetic respellings so the clone says words right. Captions keep the display form.
// "Meta" was read "MEE-tuh"; "Metta" forces the short-e "MEH-tuh".
const PRONUNCIATION = { Meta: 'Metta' }

// Silence padded onto each segment so the first/last word isn't clipped at the join.
const HEAD_PAD = 0.10
const TAIL_PAD = 0.10

/** Swap display words for their spoken respelling before sending to TTS. */
function speakText(text) {
  let out = text
  for (const [disp, spoken] of Object.entries(PRONUNCIATION)) {
    out = out.replace(new RegExp(`\\b${disp}\\b`, 'g'), spoken)
  }
  return out
}

/** Map a spoken token back to its display form for the caption. */
function restoreDisplay(word) {
  const letters = word.replace(/[^A-Za-z]/g, '')
  for (const [disp, spoken] of Object.entries(PRONUNCIATION)) {
    if (letters.toLowerCase() === spoken.toLowerCase()) return word.replace(letters, disp)
  }
  return word
}

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? process.argv[i + 1] : def
}

async function loadEnv() {
  try {
    const raw = await readFile(path.join(ROOT, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#') || !t.includes('=')) continue
      const idx = t.indexOf('=')
      const k = t.slice(0, idx).trim()
      let v = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (k && process.env[k] === undefined) process.env[k] = v
    }
  } catch { /* no .env */ }
}

function wordsFromAlignment(al, offset) {
  if (!al) return []
  const chars = al.characters || []
  const starts = al.character_start_times_seconds || []
  const ends = al.character_end_times_seconds || []
  const words = []
  let cur = '', cs = 0, ce = 0
  chars.forEach((c, i) => {
    const s = starts[i] ?? ce, e = ends[i] ?? s
    if (/\s/.test(c)) {
      if (cur) { words.push({ word: cur, start: cs + offset, end: ce + offset }); cur = '' }
      return
    }
    if (!cur) cs = s
    cur += c; ce = e
  })
  if (cur) words.push({ word: cur, start: cs + offset, end: ce + offset })
  return words
}

async function tts(text, settings, outPath) {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('ELEVENLABS_API_KEY is required')
  const voice = VOICES[arg('voice', 'ray')] || arg('voice', 'ray')
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: arg('model', 'eleven_multilingual_v2'),
      output_format: 'mp3_44100_128',
      voice_settings: settings,
    }),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`)
  const data = await res.json()
  if (!data.audio_base64) throw new Error('no audio_base64')
  await writeFile(outPath, Buffer.from(data.audio_base64, 'base64'))
  return data.normalized_alignment || data.alignment
}

function ffprobeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim()
  return parseFloat(out)
}

function makeSilence(seconds, outPath) {
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`, '-t', String(seconds), '-q:a', '9', '-acodec', 'libmp3lame', outPath], { stdio: 'ignore' })
}

/** Pad a segment with lead-in/lead-out silence so word edges aren't clipped at concat joins. */
function padSegment(inFile, outFile) {
  execFileSync('ffmpeg', ['-y', '-i', inFile, '-af', `adelay=${Math.round(HEAD_PAD * 1000)}:all=1,apad=pad_dur=${TAIL_PAD}`, '-acodec', 'libmp3lame', '-ar', '44100', '-q:a', '2', outFile], { stdio: 'ignore' })
}

async function main() {
  await loadEnv()
  const transcript = arg('transcript')
  const output = arg('output')
  if (!transcript || !output) throw new Error('--transcript and --output are required')

  const audioPath = path.resolve(output.replace(/\.[^.]+$/, '.mp3'))
  const cachePath = audioPath.replace(/\.mp3$/, '.cache.json')
  const work = path.join(ROOT, 'output', 'vo-work')
  await rm(work, { recursive: true, force: true })
  await mkdir(work, { recursive: true })

  const raw = await readFile(path.resolve(transcript), 'utf8')
  const lines = raw.split('\n')
  // Build beats: non-empty lines, flagging a paragraph break (blank line) before them.
  const beats = []
  let paraBreakPending = false
  for (const ln of lines) {
    if (ln.trim() === '') { paraBreakPending = true; continue }
    beats.push({ text: ln.trim(), paraBefore: paraBreakPending })
    paraBreakPending = false
  }

  const PAUSE = parseFloat(arg('pause', '0.45'))      // breath between sentences
  const PARA = parseFloat(arg('para-pause', '0.7'))   // longer beat at paragraph breaks

  const inputs = []          // ordered file list for concat (segments + silences)
  const allWords = []
  let cursor = 0

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i]
    const isPunchy = i === 0 || i === beats.length - 1
    const role = isPunchy ? 'punchy' : 'expressive'

    // Insert a breath BEFORE this beat (except the very first).
    if (i > 0) {
      const gap = b.paraBefore ? PARA : PAUSE
      const silFile = path.join(work, `sil-${i}.mp3`)
      makeSilence(gap, silFile)
      inputs.push(silFile)
      cursor += gap
    }

    const segRaw = path.join(work, `seg-${i}-raw.mp3`)
    const segFile = path.join(work, `seg-${i}.mp3`)
    process.stderr.write(`[${i + 1}/${beats.length}] ${role}: ${b.text.slice(0, 50)}\n`)
    const al = await tts(speakText(b.text), ROLE[role], segRaw)
    padSegment(segRaw, segFile)
    const dur = ffprobeDuration(segFile)
    // Spoken content starts after the head pad; map respelled words back to display form.
    const segWords = wordsFromAlignment(al, cursor + HEAD_PAD).map((w) => ({ ...w, word: restoreDisplay(w.word) }))
    allWords.push(...segWords)
    inputs.push(segFile)
    cursor += dur
  }

  // Concatenate all inputs (segments + silences) in order.
  const args = ['-y']
  for (const f of inputs) args.push('-i', f)
  const filter = inputs.map((_, idx) => `[${idx}:a]`).join('') + `concat=n=${inputs.length}:v=0:a=1[out]`
  args.push('-filter_complex', filter, '-map', '[out]', '-acodec', 'libmp3lame', '-ar', '44100', '-q:a', '2', audioPath)
  execFileSync('ffmpeg', args, { stdio: 'ignore' })

  const totalDur = ffprobeDuration(audioPath)
  await writeFile(cachePath, JSON.stringify({ duration: totalDur, wordTimestamps: allWords }))
  await rm(work, { recursive: true, force: true })

  process.stdout.write(JSON.stringify({ audioPath, cachePath, beats: beats.length, duration: totalDur, words: allWords.length }, null, 2) + '\n')
}

main().catch((e) => { process.stderr.write(`vo-segmented failed: ${e.message}\n`); process.exit(1) })
