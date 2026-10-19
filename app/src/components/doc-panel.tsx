import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, FileX, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import documents from '@/data/documents.json'
import type { Doc } from '@/types'
import { DocPreview } from './doc-preview'
import { SourceDialog } from './source-dialog'
import { domainColor, domainIcon } from './domain-drawer'
import Avatar3 from './watermelon/avatar-3'

// The picked document. The vault part (header, preview, ledger) is still and matte;
// the AI part (summary, insights) is tinted and moves in, so AI's role reads at a glance.

const TYPE = { pdf: 'PDF', video: 'Video', sheet: 'Spreadsheet', image: 'Image' }
const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const
const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'

function Confidence({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-2" aria-label={`Confidence ${value.toFixed(2)}`}>
      <span className="flex h-2 w-16 gap-px" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => <span key={i} className={`flex-1 rounded-full ${i < Math.round(value * 10) ? 'bg-primary' : 'bg-secondary'}`} />)}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{value.toFixed(2)}</span>
    </span>
  )
}

export function DocPanel({ doc, onClose, onSelect }: { doc: Doc; onClose: () => void; onSelect: (id: string) => void }) {
  const [source, setSource] = useState<{ documentId: string; pageRef?: string } | null>(null)
  const sourceOpen = source?.documentId === doc.id
  const missing = doc.id === 'employment-contracts'
  const linked = doc.links.map(link => documents.find(item => item.id === link.targetId)).filter(Boolean) as { id: string; title: string }[]

  return (
    <>
      <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={SPRING} aria-label={doc.title}
        className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto">

            <header className="flex flex-col gap-3 bg-muted/50 px-5 pt-4 pb-5">
              <div className="flex items-center justify-between">
                <span className={label}>Document · {TYPE[doc.type]}</span>
                <button onClick={onClose} aria-label="Close details" className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={14} /></button>
              </div>
              <h2 className="font-heading text-xl leading-tight font-semibold">{doc.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {doc.domains.map(domain => { const Icon = domainIcon(domain); const primary = domain === doc.primaryDomain; return (
                  <span key={domain} style={primary ? { background: domainColor(domain), borderColor: 'transparent' } : undefined}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${primary ? 'text-white' : 'border-border text-foreground'}`}>
                    <Icon size={12} style={primary ? undefined : { color: domainColor(domain) }} />{domain}
                  </span>) })}
              </div>
            </header>

            {missing ? (
              <div className="m-5 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center">
                <FileX size={22} className="text-muted-foreground" />
                <span className="text-sm font-medium">Not in the vault</span>
                <span className="text-xs text-muted-foreground">Other documents refer to it, but nobody has uploaded it.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-5 pt-5">
                <motion.button whileHover={{ y: -2 }} transition={SPRING} onClick={() => setSource({ documentId: doc.id })} aria-haspopup="dialog" aria-expanded={sourceOpen}
                  className="overflow-hidden rounded-2xl border border-border/60 text-left">
                  <DocPreview doc={doc} />
                </motion.button>
                <Button variant="outline" size="sm" className="self-start" onClick={() => setSource({ documentId: doc.id })}>Open source<ArrowUpRight /></Button>
              </div>
            )}

            <dl className="mx-5 mt-5 grid grid-cols-[88px_1fr] gap-x-3 border-t border-foreground/80 font-mono text-[11px]">
              <dt className="border-b border-border py-2.5 text-muted-foreground uppercase">author</dt>
              <dd className="flex items-center gap-2.5 border-b border-border py-2">
                <Avatar3 name={doc.author?.name ?? null} />
                {doc.author
                  ? <span className="flex flex-col font-sans"><span className="text-[13px] font-semibold">{doc.author.name}</span><span className="text-[11px] text-muted-foreground">{doc.author.role}</span></span>
                  : <span className="font-sans text-[13px] text-muted-foreground">Unknown</span>}
              </dd>
              {[['issued', doc.issued || '—'], ['from', doc.from || '—']].map(([name, value]) => (
                <div key={name} className="contents"><dt className="border-b border-border py-2 text-muted-foreground uppercase">{name}</dt><dd className="border-b border-border py-2">{value}</dd></div>
              ))}
              <dt className="py-2 text-muted-foreground uppercase">linked to</dt>
              <dd className="flex flex-wrap gap-1 py-1.5">
                {linked.length ? linked.map(item => (
                  <button key={item.id} onClick={() => onSelect(item.id)} className="flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 font-sans text-[11px] hover:border-foreground hover:bg-muted">
                    {item.title}<ArrowUpRight size={10} />
                  </button>)) : '—'}
              </dd>
            </dl>

            {!missing && <>
              <div className="mt-5 h-px w-full border-b-2 border-dashed border-border" />
              <section className="flex flex-col gap-4 bg-accent/30 px-5 py-5">
                <h3 className={`flex items-center gap-1.5 ${label}`}><Sparkles size={12} className="text-primary" />AI reading</h3>
                <p className="text-sm leading-relaxed">{doc.summary}</p>
                <h4 className={label}>Insights · {doc.insights.length}</h4>
                {doc.insights.map((insight, index) => (
                  <motion.article key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.12 + index * 0.08 }}
                    className="ai-edge flex flex-col gap-2.5 rounded-2xl p-4 shadow-xs">
                    <p className="text-sm leading-snug">{insight.text}</p>
                    <div className="flex flex-wrap gap-1">{insight.tags.map(tag => <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">{tag}</span>)}</div>
                    <div className="flex items-center justify-between border-t border-border pt-2.5">
                      <button onClick={() => setSource({ documentId: doc.id, pageRef: insight.pageRef })} aria-haspopup="dialog" aria-label={`Open ${doc.title}, ${insight.pageRef}`}
                        className="flex items-center gap-0.5 font-mono text-[11px] text-primary hover:underline">{insight.pageRef}<ArrowUpRight size={11} /></button>
                      <Confidence value={insight.confidence} />
                    </div>
                  </motion.article>
                ))}
              </section>
            </>}
          </motion.div>
        </AnimatePresence>
      </motion.aside>
      {!missing && <SourceDialog doc={doc} open={sourceOpen} onOpenChange={open => { if (!open) setSource(null) }} highlightRef={source?.pageRef} />}
    </>
  )
}
