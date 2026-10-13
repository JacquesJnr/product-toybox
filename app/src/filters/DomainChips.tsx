import { Button } from '@base-ui/react/button'
import { Toggle } from '@base-ui/react/toggle'
import type { Domain } from '../types'
import './filters.css'

const domains: Domain[] = [
  'Strategic direction', 'Strategy execution', 'Financial stewardship', 'Risk and resilience',
  'Controls and assurance', 'Major decisions', 'Remuneration',
]

const domainClasses: Record<Domain, string> = {
  'Strategic direction': 'strategic-direction',
  'Strategy execution': 'strategy-execution',
  'Financial stewardship': 'financial-stewardship',
  'Risk and resilience': 'risk-resilience',
  'Controls and assurance': 'controls-assurance',
  'Major decisions': 'major-decisions',
  Remuneration: 'remuneration',
}

const domainIcons: Record<Domain, string> = {
  'Strategic direction': 'explore',
  'Strategy execution': 'rocket_launch',
  'Financial stewardship': 'account_balance',
  'Risk and resilience': 'shield',
  'Controls and assurance': 'fact_check',
  'Major decisions': 'gavel',
  Remuneration: 'payments',
}

export function DomainChips({
  value,
  onChange,
  single = false,
}: {
  value: ReadonlySet<Domain>
  onChange: (next: Set<Domain>) => void
  single?: boolean
}) {
  const toggle = (domain: Domain, pressed: boolean) => {
    if (single) {
      onChange(pressed ? new Set([domain]) : new Set())
      return
    }
    const next = new Set(value)
    if (pressed) next.add(domain)
    else next.delete(domain)
    onChange(next)
  }

  return (
    <div className="domain-chips" role="group" aria-label="Filter by domain">
      {domains.map((domain) => (
        <Toggle
          key={domain}
          className={`domain-chip domain-chip--${domainClasses[domain]}`}
          pressed={value.has(domain)}
          onPressedChange={(pressed) => toggle(domain, pressed)}
        >
          {single ? <span className="domain-chip-diamond" aria-hidden="true" />
            : <span className="material-symbols-rounded domain-chip-icon" aria-hidden="true">{domainIcons[domain]}</span>}
          {domain}
        </Toggle>
      ))}
      <Button className="clear-domains" onClick={() => onChange(new Set())}>
        <span className="material-symbols-rounded" aria-hidden="true">close</span>
        Clear all
      </Button>
    </div>
  )
}
