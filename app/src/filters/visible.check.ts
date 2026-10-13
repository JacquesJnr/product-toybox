import type { Doc, Domain } from '../types'
import { visibleIds } from './visible.ts'

const doc = (id: string, domains: Domain[], title: string, text: string, insight: string): Doc => ({
  id, domains, title, text,
  type: 'pdf', issued: '', from: '', primaryDomain: domains[0], links: [], summary: '',
  insights: [{ text: insight, tags: [], pageRef: 'p. 1', confidence: 1 }],
})
const docs = [
  doc('one', ['Strategic direction', 'Risk and resilience'], 'Charter', 'Board oversight', 'Risk ownership'),
  doc('two', ['Remuneration'], 'Pay review', 'Targets', 'Evidence missing'),
  doc('three', ['Financial stewardship'], 'Forecast', 'Liquidity headroom', 'Cash timing'),
]
const allDomains = new Set<Domain>([
  'Strategic direction', 'Strategy execution', 'Financial stewardship', 'Risk and resilience',
  'Controls and assurance', 'Major decisions', 'Remuneration',
])
const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }

check(visibleIds(docs, new Set(), '').size === 3, 'empty domain filter shows every document')
check(visibleIds(docs, allDomains, '').size === 3, 'all domains show every document')
check(visibleIds(docs, new Set(['Risk and resilience']), '').has('one'), 'either document domain matches')
check(visibleIds(docs, new Set(['Risk and resilience']), 'CHARTER').has('one'), 'title matching ignores case')
check(visibleIds(docs, new Set(), 'liquidity').has('three'), 'text matching works')
check(visibleIds(docs, new Set(), 'evidence MISSING').has('two'), 'insight matching works')
check(visibleIds(docs, new Set(['Remuneration']), 'liquidity').size === 0, 'domains and search combine')
check(visibleIds(docs, new Set(), 'no such document').size === 0, 'unmatched query returns no ids')
