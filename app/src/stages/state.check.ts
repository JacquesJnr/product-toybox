import { createQuery, roomReady, exportReady, startRun, stepRun, openDisagreement, prepareRun } from './state.ts'
import type { StageState, RoomResult } from './contracts.ts'
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message) }
const docs = [{ id: 'a', links: [{ targetId: 'b' }] }, { id: 'b', links: [] }]
const input = { question: 'Q', focus: 'F', documentIds: ['a', 'b'] }
for (const broken of [{ ...input, question: ' ' }, { ...input, focus: ' ' }, { ...input, documentIds: [] }, { ...input, documentIds: ['missing'] }]) {
  let rejected = false
  try { createQuery('q', broken, docs) } catch { rejected = true }
  assert(rejected, 'invalid Query accepted')
}
const query = createQuery('q', input, docs)
assert(query.linkIds.join() === 'a->b', 'supplied link lost')
assert(createQuery('q', { ...input, documentIds: ['a'] }, docs).linkIds.length === 0, 'unselected endpoint accepted')
const empty: StageState = { query, analysis: null, run: null, snapshot: null }
assert(!roomReady(empty), 'premature Room entry')
assert(startRun(empty, 'r', 0) === empty, 'run without Analysis')
const ready: StageState = { ...empty, analysis: { queryId: 'q', agreement: [], conflict: [], assumptions: [], unknowns: [] } }
assert(!roomReady({ ...ready, analysis: { ...ready.analysis!, queryId: 'wrong' } }), 'foreign Analysis accepted')
assert(roomReady(ready), 'valid Room blocked')
assert(!exportReady(ready), 'premature Export entry')
const running = startRun(ready, 'r', 0)
assert(running.run?.completedAt === null, 'running completion time is not null')
assert(startRun(running, 'other', 1) === running, 'duplicate start accepted')
const result: RoomResult = { agreement: [], disagreement: [], missingEvidence: [], assumptions: [], reasoningSummary: '', sources: [] }
assert(stepRun(running, 'old', 8000, result) === running, 'stale run completion accepted')
for (const [time, steps] of [[1999, 0], [2000, 1], [3999, 1], [4000, 2], [6000, 3], [7999, 3], [8000, 4]]) assert(stepRun(running, 'r', time!, result).run?.completedSteps === steps, 'elapsed steps incorrect')
const lateStart = startRun(ready, 'late', 500)
assert(stepRun(lateStart, 'late', 9500, result).run?.completedAt === 8500, 'late tick moved completion time')
assert(stepRun(lateStart, 'late', 4500, result).run?.completedAt === null, 'partial run has completion time')
const complete = stepRun(running, 'r', 8000, result)
assert(complete.run?.status === 'complete' && complete.run.result === result, 'completion missing')
assert(stepRun(complete, 'r', 9000, result) === complete, 'completed timer changed run')
assert(prepareRun(complete, 'r') === complete, 'unreviewed Prepare accepted')
const prepared = prepareRun(openDisagreement(complete, 'r'), 'r')
assert(exportReady(prepared), 'reviewed Export blocked')
assert(!exportReady({ ...prepared, run: { ...prepared.run!, prepared: false } }), 'unprepared Export accepted')
assert(!exportReady({ ...prepared, run: { ...prepared.run!, disagreementOpened: false } }), 'unreviewed Export accepted')
const rerun = startRun(prepared, 'next', 10000)
assert(rerun.run?.completedAt === null, 'rerun retained completion time')
assert(rerun.run?.prepared === false && rerun.run.disagreementOpened === false && rerun.run.result === null, 'rerun retained review')
const snapshot = { query, analysis: ready.analysis!, run: prepared.run!, claims: [], evidenceSummary: '', assumptions: [], unknowns: [], reasoningSummary: '', sources: [], metadata: { confidence: { status: 'unavailable' as const, reason: '' }, freshness: { status: 'unavailable' as const, reason: '' }, modelLabel: '', scriptedLabel: '' } }
assert(startRun({ ...prepared, snapshot }, 'next', 10000).snapshot === null, 'rerun retained export snapshot')
assert(stepRun(rerun, 'r', 20000, result) === rerun, 'old completion replaced rerun')
console.log('STAGE STATE CHECKS PASSED')
