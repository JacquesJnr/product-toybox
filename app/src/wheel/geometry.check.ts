import { diamondSize, nodeRadius, nodesFor, rings, topicsFor } from './geometry.ts'
import type { Doc, Domain, WheelRecord } from '../types'
import documents from '../data/documents.json' with { type: 'json' }
import records from '../data/wheels.json' with { type: 'json' }

const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
check(topicsFor(null).length === 28, 'Whole wheel keeps seven domains with four canonical topics each')
for (const domain of new Set(topicsFor(null).map(topic => topic.domain))) {
  const count = topicsFor(domain as Domain).length
  check(count >= 4 && count <= 8, `${domain} has four to eight spokes`)
}
for (const [index, ring] of rings.entries()) {
  const base = { rung: ring.rung, riskScore: 0.7, appetite: 0.6 } as WheelRecord
  const radius = nodeRadius(base)
  check(radius > (index === 0 ? 0 : rings[index - 1].radius) && radius < ring.radius, `${ring.rung} stays inside its band`)
  check(nodeRadius({ ...base, riskScore: 0.8 }) > radius, 'Higher score moves outward against the same appetite')
  check(nodeRadius({ ...base, appetite: 0.8 }) < radius, 'Higher appetite moves inward against the same score')
  check(Number.isFinite(nodeRadius({ ...base, riskScore: 0, appetite: 0 })), 'Zero values remain finite')
}
for (const domain of [null, ...new Set(topicsFor(null).map(topic => topic.domain))]) {
  const nodes = nodesFor(records as WheelRecord[], documents as Doc[], domain)
  for (const [index, node] of nodes.entries()) {
    for (const other of nodes.slice(index + 1)) {
      // Disjoint circumscribed circles prove the rotated diamond hit areas cannot overlap.
      check(Math.hypot(node.x - other.x, node.y - other.y) > diamondSize * Math.SQRT2,
        `${domain ?? 'Whole wheel'}: hit areas overlap for ${node.key} and ${other.key}`)
    }
  }
}
console.log('Wheel geometry self-check passes')
