import documents from '../data/documents.json' with { type: 'json' }
import type { Doc, Domain } from '../types'
import { DEFAULT_DOMAINS } from './domain-drawer'
import { syncWheelDomains } from './wheel-domains'
import { DOMAINS, TODAY, fixture, pointsAt } from '../wheel/model'
import { hexPoints } from '../wheel/chart/geometry'

const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
const docs = documents as Doc[]
syncWheelDomains(DEFAULT_DOMAINS, docs)
check(DOMAINS.join() === DEFAULT_DOMAINS.join(), 'The Wheel takes the Graph domains, in order')
check(pointsAt(null, TODAY).length === 7, 'Seven domains make seven vertices')
check(Math.round(pointsAt(null, TODAY).find(p => p.name === 'Risk and resilience')!.ratio * 100) === 200, 'Risk keeps its readings under the Graph name')
check((fixture.fullKriDomain as string) === 'Risk and resilience', 'The example domain follows the rename')
const added = 'Supplier and third-party risk' as Domain
syncWheelDomains([...DEFAULT_DOMAINS, added], docs)
check(pointsAt(null, TODAY).length === 8 && (DOMAINS as string[]).includes(added), 'An added domain adds a vertex')
check(pointsAt(null, TODAY).every(p => Number.isFinite(p.ratio)), 'A domain with no data still has a reading')
check(hexPoints(100, 8).split(' ').length === 8, 'Eight domains draw an octagon')
console.log('wheel domain checks pass')
