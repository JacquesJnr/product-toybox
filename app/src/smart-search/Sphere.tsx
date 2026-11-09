import { useEffect, useLayoutEffect, useRef } from 'react'
import { sourceLabels } from './annotations'
import './sphere.css'

type Point = { x: number; y: number; z: number }
type Rotation = { x: number; y: number }
type SphereProps = {
  phase: 'ask' | 'reading' | 'answer'
  reads: { documentId: string; title: string }[]
  readingIndex: number | null
}

const points: Point[] = Array.from({ length: 260 }, (_, index) => {
  const y = 1 - 2 * (index + 0.5) / 260
  const radius = Math.sqrt(1 - y * y)
  const angle = index * Math.PI * (3 - Math.sqrt(5))
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius }
})

function pointIndex(documentId: string) {
  let hash = 0
  for (const character of documentId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return hash % points.length
}

function rotate(point: Point, rotation: Rotation): Point {
  const x = point.x * Math.cos(rotation.y) + point.z * Math.sin(rotation.y)
  const z = -point.x * Math.sin(rotation.y) + point.z * Math.cos(rotation.y)
  return {
    x,
    y: point.y * Math.cos(rotation.x) - z * Math.sin(rotation.x),
    z: point.y * Math.sin(rotation.x) + z * Math.cos(rotation.x),
  }
}

function front(point: Point): Rotation {
  return { x: Math.atan2(point.y, Math.hypot(point.x, point.z)), y: Math.atan2(-point.x, point.z) }
}

function shortestAngle(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from))
}

// Check the geometry used by the animation without introducing a test dependency.
if (import.meta.env.DEV) {
  for (const point of points) {
    const turned = rotate(point, front(point))
    if (Math.abs(Math.hypot(point.x, point.y, point.z) - 1) > 1e-10
      || Math.hypot(turned.x, turned.y) > 1e-10 || Math.abs(turned.z - 1) > 1e-10) {
      throw new Error('Sphere points must lie on the unit sphere and turn to the front')
    }
  }
}

function project(rotation: Rotation) {
  return points.map((point, index) => {
    const turned = rotate(point, rotation)
    const depth = (turned.z + 1) / 2
    return { index, x: 323 + turned.x * 258, y: 323 + turned.y * 258, z: turned.z,
      size: 1.4 + depth * 4, opacity: 0.12 + depth * 0.78 }
  })
}

// Motion. Ask: a slow idle spin. Reading: a soft spring turns each document to the front.
// Reading and Answer: drag to turn it; it coasts to a stop, and the spring takes over again at the next read.
const IDLE_SPEED = 0.18 // rad/s
const SPRING_K = 9, SPRING_C = 6 // critically damped: starts and stops gently, settles in about a second
const DRAG = 0.008 // rad per px

// Ask only: waves of nodes light up in the primary green and swell, like a crowd wave or breathing.
// The patterns are fixed to the sphere, so they turn with it. Each runs PATTERN_TIME s, then cross-fades to the next.
const PATTERN_TIME = 7, FADE_TIME = 1.2
const ripples = [{ x: 0.4, y: -0.5, z: 0.77 }, { x: -0.6, y: 0.3, z: 0.74 }, { x: 0.1, y: 0.6, z: -0.79 }]
const patterns: ((p: Point, t: number, run: number) => number)[] = [
  // 1. Crowd wave: a band of longitude sweeps round the sphere.
  (p, t) => Math.max(0, Math.cos(Math.atan2(p.x, p.z) - t * 1.4)) ** 10,
  // 2. Breathing rings: bands of latitude roll from pole to pole, the whole sphere swelling slightly in time.
  (p, t) => 0.12 * (1 + Math.sin(t * 1.6)) / 2 + 0.88 * Math.max(0, Math.cos(p.y * Math.PI * 1.5 - t * 2.2)) ** 8,
  // 3. Ripple: a ring spreads out from a point on the sphere, from a new point each time.
  (p, t, run) => {
    const c = ripples[run % ripples.length]
    const distance = Math.acos(Math.max(-1, Math.min(1, p.x * c.x + p.y * c.y + p.z * c.z)))
    const radius = (t % 3.5) * 1.1
    return Math.exp(-((distance - radius) ** 2) / 0.03) * Math.max(0, 1 - radius / 3.6)
  },
]
function highlight(p: Point, seconds: number) {
  const run = Math.floor(seconds / PATTERN_TIME), into = seconds - run * PATTERN_TIME
  const now = patterns[run % patterns.length](p, into, run)
  if (into < PATTERN_TIME - FADE_TIME) return now
  const blend = (into - (PATTERN_TIME - FADE_TIME)) / FADE_TIME
  return now * (1 - blend) + patterns[(run + 1) % patterns.length](p, into - PATTERN_TIME, run + 1) * blend
}
const COAST = 2.5 // per second

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Sphere({ phase, reads, readingIndex }: SphereProps) {
  // Rotation lives in refs and every frame is written to the DOM. React renders the diamonds and labels once per change.
  const rotation = useRef<Rotation>({ x: 0, y: 0 })
  const velocity = useRef<Rotation>({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; time: number } | null>(null)
  const manual = useRef(false)
  const cloud = useRef<SVGGElement>(null)
  const rects = useRef<(SVGRectElement | null)[]>([])
  const annotationEls = useRef<(SVGGElement | null)[]>([])
  const activeRead = phase === 'reading' && readingIndex !== null ? reads[readingIndex] : undefined
  const activePoint = activeRead ? pointIndex(activeRead.documentId) : null
  const labels = phase === 'answer' ? reads : activeRead ? [activeRead] : []
  const labelPoints = labels.map(read => pointIndex(read.documentId))
  // Each label keeps its side and offset from its node while the sphere turns, so labels never jump.
  const offsets = useRef<{ dx: number; dy: number; width: number }[]>([])
  const live = useRef({ phase, activePoint, labelPoints })
  live.current = { phase, activePoint, labelPoints }

  // A new read hands the sphere back to the spring.
  useEffect(() => { manual.current = false }, [activePoint])

  function paint() {
    const projected = project(rotation.current)
    const waving = live.current.phase === 'ask' && !reducedMotion()
    const seconds = performance.now() / 1000
    for (const point of [...projected].sort((a, b) => a.z - b.z)) {
      const rect = rects.current[point.index]
      if (!rect) continue
      // In Ask the cloud is faint (40%) and the wave lifts nodes to full strength.
      const h = waving ? highlight(points[point.index], seconds) : 0
      const size = point.size * (1 + 0.7 * h)
      rect.setAttribute('x', String(point.x - size / 2)); rect.setAttribute('y', String(point.y - size / 2))
      rect.setAttribute('width', String(size)); rect.setAttribute('height', String(size))
      rect.setAttribute('transform', `rotate(45 ${point.x} ${point.y})`)
      rect.style.fill = h > 0.02 ? `color-mix(in oklch, var(--primary) ${Math.round(h * 100)}%, var(--graphite))` : ''
      const faint = live.current.phase === 'ask' ? point.opacity * 0.4 : point.opacity
      if (!rect.classList.contains('sphere__point--read')) rect.setAttribute('opacity', String(faint + (1 - faint) * 0.85 * h))
      cloud.current?.appendChild(rect)
    }
    live.current.labelPoints.forEach((index, i) => {
      const el = annotationEls.current[i], offset = offsets.current[i]
      if (!el || !offset) return
      const point = projected[index]
      const x = Math.max(12, Math.min(634 - offset.width, point.x + offset.dx)), y = Math.max(12, Math.min(614, point.y + offset.dy))
      const endX = Math.max(x, Math.min(x + offset.width, point.x)), endY = y + 10
      el.querySelector('path')!.setAttribute('d', `M ${point.x} ${point.y} L ${endX} ${endY}`)
      el.querySelector('circle')?.setAttribute('cx', String(endX)); el.querySelector('circle')?.setAttribute('cy', String(endY))
      const slot = el.querySelector('foreignObject')!
      slot.setAttribute('x', String(x)); slot.setAttribute('y', String(y)); slot.setAttribute('width', String(offset.width))
      // A node turned to the back dims its label.
      el.style.opacity = point.z > -0.1 ? '1' : '0.35'
    })
  }

  // Place the labels once, where they appear, then keep their offsets.
  useLayoutEffect(() => {
    const projected = project(rotation.current)
    offsets.current = sourceLabels(labels.map(read => ({ ...projected[pointIndex(read.documentId)], title: read.title })))
      .map((label, i) => ({ dx: label.x - projected[labelPoints[i]].x, dy: label.y - projected[labelPoints[i]].y, width: label.width }))
    paint()
  }, [labelPoints.join()])

  useLayoutEffect(() => paint())

  useEffect(() => {
    const reduced = reducedMotion()
    let frame = 0, last = performance.now()
    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { phase, activePoint } = live.current
      const r = rotation.current, v = velocity.current
      if (drag.current) {
        // The pointer handlers move it.
      } else if (phase === 'ask') {
        if (!reduced) r.y += IDLE_SPEED * dt
        r.x += -r.x * Math.min(1, dt * 2)
        v.x = v.y = 0
      } else if (phase === 'reading' && activePoint !== null && !manual.current) {
        const target = front(points[activePoint])
        if (reduced) { r.x = target.x; r.y = target.y } else {
          v.x += (SPRING_K * shortestAngle(r.x, target.x) - SPRING_C * v.x) * dt
          v.y += (SPRING_K * shortestAngle(r.y, target.y) - SPRING_C * v.y) * dt
          r.x += v.x * dt; r.y += v.y * dt
        }
      } else {
        const decay = Math.exp(-COAST * dt)
        v.x *= decay; v.y *= decay
        r.x += v.x * dt; r.y += v.y * dt
      }
      paint()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  const projected = project(rotation.current)
  // Every node read so far stays Peach.
  const readPoints = new Set((phase === 'answer' ? reads : phase === 'reading' && readingIndex !== null ? reads.slice(0, readingIndex + 1) : []).map(read => pointIndex(read.documentId)))
  const draggable = phase !== 'ask'

  return (
    <svg className={`sphere sphere--${phase}`} viewBox="0 0 646 646" aria-hidden="true" focusable="false"
      onPointerDown={event => {
        if (!draggable) return
        drag.current = { x: event.clientX, y: event.clientY, time: performance.now() }
        manual.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={event => {
        const d = drag.current
        if (!d) return
        const now = performance.now(), dt = Math.max(1, now - d.time) / 1000
        // Drag right turns the front to the right; drag down turns it down.
        const turnY = (event.clientX - d.x) * DRAG, turnX = -(event.clientY - d.y) * DRAG
        rotation.current.y += turnY; rotation.current.x += turnX
        velocity.current = { x: turnX / dt, y: turnY / dt }
        drag.current = { x: event.clientX, y: event.clientY, time: now }
      }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <g ref={cloud} className="sphere__cloud">
        {projected.map(point => (
          <rect key={point.index} ref={element => { rects.current[point.index] = element }}
            className={readPoints.has(point.index) ? 'sphere__point sphere__point--read' : 'sphere__point'}
            rx={0.7} opacity={readPoints.has(point.index) ? 1 : point.opacity} />
        ))}
      </g>
      {labels.map((read, index) => (
        <g key={read.documentId} ref={element => { annotationEls.current[index] = element }} className="sphere__annotation">
          <path className="sphere__leader" />
          {phase === 'reading' && <circle className="sphere__leader-dot" r={2} />}
          <foreignObject className="sphere__label-slot" height={24}>
            <span className="sphere__label">{read.title}<span className="sphere__status"> · {phase === 'reading' ? 'reading' : 'source'}</span></span>
          </foreignObject>
        </g>
      ))}
    </svg>
  )
}
