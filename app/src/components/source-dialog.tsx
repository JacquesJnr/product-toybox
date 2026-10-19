import { Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Doc } from '@/types'
import { DocPreview } from './doc-preview'

// The source document, opened from the panel. Same ladder as the panel: a header band,
// the preview on the stage, AI's evidence callout, then the document text.

const TYPE = { pdf: 'PDF', video: 'Video', sheet: 'Spreadsheet', image: 'Image' }

export function SourceDialog({ doc, open, onOpenChange, highlightRef }: { doc: Doc; open: boolean; onOpenChange: (open: boolean) => void; highlightRef?: string }) {
  const insight = highlightRef ? doc.insights.find(item => item.pageRef === highlightRef) : undefined
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-3xl bg-card p-0 shadow-soft sm:max-w-2xl">
        <header className="flex flex-col gap-2 bg-muted/50 px-6 pt-5 pb-5">
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Source document · {TYPE[doc.type]}</span>
          <DialogTitle className="font-heading text-2xl leading-tight font-semibold">{doc.title}</DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-foreground">{doc.from} · {doc.issued}</DialogDescription>
        </header>
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6">
          <DocPreview doc={doc} highlightRef={highlightRef} large />
          {highlightRef && <div className="flex gap-3 rounded-2xl border border-primary/20 bg-accent/40 p-4">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">AI evidence · {highlightRef}</span>
              {insight && <p className="text-sm leading-snug">{insight.text}</p>}
            </div>
          </div>}
          <div className="border-t border-border pt-5 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">{doc.text}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
