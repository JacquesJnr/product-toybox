// Spider chart geometry, in Figma's 784 × 555 Wheel frame (frames 01–05).
export const W = 784
export const H = 555
export const C = { x: 392, y: 277.5 }
export const R = 210 // the 150% ring, at a hexagon vertex
export const MAX = 1.5

const V0 = -Math.PI / 2
const SIX = Math.PI / 3

export const ang = (i: number, n: number) => V0 + 2 * Math.PI * i / n
// Distance to the hexagon rim along angle a, as a share of the vertex distance.
export function hexR(a: number) {
  const d = ((((a - V0) % SIX) + SIX) % SIX) - SIX / 2
  return Math.cos(SIX / 2) / Math.cos(d)
}
// The plot clamps at 150%; labels keep the real value.
export const rad = (ratio: number) => Math.min(ratio, MAX) / MAX * R

export function xy(a: number, r: number) {
  const h = r * hexR(a)
  return { x: C.x + h * Math.cos(a), y: C.y + h * Math.sin(a) }
}

export function hexPoints(r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = V0 + k * SIX
    return `${(C.x + r * Math.cos(a)).toFixed(1)},${(C.y + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

// % label size: 12 px at 100%, 24 px at 200% and above.
export const labelSize = (ratio: number) => 12 + 12 * (Math.min(ratio, 2) - 1)

export type Slot = 'top' | 'bottom' | 'left' | 'right'
// Settled slots: above the hub → top; straight down → bottom; otherwise the outward side.
export function slotOf(a: number): Slot {
  const cos = Math.cos(a), sin = Math.sin(a)
  if (sin < -0.2) return 'top'
  if (Math.abs(cos) < 0.2) return 'bottom'
  return cos > 0 ? 'right' : 'left'
}
// The over tag takes the opposite slot.
export const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const satisfies Record<Slot, Slot>
