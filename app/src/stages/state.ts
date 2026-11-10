import type { QueryInput, Query, SuppliedDocument, StageState, RoomResult } from './contracts.ts'
export function createQuery(id: string, input: QueryInput, documents: readonly SuppliedDocument[], current: Query | null = null): Query {
  if (current || !id.trim() || !input.question.trim() || !input.focus.trim() || !input.documentIds.length || input.documentIds.some(id => !documents.some(doc => doc.id === id))) throw new Error('Invalid Query')
  const documentIds = [...new Set(input.documentIds)]
  return { id, question: input.question.trim(), focus: input.focus.trim(), documentIds, linkIds: documents.filter(doc => documentIds.includes(doc.id)).flatMap(doc => doc.links.filter(link => documentIds.includes(link.targetId)).map(link => `${doc.id}->${link.targetId}` as const)) }
}
export function roomReady(state: StageState): boolean { return !!state.query && state.analysis?.queryId === state.query.id }
export function exportReady(state: StageState): boolean { return roomReady(state) && state.run?.queryId === state.query?.id && state.run?.status === 'complete' && !!state.run.result && state.run.disagreementOpened && state.run.prepared }
export function startRun(state: StageState, id: string, now: number): StageState {
  if (!roomReady(state) || !id.trim() || !Number.isFinite(now) || state.run?.status === 'running' || state.run?.id === id) return state
  return { ...state, run: { id, queryId: state.query!.id, startedAt: now, completedAt: null, status: 'running', completedSteps: 0, result: null, disagreementOpened: false, prepared: false }, snapshot: null }
}
export function stepRun(state: StageState, id: string, now: number, result: RoomResult): StageState {
  const run = state.run
  if (!run || run.id !== id || run.status !== 'running' || !Number.isFinite(now)) return state
  const completedSteps = Math.max(run.completedSteps, Math.min(4, Math.max(0, Math.floor((now - run.startedAt) / 2000))))
  return { ...state, run: { ...run, completedSteps, completedAt: completedSteps === 4 ? run.startedAt + 8000 : null, status: completedSteps === 4 ? 'complete' : 'running', result: completedSteps === 4 ? result : null } }
}
export function openDisagreement(state: StageState, id: string): StageState {
  if (state.run?.id !== id || state.run.status !== 'complete') return state
  return { ...state, run: { ...state.run, disagreementOpened: true } }
}
export function prepareRun(state: StageState, id: string): StageState {
  if (state.run?.id !== id || state.run.status !== 'complete' || !state.run.result || !state.run.disagreementOpened) return state
  return { ...state, run: { ...state.run, prepared: true } }
}
