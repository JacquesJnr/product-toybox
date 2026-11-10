import { useState } from 'react'
import { ArrowLeft, Search, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { ScrollArea } from '../components/ui/scroll-area'
import documents from '../data/documents.json'
import type { Doc } from '../types'
import type { LinkId, StagePageProps } from '../stages/contracts'
import { createQuery } from '../stages/state'
import { QueryGraph } from './QueryGraph'

const docs = documents as Doc[]
const links: LinkId[] = docs.flatMap(doc => doc.links.map(link => `${doc.id}->${link.targetId}` as LinkId))
const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'

export function CreateQuery({ state, callbacks }: StagePageProps) {
  const [step, setStep] = useState<'choose' | 'create'>('choose')
  const [documentIds, setDocumentIds] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [focus, setFocus] = useState('')
  const [search, setSearch] = useState('')
  const input = { question, focus, documentIds }
  let valid = false
  try { createQuery('query-validation', input, docs, state.query); valid = true } catch { /* The shared creation rule controls availability. */ }
  const toggle = (id: string) => setDocumentIds(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id])
  if (state.query) return <p className="text-sm text-muted-foreground">A Query already exists. Reload to start again.</p>
  return <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
    <header className="flex flex-col gap-1">
      <h1 className="font-heading text-xl font-semibold">{step === 'choose' ? 'Choose nodes' : 'Create new Query'}</h1>
      <p className="text-sm text-muted-foreground">{step === 'choose' ? 'Choose documents from the vault. A link selects both documents; their insights ride along.' : 'Name the board question and set its focus. Evidence and focus lock when you create.'}</p>
    </header>
    {step === 'choose' ? <>
      <label className="relative"><Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search the vault" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the vault" className="pl-8" /></label>
      <div className="grid grid-cols-[1fr_260px] gap-4">
        <QueryGraph documents={docs} linkIds={links} selectedIds={documentIds} search={search} onNode={toggle} onLink={id => setDocumentIds(ids => [...new Set([...ids, ...id.split('->')])])} />
        <aside className="flex max-h-[470px] flex-col gap-3 rounded-2xl border border-border/60 p-3">
          <h2 className={label}>In this Query · {documentIds.length} documents</h2>
          {!documentIds.length && <p className="text-sm text-muted-foreground">Nothing yet. Click a document or a link.</p>}
          <ScrollArea className="min-h-0 flex-1"><div className="flex flex-col gap-2 pr-2">{documentIds.map(id => {
            const doc = docs.find(item => item.id === id)!
            return <div key={id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-2"><span className="min-w-0 flex-1 text-sm">{doc.title}</span><Button variant="ghost" size="icon-sm" aria-label={`Remove ${doc.title}`} onClick={() => toggle(id)}><X size={14} /></Button></div>
          })}</div></ScrollArea>
        </aside>
      </div>
    </> : <>
      <div className="flex flex-wrap gap-1.5">{documentIds.map(id => <span key={id} className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[10px]">{docs.find(doc => doc.id === id)!.title}</span>)}</div>
      <label className="flex flex-col gap-1.5"><span className={label}>Question</span><Input autoFocus value={question} onChange={event => setQuestion(event.target.value)} placeholder="One board question" /></label>
      <label className="flex flex-col gap-1.5"><span className={label}>Focus</span><Textarea value={focus} onChange={event => setFocus(event.target.value)} placeholder="What does the board need to know?" rows={3} /></label>
      <p className="text-xs text-muted-foreground">A question, focus and at least one document are required.</p>
    </>}
    <footer className="flex items-center justify-end gap-2">
      {step === 'create' && <Button variant="ghost" className="mr-auto" onClick={() => setStep('choose')}><ArrowLeft size={14} />Nodes</Button>}
      <Button variant="outline" onClick={() => callbacks.onNavigate('brain')}>Cancel</Button>
      {step === 'choose' ? <Button disabled={!documentIds.length} onClick={() => setStep('create')}>Continue</Button> : <Button disabled={!valid} onClick={() => { if (valid) callbacks.onCreate(input) }}>Create Query</Button>}
    </footer>
  </section>
}
