export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Piecewise-linear lookup through sorted [x, y] keys. */
export function interpolateKeys(keys: [number, number][], x: number) {
  if (x <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i]
    if (x <= x1) {
      const [x0, y0] = keys[i - 1]
      return lerp(y0, y1, (x - x0) / (x1 - x0))
    }
  }
  return keys[keys.length - 1][1]
}

export const pad = (n: number, size = 2) => String(Math.floor(n)).padStart(size, '0')

export const formatMinutes = (minutes: number) => `${pad(minutes / 60)}:${pad(minutes % 60)}`
