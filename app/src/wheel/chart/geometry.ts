// Spider chart geometry, in Figma's 784 × 555 Wheel frame (frames 01–05).
export const W = 784
export const H = 555
export const C = { x: 392, y: 277.5 }
export const R = 210 // the 150% ring, at a polygon vertex
export const MAX = 1.5

const V0 = -Math.PI / 2

export const ang = (i: number, n: number) => V0 + 2 * Math.PI * i / n
// The rings are a polygon with one vertex per spoke: six domains make a hexagon, eight topics an octagon.
// Distance to the n-sided rim along angle a, as a share of the vertex distance.
export function hexR(a: number, n = 6) {
  const step = 2 * Math.PI / n
  const d = ((((a - V0) % step) + step) % step) - step / 2
  return Math.cos(step / 2) / Math.cos(d)
}
// The plot clamps at 150%; labels keep the real value.
export const rad = (ratio: number) => Math.min(ratio, MAX) / MAX * R

export function xy(a: number, r: number, n = 6) {
  const h = r * hexR(a, n)
  return { x: C.x + h * Math.cos(a), y: C.y + h * Math.sin(a) }
}

export function hexPoints(r: number, n = 6) {
  return Array.from({ length: n }, (_, k) => {
    const a = ang(k, n)
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
