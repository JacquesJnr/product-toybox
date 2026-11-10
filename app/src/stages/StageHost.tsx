import type { ComponentType } from 'react'
import type { StagePage, StagePageProps } from './contracts'
import { exportReady, roomReady } from './state'

export type StagePages = Partial<Record<StagePage, ComponentType<StagePageProps & { active: boolean }>>>

const titles: Record<Exclude<StagePage, 'brain'>, string> = {
  query: 'Query', room: 'Board Simulation Room', export: 'Export Query',
}

export function StageHost({ page, pages, ...props }: StagePageProps & { page: StagePage; pages: StagePages }) {
  const Brain = pages.brain
  const allowed = (page !== 'room' || roomReady(props.state)) && (page !== 'export' || exportReady(props.state))
  const Page = pages[page]

  return <>
    <div className="stage-brain" hidden={page !== 'brain'}>
      {Brain && <Brain {...props} active={page === 'brain'} />}
    </div>
    {page !== 'brain' && (allowed && Page
      ? <Page {...props} active />
      : <main className="stage-stand-in" aria-label={titles[page]}>
        <h1>{page === 'query' && !props.state.query ? 'New Query' : titles[page]}</h1>
        <p>{!allowed ? 'Complete the previous stage to continue.' : 'This page is awaiting integration.'}</p>
      </main>)}
  </>
}
