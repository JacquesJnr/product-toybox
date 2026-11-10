import { adaptCaseToSelection } from '../stages/case.ts'
import type { Analysis, Claim, Query, StageCase } from '../stages/contracts.ts'

export function buildAnalysis(query: Query, stageCase: StageCase): Analysis {
  const findings = adaptCaseToSelection(stageCase, query.documentIds).analysis
  const relevant = (claim: Claim) => claim.documentIds.length > 0
  const supported = (claim: Claim) => claim.support === 'supported' && claim.linkIds.every(id => query.linkIds.includes(id))
  const agreement = findings.agreement.filter(relevant).filter(supported)
  const conflict = findings.conflict.filter(relevant).filter(supported)
  const assumptions = findings.assumptions.filter(relevant).filter(claim => {
    const original = stageCase.analysis.assumptions.find(item => item.id === claim.id)!
    return original.documentIds.every(id => query.documentIds.includes(id))
  })
  const retained = new Set([...agreement, ...conflict, ...assumptions].map(claim => claim.id))
  const unknowns = [...findings.unknowns, ...findings.agreement, ...findings.conflict, ...findings.assumptions]
    .filter(relevant).filter(claim => !retained.has(claim.id))
    .map(claim => ({ ...claim, support: 'unknown' as const }))
  return { queryId: query.id, agreement, conflict, assumptions, unknowns }
}
