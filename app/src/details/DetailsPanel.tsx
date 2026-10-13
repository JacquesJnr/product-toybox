import { useId } from 'react'
import { Button } from '@base-ui/react/button'
import { Dialog } from '@base-ui/react/dialog'
import type { Doc } from '../types'
import documents from '../data/documents.json'
import insightMark from './ai-insight.svg'
import { DocumentPreview } from './DocumentPreview'
import './details.css'

const typeNames = { pdf: 'PDF', video: 'Video', sheet: 'Spreadsheet', image: 'Image' }

export function DetailsPanel({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const titleId = useId()
  const missing = doc.id === 'employment-contracts'
  const linkedTitles = doc.links.map((link) => documents.find((item) => item.id === link.targetId)?.title ?? link.targetId)
  const metadata = [
    ['type', `${doc.title} · ${typeNames[doc.type]}`],
    ['issued', doc.issued || '—'],
    ['from', doc.from || '—'],
    ['linked to', linkedTitles.join(', ') || '—'],
    ['domain', doc.domains.join(', ')],
  ]

  return (
    <Dialog.Root key={doc.id}>
      <aside className="details-panel" aria-labelledby={titleId}>
        <header className="details-topline">
          <span>PICKED DOCUMENT</span>
          <Button className="details-icon-button" aria-label="Close details" onClick={onClose}><span className="material-symbols-rounded" aria-hidden="true">close</span></Button>
        </header>
        <h2 id={titleId}>{doc.title}</h2>
        {missing ? <p className="details-missing">Not in the vault</p> : (
          <div className="details-preview-wrap">
            <DocumentPreview doc={doc} />
            <Dialog.Trigger className="details-open">Open <span className="details-arrow" aria-hidden="true">↗</span></Dialog.Trigger>
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
                <div className="insight-reference"><Dialog.Trigger className="insight-page" aria-label={`Open ${doc.title}, ${insight.pageRef}`}>{insight.pageRef} ↗</Dialog.Trigger><span>confidence {insight.confidence.toFixed(2)}</span></div>
              </article>
            ))}
          </section>
        </>}
      </aside>
      {!missing && <Dialog.Portal>
        <Dialog.Backdrop className="source-backdrop" />
        <Dialog.Viewport className="source-viewport">
          <Dialog.Popup className="source-viewer">
            <header className="source-header"><div><span className="source-label">SOURCE DOCUMENT · {typeNames[doc.type]}</span><Dialog.Title>{doc.title}</Dialog.Title></div><Dialog.Close className="details-icon-button" aria-label="Close source viewer"><span className="material-symbols-rounded" aria-hidden="true">close</span></Dialog.Close></header>
            <Dialog.Description className="source-description">{doc.from} · {doc.issued}</Dialog.Description>
            <DocumentPreview doc={doc} />
            <div className="source-text"><p>{doc.text}</p></div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>}
    </Dialog.Root>
  )
}
