import documents from '../data/documents.json' with { type: 'json' }
import type { Doc, Domain } from '../types'
import { applyProposals, EXAMPLE_DOMAINS, proposeDomain } from './domain-sorting.ts'
const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
const docs = documents as Doc[]

const supplier = EXAMPLE_DOMAINS[0]
const proposals = proposeDomain(docs, supplier.name, supplier.covers)
check(proposals.some(p => p.docId === 'supplier-review' && p.kind === 'move'), 'The supplier review moves to the supplier domain')
check(!proposals.some(p => p.docId === 'strategy-note'), 'Unrelated documents get no proposal')
check(EXAMPLE_DOMAINS.every(d => proposeDomain(docs, d.name, d.covers).length > 0), 'Every example domain finds documents')
check(proposeDomain(docs, 'xyz', '').length === 0, 'A domain with no matching words finds nothing')

const domain = supplier.name as Domain
const moved = applyProposals(docs, domain, proposals).find(d => d.id === 'supplier-review')!
check(moved.primaryDomain === domain && moved.domains[0] === domain && !moved.domains.includes('Risk and resilience'), 'A move replaces the old primary domain')
const added = applyProposals(docs, domain, [{ ...proposals[0], docId: 'charter', kind: 'add' }]).find(d => d.id === 'charter')!
check(added.primaryDomain === 'Strategic direction' && added.domains.includes(domain), 'An add keeps the primary domain and adds the new one')
console.log('Domain sorting self-check passes')
