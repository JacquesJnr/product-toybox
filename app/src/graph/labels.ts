type LabelNode = { id: string; x: number; y: number; radius: number; width: number }
type Box = { x: number; y: number; width: number; height: number }
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width
  && a.y < b.y + b.height && b.y < a.y + a.height

export function placeLabels(nodes: LabelNode[]) {
  const occupied: Box[] = nodes.map(node => ({ x: node.x - node.radius - 4,
    y: node.y - node.radius - 4, width: node.radius * 2 + 8, height: node.radius * 2 + 8 }))
  return nodes.map(node => {
    const preferred = node.x < -20 ? -1 : 1
    const candidates = [preferred, -preferred].flatMap(side => [0, -18, 18, -36, 36, -54, 54].map(offset => {
      const x = node.x + side * (node.radius + 8) - (side === -1 ? node.width : 0)
      return { x, y: node.y - 10 + offset, width: node.width, height: 16 }
    }))
    const box = candidates.find(candidate => occupied.every(other => !overlaps(candidate, other))) ?? candidates[0]
    occupied.push(box)
    return { id: node.id, x: box.x - node.x, y: box.y - node.y + 12 }
  })
}
