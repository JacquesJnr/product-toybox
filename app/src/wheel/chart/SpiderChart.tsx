import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { findTopic, isProjection, pointsAt, statusOf, stopName, topicsOf, worstTopic } from '../model'
import type { Point, Status, WheelActions, WheelState } from '../model'
import type { WheelDomain } from '../../types'
import { C, H, R, W, ang, hexPoints, hexR, labelSize, opposite, rad, slotOf, xy } from './geometry'
import type { Slot } from './geometry'
import './spider-chart.css'

// The settled Wheel hues equal these toybox tokens.
const HUE: Record<WheelDomain, string> = {
  Finance: 'var(--domain-financial-stewardship)',
  Risk: 'var(--domain-risk-resilience)',
  Audit: 'var(--domain-controls-assurance)',
  Remuneration: 'var(--domain-remuneration)',
  Legal: 'var(--domain-major-decisions)',
  Compliance: 'var(--domain-strategic-direction)',
}
const LABEL: Record<Status, string> = { within: 'Within threshold', near: 'Near threshold', over: 'Over threshold' }
const pct = (r: number) => `${Math.round(r * 100)}%`

// Place an HTML box beside a point (x, y) in a slot, d px from the point.
function beside(slot: Slot, x: number, y: number, d: number): CSSProperties {
  if (slot === 'top') return { left: x, top: y - d, transform: 'translate(-50%, -50%)' }
  if (slot === 'bottom') return { left: x, top: y + d, transform: 'translate(-50%, -50%)' }
  if (slot === 'right') return { left: x + 16, top: y, transform: 'translate(0, -50%)' }
  return { left: x - 16, top: y, transform: 'translate(-100%, -50%)' }
}

// Domain and topic labels sit further out from the rim; gaps measured from frames 01 and 03.
function rimLabel(a: number, whole: boolean): CSSProperties {
  const cos = Math.cos(a), sin = Math.sin(a), upright = Math.abs(cos) < 0.2
  const gap = whole ? (upright ? 43 : 70) : (upright ? 52 : 40)
  const p = xy(a, R)
  const tx = upright ? '-50%' : cos > 0 ? '0' : '-100%'
  const ty = sin < -0.2 ? '-100%' : sin > 0.2 ? '0' : '-50%'
  return { left: p.x + cos * gap, top: p.y + sin * gap, transform: `translate(${tx}, ${ty})` }
}

// What sets a reading: the worst topic for a domain, the AI reading's source for a topic.
function tagFor(p: Point, whole: boolean, stop: number) {
  if (whole) return worstTopic(p.domain, stop).topic
  return findTopic(p.name)?.aiReading?.source.split(',')[0] ?? ''
}

function Tooltip({ id, p, r, whole, x, y }: { id: string; p: Point; r: number; whole: boolean; x: number; y: number }) {
  const s = statusOf(r)
  const record = whole ? undefined : findTopic(p.name)
  const source = record?.aiReading?.source.split(',')[0]
  const kris = record?.kris?.length ?? 0
  const many = whole ? `${topicsOf(p.domain).length} topics` : kris > 1 ? `${kris} KRIs` : ''
  const flip = x + 24 + 340 > W // the one-line status row makes the tooltip about 330 px wide
  return (
    <div id={id} className="spider-tip" role="tooltip" style={flip ? { right: W - x + 24, top: y } : { left: x + 24, top: y }}>
      <div className="spider-tip-name">{whole ? p.name : source ?? p.name}</div>
      <div className="spider-tip-sub">{whole ? 'Domain' : source ? `${p.name} · ${p.domain}` : p.domain}</div>
      <div className="spider-tip-row">
        <span className={`spider-rung ${s}`} />
        <span>{LABEL[s]}</span>
        <span className="spider-tip-score">score {pct(r)} · threshold 100%</span>
      </div>
      {many && <div className="spider-tip-sub">Worst of {many}. Pick to see all.</div>}
    </div>
  )
}

// Lane C: the spider chart, rings, over zone, points and states, % labels, over tags, center badge.
export function SpiderChart({ state, actions }: { state: WheelState; actions: WheelActions }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const tipId = useId()
  const whole = !state.domain
  const points = pointsAt(state.domain, state.t)
  const n = points.length
  // Text follows the nearest stop; geometry follows continuous time.
  const stop = Math.round(state.t)
  // The projection look follows the displayed stop, like the badge, so History paging into a projection slide gets it too.
  const proj = isProjection(stop)
  const name = stopName(stop)
  const badge = proj ? `${name} (AI)` : name === 'Last board' ? 'Last Board' : name
  const placed = points.map((p, i) => ({ p, a: ang(i, n), ...xy(ang(i, n), rad(p.ratio)) }))
  const ringAngle = Math.PI / 2 - Math.PI / n
  const hot = placed.find(q => q.p.name === hovered)
  const atStop = new Map(pointsAt(state.domain, stop).map(q => [q.name, q.ratio]))

  return (
    <div className={`spider-chart${whole ? ' whole' : ''}${proj ? ' proj' : ''}`}>
      <svg className="spider-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id="spider-rainbow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3A86FF" />
            <stop offset="0.25" stopColor="#8338EC" />
            <stop offset="0.5" stopColor="#FF006E" />
            <stop offset="0.75" stopColor="#FB5607" />
            <stop offset="1" stopColor="#FFBE0B" />
          </linearGradient>
        </defs>
        <polygon className="spider-overzone" points={hexPoints(R)} />
        <polygon className="spider-inside" points={hexPoints(rad(1))} />
        <polygon className="spider-ring" points={hexPoints(rad(0.5))} />
        <polygon className="spider-ring" points={hexPoints(R)} />
        <polygon className="spider-ring near" points={hexPoints(rad(0.8))} />
        {placed.map(({ a }, i) => { const e = xy(a, R); return <line key={i} className="spider-spoke" x1={C.x} y1={C.y} x2={e.x} y2={e.y} /> })}
        <polygon className="spider-threshold" points={hexPoints(rad(1))} />
        <polygon className="spider-reading" points={placed.map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} />
      </svg>

      {[0.5, 1, 1.5].map(v => {
        const h = rad(v) * hexR(ringAngle)
        return (
          <span key={v} className="spider-ring-label" style={{ left: C.x + h * Math.cos(ringAngle) + 4, top: C.y + h * Math.sin(ringAngle) + 2 }}>
            {v === 1.5 ? '150%+' : pct(v)}
          </span>
        )
      })}

      {placed.map(({ p, a }) => (
        <span key={p.name} className={`spider-label${p.name === state.picked ? ' picked' : ''}`}
          style={{ ...rimLabel(a, whole), color: HUE[p.domain] }} onClick={() => actions.pick(p.name)}>
          {p.name}
        </span>
      ))}

      <svg className="spider-svg spider-points" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {placed.map(({ p, x, y }) => {
          const picked = p.name === state.picked
          return (
            <g key={p.name} className={`spider-point ${p.status}${picked ? ' picked' : ''}${hovered === p.name ? ' hot' : ''}`}
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} tabIndex={0} role="button" aria-pressed={picked}
              aria-describedby={hovered === p.name ? tipId : undefined}
              aria-label={`${p.name}, ${pct(atStop.get(p.name)!)} of threshold, ${LABEL[statusOf(atStop.get(p.name)!)]}`}
              onClick={() => actions.pick(p.name)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); actions.pick(p.name) }
                if (e.key === 'Escape') setHovered(null)
              }}
              onMouseEnter={() => setHovered(p.name)} onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(p.name)} onBlur={() => setHovered(null)}>
              <circle className="spider-hit" r={16} />
              <circle className="spider-halo" r={13.25} />
              <polygon className="spider-pick" points="0,-11 11,0 0,11 -11,0" />
              <polygon className="spider-diamond" points="0,-6.5 6.5,0 0,6.5 -6.5,0" />
            </g>
          )
        })}
      </svg>

      {placed.map(({ p, a, x, y }) => {
        if (p.ratio <= 1) return null
        const slot = slotOf(a), size = labelSize(p.ratio)
        const tag = tagFor(p, whole, stop)
        const showTag = tag && p.name !== hovered && p.name !== state.picked
        return [
          <span key={`${p.name}-pct`} className="spider-pct" style={{ ...beside(slot, x, y, size + 4.5), fontSize: size }}>{pct(p.ratio)}</span>,
          showTag && <span key={`${p.name}-tag`} className="spider-tag" style={beside(opposite[slot], x, y, 25.5)}>{tag}</span>,
        ]
      })}

      <span className="spider-badge" style={{ left: C.x, top: C.y }}>{badge}</span>
      {hot && <Tooltip id={tipId} p={hot.p} r={atStop.get(hot.p.name)!} whole={whole} x={hot.x} y={hot.y} />}
    </div>
  )
}
