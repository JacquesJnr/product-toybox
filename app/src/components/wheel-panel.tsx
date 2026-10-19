import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Collapsible } from '@base-ui/react/collapsible'
import { ArrowRight, ArrowUpRight, BrainCircuit, ChevronLeft, ChevronRight, MessageSquare, PanelRightClose, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { domainOfTopic, findTopic, fixture, isDomain, isProjection, statusOf, topicsOf } from '@/wheel/model'
import type { Status, WheelActions, WheelState } from '@/wheel/model'
import { aiReading, aiSummary, labels, nearestStop, overview, percent, ratioOf, sortedRows, worstKri } from '@/wheel/panel/text'
import logo from '@/wheel/panel/acme-logo.svg'
import { wheelHue, wheelIcon } from './wheel-domain-picker'

// The Wheel's side panel in the DocPanel and RiskCard style: overview, domain and topic views.
// The vault part (status, statement, KRIs, sources) is still; the AI part (summary, reading) is tinted and moves in.
// Same content and actions as wheel/panel/WheelPanel.

const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const
const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'
const text: Record<Status, string> = { within: 'text-status-within', near: 'text-status-near', over: 'text-status-over' }
const bg: Record<Status, string> = { within: 'bg-status-within', near: 'bg-status-near', over: 'bg-status-over' }
const SEGMENTS = 40

function Source({ text }: { text: string }) {
  return <a role="link" aria-disabled="true" className="inline-flex items-center gap-1 self-start font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{text}<ArrowUpRight size={11} /></a>
}

function KriBar({ value, threshold }: { value: number; threshold: number }) {
  const scale = Math.max(threshold * 1.5, value)
  return (
    <div className="relative flex h-3 gap-px" aria-hidden="true">
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const at = ((i + 0.5) / SEGMENTS) * scale
        return <span key={i} className={`flex-1 rounded-full ${at <= value ? bg[statusOf(at / threshold)] : 'bg-secondary'}`} />
      })}
      <span className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-foreground" style={{ left: `${(threshold / scale) * 100}%` }} />
    </div>
  )
}

export function WheelSidePanel({ state, actions, onCollapse }: { state: WheelState; actions: WheelActions; onCollapse?: () => void }) {
  const [domainsOpen, setDomainsOpen] = useState(false)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const i = nearestStop(state.t)
  const projected = isProjection(i)
  const name = state.picked || state.domain
  useLayoutEffect(() => {
    scroller.current?.scrollTo(0, 0)
    if (document.activeElement === document.body) scroller.current?.querySelector('h2')?.focus({ preventScroll: true })
  }, [name])
  const domain = name ? isDomain(name) ? name : domainOfTopic(name)! : null
  const topic = name && !isDomain(name) ? findTopic(name) : undefined
  const rows = sortedRows(name ? domain : null, i)
  const over = rows.filter(r => r.ratio > 1).length
  const worst = rows[0]
  const ratio = name ? ratioOf(name, i) : worst.ratio
  const status = statusOf(ratio)
  const ov = overview(domain, i)
  const reading = topic ? aiReading(topic, i) : null
  const worstIndicator = topic ? worstKri(topic, i) : undefined
  const allTopics = fixture.domains.flatMap(d => d.topics).length
  const back = () => state.domain ? actions.setDomain(null) : actions.pick(null)
  const DomainIcon = domain ? wheelIcon(domain) : null
  const collapse = onCollapse && <button aria-label="Collapse details" title="Collapse details" onClick={onCollapse}
    className="-ml-1.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><PanelRightClose size={16} /></button>

  return (
    <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={SPRING} aria-label={name || `${fixture.business} governance vault`}
      className={`flex w-full flex-col overflow-hidden rounded-3xl shadow-soft transition-colors ${projected ? 'ai-edge' : 'border border-border/60 bg-card'}`}>
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <motion.div key={name ?? 'vault'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>

            <header className="flex flex-col gap-3 bg-muted/50 px-7 pt-6 pb-6">
              {!name ? <>
                <div className="flex items-center gap-1.5">{collapse}<span className={label}>Governance vault</span></div>
                <div className="flex items-center gap-3">
                  <img src={logo} alt="" width="40" height="40" className="rounded-xl" />
                  <h2 tabIndex={-1} className="font-heading text-2xl leading-tight font-semibold outline-none">{fixture.business}</h2>
                </div>
                <span className="text-xs text-muted-foreground">{fixture.domains.length} domains, {allTopics} topics</span>
              </> : <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">{collapse}
                    {!topic ? <button onClick={back} className="flex items-center gap-0.5 rounded-full py-0.5 pr-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><ChevronLeft size={14} />{fixture.business}</button>
                      : <span className={label}>Topic</span>}
                  </div>
                  {projected && <span className="ai-edge ai-glow flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-foreground"><Sparkles size={11} />AI projection</span>}
                </div>
                <h2 tabIndex={-1} className="font-heading text-2xl leading-tight font-semibold outline-none">{name}</h2>
                {domain && DomainIcon && (
                  <span className="flex items-center gap-1.5 self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white" style={{ background: wheelHue(domain) }}>
                    <DomainIcon size={12} />{topic ? domain : `Domain, ${topicsOf(domain).length} topics`}
                  </span>
                )}
              </>}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className={`text-xs font-semibold ${text[status]}`}>{projected ? 'Projected: ' : ''}{name ? labels[status] : over ? `${over} of ${rows.length} domains over threshold` : labels[status]}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{topic ? `worst KRI at ${percent(ratio)} of threshold` : `worst ${name ? 'topic' : 'domain'}: ${worst.name} at ${percent(ratio)}`}</span>
              </div>
            </header>

            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }}
              className="ai-edge m-6 flex flex-col gap-3 rounded-2xl p-5 [--ai-fill:color-mix(in_oklch,var(--accent)_30%,var(--card))]">
              <h3 className={`flex items-center gap-1.5 ${label}`}><Sparkles size={12} className="text-primary" />AI summary</h3>
              <p className="text-sm leading-relaxed">{aiSummary(name, i)}</p>
              <div className="grid grid-cols-2 gap-2 [&>*]:min-w-0">
                <Button variant="outline" size="sm" title="Not built in this prototype"><MessageSquare />Chat about this</Button>
                <Button variant="outline" size="sm" title="Not built in this prototype" disabled><BrainCircuit />Create a Query</Button>
              </div>
            </motion.section>

            <div className="flex flex-col gap-7 px-7 pb-8">
              <section className="flex flex-col gap-3">
                <h3 className={label}>{ov.title}</h3>
                <h4 className="text-sm font-semibold">Current state</h4>
                <p className="text-sm leading-relaxed">{ov.current}</p>
                <h4 className="text-sm font-semibold">What to consider</h4>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">{ov.consider.map(item => <li key={item}>{item}</li>)}</ul>
                <div className="mt-1 flex flex-col gap-1.5 rounded-2xl bg-muted/50 p-4">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold"><UserRound size={14} />For you</h4>
                  <p className="text-sm leading-relaxed">{ov.forYou}</p>
                </div>
              </section>

              {!topic && <section className="flex flex-col gap-3 border-t border-border pt-6">
                <Collapsible.Root open={name ? topicsOpen : domainsOpen} onOpenChange={name ? setTopicsOpen : setDomainsOpen}>
                  <h3 className="m-0">
                    <Collapsible.Trigger className="group flex min-h-8 w-full items-center justify-between rounded-lg text-left">
                      <span className={label}>{name ? 'Topics' : 'Domains'}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">{rows.length} {name ? 'topics' : 'domains'}{over ? `, ${over} over` : ''}<ChevronRight size={14} className="transition-transform group-data-[panel-open]:rotate-90" /></span>
                    </Collapsible.Trigger>
                  </h3>
                  <Collapsible.Panel className="flex flex-col pt-1">
                    {rows.map(row => {
                      const RowIcon = !name && isDomain(row.name) ? wheelIcon(row.name) : null
                      return (
                        <div key={row.name} className="flex items-center justify-between gap-4 border-t border-border/60 py-2 text-sm">
                          {name ? <span>{row.name}</span> : (
                            <button onClick={() => actions.pick(row.name)} className="flex items-center gap-2 rounded-full text-left hover:underline">
                              {RowIcon && isDomain(row.name) && <RowIcon size={14} style={{ color: wheelHue(row.name) }} />}{row.name}
                            </button>
                          )}
                          <span className={`font-mono text-[11px] ${text[statusOf(row.ratio)]}`}>{percent(row.ratio)}</span>
                        </div>
                      )
                    })}
                  </Collapsible.Panel>
                </Collapsible.Root>
                {!state.domain && name && domain === fixture.fullKriDomain && <Button variant="outline" className="self-start" onClick={() => actions.setDomain(domain)}><ArrowRight />Open the {domain} wheel</Button>}
                {!state.domain && name && domain !== fixture.fullKriDomain && <p className="text-xs text-muted-foreground">Full KRI data in this example covers {fixture.fullKriDomain} only.</p>}
              </section>}

              {topic && !topic.kris && <p className="border-t border-border pt-6 text-xs text-muted-foreground">This example has full KRI data only for {fixture.fullKriDomain}. Open that domain to see the statement, the KRIs and the AI reading for each topic.</p>}

              {topic?.appetiteStatement && <section className="flex flex-col gap-3 border-t border-border pt-6">
                <h3 className={label}>Appetite statement</h3>
                <blockquote className="text-sm leading-relaxed">“{topic.appetiteStatement.text}”</blockquote>
                <Source text={topic.appetiteStatement.source} />
              </section>}

              {topic?.kris && <section className="flex flex-col gap-5 border-t border-border pt-6">
                <h3 className={label}>KRIs</h3>
                {topic.kris.map(kri => {
                  const value = kri.values[i], unit = kri.unit ? ` ${kri.unit}` : ''
                  const kriStatus = statusOf(value / kri.threshold)
                  return (
                    <div key={kri.name} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm">{kri.name}</span>
                        <span className="font-mono text-[11px] whitespace-nowrap text-muted-foreground"><b className="text-foreground">{value}{unit}</b> / {kri.threshold}{unit}</span>
                      </div>
                      <KriBar value={value} threshold={kri.threshold} />
                      <div className={`flex justify-between text-[10px] font-bold tracking-wider uppercase ${text[kriStatus]}`}>
                        <span>{labels[kriStatus]}</span>
                        {kri === worstIndicator && <span className="text-muted-foreground">Sets the topic reading</span>}
                      </div>
                    </div>
                  )
                })}
              </section>}

              {reading && <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}
                className="ai-edge flex flex-col gap-3 rounded-2xl p-5 [--ai-fill:color-mix(in_oklch,var(--accent)_30%,var(--card))]">
                <h3 className={`flex items-center gap-1.5 ${label}`}><Sparkles size={12} className="text-primary" />{reading.title}</h3>
                <p className="text-sm leading-relaxed">{reading.text}</p>
                <Source text={reading.source} />
                <p className="text-[11px] text-muted-foreground">{reading.confidence}</p>
              </motion.section>}
            </div>
        </motion.div>
      </div>
    </motion.aside>
  )
}
