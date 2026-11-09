import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, CircleDashed, Plus, Search, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import documents from '@/data/documents.json'
import type { Doc } from '@/types'

// New Query, in two steps (Query.md): the Insight Chooser, then Create new Query.
// Continue stays off until one insight is chosen. Start from scratch is the other way in:
// a Query with no insights yet, which gathers them later.
// Vault insights are plain and still; AI suggestions are dashed and tinted.

const docs = documents as Doc[]
const insights = docs.flatMap(doc => doc.insights.map((insight, i) => ({ key: `${doc.id}#${i}`, doc, insight })))
type Item = (typeof insights)[number]

const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'

// Scripted AI: related insights come from documents linked to the chosen ones.
function suggestFor(chosen: Set<string>) {
  const chosenDocs = new Set(insights.filter(x => chosen.has(x.key)).map(x => x.doc.id))
  const linked = new Set(docs.filter(d => chosenDocs.has(d.id)).flatMap(d => d.links.map(l => l.targetId)))
  return insights.filter(x => linked.has(x.doc.id) && !chosenDocs.has(x.doc.id) && !chosen.has(x.key)).slice(0, 3)
}

// Scripted AI: focuses written from the chosen insights' documents and domains.
// From scratch there is nothing chosen, so AI reads the whole vault for what may need the board.
function focusesFor(items: Item[]) {
  if (items.length === 0) return [
    'Is supplier exposure still inside the risk appetite the board approved?',
    'Does the 2027 forecast hold if the capex plan slips a quarter?',
    'Do the open audit findings close before year-end?',
    'Should executive incentives change after the September review?',
  ]
  const titles = [...new Set(items.map(x => x.doc.title))]
  const domain = items[0].doc.primaryDomain.toLowerCase()
  return [
    titles.length > 1 ? `Do the ${titles.slice(0, 2).join(' and the ')} agree, and where do they conflict?` : `Is the ${titles[0]} current, and does a later source contradict it?`,
    `What does the board need to decide on ${domain}, and by when?`,
    `Which assumptions in the ${titles[0]} have no source behind them?`,
    `What isn't known yet that could change the board's view?`,
  ]
}

export type NewQuery = { question: string; focus: string; insights: number }

export function NewQueryDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (q: NewQuery) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">{open && <Steps onCreate={onCreate} onCancel={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function Steps({ onCreate, onCancel }: { onCreate: (q: NewQuery) => void; onCancel: () => void }) {
  const [step, setStep] = useState<'choose' | 'create'>('choose')
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [ai, setAi] = useState(true)
  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')

  const toggle = (key: string) => setChosen(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
  const q = search.trim().toLowerCase()
  const shown = insights.filter(x => !q || [x.insight.text, x.doc.title, ...x.insight.tags].some(s => s.toLowerCase().includes(q)))
  const suggested = ai ? suggestFor(chosen) : []
  const picked = insights.filter(x => chosen.has(x.key))

  if (step === 'create') return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">Create new Query</DialogTitle>
        <DialogDescription>Name the board question and set its focus. {picked.length === 0 ? 'From scratch: no insights yet. Add them from the Query.' : `${picked.length} ${picked.length === 1 ? 'insight' : 'insights'} carried in.`}</DialogDescription>
      </DialogHeader>
      {picked.length > 0 && <div className="flex flex-wrap gap-1.5">{picked.map(x => <span key={x.key} className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[10px]">{x.doc.title} · {x.insight.pageRef}</span>)}</div>}
      <label className="flex flex-col gap-1.5"><span className={label}>Name</span><Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="One board question, e.g. Is the Q1 go-live ready?" /></label>
      <label className="flex flex-col gap-1.5"><span className={label}>Focus</span><Textarea value={focus} onChange={e => setFocus(e.target.value)} placeholder="What does the board need to know?" rows={2} /></label>
      <div className="flex flex-col gap-2">
        <span className={`flex items-center gap-1.5 ${label}`}><Sparkles size={11} className="ai-glow text-[#8338EC]" />Suggested focuses{picked.length === 0 && ' · from the whole vault'}</span>
        {focusesFor(picked).map((f, i) => (
          <motion.button key={f} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => setFocus(f)}
            className={`ai-edge rounded-xl px-3 py-2 text-left text-sm [--ai-fill:color-mix(in_oklch,var(--popover)_94%,#8338EC)] ${focus === f ? 'font-medium' : 'text-foreground/80'}`}>{f}</motion.button>
        ))}
      </div>
      <DialogFooter>
        <Button variant="ghost" className="mr-auto" onClick={() => setStep('choose')}><ArrowLeft size={14} />Insights</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button disabled={!name.trim()} onClick={() => onCreate({ question: name.trim(), focus, insights: picked.length })}>Create Query</Button>
      </DialogFooter>
    </>
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">Choose insights</DialogTitle>
        <DialogDescription>Start from insights in the vault, or from scratch and gather them later.</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-3">
        <div className="relative flex-1"><Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the vault" className="pl-8" /></div>
        <label className="flex items-center gap-2 text-sm"><Switch checked={ai} onCheckedChange={setAi} /><Sparkles size={13} className={ai ? 'ai-glow text-[#8338EC]' : 'text-muted-foreground'} />Suggest related</label>
      </div>

      {ai && (
        <div className="flex flex-col gap-1.5">
          <span className={label}>Suggested by AI</span>
          {suggested.length === 0
            ? <p className="text-xs text-muted-foreground">Choose an insight and AI suggests related ones.</p>
            : suggested.map(x => (
              <motion.button key={x.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => toggle(x.key)} className="flex items-center gap-2 rounded-lg border border-dashed border-[#8338EC]/40 bg-[#8338EC]/5 px-2.5 py-2 text-left text-sm">
                <CircleDashed size={14} className="shrink-0 text-[#8338EC]" /><span className="min-w-0 flex-1 truncate">{x.insight.text}</span><span className="shrink-0 font-mono text-[10px] text-muted-foreground">{x.doc.title}</span><Plus size={14} className="shrink-0 text-muted-foreground" />
              </motion.button>
            ))}
        </div>
      )}

      <ScrollArea className="h-64 rounded-xl border border-border/60">
        <div className="flex flex-col">
          {shown.map(x => (
            <label key={x.key} className="flex cursor-pointer items-start gap-3 border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-muted/50">
              <Checkbox className="mt-0.5" checked={chosen.has(x.key)} onCheckedChange={() => toggle(x.key)} />
              <span className="flex min-w-0 flex-col gap-0.5"><span className="text-sm leading-snug">{x.insight.text}</span><span className="font-mono text-[10px] text-muted-foreground">{x.doc.title} · {x.insight.pageRef} · {x.doc.primaryDomain}</span></span>
            </label>
          ))}
          {shown.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nothing in the vault matches "{search}".</p>}
        </div>
      </ScrollArea>

      <DialogFooter>
        <span className="mr-auto self-center text-xs text-muted-foreground">{chosen.size} chosen</span>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="outline" onClick={() => { setChosen(new Set()); setStep('create') }}>Start from scratch</Button>
        <Button disabled={chosen.size === 0} onClick={() => setStep('create')}>Continue</Button>
      </DialogFooter>
    </>
  )
}
