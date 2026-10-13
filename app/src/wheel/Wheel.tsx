import { useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import type { Doc, Domain, WheelRecord } from '../types'
import { nodeRadius, point, rings, topicsFor } from './geometry'
import './wheel.css'

const domainColors: Record<Domain, string> = {
  'Strategic direction': 'var(--domain-strategic-direction)',
  'Strategy execution': 'var(--domain-strategy-execution)',
  'Financial stewardship': 'var(--domain-financial-stewardship)',
  'Risk and resilience': 'var(--domain-risk-resilience)',
  'Controls and assurance': 'var(--domain-controls-assurance)',
  'Major decisions': 'var(--domain-major-decisions)',
  Remuneration: 'var(--domain-remuneration)',
}

export function Wheel({ records, docs, domain, pickedKey, onPick }: {
  records: WheelRecord[]
  docs: Doc[]
  domain: Domain | null
  pickedKey: string | null
  onPick(key: string): void
}) {
  const topics = topicsFor(domain)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const nodes = topics.flatMap(({ topic }, index) => {
    const matching = records.filter(record => record.topic === topic && docs.some(doc => doc.id === record.documentId))
    return matching.map((record, offset) => {
      // Keep records on the same spoke individually selectable when their scores coincide.
      const angle = -72 + index * 360 / topics.length + (offset - (matching.length - 1) / 2) * 5
      return { record, key: `${record.documentId}|${record.topic}`, ...point(angle, nodeRadius(record)) }
    })
  })
  const hovered = nodes.find(node => node.key === hoveredKey)

  return (
    <section className="wheel" aria-label={domain ? `${domain} risk wheel` : 'Whole risk wheel'}>
      <div className="wheel-drawing">
        <svg className="wheel-svg" viewBox="-64 -64 808 808" aria-label="Risk topics and documents">
          <g aria-hidden="true" className="wheel-spokes">
            {topics.map(({ topic }, index) => {
              const end = point(-72 + index * 360 / topics.length, 248)
              return <line key={topic} x1="340" y1="340" x2={end.x} y2={end.y} />
            })}
          </g>
          <g aria-hidden="true" fill="none">
            {rings.map(ring => <circle key={ring.rung} cx="340" cy="340" r={ring.radius} stroke={ring.color} strokeWidth="1.5" />)}
            <circle cx="340" cy="340" r="248" stroke="var(--glass-45)" strokeWidth="1" strokeDasharray="3 3" />
          </g>
          {topics.map(({ topic, domain: topicDomain }, index) => {
            const angle = -72 + index * 360 / topics.length
            const end = point(angle, 256)
            const left = Math.cos(angle * Math.PI / 180) < 0
            return <text key={topic} className="wheel-topic" x={end.x} y={end.y}
              fill={domainColors[topicDomain]} textAnchor={left ? 'end' : 'start'} dominantBaseline="middle"
              transform={`rotate(${angle + (left ? 180 : 0)} ${end.x} ${end.y})`}>{topic}</text>
          })}
          {nodes.map(({ record, key, x, y }) => {
            const doc = docs.find(item => item.id === record.documentId)!
            const picked = key === pickedKey
            return <g key={key} className="wheel-node" transform={`translate(${x} ${y})`}
              role="button" tabIndex={0} aria-pressed={picked}
              aria-label={`${doc.title} · ${record.topic} · ${record.rung} · score ${record.riskScore} against appetite ${record.appetite}`}
              onClick={() => onPick(key)} onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPick(key) }
              }} onPointerEnter={() => setHoveredKey(key)} onPointerLeave={() => setHoveredKey(null)}
              onFocus={() => setHoveredKey(key)} onBlur={() => setHoveredKey(null)}>
              <circle className="wheel-hit" r="12" />
              {picked && <rect className="wheel-picked" x="-8" y="-8" width="16" height="16" rx="2" transform="rotate(45)" />}
              <rect className="wheel-diamond" x="-4" y="-4" width="8" height="8" rx="2" transform="rotate(45)" />
              <circle className="wheel-focus" r="13" />
            </g>
          })}
        </svg>
        {hovered && <Tooltip.Root open>
          <Tooltip.Trigger render={<span />} tabIndex={-1} aria-hidden="true" className="wheel-tooltip-anchor"
            style={{ left: `${(hovered.x + 64) / 808 * 100}%`, top: `${(hovered.y + 64) / 808 * 100}%` }} />
          <Tooltip.Portal><Tooltip.Positioner sideOffset={12}><Tooltip.Popup className="wheel-tooltip">
            {docs.find(doc => doc.id === hovered.record.documentId)!.title} · {hovered.record.topic}
          </Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
        </Tooltip.Root>}
      </div>
      <div className="wheel-legend" aria-label="Risk rungs">
        {rings.map(ring => <span key={ring.rung}><i aria-hidden="true" style={{ borderColor: ring.color }} />{ring.rung}</span>)}
      </div>
      <p className="wheel-caption">Spokes are topics, labelled in their domain’s hue. Distance from the hub is risk against the risk appetite: three rungs, green, amber, red. The outer dashed ring only carries the labels.</p>
    </section>
  )
}
