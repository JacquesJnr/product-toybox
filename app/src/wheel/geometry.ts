import type { Domain, WheelRecord } from '../types'
import { wheelTopics } from '../wheel-topics.ts'

export const rings = [
  { rung: 'Within appetite', radius: 87.4, color: 'var(--risk-within)' },
  { rung: 'Near the limit', radius: 156.4, color: 'var(--risk-near)' },
  { rung: 'Over appetite', radius: 220.8, color: 'var(--risk-over)' },
] as const

export function topicsFor(domain: Domain | null) {
  const domains = domain ? [domain] : Object.keys(wheelTopics) as Domain[]
  return domains.flatMap(name => (domain ? wheelTopics[name] : wheelTopics[name].slice(0, 4))
    .map(topic => ({ domain: name, topic })))
}

export function nodeRadius(record: WheelRecord) {
  const index = rings.findIndex(ring => ring.rung === record.rung)
  const inner = index === 0 ? 0 : rings[index - 1].radius
  const outer = rings[index].radius
  // Fixtures define the rung; score/appetite orders distance inside it without inventing a near-limit threshold.
  const fraction = record.riskScore / (record.riskScore + record.appetite || 1)
  return inner + 8 + (outer - inner - 16) * fraction
}

export function point(angle: number, radius: number) {
  const radians = angle * Math.PI / 180
  return { x: 340 + Math.cos(radians) * radius, y: 340 + Math.sin(radians) * radius }
}
