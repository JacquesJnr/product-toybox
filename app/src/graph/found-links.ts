import type { Doc } from '../types'

export interface FoundLink { source: string; target: string }

export function addFoundLink(docs: Doc[], previous: FoundLink[], link: FoundLink): FoundLink[] {
  const source = docs.find(doc => doc.id === link.source || doc.title === link.source)?.id
  const target = docs.find(doc => doc.id === link.target || doc.title === link.target)?.id
  if (!source || !target || source === target) return previous
  if (previous.some(existing => (existing.source === source && existing.target === target)
    || (existing.source === target && existing.target === source))) return previous
  return [...previous, { source, target }]
}
