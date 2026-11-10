import { adaptCaseToSelection, loadStageCase } from './case.ts'
import type { Claim, LinkId, StageCase } from './contracts.ts'
import documents from '../data/documents.json' with { type: 'json' }

const loaded = loadStageCase()
function ok(condition: unknown, message = 'assertion failed'): asserts condition { if (!condition) throw new Error(message) }
function equal(actual: unknown, expected: unknown) { ok(Object.is(actual, expected), `expected ${String(expected)}, got ${String(actual)}`) }
function deepEqual(actual: unknown, expected: unknown) { ok(JSON.stringify(actual) === JSON.stringify(expected), 'values differ') }

deepEqual(loaded.missing, [])
ok(loaded.stageCase)
const stageCase = loaded.stageCase
let missingId = `${stageCase.id}-missing-document`
while (documents.some(doc => doc.id === missingId)) missingId += '-missing'
const absentLink = stageCase.documentIds.flatMap(source => stageCase.documentIds
  .filter(target => target !== source && !documents.find(doc => doc.id === source)!.links.some(link => link.targetId === target))
  .map(target => `${source}->${target}` as LinkId))[0]
ok(absentLink, 'case needs a nonsupplied relationship for the broken control')
const suppliedLink = stageCase.linkIds[0]
ok(suppliedLink, 'case needs a supplied relationship for the endpoint control')
const available = stageCase.sources.find(source => source.status === 'available')
ok(available && available.status === 'available', 'case needs a quoted source')
const authoredId = stageCase.documentIds.find(id => documents.find(doc => doc.id === id)?.author !== null)
ok(authoredId)
const brokenCase = (change: (copy: StageCase) => StageCase) => loadStageCase(change(structuredClone(stageCase))).missing
ok(brokenCase(copy => ({ ...copy, documentIds: [...copy.documentIds, missingId] })).some(item => item.includes('Unknown document')))
ok(brokenCase(copy => ({ ...copy, linkIds: [...copy.linkIds, absentLink] })).some(item => item.includes('Unknown relationship')))
ok(brokenCase(copy => ({ ...copy, documentIds: copy.documentIds.filter(id => id !== suppliedLink.split('->')[1]) })).some(item => item.includes('Unknown relationship')))
const alteredText = `${available.text}\n${missingId}`
ok(brokenCase(copy => ({ ...copy, sources: [...copy.sources, { ...available, text: alteredText }] })).some(item => item.includes('Misquoted source')))
ok(brokenCase(copy => ({ ...copy, sources: [...copy.sources, { documentId: authoredId, passage: available.passage, status: 'unavailable', reason: 'Broken control' }] })).some(item => item.includes('Unavailable source')))

const formerlySupported = [...stageCase.analysis.agreement, ...stageCase.analysis.conflict].find(claim => claim.support === 'supported' && new Set(claim.documentIds).size > 1)
ok(formerlySupported, 'case needs a supported claim with multiple evidence documents')
const omittedId = formerlySupported.documentIds[1]
const selection = [formerlySupported.documentIds[0], ...stageCase.documentIds.filter(id => id !== omittedId && id !== formerlySupported.documentIds[0])].slice(0, 2)
const reduced = adaptCaseToSelection(stageCase, selection)
deepEqual(reduced.documentIds, stageCase.documentIds.filter(id => selection.includes(id)))
deepEqual(reduced.linkIds, stageCase.linkIds.filter(link => link.split('->').every(id => selection.includes(id))))
const stripped = [...reduced.analysis.agreement, ...reduced.analysis.conflict].find(claim => claim.id === formerlySupported.id)
ok(stripped)
equal(formerlySupported.support, 'supported')
equal(stripped.support, 'unknown')
deepEqual(stripped.documentIds, formerlySupported.documentIds.filter(id => selection.includes(id)))
const checkClaim = (claim: Claim) => {
  ok(claim.documentIds.every(id => selection.includes(id)))
  ok(claim.linkIds.every(link => reduced.linkIds.includes(link)))
  ok(claim.sources.every(source => selection.includes(source.documentId)))
}
for (const group of Object.values(reduced.analysis)) for (const claim of group) checkClaim(claim)
ok(reduced.sources.every(source => selection.includes(source.documentId)))
for (const step of reduced.room.steps) {
  ok(step.documentIds.every(id => selection.includes(id)))
  ok(step.sources.every(source => selection.includes(source.documentId)))
}
for (const group of [reduced.room.result.agreement, reduced.room.result.disagreement, reduced.room.result.missingEvidence, reduced.room.result.assumptions]) for (const claim of group) checkClaim(claim)
ok(reduced.room.result.sources.every(source => selection.includes(source.documentId)))
console.log('CASE CHECKS PASSED')
