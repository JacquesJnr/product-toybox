import { placeLabels } from './labels.ts'
const nodes = [
  { id: 'minutes', x: 0, y: 0, radius: 8, width: 84 },
  { id: 'policy', x: 20, y: 0, radius: 8, width: 56 },
  { id: 'charter', x: 40, y: 12, radius: 8, width: 48 },
  { id: 'audit', x: 50, y: 12, radius: 8, width: 64 },
]
const labels = placeLabels(nodes).map((label, index) => ({
  x: nodes[index].x + label.x, y: nodes[index].y + label.y - 12, width: nodes[index].width,
}))
for (const [index, label] of labels.entries()) for (const other of labels.slice(index + 1)) {
  if (label.x < other.x + other.width && other.x < label.x + label.width
    && label.y < other.y + 16 && other.y < label.y + 16) throw new Error('Graph labels overlap')
}
console.log('Graph label self-check passes for crowded document pairs.')
