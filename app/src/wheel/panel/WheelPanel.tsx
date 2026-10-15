import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@base-ui/react/button'
import { Collapsible } from '@base-ui/react/collapsible'
import { domainOfTopic, findTopic, fixture, isDomain, isProjection, statusOf, topicsOf } from '../model'
import type { WheelActions, WheelState } from '../model'
import { aiReading, aiSummary, labels, nearestStop, overview, percent, ratioOf, sortedRows, worstKri } from './text'
import logo from './acme-logo.svg'
import './panel.css'

const Icon = ({ name }: { name: string }) => <span className="material-symbols-rounded" aria-hidden="true">{name}</span>
const Source = ({ text }: { text: string }) => <a className="wp-source" role="link" aria-disabled="true"><span>{text}</span><span className="wp-mono">↗</span></a>

export function WheelPanel({ state, actions }: { state: WheelState; actions: WheelActions }) {
  const [domainsOpen, setDomainsOpen] = useState(false)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const i = nearestStop(state.t)
  const projected = isProjection(i)
  const name = state.picked || state.domain
  useLayoutEffect(() => {
    panel.current?.scrollTo(0, 0)
    if (document.activeElement === document.body) panel.current?.querySelector('h2')?.focus({ preventScroll: true })
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

  return <aside ref={panel} className={`wheel-panel${projected ? ' wp-projection' : ''}`} aria-label={name || `${fixture.business} governance vault`}>
    {!name && <header className="wp-banner">
      <img src={logo} alt="" width="48" height="48" />
      <h2 tabIndex={-1}>{fixture.business}</h2>
      <div className="wp-label">Governance vault, {fixture.domains.length} domains, {allTopics} topics</div>
    </header>}
    <div className={`wp-content${!name ? ' wp-vault' : ''}`}>
      {name && !topic && <Button className="wp-back" onClick={back}><Icon name="chevron_left" />{fixture.business}</Button>}
      {name && <header><h2 tabIndex={-1}>{name}</h2><div className="wp-label">{topic ? domain : `Domain, ${topicsOf(domain!).length} topics`}</div></header>}
      <div className="wp-status">
        <span className={`wp-${status}`}>{projected ? 'Projected: ' : ''}{name ? labels[status] : over ? `${over} of ${rows.length} domains over threshold` : labels[status]}</span>
        <span className="wp-mono">{topic ? `worst KRI at ${percent(ratio)} of threshold` : `worst ${name ? 'topic' : 'domain'}: ${worst.name} at ${percent(ratio)}`}</span>
      </div>
      <section className="wp-summary">
        <h3 className="wp-label"><Icon name="smart_toy" />AI Summary</h3>
        <p>{aiSummary(name, i)}</p>
        <div className="wp-actions">
          <Button className="wp-button" title="Not built in this prototype"><Icon name="chat" />Chat about this</Button>
          <Button className="wp-button" title="Not built in this prototype" disabled><Icon name="psychology" />Create a Query</Button>
        </div>
      </section>
      <section className="wp-section wp-overview">
        <h3>{ov.title}</h3>
        <h4>Current state</h4><p>{ov.current}</p>
        <h4>What to consider</h4><ul>{ov.consider.map(text => <li key={text}>{text}</li>)}</ul>
        <div className="wp-for-you"><h4><Icon name="account_circle" />For you</h4><p>{ov.forYou}</p></div>
      </section>
      {!topic && <section className="wp-section">
        <Collapsible.Root open={name ? topicsOpen : domainsOpen} onOpenChange={name ? setTopicsOpen : setDomainsOpen}>
          <h3 className="wp-fold-h"><Collapsible.Trigger className="wp-fold"><span>{name ? 'Topics' : 'Domains'}</span><span className="wp-label">{rows.length} {name ? 'topics' : 'domains'}{over ? `, ${over} over` : ''}<Icon name="chevron_right" /></span></Collapsible.Trigger></h3>
          <Collapsible.Panel className="wp-list">{rows.map(row => <div key={row.name}>
            {name ? <span>{row.name}</span> : <Button onClick={() => actions.pick(row.name)}>{row.name}</Button>}
            <span className={`wp-mono wp-${statusOf(row.ratio)}`}>{percent(row.ratio)}</span>
          </div>)}</Collapsible.Panel>
        </Collapsible.Root>
        {!state.domain && name && domain === fixture.fullKriDomain && <Button className="wp-button wp-open" onClick={() => actions.setDomain(domain)}><Icon name="arrow_forward" />Open the {domain} wheel</Button>}
        {!state.domain && name && domain !== fixture.fullKriDomain && <p className="wp-note wp-open">Full KRI data in this example covers {fixture.fullKriDomain} only.</p>}
      </section>}
      {topic && !topic.kris && <section className="wp-section wp-note">This example has full KRI data only for {fixture.fullKriDomain}. Open that domain to see the statement, the KRIs and the AI reading for each topic.</section>}
      {topic?.appetiteStatement && <section className="wp-section"><h3>Appetite statement</h3><blockquote>“{topic.appetiteStatement.text}”</blockquote><Source text={topic.appetiteStatement.source} /></section>}
      {topic?.kris && <section className="wp-section"><h3>KRIs</h3>{topic.kris.map(kri => {
        const value = kri.values[i], threshold = kri.threshold, scale = Math.max(threshold * 1.5, value)
        const status = statusOf(value / threshold), unit = kri.unit ? ` ${kri.unit}` : ''
        return <div className="wp-kri" key={kri.name}>
          <div className="wp-kri-value"><span>{kri.name}</span><span className="wp-mono"><b>{value}{unit}</b> / {threshold}{unit}</span></div>
          <div className="wp-bar" aria-hidden="true">
            <span className="wp-band wp-band-within" style={{ width: `${threshold * .8 / scale * 100}%` }} />
            <span className="wp-band wp-band-near" style={{ left: `${threshold * .8 / scale * 100}%`, width: `${threshold * .2 / scale * 100}%` }} />
            <span className="wp-band wp-band-over" style={{ left: `${threshold / scale * 100}%`, right: 0 }} />
            <span className="wp-bar-value" style={{ width: `${value / scale * 100}%` }} /><span className="wp-threshold" style={{ left: `calc(${threshold / scale * 100}% - 1px)` }} />
          </div>
          <div className={`wp-kri-meta wp-${status}`}><span>{labels[status]}</span>{kri === worstIndicator && <span>Sets the topic reading</span>}</div>
        </div>
      })}</section>}
      {reading && <section className="wp-section"><h3>{reading.title}</h3><p>{reading.text}</p><Source text={reading.source} /><p className="wp-note">{reading.confidence}</p></section>}
    </div>
  </aside>
}
