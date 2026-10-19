import { useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import type { FoundLink } from './found-links'
import type { Doc } from '../types'
import { arrivalStage, buildSimulation, linkShown, nodeShown, revealEnd, seed, tick, zoomAt } from './simulation'
import type { SimNode } from './simulation'
import './graph.css'
import './play-motion.css'

interface GraphProps {
  revealRun: number
  foundLinks: FoundLink[]
  docs: Doc[]
  visibleIds: ReadonlySet<string>
  selectedId: string | null
  onSelect: (id: string | null) => void
  active: boolean
  animateRun: number
}

export function Graph({ revealRun, foundLinks, docs, visibleIds, selectedId, onSelect, active, animateRun }: GraphProps) {
  const sim = useMemo(() => buildSimulation(docs), [docs])
  const allLinks = useMemo(() => [...sim.links, ...foundLinks.map(link => ({ ...link, reason: 'shared-content' as const }))], [sim, foundLinks])
  const foundKeys = new Set(foundLinks.map(link => `${link.source}|${link.target}`))
  const svg = useRef<SVGSVGElement>(null)
  const clock = useRef({ arrival: 0, animate: Infinity, spawned: new Set<string>() })
  const [stage, setStage] = useState<ReturnType<typeof arrivalStage>>('waiting')
  const [reveal, setReveal] = useState(Infinity)
  const nodeElements = useRef(new Map<string, SVGGElement>())
  const gradients = useRef(new Map<string, SVGLinearGradientElement>())
  const linkElements = useRef(new Map<string, SVGLineElement>())
  const [cam, setCam] = useState({ x: 0, y: 0, k: 2.5 })
  const [size, setSize] = useState({ width: 1000, height: 760 })
  const [hover, setHover] = useState<string | null>(null)
  const drag = useRef<{ node: SimNode | null; x: number; y: number; camX: number; camY: number; moved: boolean } | null>(null)
  const visible = useMemo(() => sim.nodes.filter(n => visibleIds.has(n.id)), [sim, visibleIds])
  const nodes = sim.nodes.filter(n => visibleIds.has(n.id) && (n.id !== 'liquidity-review' || stage !== 'waiting') && nodeShown(n, reveal))
  const links = allLinks.filter(l => visibleIds.has(l.source) && visibleIds.has(l.target))
    .filter(l => (l.source !== 'liquidity-review' && l.target !== 'liquidity-review') || stage === 'sorting' || stage === 'settled')
    .filter(l => linkShown(sim.byId.get(l.source)!, sim.byId.get(l.target)!, reveal))
  const nodePositions = new Map(nodes.map(n => [n.id, n]))
  const neighbours = new Set([hover])
  for (const l of links) {
    if (l.source === hover) neighbours.add(l.target)
    if (l.target === hover) neighbours.add(l.source)
  }

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize(previous => previous.width === width && previous.height === height ? previous : { width, height })
    })
    observer.observe(svg.current!.parentElement!)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const xs = sim.nodes.map(n => n.x), ys = sim.nodes.map(n => n.y)
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys)
    setCam({ x: (left + right) / 2, y: (top + bottom) / 2,
      k: Math.max(0.25, Math.min(2.5, (size.width - 280) / Math.max(1, right - left), (size.height - 100) / Math.max(1, bottom - top))) })
  }, [sim, size, stage, foundLinks, revealRun])

  useEffect(() => {
    for (const node of sim.nodes) node.deg = 0
    for (const link of allLinks) {
      sim.byId.get(link.source)!.deg++
      sim.byId.get(link.target)!.deg++
    }
    sim.alpha = Math.max(sim.alpha, 0.4)
    if (foundLinks.length) { clock.current.animate = Infinity; setReveal(Infinity) }
  }, [sim, allLinks, foundLinks, revealRun])

  useEffect(() => { sim.alpha = Math.max(sim.alpha, 0.4) }, [sim, visibleIds])
  useEffect(() => {
    if (animateRun) { clock.current.animate = 0; clock.current.spawned.clear(); setReveal(0); sim.alpha = Math.max(sim.alpha, 0.6) }
  }, [animateRun, sim])

  useEffect(() => {
    if (!active) return
    let frame = 0, last = performance.now(), lastTick = 0, drawnLinks = Infinity
    const loop = (now: number) => {
      const delta = Math.max(0, now - last)
      last = now
      const before = arrivalStage(clock.current.arrival)
      clock.current.arrival += delta
      clock.current.animate += delta
      const current = arrivalStage(clock.current.arrival)
      if (before !== current) {
        setStage(current)
        if (current === 'sorting') sim.alpha = Math.max(sim.alpha, 0.6)
        if (before === 'waiting') {
          const n = sim.byId.get('liquidity-review')!, neighbour = sim.byId.get('treasury-update')!
          n.x = neighbour.x + 65; n.y = neighbour.y + 35
        }
      }
      const elapsed = clock.current.animate
      const forceNodes = visible.filter(n => (n.id !== 'liquidity-review' || current === 'sorting' || current === 'settled') && nodeShown(n, elapsed))
      const forceIds = new Set(forceNodes.map(n => n.id))
      const forceLinks = allLinks.filter(l => forceIds.has(l.source) && forceIds.has(l.target) && linkShown(sim.byId.get(l.source)!, sim.byId.get(l.target)!, elapsed))
      // A node enters at its spiral seed as an orphan; its links pull it into place once they appear.
      if (elapsed !== Infinity) for (const n of forceNodes) if (!clock.current.spawned.has(n.id)) {
        clock.current.spawned.add(n.id)
        Object.assign(n, seed(n.i), { vx: 0, vy: 0 })
      }
      const shown = forceNodes.length * 1000 + forceLinks.length
      if (shown !== drawnLinks) { drawnLinks = shown; setReveal(elapsed) }
      if (elapsed >= revealEnd(sim.nodes.length)) { clock.current.animate = Infinity; setReveal(Infinity) }
      // Tick on every frame, as the physics steps once per tick.
      {
        const start = performance.now()
        tick(sim, forceNodes, forceLinks, now)
        svg.current!.dataset.frameGapMs = (now - lastTick).toFixed(1)
        svg.current!.dataset.arrivalElapsed = clock.current.arrival.toFixed(0)
        lastTick = now
        for (const n of sim.nodes) nodeElements.current.get(n.id)?.setAttribute('transform', `translate(${n.x} ${n.y})`)
        for (const l of allLinks) {
          const element = linkElements.current.get(`${l.source}|${l.target}`)
          if (!element) continue
          const source = sim.byId.get(l.source)!, target = sim.byId.get(l.target)!
          element.setAttribute('x1', String(source.x)); element.setAttribute('y1', String(source.y))
          element.setAttribute('x2', String(target.x)); element.setAttribute('y2', String(target.y))
          const gradient = gradients.current.get(`${l.source}|${l.target}`)
          if (gradient) {
            gradient.setAttribute('x1', String(source.x)); gradient.setAttribute('y1', String(source.y))
            gradient.setAttribute('x2', String(target.x)); gradient.setAttribute('y2', String(target.y))
          }
        }
        svg.current!.dataset.tickMs = (performance.now() - start).toFixed(3)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [active, sim, visible, allLinks, cam.k])

  useEffect(() => {
    const element = svg.current!
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = element.getBoundingClientRect()
      setCam(previous => zoomAt(previous, event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2, event.deltaY))
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [])

  const release = () => {
    if (drag.current?.node) { drag.current.node.fx = drag.current.node.fy = null }
    drag.current = null
    sim.alphaTarget = 0
  }

  return (
    <div className="graph-field" hidden={!active}>
      <svg ref={svg} className="graph-svg" aria-label="Document graph" data-arrival-stage={stage}
        viewBox={`0 0 ${size.width} ${size.height}`} onKeyDownCapture={event => {
          if (event.key === 'Escape') onSelect(null)
          const target = (event.target as Element).closest('[data-document-id]')
          if (target && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault(); onSelect(target.getAttribute('data-document-id'))
          }
        }}
        onPointerDown={event => {
          if (event.button !== 0) return
          const target = (event.target as Element).closest('[data-document-id]')
          const node = target ? sim.byId.get(target.getAttribute('data-document-id')!)! : null
          drag.current = { node, x: event.clientX, y: event.clientY, camX: cam.x, camY: cam.y, moved: false }
          if (node) { node.fx = node.x; node.fy = node.y; sim.alphaTarget = 0.3; sim.alpha = Math.max(sim.alpha, 0.3) }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => {
          const d = drag.current
          if (!d) return
          if (Math.hypot(event.clientX - d.x, event.clientY - d.y) > 3) d.moved = true
          if (d.node) {
            const rect = event.currentTarget.getBoundingClientRect()
            d.node.fx = (event.clientX - rect.left - rect.width / 2) / cam.k + cam.x
            d.node.fy = (event.clientY - rect.top - rect.height / 2) / cam.k + cam.y
          } else setCam({ ...cam, x: d.camX - (event.clientX - d.x) / cam.k, y: d.camY - (event.clientY - d.y) / cam.k })
        }}
        onPointerUp={event => {
          const d = drag.current
          if (d && !d.moved) onSelect(d.node?.id ?? null)
          release()
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={release} onLostPointerCapture={release}>
        <g transform={`translate(${size.width / 2} ${size.height / 2}) scale(${cam.k}) translate(${-cam.x} ${-cam.y})`}>
          {links.map(l => {
            const s = nodePositions.get(l.source), t = nodePositions.get(l.target)
            if (!s || !t) return null
            const found = foundKeys.has(`${s.id}|${t.id}`)
            const sorting = stage === 'sorting' && (s.id === 'liquidity-review' || t.id === 'liquidity-review')
            const empty = s.id === 'employment-contracts' || t.id === 'employment-contracts'
            const key = `${s.id}|${t.id}`
            const gradientId = `graph-found-${s.id}-${t.id}`
            return <g key={key}>
              {found && <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse"
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                ref={element => { if (element) gradients.current.set(key, element); else gradients.current.delete(key) }}>
                {['#3A86FF', '#8338EC', '#FF006E', '#FB5607', '#FFBE0B'].map((color, index) =>
                  <stop key={color} offset={`${index * 25}%`} stopColor={color} />)}
              </linearGradient></defs>}
              <line ref={element => { const key = `${s.id}|${t.id}`; if (element) linkElements.current.set(key, element); else linkElements.current.delete(key) }} data-link={`${s.id}|${t.id}`} className={`graph-link ${found ? 'found-link' : sorting ? 'sorting-link' : ''}`}
              data-found-link={found || undefined} style={found ? { stroke: `url(#${gradientId})` } : undefined}
              x1={s.x} y1={s.y} x2={t.x} y2={t.y} strokeDasharray={sorting || empty ? `${4 / cam.k} ${4 / cam.k}` : undefined}
              opacity={hover && s.id !== hover && t.id !== hover ? 0.15 : 1} />
            </g>
          })}
            {nodes.map(n => {
              const doc = docs[n.i]
              const degree = allLinks.filter(link => link.source === n.id || link.target === n.id).length
              const r = 3.2 * Math.sqrt(1 + degree * 1.4) / cam.k
              const state = n.id === 'employment-contracts' ? 'empty' : n.id === 'liquidity-review' && stage === 'sorting' ? 'sorting' : degree === 0 ? 'orphan' : 'linked'
              return <g key={n.id} ref={element => { if (element) nodeElements.current.set(n.id, element); else nodeElements.current.delete(n.id) }} transform={`translate(${n.x} ${n.y})`} opacity={hover && !neighbours.has(n.id) ? 0.15 : 1}>
                  <g role="button" tabIndex={0} className="graph-node" aria-label={doc.title}
                    data-document-id={n.id} data-state={state} aria-pressed={selectedId === n.id}
                    onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}>
                    <circle r={Math.max(r + 3, 12 / cam.k)} fill="transparent" />
                    {selectedId === n.id && <rect className="picked-ring" x={-r - 3} y={-r - 3} width={(r + 3) * 2} height={(r + 3) * 2} rx="2" transform="rotate(45)" />}
                    <rect className={`node-diamond node-${state}`} x={-r} y={-r} width={r * 2} height={r * 2} rx="2" transform="rotate(45)"
                      strokeDasharray={state === 'empty' || state === 'sorting' ? `${3 / cam.k} ${3 / cam.k}` : undefined} />
                    {/* The label sits centered under its node and never moves relative to it. */}
                    <text className="node-label" x={0} y={r * 1.42 + 14 / cam.k} textAnchor="middle" fontSize={12 / cam.k}>{doc.title}</text>
                    {state === 'sorting' && <text className="sorting-caption" y={(r * 1.5) + 14 / cam.k} textAnchor="middle" fontSize={12 / cam.k}>sorting…</text>}
                  </g>
              </g>
            })}
        </g>
      </svg>
      {hover && nodePositions.has(hover) && <Tooltip.Root open>
        <Tooltip.Trigger render={<span />} tabIndex={-1} aria-hidden="true" className="graph-tooltip-anchor"
          style={{ left: size.width / 2 + (nodePositions.get(hover)!.x - cam.x) * cam.k, top: size.height / 2 + (nodePositions.get(hover)!.y - cam.y) * cam.k }} />
        <Tooltip.Portal><Tooltip.Positioner sideOffset={12}><Tooltip.Popup className="graph-tooltip">{docs.find(d => d.id === hover)!.title}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
      </Tooltip.Root>}
      <span className="graph-caption">Graph view · {nodes.length} documents</span>
    </div>
  )
}
