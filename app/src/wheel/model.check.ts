import { DOMAINS, TODAY, at, findTopic, domainRatio, pointsAt, statusOf, stopName, topicRatio, worstTopic } from './model.ts'

const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
check(DOMAINS.length === 6, 'The Wheel has six domains')
check(pointsAt(null, TODAY).length === 6, 'The whole wheel has one point per domain')
check(pointsAt('Risk', TODAY).length === 8, 'The Risk wheel has one point per topic')
check(at([0, 1], 0.5) === 0.5 && at([0, 1], 9) === 1, 'Time interpolates and clamps')
check(statusOf(0.79) === 'within' && statusOf(0.8) === 'near' && statusOf(1) === 'near' && statusOf(1.01) === 'over', 'Near starts at 80%, over is past 100%')
for (const d of DOMAINS) check(domainRatio(d, TODAY) === topicRatio(worstTopic(d, TODAY), TODAY), `${d} takes its worst topic`)
check(stopName(TODAY) === 'Today', 'The today index names Today')
const emerging = findTopic('Emerging risks')!
check(Math.abs(topicRatio(emerging, 2.5) - 0.9167) < 0.001, 'KRIs interpolate before the max: Emerging risks at t=2.5 is near, not over')
for (const d of DOMAINS) for (const x of pointsAt(d, 0)) for (let i = 0; i <= 7; i++) {
  const topic = findTopic(x.name)!
  check(Math.abs(topicRatio(topic, i) - topic.riskScore[i]) < 1e-9, `${x.name} matches its fixture score at stop ${i}`)
}
console.log('model checks pass')
