import { DOMAINS, LAST_STOP, TODAY, domainRatio, findTopic, fixture, isDomain, statusOf, stopName, topicsOf, worstTopic } from '../model.ts'
import type { WheelDomain, WheelTopicRecord } from '../../types.ts'

export const labels = { within: 'Within threshold', near: 'Near threshold', over: 'Over threshold' }
export const nearestStop = (t: number) => Math.max(0, Math.min(LAST_STOP, Math.round(t)))
export const percent = (ratio: number) => `${Math.round(ratio * 100)}%`
export const ratioOf = (name: string, i: number) => isDomain(name) ? domainRatio(name, i) : findTopic(name)!.riskScore[i]
const stopTitle = (i: number) => stopName(i) === 'Last board' ? 'Last Board' : stopName(i)
const listAnd = (names: string[]) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
export const sortedRows = (domain: WheelDomain | null, i: number) =>
  (domain ? topicsOf(domain).map(t => t.topic) : DOMAINS).map(name => ({ name, ratio: ratioOf(name, i) })).sort((a, b) => b.ratio - a.ratio)
export const worstKri = (topic: WheelTopicRecord, i: number) =>
  topic.kris?.reduce((a, b) => b.values[i] / b.threshold > a.values[i] / a.threshold ? b : a)

export function aiSummary(name: string | null, i: number) {
  if (fixture.timeframes[i].projection) return `AI projection for ${stopName(i)}. ${fixture.copy.projectionSummary}`
  if (!name) {
    const all = fixture.domains.flatMap(d => d.topics)
    const overDomains = DOMAINS.filter(d => ratioOf(d, i) > 1).length
    const worst = sortedRows(null, i)[0].name
    return `${fixture.business} has ${DOMAINS.length} governance domains and ${all.length} topics in the vault. ${i === TODAY ? 'Today, ' : `At ${stopTitle(i)}, `}${all.filter(t => t.riskScore[i] > 1).length} of ${all.length} topics are over threshold, in ${overDomains} ${overDomains === 1 ? 'domain' : 'domains'}. ${worst} is the domain furthest from its threshold.`
  }
  const nm = (j: number) => stopName(j) === 'Today' ? 'today' : stopName(j) === 'Last board' ? 'the last board meeting' : stopName(j)
  const ratio = ratioOf(name, i)
  let text = `${name} is at ${percent(ratio)} of threshold ${i === TODAY ? 'today' : `at ${nm(i)}`} (${labels[statusOf(ratio)].toLowerCase()}).`
  if (i > 0) {
    const delta = Math.round((ratio - ratioOf(name, i - 1)) * 100)
    text += delta === 0 ? ` No change since ${nm(i - 1)}.` : ` ${delta > 0 ? 'Up' : 'Down'} ${Math.abs(delta)} points since ${nm(i - 1)}.`
  }
  if (isDomain(name)) {
    const topics = topicsOf(name)
    text += ` ${topics.filter(t => t.riskScore[i] > 1).length} of ${topics.length} topics are over threshold. ${worstTopic(name, i).topic} sets the domain reading.`
  } else {
    const kri = worstKri(findTopic(name)!, i)
    if (kri) text += ` ${kri.name} sets the reading.`
  }
  return text
}

export function overview(domain: WheelDomain | null, i: number) {
  const names = domain ? topicsOf(domain).map(t => t.topic) : DOMAINS
  const projected = fixture.timeframes[i].projection
  const over = names.filter(n => ratioOf(n, i) > 1)
  const near = names.filter(n => ratioOf(n, i) >= fixture.nearThresholdRatio && ratioOf(n, i) <= 1)
  const unit = domain ? 'topics' : 'domains'
  const current = projected ? [fixture.copy.projectionNotice] : []
  current.push(`${over.length} of ${names.length} ${unit}${domain ? ` in ${domain}` : ''} ${over.length === 1 ? 'is' : 'are'} over threshold ${i === TODAY ? 'today' : `at ${stopTitle(i)}`}${over.length ? `: ${listAnd(over)}.` : '.'}`)
  if (near.length) current.push(`${listAnd(near)} ${near.length === 1 ? 'is' : 'are'} near ${near.length === 1 ? 'its' : 'their'} threshold.`)
  if (i > 0) {
    const move = names.map(name => ({ name, delta: Math.round((ratioOf(name, i) - ratioOf(name, i - 1)) * 100) })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0]
    if (move.delta) current.push(`${move.name} moved ${move.delta > 0 ? 'up' : 'down'} ${Math.abs(move.delta)} points since ${stopTitle(i - 1)}.`)
  }
  const consider = over.map(name => {
    if (!domain) return `Ask for the plan to bring ${worstTopic(name as WheelDomain, i).topic} back under its threshold.`
    const kri = worstKri(findTopic(name)!, i)
    if (!kri) return `Ask for the plan to bring ${name} back under its threshold.`
    const unit = kri.unit ? ` ${kri.unit}` : ''
    return `${name}: ${kri.name.charAt(0).toLowerCase()}${kri.name.slice(1)} is ${kri.values[i]}${unit}, against a threshold of ${kri.threshold}${unit}.`
  })
  if (near.length) consider.push(`Watch ${listAnd(near)}. ${near.length === 1 ? 'It' : 'They'} can go over threshold before the next board meeting.`)
  if (!over.length && !near.length) consider.push(`No ${unit.slice(0, -1)} needs attention now. Check that the thresholds are still correct.`)
  const forYou = []
  if (over.length) {
    forYou.push(`${fixture.copy.chairRole} Give board time to ${listAnd(domain ? over.slice(0, 2) : over)}${domain && over.length > 2 ? ' first' : ''}.`)
    const owner = fixture.domains.find(d => d.domain === (domain || over[0]))!.owner
    forYou.push(`Ask ${owner} for a short report on ${domain ? over[0] : worstTopic(over[0] as WheelDomain, i).topic} before the meeting.`)
  } else forYou.push(fixture.copy.noOverThresholdAgenda)
  forYou.push(projected ? fixture.copy.projectionAgenda : fixture.copy.evidenceReminder)
  return { title: domain ? `${domain} overview` : 'Board overview', current: current.join(' '), consider, forYou: forYou.join(' ') }
}

export function aiReading(topic: WheelTopicRecord, i: number) {
  if (!topic.kris || !topic.aiReading) return null
  const projected = fixture.timeframes[i].projection
  return {
    title: projected ? 'AI projection' : 'AI reading',
    text: `${topic.kris.filter(k => k.values[i] > k.threshold).length} of ${topic.kris.length} KRIs ${projected ? 'are projected to be' : 'are'} over threshold. ${projected ? fixture.copy.projectionTrend : ''}${topic.aiReading.text}`,
    source: topic.aiReading.source,
    confidence: `Confidence: ${projected ? fixture.copy.projectionConfidence : topic.aiReading.confidence}. ${fixture.copy.readingResponsibility}`,
  }
}
