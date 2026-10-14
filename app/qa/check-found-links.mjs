import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { addFoundLink } from '../src/graph/found-links.ts'

const docs = JSON.parse(readFileSync(new URL('../src/data/documents.json', import.meta.url)))
const scripts = JSON.parse(readFileSync(new URL('../src/data/smart-search.json', import.meta.url)))
let links = []
for (const { foundLink } of scripts) {
  const previous = links
  links = addFoundLink(docs, links, foundLink)
  assert.equal(links.length, previous.length + 1)
  assert.equal(previous.length, links.length - 1)
  const link = links.at(-1)
  assert(docs.some(doc => doc.id === link.source))
  assert(docs.some(doc => doc.id === link.target))
  assert.strictEqual(addFoundLink(docs, links, link), links)
  assert.strictEqual(addFoundLink(docs, links, { source: link.target, target: link.source }), links)
}
assert.equal(links.length, 3)
assert.strictEqual(addFoundLink(docs, links, { source: 'missing', target: 'charter' }), links)
assert.strictEqual(addFoundLink(docs, links, { source: 'charter', target: 'charter' }), links)
assert.deepEqual(addFoundLink(docs, [], scripts[0].foundLink), [links[0]])
console.log('Found-link self-check passes: all scripts, IDs, deduplication, invalid endpoints, immutable state, fresh state.')
