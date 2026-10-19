import type { Doc, Link } from '../types'

export interface SimNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
  deg: number
  i: number
}
export interface SimLink { source: string; target: string; reason: Link['reason'] }

// A spiral start position, so nodes spread out before the forces take over.
export function seed(i: number) {
  const a = i * 2.39996, r = 30 + Math.sqrt(i) * 40
  return { x: Math.cos(a) * r, y: Math.sin(a) * r }
}

// Animate reveals the graph in three steps for each node: invisible, then an orphan, then linked.
export const APPEAR_STEP = 140
export const LINK_DELAY = 700
export const nodeShown = (node: SimNode, elapsed: number) => elapsed >= node.i * APPEAR_STEP
export const linkShown = (source: SimNode, target: SimNode, elapsed: number) =>
  elapsed >= Math.max(source.i, target.i) * APPEAR_STEP + LINK_DELAY
export const revealEnd = (nodeCount: number) => (nodeCount - 1) * APPEAR_STEP + LINK_DELAY

export function buildSimulation(docs: Doc[]) {
  const nodes = docs.map((doc, i): SimNode => ({ id: doc.id, ...seed(i), vx: 0, vy: 0, fx: null, fy: null, deg: 0, i }))
  const byId = new Map(nodes.map(n => [n.id, n]))
  const links: SimLink[] = []
  const seen = new Set<string>()
  for (const doc of docs) for (const link of doc.links) {
    const key = [doc.id, link.targetId].sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    links.push({ source: doc.id, target: link.targetId, reason: link.reason })
    byId.get(doc.id)!.deg++
    byId.get(link.targetId)!.deg++
  }
  return { nodes, byId, links, alpha: 1, alphaTarget: 0, forcesVersion: 0 }
}
export type Simulation = ReturnType<typeof buildSimulation>

// Live force settings, read on every tick so the style page sliders take effect at once.
export const forces = { repel: 160, linkDistance: 60, damping: 0.6, version: 0 }

export function tick(sim: Simulation, nodes: SimNode[], links: SimLink[], now: number) {
  if (sim.forcesVersion !== forces.version) { sim.forcesVersion = forces.version; sim.alpha = Math.max(sim.alpha, 0.6) }
  sim.alpha += (sim.alphaTarget - sim.alpha) * 0.0228
  const alpha = Math.max(sim.alpha, 0.02)
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j]
    let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy
    if (d2 === 0) { dx = 0.5; dy = 0.5; d2 = 0.5 }
    if (d2 > 250000) continue
    const k = forces.repel * alpha / Math.max(d2, 25)
    a.vx -= dx * k; a.vy -= dy * k
    b.vx += dx * k; b.vy += dy * k
  }
  for (const link of links) {
    const s = sim.byId.get(link.source)!, t = sim.byId.get(link.target)!
    const dx = t.x + t.vx - s.x - s.vx, dy = t.y + t.vy - s.y - s.vy
    const d = Math.hypot(dx, dy) || 1
    const f = ((d - forces.linkDistance) / d) * alpha / Math.min(s.deg, t.deg)
    const bias = s.deg / (s.deg + t.deg)
    t.vx -= dx * f * bias; t.vy -= dy * f * bias
    s.vx += dx * f * (1 - bias); s.vy += dy * f * (1 - bias)
  }
  for (const n of nodes) {
    n.vx -= n.x * 0.012 * alpha; n.vy -= n.y * 0.012 * alpha
    n.vx += Math.sin(now * 0.0004 + n.i * 1.7) * 0.004
    n.vy += Math.cos(now * 0.00035 + n.i * 2.3) * 0.004
    if (n.fx !== null && n.fy !== null) { n.x = n.fx; n.y = n.fy; n.vx = n.vy = 0 }
    else { n.vx *= forces.damping; n.vy *= forces.damping; n.x += n.vx; n.y += n.vy }
  }
}

export function arrivalStage(elapsed: number) {
  if (elapsed < 1000) return 'waiting'
  if (elapsed < 1800) return 'arrived'
  if (elapsed < 5200) return 'sorting'
  return 'settled'
}

export function zoomAt(cam: { x: number; y: number; k: number }, sx: number, sy: number, delta: number) {
  const k = Math.min(6, Math.max(0.25, cam.k * Math.exp(-delta * 0.0015)))
  return { x: cam.x + sx / cam.k - sx / k, y: cam.y + sy / cam.k - sy / k, k }
}
