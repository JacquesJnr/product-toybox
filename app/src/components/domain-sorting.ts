import type { Doc, Domain } from '../types'

// Scripted AI for the toy: it "reads" each document for the words that describe a new
// domain and proposes where each one belongs. No live AI call; it is keyword matching.

export interface DomainProposal {
  docId: string
  title: string
  kind: 'move' | 'add'
  from: Domain
  reason: string
  confidence: 'High' | 'Medium'
}

export const EXAMPLE_DOMAINS = [
  { name: 'Supplier and third-party risk', covers: 'supplier dependencies, recovery plans, interruption cover' },
  { name: 'Liquidity and treasury', covers: 'liquidity headroom, cash timing, facility covenants' },
  { name: 'People and culture', covers: 'training, employment, incentives' },
]

// Words too common in a governance vault to say anything about a domain.
const STOP = new Set(['and', 'the', 'for', 'with', 'from', 'that', 'this', 'into', 'over', 'their', 'what', 'about', 'risk', 'risks', 'board', 'review', 'evidence', 'policy', 'plans'])

export function keywords(name: string, covers: string) {
  const words = `${name} ${covers}`.toLowerCase().match(/[a-z][a-z-]+/g) ?? []
  // Match on stems, so "dependencies" finds "dependency" and "recovery" finds "recover".
  return [...new Set(words.filter(word => word.length > 3 && !STOP.has(word)).map(word => word.slice(0, 6)))]
}

function sentenceWith(text: string, stem: string) {
  return text.split(/(?<=[.!?])\s+/).find(sentence => sentence.toLowerCase().includes(stem))?.trim()
}

export function proposeDomain(docs: Doc[], name: string, covers: string): DomainProposal[] {
  const stems = keywords(name, covers)
  if (!stems.length) return []
  return docs.flatMap(doc => {
    const title = doc.title.toLowerCase(), summary = doc.summary.toLowerCase()
    const body = `${doc.text} ${doc.insights.map(insight => insight.text).join(' ')}`.toLowerCase()
    let score = 0, inTitle = false
    for (const stem of stems) {
      if (title.includes(stem)) { score += 3; inTitle = true }
      if (summary.includes(stem)) score += 2
      if (body.includes(stem)) score += 1
    }
    if (score < 3) return []
    const hit = stems.find(stem => summary.includes(stem)) ?? stems.find(stem => body.includes(stem))
    const reason = (hit && (sentenceWith(doc.summary, hit) ?? sentenceWith(doc.text, hit))) ?? doc.summary
    // A move takes the primary domain, so it needs the title or strong evidence. Otherwise the domain is added.
    const kind = inTitle || score >= 7 ? 'move' as const : 'add' as const
    return [{ docId: doc.id, title: doc.title, kind, from: doc.primaryDomain, reason, confidence: score >= 5 ? 'High' as const : 'Medium' as const }]
  }).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'move' ? -1 : 1))
}

export function applyProposals(docs: Doc[], domain: Domain, accepted: DomainProposal[]): Doc[] {
  const byId = new Map(accepted.map(proposal => [proposal.docId, proposal]))
  return docs.map(doc => {
    const proposal = byId.get(doc.id)
    if (!proposal) return doc
    if (proposal.kind === 'add') return { ...doc, domains: [...doc.domains, domain] }
    // A move makes the new domain primary and replaces the old primary domain.
    return { ...doc, primaryDomain: domain, domains: [domain, ...doc.domains.filter(d => d !== doc.primaryDomain)] }
  })
}
