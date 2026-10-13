import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { Field } from '@base-ui/react/field'
import { ScrollArea } from '@base-ui/react/scroll-area'
import { Input } from '@base-ui/react/input'
import scriptsData from '../data/smart-search.json'
import type { Doc, Domain } from '../types'
import { Sphere } from './Sphere'
import sendArrow from './send-arrow.svg'
import './smart-search.css'

type Script = {
  question: string
  reads: string[]
  log: string[]
  answer: string
  foundLink: { source: string; target: string }
}

const scripts = scriptsData as Script[]
const domainColors: Record<Domain, string> = {
  'Strategic direction': 'var(--domain-strategic-direction)',
  'Strategy execution': 'var(--domain-strategy-execution)',
  'Financial stewardship': 'var(--domain-financial-stewardship)',
  'Risk and resilience': 'var(--domain-risk-resilience)',
  'Controls and assurance': 'var(--domain-controls-assurance)',
  'Major decisions': 'var(--domain-major-decisions)',
  Remuneration: 'var(--domain-remuneration)',
}

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

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const index = scripts.findIndex(item => item.question === question.trim())
    if (index >= 0) startRun(index)
  }

  return (
    <section className={`smart-search smart-search--${phase}`} aria-label="Smart Search">
      {phase === 'ask' ? (
        <div className="smart-search__ask">
          <p className="smart-search__eyebrow">SMART SEARCH · READS ACROSS MEANING</p>
          <form className="smart-search__form" onSubmit={submitQuestion}>
            <Field.Root className="smart-search__field">
              <Field.Label className="visually-hidden">Ask across the whole vault</Field.Label>
              <span className="material-symbols-rounded smart-search__sparkle" aria-hidden="true">auto_awesome</span>
              <Input value={question} onValueChange={setQuestion} placeholder="Ask across the whole vault" aria-label="Ask across the whole vault" />
              <Button className="smart-search__send" type="submit" disabled={!scripts.some(item => item.question === question.trim())} aria-label="Run suggested question">
                <img src={sendArrow} alt="" />
              </Button>
            </Field.Root>
          </form>
          <div className="smart-search__suggestions">
            <p>Suggested questions · the only runs in the toy</p>
            <div className="smart-search__suggestion-list">
              {scripts.map((item, index) => <Button className="smart-search__suggestion" key={item.question} onClick={() => startRun(index)}>
                <span className="material-symbols-rounded" aria-hidden="true">subdirectory_arrow_right</span>{item.question}
              </Button>)}
            </div>
          </div>
        </div>
      ) : script && (
        <aside className="smart-search__chat" aria-label="Smart Search agent chat">
          <header className="smart-search__chat-header">
            <span className="material-symbols-rounded smart-search__chat-sparkle" aria-hidden="true">auto_awesome</span>
            <h2>Smart Search</h2>
            <span className="smart-search__counter">{phase === 'answer' ? '6 sources read' : `${readCount} sources read`}</span>
          </header>
          <p className="smart-search__question">{script.question}</p>
          {phase === 'reading' ? <>
            <hr />
            <p className="smart-search__working">WORKING</p>
            <ScrollArea.Root className="smart-search__log-scroll"><ScrollArea.Viewport className="smart-search__log" aria-live="polite">
              {script.log.slice(0, logCount).map((line, index) => <LogLine key={`${index}-${line}`} line={line} docs={docs} />)}
            </ScrollArea.Viewport></ScrollArea.Root>
            {logCount === script.log.length && <p className="smart-search__writing">Writing the answer <span aria-hidden="true" /></p>}
          </> : <>
            <p className="smart-search__read-summary">▸ Read 6 sources · used 2 tools</p>
            <hr />
            <h3 className="smart-search__answer-heading"><span className="material-symbols-rounded" aria-hidden="true">auto_awesome</span>Answer</h3>
            <p className="smart-search__answer">{script.answer}</p>
            <h3 className="smart-search__sources-heading">Sources · 6</h3>
            <div className="smart-search__source-list">
              {reads.map(read => {
                const doc = docs.find(item => item.id === read.documentId)
                return <Button key={read.documentId} className="smart-search__source" onClick={() => onOpenSource(read.documentId)}>
                  <span className="smart-search__source-dot" style={{ background: domainColors[doc?.primaryDomain ?? 'Strategic direction'] }} aria-hidden="true" />
                  {read.title}<span className="smart-search__source-arrow" aria-hidden="true">↗</span>
                </Button>
              })}
            </div>
            <div className="smart-search__connection" aria-label={`New connection: ${script.foundLink.source} to ${script.foundLink.target}`}>
              <p>NEW CONNECTION · found by meaning, not on the graph yet</p>
              <div><span className="smart-search__diamond" /> <span className="smart-search__rainbow-link" /> <span className="smart-search__diamond" /></div>
              <footer><span>{script.foundLink.source}</span><span>{script.foundLink.target}</span></footer>
            </div>
            <div className="smart-search__actions">
              <Button className="smart-search__action" onClick={() => onShowOnGraph(script.foundLink)}>
                <span className="material-symbols-rounded" aria-hidden="true">hub</span>Show on the graph
              </Button>
              <Button className="smart-search__action" disabled>
                <span className="material-symbols-rounded" aria-hidden="true">add_circle</span>Create a query
              </Button>
              <span className="smart-search__query-note">↳ Leads into the query toy</span>
            </div>
          </>}
        </aside>
      )}
      <div className="smart-search__sphere">
        <Sphere phase={phase} reads={reads} readingIndex={readingIndex} />
      </div>
    </section>
  )
}

function LogLine({ line, docs }: { line: string; docs: Doc[] }) {
  if (line.startsWith('Reading ')) {
    const title = line.slice('Reading '.length)
    const doc = docs.find(item => item.title === title)
    return <div className="smart-search__log-line"><span className="smart-search__log-dot" style={{ background: domainColors[doc?.primaryDomain ?? 'Strategic direction'] }} />
      <span className="smart-search__log-kind">Reading</span><span>{title}</span>
    </div>
  }
  if (line.startsWith('Tool · ')) return <div className="smart-search__log-line">
    <span className="material-symbols-rounded" aria-hidden="true">manage_search</span><span className="smart-search__log-kind">Tool</span><span>{line.slice('Tool · '.length)}</span>
  </div>
  const comparison = line.startsWith('Comparing ')
  return <div className="smart-search__log-line">
    <span className="material-symbols-rounded" aria-hidden="true">{comparison ? 'compare_arrows' : 'info'}</span>
    <span className="smart-search__log-kind">{comparison ? 'Comparing' : ''}</span><span>{comparison ? line.slice('Comparing '.length) : line}</span>
  </div>
}
