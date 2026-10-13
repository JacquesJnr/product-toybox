import { nodeRadius, rings, topicsFor } from './geometry.ts'
import type { Domain, WheelRecord } from '../types'

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
console.log('Wheel geometry self-check passes')
