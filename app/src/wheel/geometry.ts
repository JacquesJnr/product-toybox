import type { Doc, Domain, WheelRecord } from '../types'
import { wheelTopics } from '../wheel-topics.ts'

export const rings = [
  { rung: 'Within appetite', radius: 87.4, color: 'var(--risk-within)' },
  { rung: 'Near the limit', radius: 156.4, color: 'var(--risk-near)' },
  { rung: 'Over appetite', radius: 220.8, color: 'var(--risk-over)' },
] as const

// Figma 127:229 varies anonymous document sizes for visual hierarchy, without a risk meaning.
const diamondSpans = [9.684, 14.016, 13.087, 13.663, 11.743, 12.104, 12.619, 10.683,
  10.381, 12.459, 10.188, 9.544, 10.753, 9.324, 11.392, 9.866, 13.081, 13.512]
export function diamondSize(index: number) { return diamondSpans[index % diamondSpans.length] / Math.SQRT2 }

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

export function nodesFor(records: WheelRecord[], docs: Doc[], domain: Domain | null) {
  const topics = topicsFor(domain)
  const nodes: { record: WheelRecord; key: string; x: number; y: number }[] = []
  for (const [index, { topic }] of topics.entries()) {
    const matching = records.filter(record => record.topic === topic && docs.some(doc => doc.id === record.documentId))
    for (const [offset, record] of matching.entries()) {
      const angle = -72 + index * 360 / topics.length + (offset - (matching.length - 1) / 2) * 5
      const ringIndex = rings.findIndex(ring => ring.rung === record.rung)
      const inner = ringIndex === 0 ? 0 : rings[ringIndex - 1].radius
      const size = diamondSize(docs.findIndex(doc => doc.id === record.documentId))
      // Separate larger hit areas locally while retaining the fixture's risk band.
      const position = [0, 12, -12, 24, -24, 36, -36, 48, -48].map(shift => {
        const radius = nodeRadius(record) + shift
        return { radius, ...point(angle, radius) }
      }).find(candidate => candidate.radius > inner + size && candidate.radius < rings[ringIndex].radius - size
        && nodes.every(other => Math.hypot(candidate.x - other.x, candidate.y - other.y)
          > (size + diamondSize(docs.findIndex(doc => doc.id === other.record.documentId))) / Math.SQRT2 + 1))!
      nodes.push({ record, key: `${record.documentId}|${record.topic}`, x: position.x, y: position.y })
    }
  }
  return nodes
}
