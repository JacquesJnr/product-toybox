import { useId, useState } from 'react'
import { Button } from '@base-ui/react/button'
import type { Doc } from '../types'
import documents from '../data/documents.json'
import insightMark from './ai-insight.svg'
import { DocumentPreview } from './DocumentPreview'
import { SourceViewer } from './SourceViewer'
import './details.css'

const typeNames = { pdf: 'PDF', video: 'Video', sheet: 'Spreadsheet', image: 'Image' }

export function DetailsPanel({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const titleId = useId()
  const [source, setSource] = useState<{ documentId: string; pageRef?: string } | null>(null)
  const sourceOpen = source?.documentId === doc.id
  const missing = doc.id === 'employment-contracts'
  const linkedTitles = doc.links.map((link) => documents.find((item) => item.id === link.targetId)?.title ?? link.targetId)
  const metadata = [
    ['type', `${doc.title} · ${typeNames[doc.type]}`],
    ['issued', doc.issued || '—'],
    ['from', doc.from || '—'],
    ['linked to', (linkedTitles.length > 3 ? `${linkedTitles.slice(0, 2).join(', ')}, +${linkedTitles.length - 2}` : linkedTitles.join(', ')) || '—'],
    ['domain', doc.domains.join(', ')],
  ]

  return (
    <>
      <aside className="details-panel" aria-labelledby={titleId}>
        <header className="details-topline">
          <span>PICKED DOCUMENT</span>
          <Button className="details-icon-button" aria-label="Close details" onClick={onClose}><span className="material-symbols-rounded" aria-hidden="true">close</span></Button>
        </header>
        <h2 id={titleId}>{doc.title}</h2>
        {missing ? <p className="details-missing">Not in the vault</p> : (
          <div className="details-preview-wrap">
            <DocumentPreview doc={doc} />
            <Button className="details-open" aria-haspopup="dialog" aria-expanded={sourceOpen} onClick={() => setSource({ documentId: doc.id })}>Open <span className="details-arrow" aria-hidden="true">↗</span></Button>
          </div>
        )}
        <dl className="details-metadata">
          {metadata.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
        </dl>
        {!missing && <>
          <section className="details-summary" aria-label="Summary"><h3>Summary</h3><p>{doc.summary}</p></section>
          <section className="details-insights" aria-label="Insights">
            <h3>Insights · {doc.insights.length}</h3>
            {doc.insights.map((insight, index) => (
              <article className="details-insight" key={`${doc.id}-${index}`}>
                <div className="insight-label"><img src={insightMark} alt="" />AI insight</div>
                <p>{insight.text}</p>
                <div className="insight-tags">{insight.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="insight-reference"><Button className="insight-page" aria-haspopup="dialog" aria-expanded={sourceOpen} aria-label={`Open ${doc.title}, ${insight.pageRef}`} onClick={() => setSource({ documentId: doc.id, pageRef: insight.pageRef })}>{insight.pageRef} ↗</Button><span>confidence {insight.confidence.toFixed(2)}</span></div>
              </article>
            ))}
          </section>
        </>}
      </aside>
      {!missing && <SourceViewer doc={doc} open={sourceOpen} onOpenChange={(open) => { if (!open) setSource(null) }} highlightRef={source?.pageRef} />}
    </>
  )
}
