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
assert.throws(() => suppliedOnly({ ...query, linkIds: [...query.linkIds, 'policy-v4->employment-contracts'] }))
assert.throws(() => suppliedOnly({ ...query, documentIds: ['policy-v4'] }))
for (const invalid of [{ ...input, question: '  ' }, { ...input, focus: '\t' }, { ...input, documentIds: [] }, { ...input, documentIds: ['missing-document'] }]) assert.throws(() => createQuery('invalid', invalid, documents), /Invalid Query/)
assert.throws(() => createQuery('second', input, documents, query), /Invalid Query/)
assert.throws(() => createQuery(' ', input, documents), /Invalid Query/)
const analysis = buildAnalysis(query, stageCase)
assert.equal(analysis.queryId, query.id)
assert.deepEqual(analysis.agreement.map(claim => claim.id), ['capital-choice', 'launch-exposure', 'approval-gate', 'return-owner'])
assert.deepEqual(analysis.conflict.map(claim => claim.id), ['cash-tension'])
assert.deepEqual(analysis.assumptions.map(claim => claim.id), ['safe-to-wait'])
assert.ok(analysis.unknowns.some(claim => claim.id === 'contract-rights' && claim.sources.some(source => source.status === 'unavailable')))
assert.deepEqual(analysis.agreement, stageCase.analysis.agreement)
assert.deepEqual(analysis.conflict, stageCase.analysis.conflict)
assert.deepEqual(analysis.assumptions, stageCase.analysis.assumptions)
assert.deepEqual(analysis.unknowns, stageCase.analysis.unknowns)
assert.deepEqual(buildAnalysis(query, stageCase), analysis)
assert.throws(() => assert.deepEqual({ ...analysis, agreement: [] }, analysis))
const reduced = createQuery('reduced', { ...input, documentIds: ['board-pack-q3'] }, documents)
const reducedAnalysis = buildAnalysis(reduced, stageCase)
assert.deepEqual(reduced.linkIds, [])
assert.deepEqual(reducedAnalysis.agreement, [])
assert.ok(reducedAnalysis.unknowns.some(claim => claim.id === 'capital-choice' && claim.support === 'unknown'))
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
assert.throws(() => supportedOnly({ ...reducedAnalysis, agreement: stageCase.analysis.agreement }, reduced))
assert.throws(() => supportedOnly({ ...reducedAnalysis, agreement: [{ ...stageCase.analysis.agreement[0], documentIds: reduced.documentIds, support: 'unknown' }] }, reduced))
const partialAssumption = createQuery('partial-assumption', { ...input, documentIds: ['minutes-sep'] }, documents)
const partialAnalysis = buildAnalysis(partialAssumption, stageCase)
assert.deepEqual(partialAnalysis.assumptions, [])
assert.ok(partialAnalysis.unknowns.some(claim => claim.id === 'safe-to-wait' && claim.support === 'unknown'))
supportedOnly(partialAnalysis, partialAssumption)
const unrelated = createQuery('unrelated', { ...input, documentIds: ['charter'] }, documents)
assert.deepEqual(buildAnalysis(unrelated, stageCase), { queryId: unrelated.id, agreement: [], conflict: [], assumptions: [], unknowns: [] })
const before = JSON.stringify({ query, stageCase })
buildAnalysis(query, stageCase)
assert.equal(JSON.stringify({ query, stageCase }), before)
console.log('QUERY CHECKS PASSED')
