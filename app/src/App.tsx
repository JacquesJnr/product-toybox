import { useMemo, useState } from 'react'
import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import documents from './data/documents.json'
import wheels from './data/wheels.json'
import smartSearch from './data/smart-search.json'
import type { Doc, Domain } from './types'
import { Graph } from './graph/Graph'
import { visibleIds } from './filters/visible'
import { DomainChips } from './filters/DomainChips'
import { HeaderSearch } from './filters/HeaderSearch'
import { NoMatchingDocuments } from './filters/NoMatchingDocuments'
import { DetailsPanel } from './details/DetailsPanel'
import './App.css'

const views = ['Graph', 'Wheel', 'Smart Search'] as const
const docs = documents as Doc[]

export default function App() {
  const [view, setView] = useState<(typeof views)[number]>('Graph')
  const [query, setQuery] = useState('')
  const [domains, setDomains] = useState<Set<Domain>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animateRun, setAnimateRun] = useState(0)
  const visible = useMemo(() => visibleIds(docs, domains, query), [domains, query])
  const selected = docs.find(doc => doc.id === selectedId)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Governance Brain</h1>
        <ToggleGroup aria-label="View" className="view-switch" value={[view]}
          onValueChange={values => { if (values[0]) setView(values[0]) }}>
          {views.map(name => <Toggle key={name} value={name}>{name}</Toggle>)}
        </ToggleGroup>
        {view === 'Graph' && <>
          <Button className="animate-button" onClick={() => setAnimateRun(run => run + 1)}>
            <span className="material-symbols-rounded" aria-hidden="true">play_arrow</span>Animate
          </Button>
          <HeaderSearch value={query} onChange={setQuery} />
        </>}
      </header>
      {view === 'Graph' && <DomainChips value={domains} onChange={setDomains} />}
      <main className="graph-layout" hidden={view !== 'Graph'} aria-label="Graph view">
        <div className="graph-container">
          <Graph docs={docs} visibleIds={visible} selectedId={selectedId} onSelect={setSelectedId} active={view === 'Graph'} animateRun={animateRun} />
          {visible.size === 0 && <div className="graph-empty"><NoMatchingDocuments /></div>}
        </div>
        {selected && <DetailsPanel doc={selected} onClose={() => setSelectedId(null)} />}
      </main>
      {view !== 'Graph' && <main className="view-placeholder" aria-label={`${view} view`}><span className="view-caption">{view} view</span></main>}
      {/* shortcut: temporary fixture counts, remove when all three views render their data. */}
      <footer className="fixture-counts" aria-label="Loaded fixtures">
        {documents.length} documents · {wheels.length} wheel records · {smartSearch.length} suggested questions
      </footer>
    </div>
  )
}
