import assert from 'node:assert/strict'
import { sourceLabels } from './annotations.ts'

for (const points of [
  Array.from({ length: 6 }, () => ({ x: 323, y: 323, title: 'Board risk report' })),
  [{ x: 65, y: 65, title: 'Board risk report' }, { x: 581, y: 581, title: 'Supplier review' }],
]) {
  const labels = sourceLabels(points)
  for (const [index, label] of labels.entries()) {
    assert(label.x >= 0 && label.x + label.width <= 646 && label.y >= 0 && label.y + 24 <= 646)
    assert(Math.hypot(label.endX - points[index].x, label.endY - points[index].y) <= 135)
    for (const other of labels.slice(index + 1)) {
      assert(label.x + label.width <= other.x || other.x + other.width <= label.x
        || label.y + 24 <= other.y || other.y + 24 <= label.y)
    }
  }
}
console.log('Source label self-check passes: local leaders, square bounds, crowded sources stay separate.')
