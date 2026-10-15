import { DOMAINS, TODAY, at, domainRatio, pointsAt, statusOf, stopName, topicRatio, worstTopic } from './model.ts'

const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
check(DOMAINS.length === 6, 'The Wheel has six domains')
check(pointsAt(null, TODAY).length === 6, 'The whole wheel has one point per domain')
check(pointsAt('Risk', TODAY).length === 8, 'The Risk wheel has one point per topic')
check(at([0, 1], 0.5) === 0.5 && at([0, 1], 9) === 1, 'Time interpolates and clamps')
check(statusOf(0.79) === 'within' && statusOf(0.8) === 'near' && statusOf(1) === 'near' && statusOf(1.01) === 'over', 'Near starts at 80%, over is past 100%')
for (const d of DOMAINS) check(domainRatio(d, TODAY) === topicRatio(worstTopic(d, TODAY), TODAY), `${d} takes its worst topic`)
check(stopName(TODAY) === 'Today', 'The today index names Today')
console.log('model checks pass')
