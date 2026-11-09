import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

// The one ease-in-out curve for every sphere animation. sphere.css has the same curve as --sphere-ease.
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

function project(rotation: Rotation) {
  return points.map((point, index) => {
    const turned = rotate(point, rotation)
    const depth = (turned.z + 1) / 2
    return { index, x: 323 + turned.x * 258, y: 323 + turned.y * 258, z: turned.z,
      size: 1.4 + depth * 4, opacity: 0.12 + depth * 0.78 }
  })
}

export function Sphere({ phase, reads, readingIndex }: SphereProps) {
  // React holds only the rotation a turn ends on. Each frame of a turn is written to the DOM directly.
  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0 })
  const currentRotation = useRef(rotation)
  const cloud = useRef<SVGGElement>(null)
  const rects = useRef<(SVGRectElement | null)[]>([])
  const activeRead = phase === 'reading' && readingIndex !== null ? reads[readingIndex] : undefined
  const activePoint = activeRead ? pointIndex(activeRead.documentId) : null
  // Sorts the diamonds back to front and places them. React keeps them in index order and never moves them.
  function paint(next: Rotation) {
    const sorted = project(next).sort((a, b) => a.z - b.z)
    for (const point of sorted) {
      const rect = rects.current[point.index]
      if (!rect) continue
      rect.setAttribute('x', String(point.x - point.size / 2)); rect.setAttribute('y', String(point.y - point.size / 2))
      rect.setAttribute('width', String(point.size)); rect.setAttribute('height', String(point.size))
      rect.setAttribute('transform', `rotate(45 ${point.x} ${point.y})`)
      if (!rect.classList.contains('sphere__point--read')) rect.setAttribute('opacity', String(point.opacity))
      cloud.current?.appendChild(rect)
    }
  }
  // Labels wait until the turn that brings their node to the front has stopped, then fade in.
  const turnKey = `${phase}-${activePoint}`
  const [settledKey, setSettledKey] = useState(turnKey)

  useEffect(() => {
    if (phase === 'answer' || (phase === 'reading' && activePoint === null)) { setSettledKey(turnKey); return }
    const start = currentRotation.current
    const target = phase === 'ask' ? { x: 0, y: 0 } : front(points[activePoint!])
    const delta = { x: shortestAngle(start.x, target.x), y: shortestAngle(start.y, target.y) }
    // 650 ms ends well inside the one-second read, so each turn stops before the next read starts.
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650
    let frame = 0
    const started = performance.now()
    function animate(time: number) {
      const progress = duration === 0 ? 1 : Math.min((time - started) / duration, 1)
      const eased = easeInOutCubic(progress)
      const next = { x: start.x + delta.x * eased, y: start.y + delta.y * eased }
      currentRotation.current = next
      paint(next)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else { setRotation(target); setSettledKey(turnKey) }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [phase, activePoint, turnKey])

  const projected = project(rotation)
  // After each render (React writes the diamonds in index order), also mid-turn when the chat re-renders.
  useLayoutEffect(() => paint(currentRotation.current))
  // Every node read so far stays Peach. Labels: the active node while reading, every source in the answer.
  const readPoints = new Set((phase === 'answer' ? reads : phase === 'reading' && readingIndex !== null ? reads.slice(0, readingIndex + 1) : []).map(read => pointIndex(read.documentId)))
  const labels = settledKey !== turnKey ? [] : phase === 'answer' ? reads : activeRead ? [activeRead] : []
  const annotations = sourceLabels(labels.map(read => ({ ...projected[pointIndex(read.documentId)], title: read.title })))

  return (
    <svg className={`sphere sphere--${phase}`} viewBox="0 0 646 646" aria-hidden="true" focusable="false">
      <g ref={cloud} className="sphere__cloud">
        {projected.map(point => (
          <rect key={point.index} ref={element => { rects.current[point.index] = element }}
            className={readPoints.has(point.index) ? 'sphere__point sphere__point--read' : 'sphere__point'}
            x={point.x - point.size / 2} y={point.y - point.size / 2}
            width={point.size} height={point.size} rx={0.7}
            opacity={readPoints.has(point.index) ? 1 : point.opacity}
            transform={`rotate(45 ${point.x} ${point.y})`} />
        ))}
      </g>
      {labels.map((read, index) => {
        const point = projected[pointIndex(read.documentId)]
        const label = annotations[index]
        return (
          <g key={read.documentId} className="sphere__annotation">
            <path className="sphere__leader" d={`M ${point.x} ${point.y} L ${label.endX} ${label.endY}`} />
            {phase === 'reading' && <circle className="sphere__leader-dot" cx={label.endX} cy={label.endY} r={2} />}
            <foreignObject className={label.endX === label.x ? 'sphere__label-slot' : 'sphere__label-slot sphere__label-slot--left'}
              x={label.x} y={label.y} width={label.width} height={24}>
              <span className="sphere__label">{read.title}<span className="sphere__status"> · {phase === 'reading' ? 'reading' : 'source'}</span></span>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}
