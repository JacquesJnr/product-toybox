import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '../components/ui/button'
import { SourceViewer } from '../details/SourceViewer'
import documents from '../data/documents.json'
import type { Doc } from '../types'
import type { LinkId, SourceReference, StagePageProps } from '../stages/contracts'
import { QueryGraph } from './QueryGraph'

const docs = documents as Doc[]
const byId = new Map(docs.map(doc => [doc.id, doc]))
const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'
const reasonLabel = { cites: 'Cites', 'shared-content': 'Shared content', 'same-author': 'Same author' }

export function QueryPage({ state, stageCase, callbacks }: StagePageProps) {
  const [picked, setPicked] = useState<{ documentId: string } | { linkId: LinkId } | null>(null)
  const [source, setSource] = useState<SourceReference | null>(null)
  const query = state.query
  if (!query) return <p className="text-sm text-muted-foreground">Create a Query from New Query in the sidebar.</p>
  const selectedDocs = query.documentIds.flatMap(id => byId.get(id) ? [byId.get(id)!] : [])
  const analysis = state.analysis?.queryId === query.id ? state.analysis : null
  const pickedDoc = picked && 'documentId' in picked ? byId.get(picked.documentId) : null
  const linkId = picked && 'linkId' in picked ? picked.linkId : null
  const [fromId, toId] = linkId?.split('->') ?? []
  const from = byId.get(fromId), to = byId.get(toId)
  const link = from?.links.find(item => item.targetId === toId)
  const sourceDoc = source ? byId.get(source.documentId) : undefined
  const sourceButton = (reference: SourceReference, index: number) => <Button key={`${reference.documentId}-${reference.passage}-${index}`} variant="outline" size="sm" className="h-auto max-w-full whitespace-normal text-left font-mono text-[10px]" onClick={() => setSource(reference)}>{byId.get(reference.documentId)?.title ?? reference.documentId} · {reference.passage}{reference.status === 'unavailable' ? ' · unavailable' : ' ↗'}</Button>
  const documentDetails = (doc: Doc) => <div key={doc.id} className="flex flex-col gap-2 rounded-xl border border-border/60 p-3">
    <h3 className="font-heading text-base font-semibold">{doc.title}</h3>
    <span className="text-xs text-muted-foreground">{doc.primaryDomain} · {doc.from}</span>
    {!doc.author || !doc.text ? <p className="text-sm text-muted-foreground">Source content unavailable: this document is not in the vault.</p> : <>
      <p className="text-sm leading-relaxed">{doc.summary}</p>
      {sourceButton({ documentId: doc.id, passage: 'Document content', status: 'available', text: doc.text }, 0)}
      {doc.insights.map((insight, index) => <div key={index} className="flex flex-col items-start gap-2 rounded-lg bg-muted/50 px-3 py-2"><p className="text-sm leading-relaxed">{insight.text}</p>{sourceButton({ documentId: doc.id, passage: insight.pageRef, status: 'available', text: insight.text }, index + 1)}</div>)}
    </>}
  </div>
  return <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <header className="flex flex-col items-center gap-3 text-center">
      <span className={label}>Query</span><h1 className="font-heading text-3xl font-semibold">{query.question}</h1><p className="text-sm text-muted-foreground">{query.focus}</p>
      <Button disabled={!analysis} onClick={() => callbacks.onNavigate('room')}>Open Board Simulation Room</Button>
    </header>
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-soft"><span className="text-sm font-semibold">{query.documentIds.length} documents · {query.linkIds.length} links</span><span className="text-xs text-muted-foreground">Evidence and focus locked</span></div>
    <QueryGraph documents={selectedDocs} linkIds={query.linkIds} selectedIds={pickedDoc ? [pickedDoc.id] : []} onNode={id => setPicked({ documentId: id })} onLink={id => setPicked({ linkId: id })} />
    {pickedDoc && documentDetails(pickedDoc)}
    {linkId && <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"><span className={label}>Link · {link ? reasonLabel[link.reason] : 'Unavailable'}</span><h2 className="font-heading text-base font-semibold">{from?.title ?? fromId} → {to?.title ?? toId}</h2><p className="text-sm text-muted-foreground">{link ? 'Supplied relationship. Inspect the source documents below.' : 'Relationship content unavailable.'}</p>{from && documentDetails(from)}{to && documentDetails(to)}</section>}
    {!picked && <p className="text-sm text-muted-foreground">Click a node or a link to see its details and sources.</p>}
    <section className="ai-edge flex flex-col gap-4 rounded-2xl p-5 shadow-soft">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Sparkles size={16} className="text-primary" />Analysis</h2>{!analysis && <Button onClick={callbacks.onGenerateAnalysis}>Generate Analysis</Button>}</div>
      <p className="text-xs text-muted-foreground">{stageCase.metadata.scriptedLabel}</p>
      {!analysis ? <p className="text-sm text-muted-foreground">Generate once from this Query’s selected evidence.</p> : (['agreement', 'conflict', 'assumptions', 'unknowns'] as const).map(group => <section key={group} className={`flex flex-col gap-3 ${group === 'conflict' ? 'rounded-xl bg-status-near/10 p-3 ring-1 ring-status-near/30' : group === 'unknowns' ? 'rounded-xl border border-dashed border-border p-3' : ''}`}>
        <h3 className={label}>{{ agreement: 'Agreement', conflict: 'Conflict', assumptions: 'Assumptions', unknowns: 'Unknowns' }[group]}</h3>
        {!analysis[group].length && <p className="text-sm text-muted-foreground">No findings supported by this selection.</p>}
        {analysis[group].map(claim => <article key={claim.id} className="flex flex-col gap-2">{claim.support === 'unknown' && <span className="text-xs font-semibold text-muted-foreground">Unknown · not established by the selected evidence</span>}<p className="text-sm leading-relaxed">{claim.text}</p><div className="flex flex-wrap gap-1.5">{claim.sources.map(sourceButton)}</div>{!claim.sources.length && <p className="text-xs text-muted-foreground">Source evidence unavailable in this selection.</p>}</article>)}
      </section>)}
    </section>
    {source && (source.status === 'unavailable' || !sourceDoc?.author || !sourceDoc.text) && <section role="status" className="rounded-xl border border-dashed border-border bg-card p-4"><h2 className="font-semibold">Source unavailable</h2><p className="text-sm">{source.status === 'unavailable' ? source.reason : 'Source content is not in the vault.'}</p><Button variant="ghost" size="sm" onClick={() => setSource(null)}>Dismiss</Button></section>}
    {source?.status === 'available' && sourceDoc?.author && sourceDoc.text && <SourceViewer doc={sourceDoc} open onOpenChange={open => { if (!open) setSource(null) }} highlightRef={source.passage.replace(/^insight: /, '')} />}
  </div>
}
