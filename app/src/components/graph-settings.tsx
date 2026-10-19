import { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { ArrowLeft, Bot, Check, Plus, Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Doc, Domain } from '@/types'
import { domainIcon } from './domain-drawer'
import { EXAMPLE_DOMAINS, proposeDomain, type DomainProposal } from './domain-sorting'

// Graph settings, anchored to the graph's top right. The main option: add a domain,
// and let AI read the vault and propose which documents move to it or join it.

type Step = 'menu' | 'add' | 'reading' | 'review'
const READ_MS = 110

export function GraphSettings({ docs, domains, showOrphans, onShowOrphans, onAddDomain }: {
  docs: Doc[]
  domains: Domain[]
  showOrphans: boolean
  onShowOrphans: (show: boolean) => void
  onAddDomain: (domain: Domain, accepted: DomainProposal[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('menu')
  const [name, setName] = useState('')
  const [covers, setCovers] = useState('')
  const [read, setRead] = useState(0)
  const [proposals, setProposals] = useState<DomainProposal[]>([])
  const [declined, setDeclined] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState<string | null>(null)

  const trimmed = name.trim()
  const exists = domains.some(d => d.toLowerCase() === trimmed.toLowerCase())
  const accepted = proposals.filter(p => !declined.has(p.docId))

  // The scripted read: one document every READ_MS, then the proposals.
  useEffect(() => {
    if (step !== 'reading') return
    if (read >= docs.length) { setProposals(proposeDomain(docs, trimmed, covers)); setStep('review'); return }
    const timer = setTimeout(() => setRead(r => r + 1), READ_MS)
    return () => clearTimeout(timer)
  }, [step, read, docs, trimmed, covers])

  const startReading = () => { setRead(0); setDeclined(new Set()); setStep('reading') }
  const reset = () => { setStep('menu'); setName(''); setCovers(''); setProposals([]) }
  const apply = () => {
    onAddDomain(trimmed as Domain, accepted)
    setNotice(`Added ${trimmed}. ${accepted.length} ${accepted.length === 1 ? 'document' : 'documents'} updated.`)
    reset()
  }
  const toggle = (id: string) => setDeclined(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const count = (domain: Domain) => docs.filter(doc => doc.domains.includes(domain)).length

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.div key="open" layoutId="graph-settings" style={{ borderRadius: 20, transformOrigin: '100% 0%' }}
            className="flex max-h-[600px] w-96 flex-col overflow-hidden border border-border/60 bg-card/90 shadow-soft backdrop-blur-md">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-2">
                {step !== 'menu' && step !== 'reading' && <button aria-label="Back" onClick={() => setStep(step === 'review' ? 'add' : 'menu')} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><ArrowLeft size={14} /></button>}
                <span className="font-heading text-sm font-semibold">{step === 'menu' ? 'Graph settings' : step === 'add' ? 'Add a domain' : step === 'reading' ? 'AI is reading the vault' : `AI suggestions for ${trimmed}`}</span>
              </span>
              <button aria-label="Close settings" onClick={() => setOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X size={14} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {step === 'menu' && <div className="flex flex-col gap-5">
                {notice && <p className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs text-accent-foreground"><Check size={14} />{notice}</p>}
                <section className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Domains · {domains.length}</h3>
                  <ul className="flex flex-col">
                    {domains.map(domain => { const Icon = domainIcon(domain); return (
                      <li key={domain} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                        <span className="flex items-center gap-2.5"><Icon size={15} className="text-muted-foreground" />{domain}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{count(domain)} docs</span>
                      </li>) })}
                  </ul>
                  <Button variant="outline" onClick={() => { setNotice(null); setStep('add') }}><Plus />Add a domain</Button>
                  <p className="text-[11px] leading-snug text-muted-foreground">AI reads every document and suggests which ones move to the new domain or also belong in it. You approve each change.</p>
                </section>
                <section className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Display</h3>
                  <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                    Show orphan documents
                    <input type="checkbox" className="h-4 w-4 accent-primary" checked={showOrphans} onChange={e => onShowOrphans(e.target.checked)} />
                  </label>
                </section>
              </div>}

              {step === 'add' && <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm">Domain name
                  <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="For example, Supplier and third-party risk"
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring" />
                  {exists && <span className="text-xs text-destructive">This domain already exists.</span>}
                </label>
                <label className="flex flex-col gap-1.5 text-sm">What it covers <span className="text-xs text-muted-foreground">Optional. Words that help AI find the right documents.</span>
                  <textarea value={covers} onChange={e => setCovers(e.target.value)} rows={2} placeholder="supplier dependencies, recovery plans"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Examples</span>
                  <div className="flex flex-wrap gap-1.5">{EXAMPLE_DOMAINS.filter(e => !domains.includes(e.name as Domain)).map(e =>
                    <button key={e.name} onClick={() => { setName(e.name); setCovers(e.covers) }} className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted">{e.name}</button>)}</div>
                </div>
                <Button disabled={!trimmed || exists} onClick={startReading}><Bot />Ask AI to sort the vault</Button>
              </div>}

              {step === 'reading' && <div className="flex flex-col gap-3">
                <div className="flex justify-between font-mono text-[11px] text-muted-foreground"><span>Reading {Math.min(read + 1, docs.length)} of {docs.length}</span><span>{trimmed}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><motion.div className="h-full bg-primary" animate={{ width: `${(read / docs.length) * 100}%` }} transition={{ duration: READ_MS / 1000, ease: 'linear' }} /></div>
                <ul className="flex flex-col gap-1">
                  {docs.slice(Math.max(0, read - 4), read + 1).map((doc, index, list) =>
                    <motion.li key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: index === list.length - 1 ? 1 : 0.4, y: 0 }} className="flex items-center gap-2 text-sm">
                      <Bot size={13} className="text-muted-foreground" />{doc.title}
                    </motion.li>)}
                </ul>
              </div>}

              {step === 'review' && <div className="flex flex-col gap-3">
                {proposals.length === 0
                  ? <p className="text-sm text-muted-foreground">AI found no documents that belong in {trimmed}. You can still add it, and assign documents later.</p>
                  : <p className="text-xs text-muted-foreground">{proposals.filter(p => p.kind === 'move').length} to move, {proposals.filter(p => p.kind === 'add').length} to also tag. Untick any you disagree with.</p>}
                {proposals.map((p, index) => {
                  const on = !declined.has(p.docId)
                  return <motion.label key={p.docId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${on ? 'border-primary/40 bg-accent/40' : 'border-border opacity-60'}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle(p.docId)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium">{p.title}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{p.confidence}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-primary">{p.kind === 'move' ? `Move here, replaces ${p.from}` : `Also in ${trimmed}, keeps ${p.from}`}</span>
                      <span className="text-xs leading-snug text-muted-foreground">“{p.reason}”</span>
                    </span>
                  </motion.label>
                })}
                <p className="text-[10px] text-muted-foreground">Example data. The AI reading is scripted in this toy.</p>
              </div>}
            </div>

            {step === 'review' && <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <Button variant="ghost" onClick={reset}>Cancel</Button>
              <Button onClick={apply}>{proposals.length ? `Add domain, apply ${accepted.length}` : 'Add domain'}</Button>
            </footer>}
          </motion.div>
        ) : (
          <motion.button key="closed" layoutId="graph-settings" onClick={() => setOpen(true)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            style={{ borderRadius: 20 }} aria-label="Open graph settings"
            className="flex h-10 w-10 items-center justify-center border border-border/60 bg-card/90 text-foreground shadow-soft backdrop-blur-md">
            <Settings2 size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
