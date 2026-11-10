import { useId, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { domainColor } from '../components/domain-drawer'
import { buildSimulation, tick } from '../graph/simulation'
import type { Doc } from '../types'
import type { LinkId } from '../stages/contracts'
import '../graph/graph.css'

export interface QueryGraphProps {
  documents: Doc[]
  linkIds: readonly LinkId[]
  selectedIds?: readonly string[]
  search?: string
  onNode(id: string): void
  onLink(id: LinkId): void
}

export function QueryGraph({ documents, linkIds, selectedIds = [], search = '', onNode, onLink }: QueryGraphProps) {
  const [open, setOpen] = useState(true)
  const [hover, setHover] = useState<string | null>(null)
  const gradientId = useId()
  const layout = useMemo(() => {
    const ids = new Set(documents.map(doc => doc.id))
    const graphDocs = documents.map(doc => ({ ...doc, links: doc.links.filter(link => ids.has(link.targetId) && linkIds.includes(`${doc.id}->${link.targetId}`)) }))
    const sim = buildSimulation(graphDocs)
    for (let i = 0; i < 600; i++) tick(sim, sim.nodes, sim.links, i * 16)
    const xs = sim.nodes.map(node => node.x), ys = sim.nodes.map(node => node.y)
    const x = Math.min(0, ...xs) - 65, y = Math.min(0, ...ys) - 45
    return { ...sim, x, y, w: Math.max(0, ...xs) - x + 65, h: Math.max(0, ...ys) - y + 45 }
  }, [documents, linkIds])
  const k = Math.max(layout.w / 680, layout.h / 400)
  const q = search.trim().toLowerCase()
  const matches = (doc: Doc) => !q || [doc.title, doc.text, ...doc.insights.map(insight => insight.text)].some(text => text.toLowerCase().includes(q))
  const keyAction = (event: KeyboardEvent<SVGGElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action() }
  }
  const byId = new Map(documents.map(doc => [doc.id, doc]))
  return <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
    <button type="button" className="flex items-center gap-1.5 self-start" aria-expanded={open} onClick={() => setOpen(!open)}>
      <ChevronDown size={14} className={open ? '' : '-rotate-90'} />
      <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Query graph · {documents.length} nodes · {linkIds.length} links</span>
    </button>
    {open && <div className="relative h-[400px] overflow-hidden rounded-xl border border-border bg-stage">
      <svg aria-label="Query documents and supplied relationships" viewBox={`${layout.x} ${layout.y} ${layout.w} ${layout.h}`} className="h-full w-full select-none">
        {linkIds.map(id => {
          const [sourceId, targetId] = id.split('->')
          const source = layout.byId.get(sourceId), target = layout.byId.get(targetId)
          const sourceDoc = byId.get(sourceId), targetDoc = byId.get(targetId)
          if (!source || !target || !sourceDoc || !targetDoc || !sourceDoc.links.some(link => link.targetId === targetId)) return null
          const on = hover === id
          // Reciprocal fixture links get separate hit targets, so either direction can be inspected.
          const offset = linkIds.includes(`${targetId}->${sourceId}`) ? 3 * k : 0
          const length = Math.hypot(target.x - source.x, target.y - source.y) || 1
          const dx = -(target.y - source.y) / length * offset, dy = (target.x - source.x) / length * offset
          return <g key={id} role="button" tabIndex={0} aria-label={`${sourceDoc.title} → ${targetDoc.title}`} className="cursor-pointer focus:outline-none" onFocus={() => setHover(id)} onBlur={() => setHover(null)} onPointerEnter={() => setHover(id)} onPointerLeave={() => setHover(null)} onClick={() => onLink(id)} onKeyDown={event => keyAction(event, () => onLink(id))}>
            <title>{sourceDoc.title} → {targetDoc.title}</title>
            <line x1={source.x + dx} y1={source.y + dy} x2={target.x + dx} y2={target.y + dy} stroke="transparent" strokeWidth={5 * k} />
            <line x1={source.x + dx} y1={source.y + dy} x2={target.x + dx} y2={target.y + dy} className={on ? undefined : 'graph-link'} stroke={on ? 'var(--foreground)' : undefined} strokeWidth={on ? 2.5 : undefined} vectorEffect="non-scaling-stroke" />
          </g>
        })}
        {layout.nodes.map(node => {
          const doc = byId.get(node.id)!, color = domainColor(doc.primaryDomain)
          const picked = selectedIds.includes(node.id), on = picked || hover === node.id
          const r = Math.min(12, 4.5 * Math.sqrt(1 + node.deg * 0.9)) * k
          return <g key={node.id} role="button" tabIndex={0} aria-label={doc.title} aria-pressed={picked} transform={`translate(${node.x} ${node.y})`} className="cursor-pointer focus:outline-none" opacity={matches(doc) ? 1 : 0.18} onFocus={() => setHover(node.id)} onBlur={() => setHover(null)} onPointerEnter={() => setHover(node.id)} onPointerLeave={() => setHover(null)} onClick={() => onNode(node.id)} onKeyDown={event => keyAction(event, () => onNode(node.id))}>
            <title>{doc.title}</title><circle r={r + 10 * k} fill="transparent" />
            {on && <rect className="picked-ring" style={{ stroke: color }} x={-r - 3 * k} y={-r - 3 * k} width={(r + 3 * k) * 2} height={(r + 3 * k) * 2} rx="2" transform="rotate(45)" />}
            <defs><linearGradient id={`${gradientId}-${node.id}`}><stop offset="0%" stopColor="var(--muted)" /><stop offset="50%" stopColor={`color-mix(in oklch, ${color} 45%, white)`} /><stop offset="100%" stopColor={color} /></linearGradient></defs>
            <rect className="node-diamond" x={-r} y={-r} width={r * 2} height={r * 2} rx="2" transform="rotate(45)" style={{ fill: on ? `url(#${gradientId}-${node.id})` : color, stroke: on ? color : 'var(--surface)' }} />
            <text className="node-label" y={r * 1.42 + 12 * k} textAnchor="middle" fontSize={10 * k} style={on ? { fill: 'var(--foreground)' } : undefined}>{doc.title}</text>
          </g>
        })}
      </svg>
      {hover?.includes('->') && <span className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-border bg-card px-3 py-2 text-xs">{hover.split('->').map(id => byId.get(id)?.title ?? id).join(' → ')}</span>}
    </div>}
  </section>
}
