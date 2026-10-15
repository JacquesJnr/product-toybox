export type Domain =
  | 'Strategic direction'
  | 'Strategy execution'
  | 'Financial stewardship'
  | 'Risk and resilience'
  | 'Controls and assurance'
  | 'Major decisions'
  | 'Remuneration'

export interface Link {
  targetId: string
  reason: 'shared-content' | 'same-author' | 'cites'
}

export interface Insight {
  text: string
  tags: string[]
  pageRef: string
  confidence: number
}

export interface Doc {
  id: string
  title: string
  type: 'pdf' | 'video' | 'sheet' | 'image'
  issued: string
  from: string
  domains: Domain[]
  primaryDomain: Domain
  text: string
  links: Link[]
  summary: string
  insights: Insight[]
}

// shortcut: the old Wheel still compiles with this type; remove it when Wheel v2 replaces the UI.
export interface WheelRecord {
  documentId: string
  topic: string
  riskScore: number
  appetite: number
  rung: 'Within appetite' | 'Near the limit' | 'Over appetite'
  factors: { factor: string; weight: number; evidenceRef: { documentId: string; pageRef: string } }[]
}

export type WheelDomain = 'Finance' | 'Risk' | 'Audit' | 'Remuneration' | 'Legal' | 'Compliance'

// Values follow the fixture's six history stops, then its two AI projections.
export type WheelSeries = [number, number, number, number, number, number, number, number]

export interface WheelKri {
  name: string
  unit: string
  threshold: number
  values: WheelSeries
}

export interface WheelTopicRecord {
  topic: string
  appetite: number
  riskScore: WheelSeries
  appetiteStatement?: { text: string; source: string }
  kris?: WheelKri[]
  aiReading?: { text: string; source: string; confidence: 'Medium' | 'High' }
}

export interface WheelFixture {
  business: string
  todayIndex: number
  nearThresholdRatio: number
  timeframes: { label: string; note: string; projection: boolean }[]
  fullKriDomain: WheelDomain
  copy: {
    projectionNotice: string
    projectionSummary: string
    projectionTrend: string
    projectionConfidence: string
    readingResponsibility: string
    chairRole: string
    evidenceReminder: string
    projectionAgenda: string
    noOverThresholdAgenda: string
  }
  domains: { domain: WheelDomain; owner: string; topics: WheelTopicRecord[] }[]
}
