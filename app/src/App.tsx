import { useMemo, useState } from 'react'
import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import documents from './data/documents.json'
import wheels from './data/wheels.json'
import smartSearch from './data/smart-search.json'
import type { Doc, Domain, WheelRecord } from './types'
import { Graph } from './graph/Graph'
import { Wheel } from './wheel/Wheel'
import { visibleIds } from './filters/visible'
import { DomainChips } from './filters/DomainChips'
import { HeaderSearch } from './filters/HeaderSearch'
import { NoMatchingDocuments } from './filters/NoMatchingDocuments'
import { DetailsPanel } from './details/DetailsPanel'
import { SourceViewer } from './details/SourceViewer'
import { RiskSummary } from './risk/RiskSummary'
import './App.css'

const views = ['Graph', 'Wheel', 'Smart Search'] as const
const docs = documents as Doc[]
const wheelRecords = wheels as WheelRecord[]

export default function App() {
  const [view, setView] = useState<(typeof views)[number]>('Graph')
  const [query, setQuery] = useState('')
  const [domains, setDomains] = useState<Set<Domain>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animateRun, setAnimateRun] = useState(0)
  const [wheelDomain, setWheelDomain] = useState<Domain | null>(null)
  const [pickedWheelKey, setPickedWheelKey] = useState<string | null>(null)
  const [evidence, setEvidence] = useState<{ documentId: string; pageRef: string } | null>(null)
  const visible = useMemo(() => visibleIds(docs, domains, query), [domains, query])
  const selected = docs.find(doc => doc.id === selectedId)
  const pickedWheelRecord = wheelRecords.find(record => `${record.documentId}|${record.topic}` === pickedWheelKey)
  const pickedWheelDoc = docs.find(doc => doc.id === pickedWheelRecord?.documentId)
  const evidenceDoc = docs.find(doc => doc.id === evidence?.documentId)

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
      {view === 'Wheel' && <DomainChips single value={new Set(wheelDomain ? [wheelDomain] : [])}
        onChange={next => setWheelDomain(next.values().next().value ?? null)} />}
      <main className="graph-layout" hidden={view !== 'Graph'} aria-label="Graph view">
        <div className="graph-container">
          <Graph docs={docs} visibleIds={visible} selectedId={selectedId} onSelect={setSelectedId} active={view === 'Graph'} animateRun={animateRun} />
          {visible.size === 0 && <div className="graph-empty"><NoMatchingDocuments /></div>}
        </div>
        {selected && <DetailsPanel doc={selected} onClose={() => setSelectedId(null)} />}
      </main>
      <main className="graph-layout" hidden={view !== 'Wheel'} aria-label="Wheel view">
        <Wheel records={wheelRecords} docs={docs} domain={wheelDomain} pickedKey={pickedWheelKey} onPick={setPickedWheelKey} />
        {pickedWheelRecord && pickedWheelDoc && <RiskSummary record={pickedWheelRecord} doc={pickedWheelDoc}
          onClose={() => setPickedWheelKey(null)} onOpenEvidence={(documentId, pageRef) => setEvidence({ documentId, pageRef })} />}
      </main>
      {evidenceDoc && <SourceViewer doc={evidenceDoc} open={evidence !== null}
        onOpenChange={open => { if (!open) setEvidence(null) }} highlightRef={evidence?.pageRef} />}
      {view === 'Smart Search' && <main className="view-placeholder" aria-label="Smart Search view"><span className="view-caption">Smart Search view</span></main>}
      {/* shortcut: temporary fixture counts, remove when all three views render their data. */}
      <footer className="fixture-counts" aria-label="Loaded fixtures">
        {documents.length} documents · {wheels.length} wheel records · {smartSearch.length} suggested questions
      </footer>
    </div>
  )
}
