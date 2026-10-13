import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { wheelTopics } from '../src/wheel-topics.ts'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const pkg = JSON.parse(read('../package.json'))
const allowed = new Set(['react', 'react-dom', 'vite', '@vitejs/plugin-react', 'typescript', '@types/react', '@types/react-dom', '@base-ui/react', 'd3-force', '@types/d3-force'])
for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
  assert(allowed.has(name), `Unapproved dependency: ${name}`)
}
const config = JSON.parse(read('../tsconfig.app.json'))
assert.equal(config.compilerOptions.strict, true)
assert.equal(config.compilerOptions.skipLibCheck, false)
assert.equal(config.compilerOptions.resolveJsonModule, true)
assert(read('../vite.config.js').includes("base: '/product-toybox/app/'"))
assert(read('../src/index.css').includes('#root { isolation: isolate; }'))
const design = read('../../DESIGN.md')
assert.equal(read('../src/tokens.css'), design.split('```css\n')[1].split('```')[0])
for (const name of ['documents', 'wheels', 'smart-search']) {
  assert(read('../src/App.tsx').includes(`from './data/${name}.json'`))
}
const docs = JSON.parse(read('../src/data/documents.json'))
const wheels = JSON.parse(read('../src/data/wheels.json'))
const scripts = JSON.parse(read('../src/data/smart-search.json'))
assert.equal(docs.length, 18)
assert.equal(new Set(docs.map(d => d.id)).size, 18)
assert.equal(scripts.length, 3)
const ids = new Set(docs.map(d => d.id))
const topics = Object.values(wheelTopics).flat()
assert.equal(Object.keys(wheelTopics).length, 7)
assert.equal(new Set(topics).size, topics.length)
for (const group of Object.values(wheelTopics)) assert(group.length >= 4 && group.length <= 8)
for (const w of wheels) {
  assert(ids.has(w.documentId))
  assert(topics.includes(w.topic))
  assert(['Within appetite', 'Near the limit', 'Over appetite'].includes(w.rung))
  assert(w.riskScore >= 0 && w.riskScore <= 1)
  assert(w.appetite >= 0 && w.appetite <= 1)
  for (const f of w.factors) {
    assert(ids.has(f.evidenceRef.documentId))
    assert.equal(typeof f.evidenceRef.pageRef, 'string')
  }
}
const byTitle = new Map(docs.map(d => [d.title, d]))
const seed = design.match(/\*\*Linked documents:\*\* (.+)\./)[1].replace(' (the hub)', '').split(', ')
assert.deepEqual(docs.map(d => d.title).sort(), [...seed, 'Draft charter', 'Employment contracts', 'Liquidity review'].sort())
const tags = design.match(/\*\*Insight tags \(fixed list\):\*\* (.+)\./)[1].split(', ')
for (const d of docs) {
  assert(d.domains.every(domain => domain in wheelTopics))
  assert(d.domains.includes(d.primaryDomain))
  for (const i of d.insights) assert(i.tags.every(tag => tags.includes(tag)))
  const linked = d.links.length > 0 || docs.some(other => other.links.some(l => l.targetId === d.id))
  assert.equal(linked, d.title !== 'Draft charter', `Unexpected link state: ${d.title}`)
}
assert.equal(byTitle.get('Employment contracts').text, '')
assert.deepEqual(byTitle.get('Employment contracts').insights, [])
for (const script of scripts) {
  const source = byTitle.get(script.foundLink.source)
  const target = byTitle.get(script.foundLink.target)
  assert(source && target)
  assert(!source.links.some(l => l.targetId === target.id))
  assert(!target.links.some(l => l.targetId === source.id))
}
assert.match(read('../src/assets/sphere.svg'), /<svg\b/)
console.log('Milestone checks pass: boundaries, strict types, tokens, fixture imports, wheel references, Sphere SVG.')
