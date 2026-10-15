import wheels from '../data/wheels.json' with { type: 'json' }
import type { WheelDomain, WheelFixture, WheelTopicRecord } from '../types'

export const fixture = wheels as WheelFixture
export const DOMAINS: WheelDomain[] = fixture.domains.map(d => d.domain)
export const TODAY = fixture.todayIndex
export const LAST_STOP = fixture.timeframes.length - 1

export type Status = 'within' | 'near' | 'over'
export type TimeMode = 'history' | 'projection'
export type DrawerView = 'history' | 'playback'

// Shared Wheel state. WheelView owns it; the chart, drawer and panel only read it and call the actions.
// `t` is continuous time over the timeframe stops (0..LAST_STOP); playback moves it through fractions.
// `picked` is a domain name on the whole wheel, or a topic name on a domain wheel.
export interface WheelState {
  domain: WheelDomain | null
  picked: string | null
  t: number
  mode: TimeMode
  drawerView: DrawerView
  drawerOpen: boolean
}

export interface WheelActions {
  setDomain(domain: WheelDomain | null): void
  pick(name: string | null): void
  setTime(t: number): void
  setMode(mode: TimeMode): void
  setDrawerView(view: DrawerView): void
  setDrawerOpen(open: boolean): void
}

export interface Point { name: string; domain: WheelDomain; ratio: number; status: Status }

export function at(series: readonly number[], t: number) {
  const c = Math.max(0, Math.min(series.length - 1, t))
  const i = Math.min(Math.floor(c), series.length - 2)
  return series[i] + (series[i + 1] - series[i]) * (c - i)
}

export const statusOf = (ratio: number): Status =>
  ratio > 1 ? 'over' : ratio >= fixture.nearThresholdRatio ? 'near' : 'within'

export const topicsOf = (domain: WheelDomain): WheelTopicRecord[] =>
  fixture.domains.find(d => d.domain === domain)?.topics ?? []

export const domainOfTopic = (topic: string) =>
  fixture.domains.find(d => d.topics.some(x => x.topic === topic))?.domain

export const findTopic = (topic: string) =>
  fixture.domains.flatMap(d => d.topics).find(x => x.topic === topic)

export const isDomain = (name: string): name is WheelDomain => (DOMAINS as string[]).includes(name)

// A topic with KRIs reads as its worst KRI, each interpolated before the max, so a reading between stops never jumps status.
export const topicRatio = (topic: WheelTopicRecord, t: number) =>
  topic.kris?.length ? Math.max(...topic.kris.map(k => at(k.values, t) / k.threshold)) : at(topic.riskScore, t)

// Worst reading wins: a domain takes the reading of its topic furthest over its threshold.
export function worstTopic(domain: WheelDomain, t: number) {
  return topicsOf(domain).reduce((a, b) => (topicRatio(b, t) > topicRatio(a, t) ? b : a))
}

export const domainRatio = (domain: WheelDomain, t: number) => topicRatio(worstTopic(domain, t), t)

// Whole wheel: one point per domain. Domain wheel: one point per topic.
export function pointsAt(domain: WheelDomain | null, t: number): Point[] {
  if (!domain) return DOMAINS.map(d => { const ratio = domainRatio(d, t); return { name: d, domain: d, ratio, status: statusOf(ratio) } })
  return topicsOf(domain).map(x => { const ratio = topicRatio(x, t); return { name: x.topic, domain, ratio, status: statusOf(ratio) } })
}

// First line of a timeframe label: "Today", "Last board", "Q4 2026".
export const stopName = (i: number) => fixture.timeframes[i].label.split('\n')[0]
export const isProjection = (i: number) => fixture.timeframes[i].projection
