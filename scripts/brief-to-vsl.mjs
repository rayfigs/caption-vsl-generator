#!/usr/bin/env node
/**
 * brief-to-vsl.mjs — the done-for-you orchestrator.
 *
 * Takes an interview brief (the structured output of the ElevenLabs agent),
 * turns it into a finished Caption VSL, and pings Telegram for QC before
 * anything goes to the lead. This is the "heart" of the done-for-you path;
 * the agent + webhook + email delivery wrap around it (see the Codex spec).
 *
 * Usage:
 *   node scripts/brief-to-vsl.mjs path/to/brief.json
 *
 * Brief shape (all the interview needs to capture):
 * {
 *   "leadName": "Jane",
 *   "leadEmail": "jane@acme.com",
 *   "offer": "what they sell + the promise",
 *   "audience": "who it's for",
 *   "angle": "the hook / what to lead with",
 *   "brandColors": { "primary": "#C8804F", "accent": "#F6B868" },
 *   "template": "rorick-bold",   // optional, defaults to rorick-bold
 *   "voice": "adam",             // optional
 *   "script": "...optional pre-written script. If omitted, one is generated."
 * }
 *
 * HUMAN-IN-THE-LOOP (v1): this renders and Telegram-pings Ray with the file.
 * It does NOT email the lead. Sending to the lead is a separate, approved step
 * (see deliverToLead, currently a stub) so nothing reaches a real person without
 * Ray's sign-off. Flip to auto-send once the quality bar is trusted.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_DIR = path.join(ROOT, 'output', 'done-for-you')

async function loadEnv() {
  // The CLI needs ELEVENLABS_API_KEY / OPENAI_API_KEY in process.env.
  // Load them from the repo .env so the spawned child inherits them.
  try {
    const raw = await readFile(path.join(ROOT, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const idx = trimmed.indexOf('=')
      const key = trimmed.slice(0, idx).trim()
      let val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (key && process.env[key] === undefined) process.env[key] = val
    }
  } catch { /* no .env, fine */ }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))))
    child.on('error', reject)
  })
}

async function notify(message) {
  // Reuse ClaudeClaw's notify script if present; otherwise just log.
  const notifyPath = process.env.CLAUDECLAW_NOTIFY
  if (notifyPath) {
    try { await run('bash', [notifyPath, message]) } catch { /* non-fatal */ }
  }
  process.stdout.write(`[notify] ${message}\n`)
}

/**
 * generateScript — turn a brief into a Caption VSL script.
 * v1: if the brief already has a script, use it. Otherwise call OpenAI.
 * Later this can route to Ray's VSL Scripting Engine instead.
 */
async function generateScript(brief) {
  if (brief.script && brief.script.trim().length > 0) return brief.script.trim()

  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('No script in brief and OPENAI_API_KEY not set for script generation.')

  const sys = [
    'You write short text-on-screen video sales letter (VSL) scripts in the Jon Benson tradition.',
    'Rules: plain spoken sentences, one idea per line, lead with the angle, no hype, no em dashes,',
    'no groups of three, no "not X but Y" constructions. 110 to 160 words. End on one clear next step.',
  ].join(' ')
  const user = `Write a Caption VSL script.\nOffer: ${brief.offer}\nAudience: ${brief.audience}\nAngle: ${brief.angle}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Script generation failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

/** deliverToLead — STUB. Wire to Resend once Ray approves the QC step. */
async function deliverToLead(/* brief, videoPath */) {
  // Intentionally not implemented: v1 is human-in-the-loop. See Codex spec.
  return { delivered: false, reason: 'human-in-the-loop: awaiting Ray QC + approval' }
}

async function main() {
  const briefPath = process.argv[2]
  if (!briefPath) throw new Error('Usage: node scripts/brief-to-vsl.mjs <brief.json>')

  await loadEnv()
  const brief = JSON.parse(await readFile(path.resolve(briefPath), 'utf8'))
  await mkdir(OUTPUT_DIR, { recursive: true })

  const slug = (brief.leadName || 'lead').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const transcriptPath = path.join(OUTPUT_DIR, `${slug}-${stamp}.txt`)
  const outputPath = path.join(OUTPUT_DIR, `${slug}-${stamp}.mp4`)

  await notify(`Caption VSL build started for ${brief.leadName || 'a lead'} ⚙️`)

  const script = await generateScript(brief)
  await writeFile(transcriptPath, script, 'utf8')

  const brandKit = JSON.stringify({
    name: brief.leadName || 'Lead',
    primaryColor: brief.brandColors?.primary || '#C8804F',
    accentColor: brief.brandColors?.accent || '#F6B868',
  })

  const args = [
    'tsx', 'src/cli.ts', 'generate',
    '--transcript', transcriptPath,
    '--template', brief.template || 'rorick-bold',
    '--voice', brief.voice || 'adam',
    '--brand-kit', brandKit,
    '--output', outputPath,
  ]
  await run('npx', args)

  await notify(`Caption VSL ready for QC: ${outputPath} ✅`)
  const delivery = await deliverToLead()

  process.stdout.write(JSON.stringify({ script: transcriptPath, video: outputPath, delivery }, null, 2) + '\n')
}

main().catch((err) => {
  process.stderr.write(`brief-to-vsl failed: ${err.message}\n`)
  process.exit(1)
})
