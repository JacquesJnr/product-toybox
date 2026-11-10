import { adaptCaseToSelection, loadStageCase } from './case.ts'
import type { Claim, StageCase, SourceReference } from './contracts.ts'
import rawCase from '../data/stage-script.json' with { type: 'json' }

const loaded = loadStageCase()
function ok(condition: unknown, message = 'assertion failed'): asserts condition { if (!condition) throw new Error(message) }
function equal(actual: unknown, expected: unknown) { ok(Object.is(actual, expected), `expected ${String(expected)}, got ${String(actual)}`) }
function deepEqual(actual: unknown, expected: unknown) { ok(JSON.stringify(actual) === JSON.stringify(expected), 'values differ') }

deepEqual(loaded.missing, [])
ok(loaded.stageCase)
const stageCase = loaded.stageCase

const brokenCase = (change: (copy: any) => void) => {
  const copy = structuredClone(rawCase)
  change(copy)
  return loadStageCase(copy).missing
}
ok(brokenCase(copy => copy.documentIds.push('not-a-document')).some(item => item.includes('Unknown document')))
ok(brokenCase(copy => copy.linkIds.push('board-pack-q3->employment-contracts')).some(item => item.includes('Unknown relationship')))
ok(brokenCase(copy => copy.linkIds.push('board-pack-q3->charter')).some(item => item.includes('Unknown relationship')))
ok(brokenCase(copy => copy.sources.find((source: SourceReference) => source.status === 'available').text += ' altered').some(item => item.includes('Misquoted source')))
ok(brokenCase(copy => { copy.sources.find((source: SourceReference) => source.status === 'unavailable').documentId = 'board-pack-q3' }).some(item => item.includes('Unavailable source')))

const reduced = adaptCaseToSelection(stageCase as StageCase, ['exec-pay-review', 'forecast-2027'])
ok(reduced.linkIds.every(link => link.startsWith('exec-pay-review->') && link.endsWith('->exec-pay-review')))
const formerlySupported = stageCase.analysis.agreement.find(claim => claim.id === 'capital-choice') as Claim
const stripped = reduced.analysis.agreement.find(claim => claim.id === 'capital-choice') as Claim
equal(formerlySupported.support, 'supported')
equal(stripped.support, 'unknown')
deepEqual(stripped.documentIds, ['forecast-2027'])
ok(stripped.sources.every(source => ['exec-pay-review', 'forecast-2027'].includes(source.documentId)))
console.log('CASE CHECKS PASSED')
