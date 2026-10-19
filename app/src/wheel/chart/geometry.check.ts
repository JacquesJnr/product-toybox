import { C, R, ang, labelSize, opposite, rad, slotOf, smoothPath, xy } from './geometry.ts'
import { TODAY, pointsAt } from '../model.ts'

const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
const close = (a: number, b: number) => Math.abs(a - b) < 0.05
check(rad(2) === R && rad(1.5) === R && close(rad(1), 140), 'The plot clamps at 150%; 100% sits at 140 px')
check(labelSize(1) === 12 && labelSize(1.5) === 18 && labelSize(2) === 24 && labelSize(3) === 24, '% label grows 12 → 24 px and caps at 200%')
check(close(xy(ang(1, 6), R).x, 573.9) && close(xy(ang(1, 6), R).y, 172.5), 'Risk vertex matches Figma frame 01')
check(close(xy(ang(2, 8), R).x - C.x, 181.9), 'A face midpoint sits on the hexagon edge (Figma frame 03)')
const slots = [0, 1, 2, 3, 4, 5].map(i => slotOf(ang(i, 6)))
check(slots.join() === 'top,top,right,bottom,left,top', `Whole wheel slots: ${slots}`)
check(slots.map(s => opposite[s]).join() === 'bottom,bottom,left,top,right,bottom', 'Over tags take the opposite slot')
const today = Object.fromEntries(pointsAt(null, TODAY).map(p => [p.name, Math.round(p.ratio * 100)]))
check(today.Risk === 200 && today.Remuneration === 118, 'Today: Risk 200%, Remuneration 118%')
const risk = Object.fromEntries(pointsAt('Risk', TODAY).map(p => [p.name, Math.round(p.ratio * 100)]))
check(risk['Supplier risk'] === 200 && risk['Emerging risks'] === 150, 'Risk wheel: Supplier risk 200%, Emerging risks 150%')
const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
const curve = smoothPath(square)
check(curve.startsWith('M0.0,0.0') && curve.endsWith('Z') && (curve.match(/C/g) ?? []).length === 4, 'The reading curve is closed, with one Bézier side for each node')
check(['10.0,0.0', '10.0,10.0', '0.0,10.0'].every(p => curve.includes(` ${p} C`) || curve.includes(` ${p}Z`)), 'The reading curve passes through every node')
check(smoothPath(square, 0).includes('C0.0,0.0 10.0,0.0 10.0,0.0'), 'Tension 0 gives straight sides')
console.log('chart geometry checks pass')
