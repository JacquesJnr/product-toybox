import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Search, Sparkles, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { domainColor, domainGradient } from '@/components/domain-drawer'
import { buildSimulation, tick, type SimLink } from '@/graph/simulation'
import documents from '@/data/documents.json'
import type { Doc } from '@/types'
import '@/graph/graph.css'

// New Query, in two steps: the Node Chooser, then Create new Query.
// The chooser is a small Graph (Jacques, 09-Nov): people remember the data, not the insights about it.
// A Query holds nodes and links. A node brings the whole document, and its insights ride along.
// A link brings both of its documents. Continue stays off until one node or link is in.
// Start from scratch is the other way in: a Query with nothing yet, which gathers later.
// Vault parts are plain and still; AI suggestions are dashed and tinted.

const docs = documents as Doc[]
const byId = new Map(docs.map(d => [d.id, d]))
const reasonLabel: Record<SimLink['reason'], string> = { cites: 'Cites', 'shared-content': 'Shared content', 'same-author': 'Same author' }
const linkKey = (l: SimLink) => `${l.source}|${l.target}`

// The main Graph's layout, settled once: same forces, no live motion in a chooser.
const sim = buildSimulation(docs)
for (let i = 0; i < 600; i++) tick(sim, sim.nodes, sim.links, i * 16)
const xs = sim.nodes.map(n => n.x), ys = sim.nodes.map(n => n.y)
const PAD = 40
const view = { x: Math.min(...xs) - PAD, y: Math.min(...ys) - PAD, w: Math.max(...xs) - Math.min(...xs) + PAD * 2, h: Math.max(...ys) - Math.min(...ys) + PAD * 2 }

const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'

// Scripted AI: focuses written from what is in the Query. From scratch, AI reads the whole vault.
function focusesFor(titles: string[], edge?: [string, string]) {
  if (titles.length === 0) return [
    'Is supplier exposure still inside the risk appetite the board approved?',
    'Does the 2027 forecast hold if the capex plan slips a quarter?',
    'Do the open audit findings close before year-end?',
    'Should executive incentives change after the September review?',
  ]
  return [
    edge ? `Do the ${edge[0]} and the ${edge[1]} agree, and where do they conflict?` : `Is the ${titles[0]} current, and does a later source contradict it?`,
    `What does the board need to decide here, and by when?`,
    `Which assumptions in the ${titles[0]} have no source behind them?`,
    `What isn't known yet that could change the board's view?`,
  ]
}

export type NewQuery = { question: string; focus: string; insights: number }

export function NewQueryDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (q: NewQuery) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">{open && <Steps onCreate={onCreate} onCancel={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function Steps({ onCreate, onCancel }: { onCreate: (q: NewQuery) => void; onCancel: () => void }) {
  const [step, setStep] = useState<'choose' | 'create'>('choose')
  const [nodes, setNodes] = useState<Set<string>>(new Set())
  const [edges, setEdges] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [ai, setAi] = useState(true)
  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')

  const flip = (set: Set<string>, key: string) => { const next = new Set(set); if (next.has(key)) next.delete(key); else next.add(key); return next }
  const pickedEdges = sim.links.filter(l => edges.has(linkKey(l)))
  // In the Query: the picked nodes and both ends of each picked link.
  const inQuery = useMemo(() => new Set([...nodes, ...pickedEdges.flatMap(l => [l.source, l.target])]), [nodes, edges])
  const titles = [...inQuery].map(id => byId.get(id)!.title)
  const firstEdge = pickedEdges[0] && [byId.get(pickedEdges[0].source)!.title, byId.get(pickedEdges[0].target)!.title] as [string, string]
  const count = inQuery.size + edges.size
  // Taking a node out also takes out the links that brought it in.
  const remove = (id: string) => { setNodes(new Set([...nodes].filter(n => n !== id))); setEdges(new Set([...edges].filter(k => !k.split('|').includes(id)))) }

  if (step === 'create') return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">Create new Query</DialogTitle>
        <DialogDescription>Name the board question and set its focus. {count === 0 ? 'From scratch: nothing in it yet. Add nodes from the Query.' : `${inQuery.size} ${inQuery.size === 1 ? 'node' : 'nodes'} and ${edges.size} ${edges.size === 1 ? 'link' : 'links'} carried in.`}</DialogDescription>
      </DialogHeader>
      {count > 0 && <div className="flex flex-wrap gap-1.5">
        {titles.map(t => <span key={t} className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[10px]">{t}</span>)}
        {pickedEdges.map(l => <span key={linkKey(l)} className="rounded-full border border-foreground/40 px-2 py-0.5 font-mono text-[10px]">{byId.get(l.source)!.title} ↔ {byId.get(l.target)!.title}</span>)}
      </div>}
      <label className="flex flex-col gap-1.5"><span className={label}>Name</span><Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="One board question, e.g. Is the Q1 go-live ready?" /></label>
      <label className="flex flex-col gap-1.5"><span className={label}>Focus</span><Textarea value={focus} onChange={e => setFocus(e.target.value)} placeholder="What does the board need to know?" rows={2} /></label>
      <div className="flex flex-col gap-2">
        <span className={`flex items-center gap-1.5 ${label}`}><Sparkles size={11} className="ai-glow text-[#8338EC]" />Suggested focuses{count === 0 && ' · from the whole vault'}</span>
        {focusesFor(titles, firstEdge).map((f, i) => (
          <motion.button key={f} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => setFocus(f)}
            className={`ai-edge rounded-xl px-3 py-2 text-left text-sm [--ai-fill:color-mix(in_oklch,var(--popover)_94%,#8338EC)] ${focus === f ? 'font-medium' : 'text-foreground/80'}`}>{f}</motion.button>
        ))}
      </div>
      <DialogFooter>
        <Button variant="ghost" className="mr-auto" onClick={() => setStep('choose')}><ArrowLeft size={14} />Nodes</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button disabled={!name.trim()} onClick={() => onCreate({ question: name.trim(), focus, insights: count })}>Create Query</Button>
      </DialogFooter>
    </>
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">Choose nodes</DialogTitle>
        <DialogDescription>Click a document or a link between two. A node brings the whole document; its insights ride along.</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-3">
        <div className="relative flex-1"><Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the vault" className="pl-8" /></div>
        <label className="flex items-center gap-2 text-sm"><Switch checked={ai} onCheckedChange={setAi} /><Sparkles size={13} className={ai ? 'ai-glow text-[#8338EC]' : 'text-muted-foreground'} />Suggest related</label>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <NodeGraph search={search} ai={ai} edges={edges} inQuery={inQuery}
          onNode={id => inQuery.has(id) ? remove(id) : setNodes(flip(nodes, id))} onEdge={key => setEdges(flip(edges, key))} />
        <InQuery nodes={[...inQuery]} edges={pickedEdges} onRemoveNode={remove} onRemoveEdge={key => setEdges(flip(edges, key))} />
      </div>

      <DialogFooter>
        <span className="mr-auto self-center text-xs text-muted-foreground">{inQuery.size} nodes · {edges.size} links</span>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="outline" onClick={() => { setNodes(new Set()); setEdges(new Set()); setStep('create') }}>Start from scratch</Button>
        <Button disabled={count === 0} onClick={() => setStep('create')}>Continue</Button>
      </DialogFooter>
    </>
  )
}

// The small Graph: the main Graph's diamonds, domain colors and picked ring, plus selectable links.
function NodeGraph({ search, ai, edges, inQuery, onNode, onEdge }: {
  search: string; ai: boolean; edges: Set<string>; inQuery: Set<string>; onNode: (id: string) => void; onEdge: (key: string) => void
}) {
  const [hover, setHover] = useState<string | null>(null)
  const q = search.trim().toLowerCase()
  const matches = (doc: Doc) => !q || [doc.title, doc.text, ...doc.insights.map(i => i.text)].some(s => s.toLowerCase().includes(q))
  // Scripted AI: the neighbors of what is in the Query, not yet in it.
  const suggested = new Set(ai ? sim.links.flatMap(l => inQuery.has(l.source) && !inQuery.has(l.target) ? [l.target] : inQuery.has(l.target) && !inQuery.has(l.source) ? [l.source] : []).slice(0, 4) : [])
  const hoveredEdge = sim.links.find(l => linkKey(l) === hover)
  const k = view.w / 640 // keeps strokes and labels at screen size

  return (
    <div className="relative h-[440px] overflow-hidden rounded-2xl border border-border bg-stage">
      <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className="absolute inset-0 h-full w-full select-none">
        {sim.links.map(l => {
          const s = sim.byId.get(l.source)!, t = sim.byId.get(l.target)!, key = linkKey(l)
          const picked = edges.has(key), on = hover === key
          const dim = q && !(matches(byId.get(l.source)!) && matches(byId.get(l.target)!))
          return <g key={key} className="cursor-pointer" onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)} onClick={() => onEdge(key)} opacity={dim ? 0.15 : 1}>
            <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth={14 * k} />
            <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} className={picked || on ? undefined : 'graph-link'}
              stroke={picked ? 'var(--foreground)' : on ? 'var(--muted-foreground)' : undefined} strokeWidth={picked ? 2.5 : on ? 2 : undefined} vectorEffect="non-scaling-stroke" />
          </g>
        })}
        {sim.nodes.map(n => {
          const doc = byId.get(n.id)!, color = domainColor(doc.primaryDomain)
          const r = 3.2 * Math.sqrt(1 + n.deg * 1.4) * k * 0.9
          const isIn = inQuery.has(n.id), isSuggested = suggested.has(n.id)
          const dim = q && !matches(doc)
          return <g key={n.id} transform={`translate(${n.x} ${n.y})`} className="cursor-pointer" opacity={dim ? 0.2 : 1}
            onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)} onClick={() => onNode(n.id)}>
            <circle r={r + 8 * k} fill="transparent" />
            {isSuggested && <motion.rect x={-r - 5 * k} y={-r - 5 * k} width={(r + 5 * k) * 2} height={(r + 5 * k) * 2} rx="2" transform="rotate(45)" fill="none" stroke="#8338EC" strokeWidth={1.5} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" className="ai-glow" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />}
            {isIn && <rect className="picked-ring" style={{ stroke: color }} x={-r - 3 * k} y={-r - 3 * k} width={(r + 3 * k) * 2} height={(r + 3 * k) * 2} rx="2" transform="rotate(45)" />}
            <rect className="node-diamond" x={-r} y={-r} width={r * 2} height={r * 2} rx="2" transform="rotate(45)"
              style={{ fill: isIn || hover === n.id ? `url(#chooser-${n.id})` : isSuggested ? 'var(--muted)' : color, stroke: isIn || hover === n.id ? color : 'var(--surface)' }} />
            <defs><linearGradient id={`chooser-${n.id}`}><stop offset="0%" style={{ stopColor: 'var(--muted)' }} /><stop offset="50%" style={{ stopColor: `color-mix(in oklch, ${color} 45%, white)` }} /><stop offset="100%" style={{ stopColor: color }} /></linearGradient></defs>
            <text className="node-label" y={r * 1.42 + 12 * k} textAnchor="middle" fontSize={10 * k} style={isIn ? { fill: 'var(--foreground)' } : undefined}>{doc.title}</text>
          </g>
        })}
      </svg>
      {/* A link has its own details: what joins the two documents. The main Graph needs this too (Jacques, 09-Nov). */}
      {hoveredEdge && <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-soft">
        <span className="font-medium">{byId.get(hoveredEdge.source)!.title} ↔ {byId.get(hoveredEdge.target)!.title}</span>
        <span className="text-muted-foreground">{reasonLabel[hoveredEdge.reason]}</span>
        <span className="text-muted-foreground">· click to {edges.has(linkKey(hoveredEdge)) ? 'remove' : 'add the link'}</span>
      </div>}
      {suggested.size > 0 && <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#8338EC]/10 px-2.5 py-1 text-[11px] text-[#8338EC]"><Sparkles size={11} />{suggested.size} related, suggested by AI</span>}
      <span className="absolute right-3 bottom-3 font-mono text-[10px] text-muted-foreground">{docs.length} documents</span>
    </div>
  )
}

// What is in the Query so far. Plain: it is the director's choice.
function InQuery({ nodes, edges, onRemoveNode, onRemoveEdge }: { nodes: string[]; edges: SimLink[]; onRemoveNode: (id: string) => void; onRemoveEdge: (key: string) => void }) {
  return (
    <div className="flex h-[440px] flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3">
      <span className={label}>In this Query</span>
      {nodes.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet. Click a node or the line between two.</p>}
      <ScrollArea className="min-h-0 flex-1"><div className="flex flex-col gap-1 pr-2">
        {edges.map(l => (
          <div key={linkKey(l)} className="flex items-center gap-2 rounded-lg border border-foreground/30 px-2 py-1.5">
            <span className="h-0.5 w-3 shrink-0 bg-foreground" />
            <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm">{byId.get(l.source)!.title} ↔ {byId.get(l.target)!.title}</span><span className="text-[11px] text-muted-foreground">Link · {reasonLabel[l.reason]}</span></span>
            <button aria-label="Remove the link" onClick={() => onRemoveEdge(linkKey(l))} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
          </div>
        ))}
        {nodes.map(id => {
          const doc = byId.get(id)!, color = domainColor(doc.primaryDomain)
          return (
            <div key={id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50">
              <span className="size-2.5 shrink-0 rotate-45 rounded-[2px]" style={{ background: domainGradient(color), border: `1px solid ${color}` }} />
              <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm">{doc.title}</span><span className="text-[11px] text-muted-foreground">{doc.insights.length} {doc.insights.length === 1 ? 'insight rides' : 'insights ride'} along</span></span>
              <button aria-label={`Remove ${doc.title}`} onClick={() => onRemoveNode(id)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
            </div>
          )
        })}
      </div></ScrollArea>
    </div>
  )
}
