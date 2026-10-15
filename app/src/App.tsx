import { useMemo, useState } from 'react'
import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import documents from './data/documents.json'
import { SmartSearch } from './smart-search/SmartSearch'
import { addFoundLink } from './graph/found-links'
import type { FoundLink } from './graph/found-links'
import type { Doc, Domain } from './types'
import { Graph } from './graph/Graph'
import { WheelView } from './wheel/WheelView'
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
  const [searchRun, setSearchRun] = useState(0)
  const [searchSelectedId, setSearchSelectedId] = useState<string | null>(null)
  const searchSelected = docs.find(doc => doc.id === searchSelectedId)
  const [foundLinks, setFoundLinks] = useState<FoundLink[]>([])
  const [animateRun, setAnimateRun] = useState(0)
  const visible = useMemo(() => visibleIds(docs, domains, query), [domains, query])
  const selected = docs.find(doc => doc.id === selectedId)

  function showOnGraph(link: FoundLink) {
    setFoundLinks(previous => addFoundLink(docs, previous, link))
    setDomains(new Set())
    setQuery('')
    setView('Graph')
    setSearchSelectedId(null)
    setSearchRun(run => run + 1)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Governance Brain</h1>
        <ToggleGroup aria-label="View" className="view-switch" value={[view]}
          onValueChange={values => { if (values[0]) setView(values[0]) }}>
          {views.map(name => <Toggle key={name} value={name}>{name}</Toggle>)}
        </ToggleGroup>
        {view === 'Wheel' && <span className="view-sub">Wheel. The whole wheel shows each domain at its worst topic. A domain wheel shows each topic at its worst KRI. Example data.</span>}
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
          <Graph revealRun={searchRun} foundLinks={foundLinks} docs={docs} visibleIds={visible} selectedId={selectedId} onSelect={setSelectedId} active={view === 'Graph'} animateRun={animateRun} />
          {visible.size === 0 && <div className="graph-empty"><NoMatchingDocuments /></div>}
        </div>
        {selected && <DetailsPanel doc={selected} onClose={() => setSelectedId(null)} />}
      </main>
      <WheelView hidden={view !== 'Wheel'} />
      <main className="smart-search-layout" hidden={view !== 'Smart Search'} aria-label="Smart Search view">
        <SmartSearch key={searchRun} docs={docs} onOpenSource={setSearchSelectedId} onShowOnGraph={showOnGraph} />
        {searchSelected && <DetailsPanel doc={searchSelected} onClose={() => setSearchSelectedId(null)} />}
      </main>
    </div>
  )
}
