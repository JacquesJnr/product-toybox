export function sourceLabels(points: { x: number; y: number; title: string }[]) {
  const placed: { x: number; y: number; width: number; endX: number; endY: number }[] = []
  for (const point of points) {
    const width = point.title.length * 6 + 58
    const sides = point.x + 60 + width <= 634 ? [1, -1] : [-1, 1]
    const candidates = sides.flatMap(side => [-40, 40, -80, 80, -120, 120].map(offset => {
      const x = Math.max(12, Math.min(634 - width, point.x + (side === 1 ? 60 : -60 - width)))
      const y = Math.max(12, Math.min(614, point.y + offset - 10))
      return { x, y, width, endX: Math.max(x, Math.min(x + width, point.x)), endY: y + 10 }
    }))
    const label = candidates.find(candidate => placed.every(other => candidate.x + width + 8 <= other.x
      || other.x + other.width + 8 <= candidate.x || candidate.y + 28 <= other.y || other.y + 28 <= candidate.y))
      ?? candidates[0]
    placed.push(label)
  }
  return placed
}
