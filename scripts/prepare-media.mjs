#!/usr/bin/env node
/**
 * Prepares the Shanghai footage for the web.
 *
 *   npm run media -- path/to/video.mp4
 *
 * Defaults to media-src/shanghai-source.mp4. Writes to public/media/:
 *   shanghai.mp4         desktop 1080p, short GOP so scroll-scrubbing seeks fast
 *   shanghai-mobile.mp4  720p for phones (portrait crops stretch the height most)
 *   *.webm               VP9 fallbacks for browsers without H.264
 *   poster-*.jpg         stills sampled across the day → night transition
 *
 * The footage is only resized (Lanczos, with a gentle luma unsharp to
 * keep skyline edges crisp) and compressed — nothing is painted out.
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

// -g 12 / no B-frames: at 24 fps every seek lands within half a second of a
// keyframe, which is what keeps currentTime scrubbing smooth in the TIME section.
const common = ['-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '24', '-bf', '0', '-movflags', '+faststart']

// Resize once, well, instead of leaving it to the browser's bilinear scaler.
// Sources larger than the target are scaled down; smaller ones are upscaled.
const resize = (h) => `scale=-2:${h}:flags=lanczos,unsharp=5:5:0.45:5:5:0`
const DESKTOP = resize(1080)
const MOBILE = resize(720)

console.log('→ shanghai.mp4')
run(['-i', input, ...common, '-preset', 'slow', '-crf', '24', '-tune', 'film', '-g', '12', '-vf', DESKTOP, `${out}/shanghai.mp4`])

console.log('→ shanghai-mobile.mp4')
run(['-i', input, ...common, '-preset', 'slow', '-crf', '26', '-tune', 'film', '-g', '12', '-vf', MOBILE, `${out}/shanghai-mobile.mp4`])

// VP9 fallbacks, same keyframe spacing and sizes.
const vp9 = ['-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-r', '24', '-g', '12', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3']
console.log('→ shanghai.webm')
run(['-i', input, ...vp9, '-crf', '36', '-vf', DESKTOP, `${out}/shanghai.webm`])
console.log('→ shanghai-mobile.webm')
run(['-i', input, ...vp9, '-crf', '39', '-vf', MOBILE, `${out}/shanghai-mobile.webm`])

const stills = { day: 0.02, golden: 0.3, dusk: 0.5, blue: 0.7, night: 0.97 }
for (const [name, at] of Object.entries(stills)) {
  console.log(`→ poster-${name}.jpg`)
  run(['-ss', String((duration * at).toFixed(2)), '-i', input, '-frames:v', '1', '-q:v', '4', '-vf', DESKTOP, `${out}/poster-${name}.jpg`])
}

for (const f of ['shanghai.mp4', 'shanghai-mobile.mp4', 'shanghai.webm', 'shanghai-mobile.webm']) {
  console.log(`${f}: ${(statSync(`${out}/${f}`).size / 1e6).toFixed(1)} MB`)
}
