import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, Check, ChevronDown, Plus, Sparkles, StickyNote, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { domainColor, domainGradient } from '@/components/domain-drawer'
import { NewQueryDialog } from './NewQueryDialog'
import documents from '@/data/documents.json'
import type { Doc, Domain } from '@/types'
import '@/graph/graph.css'

// The Query graph: the Query's nodes and the links between them (T78).
// Same look as the main Graph and the node chooser: domain-colored diamonds, hairline links, picked ring.
// A node brings its whole document; its insights ride along as notes on the node.
// Vault parts are plain and still. AI parts (the suggested neighbor) are dashed, tinted and move.
// Content is the Meridian Group mid-fi; nodes added from the chooser come from the vault fixtures.

export type QNode = { id: string; title: string; domain: Domain; x: number; y: number; notes: { text: string; source: string }[] }
export type QLink = { a: string; b: string; reason: 'Cites' | 'Shared content' | 'Same author' | 'Conflict'; text: string }

export const startNodes: QNode[] = [
  { id: 'm3', title: 'M3 go-live', domain: 'Strategy execution', x: 200, y: 185, notes: [
    { text: 'M3 is the consolidated ledger go-live, set for Q1 FY27.', source: 'Report p.3' },
    { text: 'Readiness review sits one month after regional training.', source: 'Report p.15' },
    { text: 'Spend is 62% committed against the phased plan.', source: 'Report p.9' },
  ] },
  { id: 'report', title: 'Programme report', domain: 'Strategy execution', x: 85, y: 95, notes: [
    { text: 'Reports M3 as on track.', source: 'Report p.14' },
    { text: 'Assumes regional training finishes before go-live.', source: 'Report p.15' },
  ] },
  { id: 'r22', title: 'Risk R-22', domain: 'Risk and resilience', x: 315, y: 85, notes: [
    { text: 'Rates M3 high risk, with 4 open risks.', source: 'R-22' },
    { text: 'Updated 4 days after the programme report.', source: 'R-22 · history' },
  ] },
  { id: 'coresys', title: 'CoreSys contract', domain: 'Controls and assurance', x: 335, y: 220, notes: [
    { text: "Not read yet. Vendor exit terms aren't known.", source: 'CoreSys contract' },
  ] },
  { id: 'd114', title: 'Decision D-114', domain: 'Major decisions', x: 80, y: 290, notes: [
    { text: 'The board approved the phased budget in March.', source: 'Minutes · Mar' },
  ] },
  { id: 'budget', title: 'Budget line', domain: 'Financial stewardship', x: 280, y: 315, notes: [
    { text: 'AED 2.1m parallel running costs if M3 slips a quarter, inside the 5% contingency.', source: 'ERP · Aug actuals' },
  ] },
]

export const startLinks: QLink[] = [
  { a: 'm3', b: 'report', reason: 'Cites', text: 'The programme report tracks M3 against its plan.' },
  { a: 'm3', b: 'r22', reason: 'Cites', text: 'R-22 is raised against the M3 milestone.' },
  { a: 'm3', b: 'coresys', reason: 'Shared content', text: 'CoreSys supplies the ledger M3 puts live.' },
  { a: 'm3', b: 'd114', reason: 'Cites', text: 'D-114 approved the plan M3 delivers.' },
  { a: 'm3', b: 'budget', reason: 'Shared content', text: 'The budget line funds M3.' },
  { a: 'r22', b: 'coresys', reason: 'Shared content', text: 'Vendor continuity is one of the 4 open risks.' },
  { a: 'd114', b: 'budget', reason: 'Same author', text: 'Both from the Finance office.' },
  { a: 'report', b: 'r22', reason: 'Conflict', text: 'The programme report says M3 is on track; the risk register rates the same milestone high risk with 4 open risks. The two were updated 4 days apart.' },
]

// Scripted AI: one suggested neighbor.
export const suggestion: QNode & { link: QLink } = {
  id: 'training', title: 'Training plan', domain: 'Strategy execution', x: 165, y: 330,
  notes: [{ text: 'Regional training is scheduled for November, one month before the readiness review.', source: 'Training log' }],
  link: { a: 'm3', b: 'training', reason: 'Shared content', text: 'AI: M3 depends on regional training finishing first. No source confirms the dates are fixed.' },
}

// Free spots for nodes added from the chooser. ponytail: fixed slots, then a ring; a force layout if Queries grow big.
const slots = [[200, 45], [45, 190], [365, 140], [365, 310], [130, 30], [270, 25]]
const slot = (i: number) => slots[i] ?? [200 + 170 * Math.cos(i), 185 + 160 * Math.sin(i)]

const docs = documents as Doc[]
const byId = new Map(docs.map(d => [d.id, d]))
const linkKey = (l: QLink) => `${l.a}|${l.b}`
const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'

export function QueryGraph({ nodes, links, onAdd, suggestionState, onSuggestion }: {
  nodes: QNode[]; links: QLink[]; onAdd: (nodes: QNode[], links: QLink[]) => void
  suggestionState: 'open' | 'accepted' | 'rejected'; onSuggestion: (s: 'open' | 'accepted' | 'rejected') => void
}) {
  const [picked, setPicked] = useState<string>('m3')
  const [hover, setHover] = useState<string | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [open, setOpen] = useState(true)
  const at = new Map(nodes.map(n => [n.id, n]))
  const showSuggestion = suggestionState === 'open'
  if (showSuggestion) at.set(suggestion.id, suggestion)

  const pickedNode = at.get(picked)
  const pickedLink = [...links, ...(showSuggestion ? [suggestion.link] : [])].find(l => linkKey(l) === picked)
  const deg = (id: string) => links.filter(l => l.a === id || l.b === id).length

  const add = (ids: string[]) => {
    const fresh = ids.filter(id => !at.has(id))
    const added = fresh.map((id, i) => {
      const doc = byId.get(id)!, [x, y] = slot(nodes.length - startNodes.length + i)
      return { id, title: doc.title, domain: doc.primaryDomain, x, y, notes: doc.insights.map(ins => ({ text: ins.text, source: `${doc.title} ${ins.pageRef}` })) }
    })
    onAdd(added, added.map(n => ({ a: 'm3', b: n.id, reason: 'Shared content', text: `Added from the vault. ${n.title} and M3 go-live share content.` })))
    setChoosing(false)
    if (added[0]) setPicked(added[0].id)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-1.5" aria-expanded={open} onClick={() => setOpen(!open)}>
          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className={label}>Query graph</span>
          {!open && <span className="text-xs text-muted-foreground">· {nodes.length} nodes · {links.length} links</span>}
        </button>
        <Button variant="outline" size="sm" onClick={() => setChoosing(true)}><Plus size={14} />Add</Button>
      </div>

      {open && <>
      <div className="relative h-[400px] overflow-hidden rounded-xl border border-border bg-stage">
        <svg viewBox="0 0 400 360" className="absolute inset-0 h-full w-full select-none">
          {[...links, ...(showSuggestion ? [suggestion.link] : [])].map(l => {
            const s = at.get(l.a)!, t = at.get(l.b)!, key = linkKey(l)
            const on = picked === key || hover === key, conflict = l.reason === 'Conflict', ai = l === suggestion.link
            return <g key={key} className="cursor-pointer" onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)} onClick={() => setPicked(key)}>
              <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth={14} />
              <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} className={on || conflict || ai ? (ai ? 'ai-glow' : undefined) : 'graph-link'} vectorEffect="non-scaling-stroke"
                stroke={ai ? '#8338EC' : conflict ? 'var(--status-near)' : on ? 'var(--foreground)' : undefined}
                strokeWidth={on ? 2.5 : conflict ? 1.75 : ai ? 1.25 : undefined} strokeDasharray={conflict ? '5 4' : ai ? '3 3' : undefined} />
            </g>
          })}
          {[...at.values()].map(n => {
            const ai = showSuggestion && n.id === suggestion.id, color = domainColor(n.domain), on = picked === n.id || hover === n.id
            const r = ai ? 6 : 4.5 * Math.sqrt(1 + deg(n.id) * 0.9)
            return <g key={n.id} transform={`translate(${n.x} ${n.y})`} className="cursor-pointer"
              onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)} onClick={() => setPicked(n.id)}>
              <circle r={r + 10} fill="transparent" />
              {ai && <motion.rect x={-r - 5} y={-r - 5} width={(r + 5) * 2} height={(r + 5) * 2} rx="2" transform="rotate(45)" fill="none" stroke="#8338EC" strokeWidth={1.5} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" className="ai-glow" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />}
              {picked === n.id && <rect className="picked-ring" style={{ stroke: color }} x={-r - 3} y={-r - 3} width={(r + 3) * 2} height={(r + 3) * 2} rx="2" transform="rotate(45)" />}
              <rect className="node-diamond" x={-r} y={-r} width={r * 2} height={r * 2} rx="2" transform="rotate(45)"
                style={{ fill: on ? `url(#qg-${n.id})` : ai ? 'var(--muted)' : color, stroke: on ? color : 'var(--surface)' }} />
              <defs><linearGradient id={`qg-${n.id}`}><stop offset="0%" style={{ stopColor: 'var(--muted)' }} /><stop offset="50%" style={{ stopColor: `color-mix(in oklch, ${color} 45%, white)` }} /><stop offset="100%" style={{ stopColor: color }} /></linearGradient></defs>
              <text className="node-label" y={r * 1.42 + 12} textAnchor="middle" fontSize={10} style={picked === n.id ? { fill: 'var(--foreground)' } : ai ? { fill: '#8338EC' } : undefined}>
                {ai ? `Suggested: ${n.title}` : n.title}
                {!ai && <tspan dx={4} fontSize={8} style={{ fill: 'var(--muted-foreground)' }}>{n.notes.length}</tspan>}
              </text>
            </g>
          })}
        </svg>
        <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] text-muted-foreground shadow-soft">
          <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="var(--status-near)" strokeWidth="1.75" strokeDasharray="5 4" /></svg>Dashed = conflict
        </span>
        <span className="pointer-events-none absolute right-3 bottom-3 font-mono text-[10px] text-muted-foreground">{nodes.length} nodes · {links.length} links</span>
      </div>

      {/* Details for the picked node or link. */}
      {pickedNode && <NodeDetails node={pickedNode} ai={showSuggestion && pickedNode.id === suggestion.id} onSuggestion={onSuggestion} />}
      {pickedLink && <LinkDetails link={pickedLink} title={id => at.get(id)?.title ?? ''} />}
      {!pickedNode && !pickedLink && <p className="text-sm text-muted-foreground">Click a node or a link to see its details.</p>}
      {suggestionState !== 'open' && <button className="self-start text-xs text-muted-foreground underline" onClick={() => { onSuggestion('open'); setPicked(suggestion.id) }}>Training plan {suggestionState} · undo</button>}
      </>}

      <NewQueryDialog open={choosing} onOpenChange={setChoosing} onCreate={() => {}} onAdd={add} />
    </div>
  )
}

function NodeDetails({ node, ai, onSuggestion }: { node: QNode; ai: boolean; onSuggestion: (s: 'accepted' | 'rejected') => void }) {
  const color = domainColor(node.domain)
  return (
    <div className={`flex flex-col gap-2 rounded-xl p-3 ${ai ? 'ai-edge [--ai-fill:color-mix(in_oklch,var(--card)_94%,#8338EC)]' : 'border border-border/60'}`}>
      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rotate-45 rounded-[2px]" style={{ background: domainGradient(color), border: `1px solid ${color}` }} />
        <span className="font-heading text-base font-semibold">{node.title}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{ai ? <span className="flex items-center gap-1 text-[#8338EC]"><Sparkles size={11} className="ai-glow" />Suggested by AI</span> : node.domain}</span>
      </div>
      <span className={`flex items-center gap-1.5 ${label}`}><StickyNote size={11} />{node.notes.length} {node.notes.length === 1 ? 'note' : 'notes'} · insights from the document</span>
      {node.notes.map(n => (
        <div key={n.text} className="flex flex-col gap-1 rounded-lg bg-muted/50 px-2.5 py-2">
          <p className="text-sm leading-snug">{n.text}</p>
          <span className="inline-flex items-center gap-1 self-start rounded-full border border-border/80 bg-card px-2 py-0.5 font-mono text-[10px]">{n.source}<ArrowUpRight size={10} /></span>
        </div>
      ))}
      {ai && <div className="flex gap-2">
        <Button size="sm" onClick={() => onSuggestion('accepted')}><Check size={14} />Accept</Button>
        <Button size="sm" variant="outline" onClick={() => onSuggestion('rejected')}><X size={14} />Reject</Button>
      </div>}
    </div>
  )
}

function LinkDetails({ link, title }: { link: QLink; title: (id: string) => string }) {
  const conflict = link.reason === 'Conflict'
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl p-3 ${conflict ? 'bg-status-near/10 ring-1 ring-status-near/30' : 'border border-border/60'}`}>
      <span className={`flex items-center gap-1.5 ${label}`}>{conflict && <span className="size-1.5 rounded-full bg-status-near" />}Link · {link.reason}</span>
      <span className="font-heading text-base font-semibold">{title(link.a)} ↔ {title(link.b)}</span>
      <p className="text-sm leading-relaxed">{link.text}</p>
    </div>
  )
}
