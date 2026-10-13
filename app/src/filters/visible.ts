import type { Doc, Domain } from '../types'

export function visibleIds(docs: Doc[], domains: ReadonlySet<Domain>, query: string): Set<string> {
  const search = query.toLowerCase()
  const filterDomains = domains.size > 0 && domains.size < 7

  return new Set(docs.filter((doc) =>
    (!filterDomains || doc.domains.some((domain) => domains.has(domain))) &&
    (!search || doc.title.toLowerCase().includes(search) || doc.text.toLowerCase().includes(search) ||
      doc.insights.some((insight) => insight.text.toLowerCase().includes(search))),
  ).map((doc) => doc.id))
}
