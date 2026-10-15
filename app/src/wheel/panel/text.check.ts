import { DOMAINS, LAST_STOP, TODAY, findTopic, fixture } from '../model.ts'
import { aiReading, aiSummary, nearestStop, overview, sortedRows, worstKri } from './text.ts'

const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
check(nearestStop(4.49) === 4 && nearestStop(4.5) === TODAY && nearestStop(-1) === 0 && nearestStop(99) === LAST_STOP, 'Panel time rounds to the nearest bounded stop')
check(aiSummary(null, TODAY) === 'Acme.Inc has 6 governance domains and 28 topics in the vault. Today, 3 of 28 topics are over threshold, in 2 domains. Risk is the domain furthest from its threshold.', 'Vault Today matches frame 01')
check(aiSummary('Risk', TODAY) === 'Risk is at 200% of threshold today (over threshold). No change since the last board meeting. 2 of 8 topics are over threshold. Supplier risk sets the domain reading.', 'Risk Today matches frame 02')
const supplier = findTopic('Supplier risk')!
check(aiSummary(supplier.topic, TODAY).endsWith('Critical suppliers without a tested recovery plan sets the reading.'), 'Worst KRI drives the topic summary')
check(worstKri(supplier, TODAY) === supplier.kris![0], 'Supplier worst KRI is 4 against 2')
check(aiReading(supplier, TODAY)!.text.startsWith('2 of 2 KRIs are over threshold.') && aiReading(supplier, TODAY)!.confidence.startsWith('Confidence: High.'), 'Supplier Today has two breaches and High confidence')
check(aiReading(supplier, 3)!.text.startsWith('1 of 2 KRIs are over threshold.'), 'Q2 uses its own KRI values')
check(overview('Risk', TODAY).current.includes('Emerging risks moved up 50 points since Last Board.'), 'Overview tracks the biggest movement')
check(overview(null, TODAY).forYou.includes('Ask the risk committee chair'), 'Chair agenda uses the domain owner')
check(aiSummary(null, TODAY + 1) === `AI projection for Q4 2026. ${fixture.copy.projectionSummary}`, 'Projection summary uses fixture copy')
check(overview(null, TODAY + 1).current.startsWith(fixture.copy.projectionNotice) && overview(null, TODAY + 1).forYou.endsWith(fixture.copy.projectionAgenda), 'Projection warns the chair')
check(aiReading(supplier, TODAY + 1)!.confidence.startsWith('Confidence: Low.') && aiReading(supplier, TODAY + 1)!.text.includes(fixture.copy.projectionTrend), 'Projection reading includes trend and Low confidence')
for (let i = 0; i <= LAST_STOP; i++) {
  for (const domain of [null, ...DOMAINS]) {
    const rows = sortedRows(domain, i)
    check(rows.every((row, j) => j === 0 || rows[j - 1].ratio >= row.ratio), 'Fold rows sort worst first')
    const text = overview(domain, i)
    check(text.current.length > 0 && text.consider.length > 0 && text.forYou.length > 0, 'Every overview has all three sections')
    for (const row of rows) check(!aiSummary(row.name, i).includes('undefined'), 'All point summaries have complete copy')
  }
}
console.log('panel text checks pass')
