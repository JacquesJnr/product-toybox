import type { Doc, Domain, WheelDomain, WheelFixture, WheelSeries } from '@/types'
import { DOMAINS, fixture } from '@/wheel/model'
import { WHEEL_DOMAIN } from './wheel-domain-picker'

// The Wheel's domains follow the Graph's list: one vertex for each Graph domain, named as the Graph names it.
// A Graph domain with a Wheel record keeps that record's topics and readings. Any other domain (Strategy execution,
// or one the AI sorting added) gets one topic for each of its documents, with a scripted reading.

const original = fixture.domains.map(d => ({ ...d }))
const byGraphName = new Map(original.map(d => [WHEEL_DOMAIN[d.domain] as string, d]))
const exampleGraphName = WHEEL_DOMAIN[original.find(d => d.domain === fixture.fullKriDomain)!.domain]

// A steady, made-up reading for a domain with no data: within its appetite, with a small drift.
function scripted(seed: string) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const base = 0.35 + (h % 40) / 100, drift = ((h >> 8) % 7 - 3) / 100
  return fixture.timeframes.map((_, i) => +(base + drift * i).toFixed(3)) as WheelSeries
}

function recordFor(domain: Domain, vault: Doc[]): WheelFixture['domains'][number] {
  const known = byGraphName.get(domain)
  if (known) return { ...known, domain: domain as WheelDomain }
  const titles = vault.filter(doc => doc.domains.includes(domain)).map(doc => doc.title).slice(0, 8)
  const topics = (titles.length ? titles : [domain]).map(topic => ({ topic, appetite: 1, riskScore: scripted(topic) }))
  return { domain: domain as WheelDomain, owner: 'the board', topics }
}

// ponytail: rewrites the shared Wheel fixture in place, because every Wheel part reads it from the module.
// That is safe on the style page, which is its own bundle. Pass the fixture down instead if the app needs this too.
export function syncWheelDomains(domains: Domain[], vault: Doc[]) {
  fixture.domains = domains.map(domain => recordFor(domain, vault))
  fixture.fullKriDomain = exampleGraphName as WheelDomain
  DOMAINS.splice(0, DOMAINS.length, ...fixture.domains.map(d => d.domain))
}
