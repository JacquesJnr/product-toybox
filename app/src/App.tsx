import { useState } from 'react'
import { Field } from '@base-ui/react/field'
import { Input } from '@base-ui/react/input'
import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import documents from './data/documents.json'
import wheels from './data/wheels.json'
import smartSearch from './data/smart-search.json'
import './App.css'

const views = ['Graph', 'Wheel', 'Smart Search'] as const

export default function App() {
  const [view, setView] = useState<(typeof views)[number]>('Graph')
  const [search, setSearch] = useState('')

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Governance Brain</h1>
        <ToggleGroup
          aria-label="View"
          className="view-switch"
          value={[view]}
          onValueChange={(values) => { if (values[0]) setView(values[0]) }}
        >
          {views.map((name) => <Toggle key={name} value={name}>{name}</Toggle>)}
        </ToggleGroup>
        {view === 'Graph' && (
          <Field.Root className="header-search">
            <span className="material-symbols-rounded" aria-hidden="true">search</span>
            <Field.Label className="visually-hidden">Search the vault</Field.Label>
            <Input value={search} onValueChange={setSearch} placeholder="Search the vault" />
          </Field.Root>
        )}
      </header>
      <main className={`view-placeholder ${view === 'Graph' ? 'graph-placeholder' : ''}`} aria-label={`${view} view`}>
        <span className="view-caption">{view}{view === 'Graph' ? ' view · default' : ' view'}</span>
      </main>
      {/* shortcut: temporary fixture counts, remove when the views render their data. */}
      <footer className="fixture-counts" aria-label="Loaded fixtures">
        {documents.length} documents · {wheels.length} wheel records · {smartSearch.length} suggested questions
      </footer>
    </div>
  )
}
