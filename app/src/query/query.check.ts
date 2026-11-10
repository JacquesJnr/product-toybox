/// <reference types="node" />
import assert from 'node:assert/strict'
import documents from '../data/documents.json' with { type: 'json' }
import { loadStageCase } from '../stages/case.ts'
import { createQuery } from '../stages/state.ts'
import type { Analysis, Query, QueryInput } from '../stages/contracts.ts'
import { buildAnalysis } from './analysis.ts'

const loaded = loadStageCase()
assert.deepEqual(loaded.missing, [])
assert.ok(loaded.stageCase)
const stageCase = loaded.stageCase
const input: QueryInput = { question: stageCase.question, focus: stageCase.focus, documentIds: stageCase.documentIds }
const query = createQuery('demo-query', input, documents)
let missingId = `${stageCase.id}-missing-document`
while (documents.some(doc => doc.id === missingId)) missingId += '-missing'
const absentLink = stageCase.documentIds.flatMap(source => stageCase.documentIds
  .filter(target => target !== source && !documents.find(doc => doc.id === source)!.links.some(link => link.targetId === target))
  .map(target => `${source}->${target}` as const))[0]
assert.ok(absentLink, 'case needs a nonsupplied relationship for the broken control')
const supportedClaim = stageCase.analysis.agreement.find(claim => claim.support === 'supported' && new Set(claim.documentIds).size > 1)
assert.ok(supportedClaim, 'case needs a supported agreement with multiple evidence documents')
const omittedId = supportedClaim.documentIds[1]
const reducedIds = [supportedClaim.documentIds[0], ...stageCase.documentIds.filter(id => id !== omittedId && id !== supportedClaim.documentIds[0])].slice(0, 2)
const assumption = stageCase.analysis.assumptions.find(claim => new Set(claim.documentIds).size > 1)
assert.ok(assumption, 'case needs an assumption with multiple evidence documents')
const unrelatedId = documents.find(doc => !stageCase.documentIds.includes(doc.id))?.id
assert.ok(unrelatedId, 'fixture needs a document outside the case for the unrelated-selection control')
assert.deepEqual(query.documentIds, input.documentIds)
assert.equal(query.question, input.question.trim())
assert.equal(query.focus, input.focus.trim())
assert.deepEqual(new Set(query.linkIds), new Set(stageCase.linkIds))
const suppliedOnly = (value: Query) => {
  for (const id of value.linkIds) {
    const [source, target] = id.split('->')
    assert.ok(value.documentIds.includes(source) && value.documentIds.includes(target))
    assert.ok(documents.find(doc => doc.id === source)?.links.some(link => link.targetId === target))
  }
}
suppliedOnly(query)
assert.throws(() => suppliedOnly({ ...query, linkIds: [...query.linkIds, absentLink] }))
assert.throws(() => suppliedOnly({ ...query, documentIds: [] }))
for (const invalid of [{ ...input, question: '  ' }, { ...input, focus: '\t' }, { ...input, documentIds: [] }, { ...input, documentIds: [missingId] }]) assert.throws(() => createQuery('invalid', invalid, documents), /Invalid Query/)
assert.throws(() => createQuery('second', input, documents, query), /Invalid Query/)
assert.throws(() => createQuery(' ', input, documents), /Invalid Query/)
const analysis = buildAnalysis(query, stageCase)
assert.equal(analysis.queryId, query.id)
assert.ok(analysis.agreement.some(claim => claim.id === supportedClaim.id))
const unavailableUnknown = stageCase.analysis.unknowns.find(claim => claim.sources.some(source => source.status === 'unavailable'))
assert.ok(unavailableUnknown, 'case needs an unknown with unavailable evidence')
assert.ok(analysis.unknowns.some(claim => claim.id === unavailableUnknown.id && claim.sources.some(source => source.status === 'unavailable')))
assert.deepEqual(analysis.agreement, stageCase.analysis.agreement)
assert.deepEqual(analysis.conflict, stageCase.analysis.conflict)
assert.deepEqual(analysis.assumptions, stageCase.analysis.assumptions)
assert.deepEqual(analysis.unknowns, stageCase.analysis.unknowns)
assert.deepEqual(buildAnalysis(query, stageCase), analysis)
assert.throws(() => assert.deepEqual({ ...analysis, agreement: [] }, analysis))
const reduced = createQuery('reduced', { ...input, documentIds: reducedIds }, documents)
const reducedAnalysis = buildAnalysis(reduced, stageCase)
assert.deepEqual(reduced.linkIds, stageCase.linkIds.filter(link => link.split('->').every(id => reducedIds.includes(id))))
const isolatedId = stageCase.documentIds.find(id => !documents.find(doc => doc.id === id)!.links.some(link => link.targetId === id))
assert.ok(isolatedId, 'case needs a document without a self-link for the empty-relationship check')
assert.deepEqual(createQuery('single-document', { ...input, documentIds: [isolatedId] }, documents).linkIds, [])
assert.ok(!reducedAnalysis.agreement.some(claim => claim.id === supportedClaim.id))
assert.ok(reducedAnalysis.unknowns.some(claim => claim.id === supportedClaim.id && claim.support === 'unknown'))
const supportedOnly = (value: Analysis, selection: Query) => {
  for (const group of [value.agreement, value.conflict]) for (const claim of group) {
    assert.equal(claim.support, 'supported')
    const original = [...stageCase.analysis.agreement, ...stageCase.analysis.conflict].find(item => item.id === claim.id)
    assert.ok(original?.documentIds.every(id => selection.documentIds.includes(id)))
  }
  for (const group of [value.agreement, value.conflict, value.assumptions, value.unknowns]) for (const claim of group) {
    assert.ok(claim.documentIds.every(id => selection.documentIds.includes(id)))
    assert.ok(claim.linkIds.every(id => selection.linkIds.includes(id)))
    assert.ok(claim.sources.every(source => selection.documentIds.includes(source.documentId)))
  }
}
supportedOnly(analysis, query)
supportedOnly(reducedAnalysis, reduced)
assert.throws(() => supportedOnly({ ...reducedAnalysis, agreement: [supportedClaim] }, reduced))
assert.throws(() => supportedOnly({ ...reducedAnalysis, agreement: [{ ...supportedClaim, documentIds: reduced.documentIds, support: 'unknown' }] }, reduced))
const partialAssumption = createQuery('partial-assumption', { ...input, documentIds: [assumption.documentIds[0]] }, documents)
const partialAnalysis = buildAnalysis(partialAssumption, stageCase)
assert.ok(!partialAnalysis.assumptions.some(claim => claim.id === assumption.id))
assert.ok(partialAnalysis.unknowns.some(claim => claim.id === assumption.id && claim.support === 'unknown'))
supportedOnly(partialAnalysis, partialAssumption)
const unrelated = createQuery('unrelated', { ...input, documentIds: [unrelatedId] }, documents)
assert.deepEqual(buildAnalysis(unrelated, stageCase), { queryId: unrelated.id, agreement: [], conflict: [], assumptions: [], unknowns: [] })
const before = JSON.stringify({ query, stageCase })
buildAnalysis(query, stageCase)
assert.equal(JSON.stringify({ query, stageCase }), before)
console.log('QUERY CHECKS PASSED')
