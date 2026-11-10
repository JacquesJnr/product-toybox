import type { Claim, Findings, SourceReference, StageCase, SuppliedDocument } from './contracts.ts'
import rawCase from '../data/stage-script.json' with { type: 'json' }
import documents from '../data/documents.json' with { type: 'json' }

interface DocumentRecord extends SuppliedDocument {
  readonly text: string
  readonly summary: string
  readonly insights: readonly { readonly text: string }[]
  readonly author: unknown
}

export interface CaseLoad { readonly stageCase: StageCase | null; readonly missing: readonly string[] }

export function loadStageCase(script: unknown = rawCase, suppliedDocuments: readonly DocumentRecord[] = documents as readonly DocumentRecord[]): CaseLoad {
  const missing: string[] = []
  const byId = new Map(suppliedDocuments.map(document => [document.id, document]))
  const candidate = script as StageCase
  if (!candidate || typeof candidate !== 'object') return { stageCase: null, missing: ['Stage case input is missing.'] }
  for (const id of candidate.documentIds ?? []) if (!byId.has(id)) missing.push(`Unknown document: ${id}`)
  for (const linkId of candidate.linkIds ?? []) {
    const [sourceId, targetId] = linkId.split('->')
    const source = byId.get(sourceId)
    if (!source || !byId.has(targetId) || !source.links.some(link => link.targetId === targetId) || !(candidate.documentIds ?? []).includes(sourceId) || !(candidate.documentIds ?? []).includes(targetId)) missing.push(`Unknown relationship: ${linkId}`)
  }
  const declaredLinks = new Set(candidate.linkIds ?? [])
  for (const sourceId of candidate.documentIds ?? []) for (const link of byId.get(sourceId)?.links ?? []) {
    if ((candidate.documentIds ?? []).includes(link.targetId) && !declaredLinks.has(`${sourceId}->${link.targetId}`)) missing.push(`Missing relationship: ${sourceId}->${link.targetId}`)
  }
  const validateSource = (source: SourceReference) => {
    const document = byId.get(source.documentId)
    if (!document) { missing.push(`Unknown source document: ${source.documentId}`); return }
    if (!(candidate.documentIds ?? []).includes(source.documentId)) missing.push(`Source document is outside the case: ${source.documentId}`)
    if (source.status === 'unavailable') {
      if (document.author !== null) missing.push(`Unavailable source requires an authorless document: ${source.documentId}`)
    } else if (![document.text, document.summary, ...document.insights.map(insight => insight.text)].some(text => text.includes(source.text))) {
      missing.push(`Misquoted source: ${source.documentId} (${source.passage})`)
    }
  }
  const validateClaim = (claim: Claim) => {
    for (const id of claim.documentIds) if (!byId.has(id)) missing.push(`Unknown claim document: ${id}`)
    for (const id of claim.linkIds) if (!candidate.linkIds?.includes(id)) missing.push(`Unknown claim relationship: ${id}`)
    for (const source of claim.sources) validateSource(source)
  }
  for (const source of candidate.sources ?? []) validateSource(source)
  for (const claims of Object.values(candidate.analysis ?? {}) as readonly Claim[][]) for (const claim of claims) validateClaim(claim)
  for (const step of candidate.room?.steps ?? []) { for (const id of step.documentIds) if (!byId.has(id)) missing.push(`Unknown room document: ${id}`); for (const source of step.sources) validateSource(source) }
  const result = candidate.room?.result
  if (result) for (const group of [result.agreement, result.disagreement, result.missingEvidence, result.assumptions]) for (const claim of group) validateClaim(claim)
  if (result) for (const source of result.sources) validateSource(source)
  return { stageCase: missing.length ? null : candidate, missing }
}

export function adaptCaseToSelection(stageCase: StageCase, selectedDocumentIds: readonly string[]): StageCase {
  const selected = new Set(selectedDocumentIds)
  const filterClaim = (claim: Claim): Claim => {
    const documentIds = claim.documentIds.filter(id => selected.has(id))
    const supported = claim.support === 'supported' && documentIds.length === claim.documentIds.length
    return { ...claim, documentIds, linkIds: claim.linkIds.filter(id => {
      const [source, target] = id.split('->')
      return selected.has(source) && selected.has(target)
    }), sources: claim.sources.filter(source => selected.has(source.documentId)), support: supported ? 'supported' : 'unknown' }
  }
  const filterFindings = (findings: Findings): Findings => ({ agreement: findings.agreement.map(filterClaim), conflict: findings.conflict.map(filterClaim), assumptions: findings.assumptions.map(filterClaim), unknowns: findings.unknowns.map(filterClaim) })
  return { ...stageCase, documentIds: stageCase.documentIds.filter(id => selected.has(id)), linkIds: stageCase.linkIds.filter(id => { const [source, target] = id.split('->'); return selected.has(source) && selected.has(target) }), sources: stageCase.sources.filter(source => selected.has(source.documentId)), analysis: filterFindings(stageCase.analysis), room: { ...stageCase.room, steps: [0, 1, 2, 3].map(index => { const step = stageCase.room.steps[index]; return { ...step, documentIds: step.documentIds.filter(id => selected.has(id)), sources: step.sources.filter(source => selected.has(source.documentId)) } }) as unknown as StageCase['room']['steps'], result: { ...stageCase.room.result, agreement: stageCase.room.result.agreement.map(filterClaim), disagreement: stageCase.room.result.disagreement.map(filterClaim), missingEvidence: stageCase.room.result.missingEvidence.map(filterClaim), assumptions: stageCase.room.result.assumptions.map(filterClaim), sources: stageCase.room.result.sources.filter(source => selected.has(source.documentId)) } } }
}
