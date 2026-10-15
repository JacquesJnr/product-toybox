import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const fixture = JSON.parse(readFileSync(new URL('./wheels.json', import.meta.url)))
assert.equal(fixture.business, 'Acme.Inc')
assert.equal(fixture.todayIndex, 5)
assert.equal(fixture.nearThresholdRatio, 0.8)
assert.equal(fixture.timeframes.length, 8)
assert.deepEqual(fixture.timeframes.map(t => t.projection), [false, false, false, false, false, false, true, true])
assert.deepEqual(fixture.domains.map(d => d.domain), ['Finance', 'Risk', 'Audit', 'Remuneration', 'Legal', 'Compliance'])
const topics = fixture.domains.flatMap(d => d.topics)
assert.equal(topics.length, 28)
assert.equal(new Set(topics.map(t => t.topic)).size, 28)
for (const domain of fixture.domains) {
  assert(domain.owner)
  for (const topic of domain.topics) {
    assert.equal(topic.appetite, 1)
    assert.equal(topic.riskScore.length, 8)
    assert(topic.riskScore.every(v => Number.isFinite(v) && v >= 0))
    if (domain.domain !== fixture.fullKriDomain) {
      assert.equal(topic.kris, undefined)
      assert.equal(topic.appetiteStatement, undefined)
      assert.equal(topic.aiReading, undefined)
      continue
    }
    assert(topic.appetiteStatement.text && topic.appetiteStatement.source)
    assert(topic.aiReading.text && topic.aiReading.source)
    assert(['Medium', 'High'].includes(topic.aiReading.confidence))
    assert.equal(topic.kris.length, 2)
    for (const kri of topic.kris) {
      assert(kri.name && typeof kri.unit === 'string')
      assert(kri.threshold > 0)
      assert.equal(kri.values.length, 8)
      assert(kri.values.every(v => Number.isFinite(v) && v >= 0))
    }
    topic.riskScore.forEach((score, i) => assert.equal(score, Math.max(...topic.kris.map(k => k.values[i] / k.threshold))))
  }
}
const supplier = topics.find(t => t.topic === 'Supplier risk')
assert.deepEqual(supplier.kris[0].values, [1, 1, 2, 3, 4, 4, 4, 3])
assert.equal(supplier.riskScore[5], 2)
assert.equal(topics.find(t => t.topic === 'Incentive plans').riskScore[5], 1.18)
console.log('Wheel v2 fixture checks pass: six domains, 28 topics, eight timeframes, 16 KRIs, normalized scores.')
