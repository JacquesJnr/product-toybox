import type { Doc } from '../types'

export function DocumentPreview({ doc }: { doc: Doc }) {
  const reference = doc.insights[0]?.pageRef
  return (
    <div className={`document-preview preview-${doc.type}`} role="img" aria-label={`${doc.type.toUpperCase()} preview of ${doc.title}; AI evidence highlighted${reference ? ` at ${reference}` : ''}`}>
      {doc.type === 'pdf' && (
        <div className="preview-paper" aria-hidden="true">
          <span className="preview-issued">{doc.issued}</span>
          <strong>{doc.title}</strong>
          {[96, 80, 96, 70, 96, 60].map((width, index) => <span key={index} className={`preview-line ${index === 2 ? 'evidence-line' : ''}`} style={{ width }} />)}
        </div>
      )}
      {doc.type === 'video' && (
        <div className="preview-recording" aria-hidden="true">
          <div className="preview-video-frame"><span className="material-symbols-rounded">play_arrow</span></div>
          <div className="preview-timeline"><span className="timeline-evidence" /><span className="timeline-position" /></div>
        </div>
      )}
      {doc.type === 'sheet' && (
        <div className="preview-sheet" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <span key={index} className={index === 5 ? 'evidence-cell' : ''}>{index < 3 ? ['A', 'B', 'C'][index] : index === 5 ? reference : ''}</span>)}
        </div>
      )}
      {doc.type === 'image' && (
        <div className="preview-image" aria-hidden="true">
          <span className="image-line image-line-one" /><span className="image-line image-line-two" />
          <span className="image-line image-line-three" /><span className="image-line image-line-four" />
          <span className="image-line image-line-five" /><span className="image-evidence" />
        </div>
      )}
    </div>
  )
}
