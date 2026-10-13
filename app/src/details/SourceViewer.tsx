import { useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import type { Doc } from '../types'
import { DocumentPreview } from './DocumentPreview'
import './details.css'

const typeNames = { pdf: 'PDF', video: 'Video', sheet: 'Spreadsheet', image: 'Image' }

export function SourceViewer({ doc, open, onOpenChange, highlightRef }: {
  doc: Doc
  open: boolean
  onOpenChange(open: boolean): void
  highlightRef?: string
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  if (doc.id === 'employment-contracts') return null

  return (
    <Dialog.Root key={doc.id} open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="source-backdrop" />
        <Dialog.Viewport className="source-viewport">
          <Dialog.Popup className="source-viewer" initialFocus={() => {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
            return closeRef.current
          }} finalFocus={openerRef}>
            <header className="source-header"><div><span className="source-label">SOURCE DOCUMENT · {typeNames[doc.type]}</span><Dialog.Title>{doc.title}</Dialog.Title></div><Dialog.Close ref={closeRef} className="details-icon-button" aria-label="Close source viewer"><span className="material-symbols-rounded" aria-hidden="true">close</span></Dialog.Close></header>
            <Dialog.Description className="source-description">{doc.from} · {doc.issued}</Dialog.Description>
            <DocumentPreview doc={doc} highlightRef={highlightRef} />
            {highlightRef && <p className="source-highlight-reference">Evidence · {highlightRef}</p>}
            <div className="source-text"><p>{doc.text}</p></div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
