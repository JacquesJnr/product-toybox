import { useId } from 'react'
import { Button } from '@base-ui/react/button'
import { Meter } from '@base-ui/react/meter'
import documents from '../data/documents.json'
import type { Doc, WheelRecord } from '../types'
import { wheelTopics } from '../wheel-topics'
import rungDot from './rung-dot.svg'
import './risk.css'

const rungColors = {
  'Within appetite': 'var(--risk-within)',
  'Near the limit': 'var(--risk-near)',
  'Over appetite': 'var(--risk-over)',
}
const domainColors = {
  'Strategic direction': 'var(--domain-strategic-direction)',
  'Strategy execution': 'var(--domain-strategy-execution)',
  'Financial stewardship': 'var(--domain-financial-stewardship)',
  'Risk and resilience': 'var(--domain-risk-resilience)',
  'Controls and assurance': 'var(--domain-controls-assurance)',
  'Major decisions': 'var(--domain-major-decisions)',
  'Remuneration': 'var(--domain-remuneration)',
}

export function RiskSummary({ record, doc, onClose, onOpenEvidence }: {
  record: WheelRecord
  doc: Doc
  onClose(): void
  onOpenEvidence(documentId: string, pageRef: string): void
}) {
  const titleId = useId()
  const domain = Object.entries(wheelTopics).find(([, topics]) => (topics as readonly string[]).includes(record.topic))?.[0] as keyof typeof domainColors | undefined
  const scoreText = `score ${record.riskScore.toFixed(2)} · appetite ${record.appetite.toFixed(2)}`

  return (
    <aside className="risk-summary" aria-labelledby={titleId}>
      <header className="risk-topline">
        <span>RISK SUMMARY</span>
        <Button className="risk-close" aria-label="Close risk summary" onClick={onClose}><span className="material-symbols-rounded" aria-hidden="true">close</span></Button>
      </header>
      <h2 id={titleId}>{record.topic}</h2>
      <p className="risk-domain" style={{ color: domainColors[domain ?? doc.primaryDomain] }}>{domain ?? doc.primaryDomain}</p>
      <div className="risk-status">
        {record.rung === 'Over appetite' ? <img className="risk-rung-dot" src={rungDot} alt="" /> : <span className="risk-rung-dot" style={{ background: rungColors[record.rung] }} aria-hidden="true" />}
        <span className="risk-rung">{record.rung}</span>
        <span className="risk-score">{scoreText}</span>
      </div>
      <Meter.Root className="risk-gauge" value={record.riskScore} min={0} max={1} aria-label={`${record.topic} risk`} aria-valuetext={`${record.rung}; ${scoreText}`}>
        <Meter.Track className="risk-gauge-track">
          <span className="risk-band risk-band-within" /><span className="risk-band risk-band-near" /><span className="risk-band risk-band-over" />
          <Meter.Indicator className="risk-gauge-indicator" />
        </Meter.Track>
      </Meter.Root>
      <h3>Factors</h3>
      <table className="risk-factors">
        <colgroup><col className="risk-factor-column" /><col className="risk-weight-column" /><col className="risk-evidence-column" /></colgroup>
        <thead><tr><th scope="col">factor</th><th scope="col">weight</th><th scope="col">evidence</th></tr></thead>
        <tbody>{record.factors.map(({ factor, weight, evidenceRef }, index) => {
          const evidence = documents.find((item) => item.id === evidenceRef.documentId)
          const weightRung = weight < 0 ? 'Within appetite' : weight < 0.35 ? 'Near the limit' : 'Over appetite'
          return <tr key={index}>
            <td>{factor}</td>
            <td className="risk-weight" style={{ color: rungColors[weightRung] }}>{weight < 0 ? '−' : '+'}{Math.abs(weight).toFixed(2)}</td>
            <td><Button className="risk-evidence" aria-haspopup="dialog" onClick={() => onOpenEvidence(evidenceRef.documentId, evidenceRef.pageRef)}>{evidence?.title ?? evidenceRef.documentId}{evidenceRef.pageRef && ` · ${evidenceRef.pageRef}`} <span aria-hidden="true">↗</span></Button></td>
          </tr>
        })}</tbody>
      </table>
      <p className="risk-explanation">Why a node sits on its rung: the factors that put it there, each with the line of evidence behind it.</p>
    </aside>
  )
}
