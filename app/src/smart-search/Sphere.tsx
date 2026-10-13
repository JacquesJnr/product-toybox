import { useEffect, useRef, useState } from 'react'
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

export function Sphere({ phase, reads, readingIndex }: SphereProps) {
  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0 })
  const currentRotation = useRef(rotation)
  const activeRead = phase === 'reading' && readingIndex !== null ? reads[readingIndex] : undefined
  const activePoint = activeRead ? pointIndex(activeRead.documentId) : null

  useEffect(() => {
    if (phase === 'answer' || (phase === 'reading' && activePoint === null)) return
    const start = currentRotation.current
    const target = phase === 'ask' ? { x: 0, y: 0 } : front(points[activePoint!])
    const delta = { x: shortestAngle(start.x, target.x), y: shortestAngle(start.y, target.y) }
    const duration = phase === 'ask' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650
    let frame = 0
    const started = performance.now()
    function animate(time: number) {
      const progress = duration === 0 ? 1 : Math.min((time - started) / duration, 1)
      const eased = progress * progress * (3 - 2 * progress)
      const next = { x: start.x + delta.x * eased, y: start.y + delta.y * eased }
      currentRotation.current = next
      setRotation(next)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    // Finish within the one-second read even when animation frames are delayed.
    const settle = window.setTimeout(() => {
      cancelAnimationFrame(frame)
      currentRotation.current = target
      setRotation(target)
    }, duration)
    return () => { cancelAnimationFrame(frame); window.clearTimeout(settle) }
  }, [phase, activePoint])

  const projected = points.map((point, index) => {
    const turned = rotate(point, rotation)
    const depth = (turned.z + 1) / 2
    return { index, x: 323 + turned.x * 258, y: 323 + turned.y * 258, z: turned.z,
      size: 1.4 + depth * 4, opacity: 0.12 + depth * 0.78 }
  })
  const labels = phase === 'answer' ? reads : activeRead ? [activeRead] : []
  const sourcePoints = new Set(labels.map(read => pointIndex(read.documentId)))
  const annotations = sourceLabels(labels.map(read => ({ ...projected[pointIndex(read.documentId)], title: read.title })))

  return (
    <svg className={`sphere sphere--${phase}`} viewBox="0 0 646 646" aria-hidden="true" focusable="false">
      <g className="sphere__cloud">
        {[...projected].sort((a, b) => a.z - b.z).map(point => (
          <rect key={point.index} className={sourcePoints.has(point.index) ? 'sphere__point sphere__point--source' : 'sphere__point'}
            x={point.x - point.size / 2} y={point.y - point.size / 2}
            width={point.size} height={point.size} rx={0.7}
            opacity={sourcePoints.has(point.index) ? 1 : point.opacity}
            transform={`rotate(45 ${point.x} ${point.y})`} />
        ))}
      </g>
      {labels.map((read, index) => {
        const point = projected[pointIndex(read.documentId)]
        const label = annotations[index]
        return (
          <g key={read.documentId} className="sphere__annotation">
            <path className="sphere__leader" d={`M ${point.x} ${point.y} L ${label.endX} ${label.endY}`} />
            <foreignObject className="sphere__label-slot"
              x={label.x} y={label.y} width={label.width} height={24}>
              <span className="sphere__label">{read.title}<span className="sphere__status"> · {phase === 'reading' ? 'reading' : 'source'}</span></span>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}
