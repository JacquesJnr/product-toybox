import { arrivalStage, buildSimulation, linkShown, nodeShown, revealEnd, tick, zoomAt } from './simulation.ts'
import type { Doc } from '../types'
const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
const docs: Doc[] = ['a', 'b'].map(id => ({ id, title: id, type: 'pdf', issued: '', from: '', author: null, domains: ['Major decisions'], primaryDomain: 'Major decisions', text: '', links: [{ targetId: id === 'a' ? 'b' : 'a', reason: 'cites' }], summary: '', insights: [] }))
const sim = buildSimulation(docs)
check(sim.links.length === 1, 'Reverse fixture references make one visual spring')
const pinned = sim.nodes[0]
pinned.fx = 100; pinned.fy = 80
for (let i = 0; i < 300; i++) tick(sim, sim.nodes, sim.links, i * 16)
check(pinned.x === 100 && pinned.y === 80, 'A dragged node stays pinned')
check(sim.nodes.every(n => Number.isFinite(n.x) && Number.isFinite(n.y)), 'Simulation stays finite')
pinned.fx = pinned.fy = null
const previous = pinned.x
tick(sim, sim.nodes, sim.links, 4800)
check(pinned.x !== previous, 'Released nodes resume simulation')
const cam = { x: 12, y: 23, k: 2 }
const next = zoomAt(cam, 80, 120, -100)
check(Math.abs(cam.x + 80 / cam.k - next.x - 80 / next.k) < 1e-10, 'Zoom preserves cursor world x')
check(Math.abs(cam.y + 120 / cam.k - next.y - 120 / next.k) < 1e-10, 'Zoom preserves cursor world y')
check(zoomAt(cam, 0, 0, 1e6).k === 0.25 && zoomAt(cam, 0, 0, -1e6).k === 6, 'Zoom is bounded')
check(arrivalStage(999) === 'waiting' && arrivalStage(1000) === 'arrived' && arrivalStage(1800) === 'sorting' && arrivalStage(5200) === 'settled', 'Arrival phases have defined boundaries')
const [first, second] = buildSimulation(docs).nodes
check(nodeShown(first, 0) && !nodeShown(second, 0), 'Animate shows nodes one at a time')
check(nodeShown(second, 200) && !linkShown(first, second, 200), 'A new node is an orphan before it links')
check(linkShown(first, second, revealEnd(2)), 'Every link shows by the end of the reveal')
check(nodeShown(second, Infinity) && linkShown(first, second, Infinity), 'Outside Animate everything shows')
console.log('Graph simulation self-check passes')
