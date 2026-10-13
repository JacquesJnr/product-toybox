import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('./RiskSummary.tsx', import.meta.url), 'utf8')
const exports = {}
runInNewContext(ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText, {
  exports,
  require: (path) => path.endsWith('.css') ? {} : path.endsWith('.svg') ? 'rung-dot.svg' : require(path === '../wheel-topics' ? '../wheel-topics.ts' : path),
})
const docs = require('../data/documents.json')
const records = require('../data/wheels.json')
const colors = { 'Within appetite': 'var(--risk-within)', 'Near the limit': 'var(--risk-near)', 'Over appetite': 'var(--risk-over)' }
for (const record of records) {
  const html = renderToStaticMarkup(createElement(exports.RiskSummary, {
    record, doc: docs.find(doc => doc.id === record.documentId), onClose() {}, onOpenEvidence() {},
  }))
  assert(html.includes(`score ${record.riskScore.toFixed(2)} · appetite ${record.appetite.toFixed(2)}`))
  assert(html.includes(`aria-valuenow="${record.riskScore}"`))
  assert(html.includes(record.rung))
  for (const factor of record.factors) {
    assert(html.includes(docs.find(doc => doc.id === factor.evidenceRef.documentId).title))
    assert(html.includes(factor.evidenceRef.pageRef))
  }
}
const record = records[0]
for (const [weight, rung, label] of [[-0.08, 'Within appetite', '−0.08'], [0, 'Near the limit', '+0.00'], [0.349, 'Near the limit', '+0.35'], [0.35, 'Over appetite', '+0.35'], [0.42, 'Over appetite', '+0.42']]) {
  const html = renderToStaticMarkup(createElement(exports.RiskSummary, {
    record: { ...record, factors: [{ ...record.factors[0], weight }] },
    doc: docs.find(doc => doc.id === record.documentId), onClose() {}, onOpenEvidence() {},
  }))
  assert(html.includes(`class="risk-weight" style="color:${colors[rung]}">${label}</td>`))
}
console.log(`Risk summary checks pass: ${records.length} fixtures, Meter values, evidence titles/references, signed weight boundaries.`)
