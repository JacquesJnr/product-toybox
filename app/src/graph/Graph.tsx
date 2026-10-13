import { useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import type { Doc } from '../types'
import { arrivalStage, buildSimulation, tick, zoomAt } from './simulation'
import type { SimNode } from './simulation'
import './graph.css'

interface GraphProps {
  docs: Doc[]
  visibleIds: ReadonlySet<string>
  selectedId: string | null
  onSelect: (id: string | null) => void
  active: boolean
  animateRun: number
}

export function Graph({ docs, visibleIds, selectedId, onSelect, active, animateRun }: GraphProps) {
  const sim = useMemo(() => buildSimulation(docs), [docs])
  const svg = useRef<SVGSVGElement>(null)
  const clock = useRef({ arrival: 0, animate: Infinity })
  const [stage, setStage] = useState<ReturnType<typeof arrivalStage>>('waiting')
  const [linkCount, setLinkCount] = useState(Infinity)
  const nodeElements = useRef(new Map<string, SVGGElement>())
  const linkElements = useRef(new Map<string, SVGLineElement>())
  const [cam, setCam] = useState({ x: 0, y: 0, k: 2.5 })
  const [size, setSize] = useState({ width: 1000, height: 760 })
  const [hover, setHover] = useState<string | null>(null)
  const drag = useRef<{ node: SimNode | null; x: number; y: number; camX: number; camY: number; moved: boolean } | null>(null)
  const visible = useMemo(() => sim.nodes.filter(n => visibleIds.has(n.id)), [sim, visibleIds])
  const nodes = sim.nodes.filter(n => visibleIds.has(n.id) && (n.id !== 'liquidity-review' || stage !== 'waiting'))
  const links = sim.links.filter(l => visibleIds.has(l.source) && visibleIds.has(l.target))
    .filter(l => (l.source !== 'liquidity-review' && l.target !== 'liquidity-review') || stage === 'sorting' || stage === 'settled')
    .slice(0, linkCount)
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
  }, [sim, size, stage])

  useEffect(() => { sim.alpha = Math.max(sim.alpha, 0.4) }, [sim, visibleIds])
  useEffect(() => {
    if (animateRun) { clock.current.animate = 0; setLinkCount(0); sim.alpha = Math.max(sim.alpha, 0.6) }
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
      const forceNodes = visible.filter(n => n.id !== 'liquidity-review' || current === 'sorting' || current === 'settled')
      const forceIds = new Set(forceNodes.map(n => n.id))
      const count = Math.floor(clock.current.animate / 100)
      if (count !== drawnLinks) { drawnLinks = count; setLinkCount(count) }
      if (count >= sim.links.length) clock.current.animate = Infinity
      const forceLinks = sim.links.filter(l => forceIds.has(l.source) && forceIds.has(l.target)).slice(0, count)
      const interval = sim.alpha > 0.05 || sim.alphaTarget > 0 ? 1000 / 30 : 100
      if (now - lastTick >= interval || before !== current) {
        const start = performance.now()
        tick(sim, forceNodes, forceLinks, now)
        svg.current!.dataset.frameGapMs = (now - lastTick).toFixed(1)
        svg.current!.dataset.arrivalElapsed = clock.current.arrival.toFixed(0)
        lastTick = now
        for (const n of sim.nodes) nodeElements.current.get(n.id)?.setAttribute('transform', `translate(${n.x} ${n.y})`)
        for (const l of sim.links) {
          const element = linkElements.current.get(`${l.source}|${l.target}`)
          if (!element) continue
          const source = sim.byId.get(l.source)!, target = sim.byId.get(l.target)!
          element.setAttribute('x1', String(source.x)); element.setAttribute('y1', String(source.y))
          element.setAttribute('x2', String(target.x)); element.setAttribute('y2', String(target.y))
        }
        svg.current!.dataset.tickMs = (performance.now() - start).toFixed(3)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [active, sim, visible])

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
            const sorting = stage === 'sorting' && (s.id === 'liquidity-review' || t.id === 'liquidity-review')
            const empty = s.id === 'employment-contracts' || t.id === 'employment-contracts'
            return <line key={`${s.id}|${t.id}`} ref={element => { const key = `${s.id}|${t.id}`; if (element) linkElements.current.set(key, element); else linkElements.current.delete(key) }} data-link={`${s.id}|${t.id}`} className={`graph-link ${sorting ? 'sorting-link' : ''}`}
              x1={s.x} y1={s.y} x2={t.x} y2={t.y} strokeDasharray={sorting || empty ? `${4 / cam.k} ${4 / cam.k}` : undefined}
              opacity={hover && s.id !== hover && t.id !== hover ? 0.15 : 1} />
          })}
            {nodes.map(n => {
              const doc = docs[n.i]
              const r = 3.2 * Math.sqrt(1 + n.deg * 1.4) / cam.k
              const state = n.id === 'employment-contracts' ? 'empty' : n.id === 'liquidity-review' && stage === 'sorting' ? 'sorting' : n.deg === 0 ? 'orphan' : 'linked'
              const labelLeft = n.x < -20
              return <g key={n.id} ref={element => { if (element) nodeElements.current.set(n.id, element); else nodeElements.current.delete(n.id) }} transform={`translate(${n.x} ${n.y})`} opacity={hover && !neighbours.has(n.id) ? 0.15 : 1}>
                  <g role="button" tabIndex={0} className="graph-node" aria-label={doc.title}
                    data-document-id={n.id} data-state={state} aria-pressed={selectedId === n.id}
                    onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}>
                    <circle r={Math.max(r + 3, 12 / cam.k)} fill="transparent" />
                    {selectedId === n.id && <rect className="picked-ring" x={-r - 3} y={-r - 3} width={(r + 3) * 2} height={(r + 3) * 2} rx="2" transform="rotate(45)" />}
                    <rect className={`node-diamond node-${state}`} x={-r} y={-r} width={r * 2} height={r * 2} rx="2" transform="rotate(45)"
                      strokeDasharray={state === 'empty' || state === 'sorting' ? `${3 / cam.k} ${3 / cam.k}` : undefined} />
                    <text className="node-label" x={(labelLeft ? -1 : 1) * (r * 1.42 + 8 / cam.k)} y={4 / cam.k} textAnchor={labelLeft ? 'end' : 'start'} fontSize={12 / cam.k}>{doc.title}</text>
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
