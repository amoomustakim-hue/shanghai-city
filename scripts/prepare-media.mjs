#!/usr/bin/env node
/**
 * Prepares the Shanghai footage for the web.
 *
 *   npm run media -- path/to/video.mp4
 *
 * Defaults to media-src/shanghai-source.mp4. Writes to public/media/:
 *   shanghai.mp4         desktop, short GOP so scroll-scrubbing seeks fast
 *   shanghai-mobile.mp4  lighter encode for small screens
 *   *.webm               VP9 fallbacks for browsers without H.264
 *   poster-*.jpg         stills sampled across the day → night transition
 *
 * The footage itself is never altered beyond scaling and compression.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = resolve(root, process.argv[2] ?? 'media-src/shanghai-source.mp4')
const out = resolve(root, 'public/media')

if (!existsSync(input)) {
  console.error(`No source video at ${input}`)
  process.exit(1)
}
mkdirSync(out, { recursive: true })

const run = (args) => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', input], { encoding: 'utf8' }).stderr
const [, h, m, s] = probe.match(/Duration: (\d+):(\d+):([\d.]+)/) ?? []
const duration = +h * 3600 + +m * 60 + +s
console.log(`source: ${input} (${duration.toFixed(2)}s)`)

// -g 8 / no B-frames: every seek lands at most 7 frames from a keyframe,
// which is what keeps currentTime scrubbing smooth in the TIME section.
const common = ['-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '24', '-bf', '0', '-movflags', '+faststart']

console.log('→ shanghai.mp4')
run(['-i', input, ...common, '-preset', 'slow', '-crf', '23', '-g', '8', '-vf', 'scale=-2:min(ih\\,720)', `${out}/shanghai.mp4`])

console.log('→ shanghai-mobile.mp4')
run(['-i', input, ...common, '-preset', 'slow', '-crf', '25', '-g', '8', '-vf', 'scale=-2:480', `${out}/shanghai-mobile.mp4`])

// VP9 fallbacks, same keyframe spacing.
const vp9 = ['-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-r', '24', '-g', '8', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2']
console.log('→ shanghai.webm')
run(['-i', input, ...vp9, '-crf', '36', '-vf', 'scale=-2:min(ih\\,720)', `${out}/shanghai.webm`])
console.log('→ shanghai-mobile.webm')
run(['-i', input, ...vp9, '-crf', '40', '-vf', 'scale=-2:480', `${out}/shanghai-mobile.webm`])

const stills = { day: 0.02, golden: 0.3, dusk: 0.5, blue: 0.7, night: 0.97 }
for (const [name, at] of Object.entries(stills)) {
  console.log(`→ poster-${name}.jpg`)
  run(['-ss', String((duration * at).toFixed(2)), '-i', input, '-frames:v', '1', '-q:v', '3', `${out}/poster-${name}.jpg`])
}

for (const f of ['shanghai.mp4', 'shanghai-mobile.mp4', 'shanghai.webm', 'shanghai-mobile.webm']) {
  console.log(`${f}: ${(statSync(`${out}/${f}`).size / 1e6).toFixed(1)} MB`)
}
