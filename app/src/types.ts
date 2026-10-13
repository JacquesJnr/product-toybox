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

export interface WheelRecord {
  documentId: string
  topic: string
  riskScore: number
  appetite: number
  rung: 'Within appetite' | 'Near the limit' | 'Over appetite'
  factors: { factor: string; weight: number; evidenceRef: { documentId: string; pageRef: string } }[]
}
