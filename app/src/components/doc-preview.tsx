import { motion } from 'motion/react'
import { Play, Sparkles } from 'lucide-react'
import type { Doc } from '@/types'

// A picture of the document on the stage surface. The document is still; the evidence
// mark is AI's, so it is the one thing that glows and breathes.

const breathe = { animate: { opacity: [0.55, 1, 0.55] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const } }
const glow = 'shadow-[0_0_10px_color-mix(in_oklch,var(--primary)_55%,transparent)]'

export function DocPreview({ doc, highlightRef, large = false }: { doc: Doc; highlightRef?: string; large?: boolean }) {
  const reference = highlightRef ?? doc.insights[0]?.pageRef
  const paper = `rounded-lg border border-border/60 bg-card shadow-soft ${large ? 'w-72 p-6' : 'w-36 p-3'}`
  const line = 'block h-[3px] rounded-full bg-hairline/70'

  return (
    <div role="img" aria-label={`${doc.type.toUpperCase()} preview of ${doc.title}; AI evidence highlighted${reference ? ` at ${reference}` : ''}`}
      className={`relative flex items-center justify-center overflow-hidden bg-stage ${large ? 'h-80 rounded-2xl' : 'h-44'}`}>

      {doc.type === 'pdf' && <div className={`${paper} flex flex-col gap-2`}>
        <span className="font-mono text-[8px] tracking-wider text-muted-foreground uppercase">{doc.issued}</span>
        <strong className={`font-heading leading-tight ${large ? 'text-base' : 'text-[11px]'}`}>{doc.title}</strong>
        {[92, 78, 96, 70, 94, 58, 84].map((width, index) => index === 2
          ? <motion.span key={index} {...breathe} className={`block h-[3px] rounded-full bg-primary ${glow}`} style={{ width: `${width}%` }} />
          : <span key={index} className={line} style={{ width: `${width}%` }} />)}
      </div>}

      {doc.type === 'video' && <div className={`${paper} flex flex-col gap-3`}>
        <div className={`flex items-center justify-center rounded-md bg-foreground/90 ${large ? 'h-36' : 'h-16'}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90"><Play size={14} className="ml-0.5 fill-foreground" /></span>
        </div>
        <div className="relative h-1.5 rounded-full bg-hairline/60">
          <motion.span {...breathe} className={`absolute top-0 left-[62%] h-1.5 w-[10%] rounded-full bg-primary ${glow}`} />
          <span className="absolute -top-1 left-[35%] h-3.5 w-0.5 rounded-full bg-foreground" />
        </div>
      </div>}

      {doc.type === 'sheet' && <div className={`${paper} grid grid-cols-3 gap-px overflow-hidden !p-0`}>
        {Array.from({ length: 18 }, (_, index) => index === 5
          ? <motion.span key={index} {...breathe} className={`bg-accent px-1.5 py-1 font-mono text-[9px] text-foreground ring-1 ring-primary ring-inset ${glow}`}>{reference}</motion.span>
          : <span key={index} className={`px-1.5 py-1 font-mono text-[9px] text-muted-foreground ${index < 3 ? 'bg-muted font-bold' : 'bg-card'} ${large ? 'h-8' : 'h-5'}`}>{index < 3 ? 'ABC'[index] : ''}</span>)}
      </div>}

      {doc.type === 'image' && <div className={`${paper} relative ${large ? 'h-56' : 'h-28'}`}>
        <span className={`${line} absolute top-[14%] left-[9%] w-[31%]`} /><span className={`${line} absolute top-[25%] left-[9%] w-[21%]`} />
        <span className={`${line} absolute top-[58%] left-[50%] w-[36%]`} /><span className={`${line} absolute top-[69%] left-[50%] w-[26%]`} />
        <span className={`${line} absolute top-[66%] left-[14%] w-[21%]`} />
        <motion.span {...breathe} className="absolute top-[47%] left-[45%] h-[34%] w-[46%] rounded-md border-[1.5px] border-dashed border-primary bg-primary/5" />
      </div>}

      {reference && <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] text-primary shadow-soft backdrop-blur-sm">
        <Sparkles size={10} />{reference}
      </span>}
    </div>
  )
}
