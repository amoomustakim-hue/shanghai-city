import type { PosterKey } from './media'

export const COORDS = { lat: '31°13′N', lng: '121°28′E' }

export type Chapter = { id: string; index: string; label: string }

/** Page order. `id` doubles as the section's DOM id and the menu target. */
export const CHAPTERS: Chapter[] = [
  { id: 'arrival', index: '00', label: 'Arrival' },
  { id: 'intro', index: '01', label: 'Intro' },
  { id: 'river', index: '02', label: 'River' },
  { id: 'city', index: '03', label: 'City' },
  { id: 'time', index: '04', label: 'Time' },
  { id: 'archive', index: '05', label: 'Archive' },
  { id: 'outro', index: '06', label: 'End' },
]

export const MENU_ITEMS = CHAPTERS.filter((c) => ['intro', 'river', 'city', 'time', 'archive'].includes(c.id)).map((c) => ({
  ...c,
  poster: ({ intro: 'day', river: 'golden', city: 'dusk', time: 'blue', archive: 'night' } as Record<string, PosterKey>)[c.id],
}))

/**
 * Architectural plate labels, in % of the native 1504 × 640 frame.
 * (x, y) is the point on the image; `to` is where the leader line ends
 * vertically (the label sits at that end).
 */
export type PlateLabel = { code: string; name: string; note: string; x: number; y: number; to: number }

export const PLATE_LABELS: PlateLabel[] = [
  { code: 'A.01', name: 'The Bund', note: 'Waterfront / 1920s', x: 5.5, y: 50, to: 16 },
  { code: 'L1', name: 'City Grid', note: 'Puxi / Low rise', x: 24, y: 47.5, to: 28 },
  { code: 'A.02', name: 'Huangpu', note: 'River / 113 km', x: 40, y: 67, to: 88 },
  { code: 'A.03', name: 'Oriental Pearl', note: '468 m / 1994', x: 64.2, y: 24, to: 6 },
  { code: 'A.04', name: 'Pudong', note: 'Lujiazui / 1990 →', x: 85.5, y: 40, to: 12 },
]

/** Scroll ranges (0–1) for the TIME section. The footage runs day → night, so time is linear. */
export type Phase = { word: string; note: string; from: number; to: number }

export const PHASES: Phase[] = [
  { word: 'Day', note: 'Full light / 16:30', from: 0, to: 0.18 },
  { word: 'Golden Hour', note: 'Low sun / West bank', from: 0.18, to: 0.38 },
  { word: '18:42', note: 'The city switches on', from: 0.38, to: 0.56 },
  { word: 'Blue Hour', note: 'Sky and glass / 19:20', from: 0.56, to: 0.78 },
  { word: 'Night', note: 'Huangpu after dark', from: 0.78, to: 1 },
]

/** Clock readout keyframes for the TIME section: [progress, minutes after midnight]. 18:42 lands inside its phase. */
export const CLOCK_KEYS: [number, number][] = [
  [0, 16 * 60 + 30],
  [0.47, 18 * 60 + 42],
  [1, 21 * 60 + 15],
]

export type ArchiveItem = { index: string; title: string; alt: string; meta: string; file: string; poster: PosterKey; target: string; tint: string }

export const ARCHIVE_ITEMS: ArchiveItem[] = [
  { index: '01', title: 'The River', alt: 'the river', meta: 'Huangpu / Water', file: '001.A', poster: 'golden', target: 'river', tint: '#0c0f12' },
  { index: '02', title: 'The Skyline', alt: 'the skyline', meta: 'Pudong / Glass', file: '001.B', poster: 'day', target: 'city', tint: '#0d0e10' },
  { index: '03', title: 'The Light', alt: 'the light', meta: 'Dusk / 18:42', file: '001.C', poster: 'dusk', target: 'time', tint: '#120e0c' },
  { index: '04', title: 'The Movement', alt: 'the movement', meta: 'Traffic / Tide', file: '001.D', poster: 'night', target: 'outro', tint: '#0b0a10' },
]
