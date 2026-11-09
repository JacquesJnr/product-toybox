import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftRight, ArrowUpRight, ChevronRight, CirclePlus, Clock, CornerDownRight, FileSearch, Info, Network, Paperclip, AtSign, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextualAIBar } from '@/components/watermelon/contextual-ai-bar'
import { domainColor } from '@/components/domain-drawer'
import scriptsData from '../data/smart-search.json'
import type { Doc } from '../types'
import { Sphere } from './Sphere'
import './smart-search.css'

type Script = {
  question: string
  reads: string[]
  log: string[]
  answer: string
  foundLink: { source: string; target: string }
}

const scripts = scriptsData as Script[]
const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const
const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'
const dotColor = (docs: Doc[], title: string) => domainColor(docs.find(item => item.title === title)?.primaryDomain ?? 'Strategic direction')

export function SmartSearch({ docs, onOpenSource, onShowOnGraph }: {
  docs: Doc[]
  onOpenSource(documentId: string): void
  onShowOnGraph(link: { source: string; target: string }): void
}) {
  const [question, setQuestion] = useState('')
  const [runIndex, setRunIndex] = useState<number | null>(null)
  const [readCount, setReadCount] = useState(0)
  const [logCount, setLogCount] = useState(0)
  const [writingDone, setWritingDone] = useState(false)
  const script = runIndex === null ? null : scripts[runIndex]
  const reads = script?.reads.map(title => {
    const doc = docs.find(item => item.title === title)
    return { documentId: doc?.id ?? title, title }
  }) ?? []
  const phase = !script ? 'ask' : readCount === reads.length && logCount === script.log.length && writingDone ? 'answer' : 'reading'
  const readingIndex = phase === 'reading' && reads.length ? Math.min(readCount, reads.length - 1) : null

  useEffect(() => {
    if (runIndex === null) return
    const activeScript = scripts[runIndex]
    let completedReads = 0
    let shownLines = 1
    setReadCount(0)
    setLogCount(1)
    const readTimer = window.setInterval(() => {
      completedReads += 1
      setReadCount(completedReads)
      if (completedReads === activeScript.reads.length) window.clearInterval(readTimer)
    }, 1000)
    const logTimer = window.setInterval(() => {
      shownLines += 1
      setLogCount(shownLines)
      if (shownLines === activeScript.log.length) window.clearInterval(logTimer)
    }, 1100)
    return () => {
      window.clearInterval(readTimer)
      window.clearInterval(logTimer)
    }
  }, [runIndex])

  useEffect(() => {
    if (!script || readCount !== reads.length || logCount !== script.log.length) return
    const writingTimer = window.setTimeout(() => setWritingDone(true), 900)
    return () => window.clearTimeout(writingTimer)
  }, [script, readCount, logCount, reads.length])

  function startRun(index: number) {
    if (runIndex !== null) return
    setQuestion(scripts[index].question)
    setReadCount(0)
    setLogCount(0)
    setWritingDone(false)
    setRunIndex(index)
  }

  function submitQuestion() {
    const index = scripts.findIndex(item => item.question === question.trim())
    if (index >= 0) startRun(index)
  }

  return (
    <section className={`smart-search smart-search--${phase}`} aria-label="Smart Search">
      <AnimatePresence mode="wait" initial={false}>
      {phase === 'ask' ? (
        <motion.div key="ask" className="smart-search__ask" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING}>
          <p className={label}>Smart Search · reads across meaning</p>
          <ContextualAIBar defaultExpanded className="max-w-[760px]" placeholder="Ask across the whole vault"
            musicIcon={<Clock size={18} />} sparkleIcon={<Sparkles size={18} className="text-primary" />}
            tools={[<Paperclip key="a" size={18} />, <AtSign key="b" size={18} />]}
            value={question} onValueChange={setQuestion} onSubmit={submitQuestion}
            submitDisabled={!scripts.some(item => item.question === question.trim())} submitLabel="Run suggested question" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Suggested questions · the only runs in the toy</p>
            {/* Three chips fit the 948px column on one row, as in Figma 208:298 (issue #23). They wrap only when the stage is narrower. */}
            <div className="flex flex-wrap justify-center gap-2">
              {scripts.map((item, index) => <motion.button key={item.question} onClick={() => startRun(index)} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm shadow-soft hover:border-ring">
                <CornerDownRight size={14} className="text-muted-foreground" />{item.question}
              </motion.button>)}
            </div>
          </div>
        </motion.div>
      ) : script && (
        <motion.aside key="chat" aria-label="Smart Search agent chat" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}
          className="smart-search__chat flex flex-col gap-3 overflow-y-auto rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
          <header className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h2 className="flex-1 font-heading text-base font-semibold">Smart Search</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">{phase === 'answer' ? 6 : readCount} sources read</span>
          </header>
          <p className="rounded-2xl bg-muted/60 px-4 py-2.5 text-sm">{script.question}</p>
          {phase === 'reading' ? <>
            <p className={label}>Working</p>
            <ScrollArea className="max-h-64"><div className="flex flex-col gap-2 pr-3" aria-live="polite">
              <AnimatePresence initial={false}>
                {script.log.slice(0, logCount).map((line, index) => <LogLine key={`${index}-${line}`} line={line} docs={docs} />)}
              </AnimatePresence>
            </div></ScrollArea>
            {logCount === script.log.length && <p className="text-sm text-muted-foreground">Writing the answer <span className="smart-search__caret" aria-hidden="true" /></p>}
          </> : <>
            <p className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground"><ChevronRight size={12} />Read 6 sources · used 2 tools</p>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
              className="ai-edge flex flex-col gap-3 rounded-2xl p-4 [--ai-fill:color-mix(in_oklch,var(--primary)_4%,var(--card))]">
              <h3 className="flex items-center gap-1.5 font-heading text-sm font-semibold"><Sparkles size={15} className="text-primary" />Answer</h3>
              <p className="text-sm leading-relaxed">{script.answer}</p>
            </motion.div>
            <h3 className={label}>Sources · 6</h3>
            <div className="flex flex-wrap gap-1.5">
              {reads.map(read => <button key={read.documentId} onClick={() => onOpenSource(read.documentId)}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs hover:border-ring">
                <span className="size-1.5 rounded-full" style={{ background: dotColor(docs, read.title) }} aria-hidden="true" />
                {read.title}<ArrowUpRight size={12} className="text-muted-foreground" />
              </button>)}
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-muted/60 p-3" aria-label={`New connection: ${script.foundLink.source} to ${script.foundLink.target}`}>
              <p className={label}>New connection · found by meaning, not on the graph yet</p>
              <div className="flex h-2 items-center gap-1"><span className="smart-search__diamond" /><span className="h-px flex-1 ai-glow" style={{ background: 'var(--ai-gradient)' }} /><span className="smart-search__diamond" /></div>
              <footer className="flex justify-between text-xs"><span>{script.foundLink.source}</span><span>{script.foundLink.target}</span></footer>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => onShowOnGraph(script.foundLink)}><Network />Show on the graph</Button>
              <Button variant="outline" disabled><CirclePlus />Create a query</Button>
              <span className="font-mono text-[10px] text-muted-foreground">↳ Leads into the query toy</span>
            </div>
          </>}
        </motion.aside>
      )}
      </AnimatePresence>
      <div className="smart-search__sphere">
        <Sphere phase={phase} reads={reads} readingIndex={readingIndex} />
      </div>
    </section>
  )
}

function LogLine({ line, docs }: { line: string; docs: Doc[] }) {
  const [kind, text, lead] = line.startsWith('Reading ') ? ['Reading', line.slice(8), <span className="size-1.5 rounded-full" style={{ background: dotColor(docs, line.slice(8)) }} />]
    : line.startsWith('Tool · ') ? ['Tool', line.slice(7), <FileSearch size={14} />]
    : line.startsWith('Comparing ') ? ['Comparing', line.slice(10), <ArrowLeftRight size={14} />]
    : ['', line, <Info size={14} />]
  return <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
    className="grid grid-cols-[16px_72px_minmax(0,1fr)] items-center gap-2 text-xs">
    <span className="grid place-items-center text-muted-foreground">{lead}</span>
    <span className="font-mono text-[10px] text-muted-foreground">{kind}</span><span>{text}</span>
  </motion.div>
}
