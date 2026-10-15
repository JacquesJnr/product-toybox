// Run with Node 22.18+ from app/: node src/wheel/drawer/drawerLogic.check.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { clampTime, playbackTime, slideText, stepDestination } from './drawerLogic.ts'
const fixture = JSON.parse(readFileSync(new URL('../../data/wheels.json', import.meta.url)))
const points = (k, domain) => domain
  ? fixture.domains.find(d => d.domain === domain).topics.map(t => ({ name: t.topic, ratio: t.riskScore[k] }))
  : fixture.domains.map(d => ({ name: d.domain, ratio: Math.max(...d.topics.map(t => t.riskScore[k])) }))
const text = (k, domain) => slideText(points(k, domain), k ? points(k - 1, domain) : null, k ? fixture.timeframes[k - 1].label.split('\n')[0] : '', k > fixture.todayIndex)
assert.match(text(0), /This is the first timeframe in the history\.$/)
assert.equal(text(5), '2 of 6 over threshold: Risk, Remuneration. Biggest move: Remuneration, up 6 points.')
assert.match(text(5, 'Risk'), /2 of 8 over threshold:.*Biggest move: Emerging risks, up 50 points\.$/)
assert.equal(text(6), 'AI projection, an estimate from the trend. 2 of 6 over threshold: Risk, Remuneration. Biggest move: Legal, up 5 points.')
assert.equal(slideText([{ name: 'A', ratio: 1.2 }, { name: 'B', ratio: .9 }], [{ name: 'A', ratio: .8 }, { name: 'B', ratio: 1.1 }], 'Q1', false), '1 of 2 over threshold: A. Crossed since Q1: A. Back under: B. Biggest move: A, up 40 points.')
assert.equal(clampTime(-1, 7), 0)
assert.equal(clampTime(8, 7), 7)
assert.equal(stepDestination(2.3, null, -1, 5), 2)
assert.equal(stepDestination(2.3, null, 1, 5), 3)
assert.equal(stepDestination(2.3, 4, 1, 5), 5)
assert.equal(stepDestination(2.3, 1, -1, 5), 0)
assert.equal(playbackTime(3, -50, 5), 3)
assert.equal(playbackTime(3, 700, 5), 3.5)
assert.equal(playbackTime(3, 2800, 5), 5)
assert.equal(playbackTime(3, 10000, 5), 5)
console.log('Drawer checks passed: copy, scope, crossings, returns, movement, bounds, pending steps, playback endpoint.')
