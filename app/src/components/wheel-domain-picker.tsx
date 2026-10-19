import { useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Check, Hexagon, X } from 'lucide-react'
import type { Domain, WheelDomain } from '@/types'
import { DOMAINS, fixture } from '@/wheel/model'
import { domainColor, domainGradient, domainIcon } from './domain-drawer'

// The Wheel's domain picker, in the Graph's DomainDrawer style but single select (DESIGN.md §2.5).
// Only the example domain has a domain wheel; the others show "No data yet".

// The settled Wheel hues equal these toybox domains (the same map as SpiderChart's HUE).
export const WHEEL_DOMAIN: Record<WheelDomain, Domain> = {
  Finance: 'Financial stewardship',
  Risk: 'Risk and resilience',
  Audit: 'Controls and assurance',
  Remuneration: 'Remuneration',
  Legal: 'Major decisions',
  Compliance: 'Strategic direction',
}
// On the style page the Wheel's domains already carry the Graph's names (see wheel-domains.ts).
const graphName = (domain: WheelDomain) => (WHEEL_DOMAIN[domain] ?? domain) as Domain
export const wheelHue = (domain: WheelDomain) => domainColor(graphName(domain))
export const wheelIcon = (domain: WheelDomain) => domainIcon(graphName(domain))
const ROW_SPRING = { type: 'spring', stiffness: 240, damping: 20, mass: 1 } as const

export function WheelDomainPicker({ value, onChange, defaultOpen = false }: {
  value: WheelDomain | null
  onChange: (domain: WheelDomain | null) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const rows: (WheelDomain | null)[] = [null, ...DOMAINS]
  const EXAMPLE = fixture.fullKriDomain
  const CurrentIcon = value ? wheelIcon(value) : Hexagon

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.div key="open" layoutId="wheel-domain-picker" style={{ borderRadius: 20, transformOrigin: '0% 0%' }}
            className="flex w-64 flex-col gap-1 overflow-hidden border border-border/60 bg-card/90 p-2 shadow-soft backdrop-blur-md"
            role="radiogroup" aria-label="Domain">
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Wheel</span>
              <button onClick={() => setOpen(false)} aria-label="Close domain picker" className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            {rows.map((domain, index) => {
              const Icon = domain ? wheelIcon(domain) : Hexagon
              const color = domain ? wheelHue(domain) : 'var(--foreground)'
              const selected = value === domain
              const enabled = !domain || domain === EXAMPLE
              return (
                <motion.button key={domain ?? 'all'}
                  initial={{ opacity: 0, scale: 1.05, y: -16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ ...ROW_SPRING, delay: (2 + index) * 0.04 }}
                  whileTap={enabled ? { scale: 0.98 } : undefined}
                  onClick={() => { if (enabled && !selected) onChange(domain) }}
                  role="radio" aria-checked={selected} aria-disabled={!enabled || undefined}
                  title={enabled ? undefined : `Example data covers ${EXAMPLE} only`}
                  style={{ '--row-gradient': domainGradient(color), background: selected ? 'var(--row-gradient)' : undefined } as React.CSSProperties}
                  className={`flex w-full items-center justify-between rounded-full px-2.5 py-1.5 text-left transition-[background] ${enabled ? 'cursor-pointer hover:[background:var(--row-gradient)]' : 'cursor-not-allowed'}`}>
                  <span className="flex items-center gap-3">
                    <Icon size={16} style={{ color, opacity: enabled ? 1 : 0.45 }} />
                    <span className={`text-sm font-medium ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{domain ?? 'All domains'}</span>
                  </span>
                  {enabled ? (
                    <motion.span animate={{ backgroundColor: selected ? 'var(--foreground)' : 'rgba(0,0,0,0)' }}
                      style={{ borderColor: selected ? 'var(--foreground)' : undefined }}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border">
                      <motion.span animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }} transition={{ type: 'spring', stiffness: 520, damping: 30 }}>
                        <Check size={12} strokeWidth={3} className="text-background" />
                      </motion.span>
                    </motion.span>
                  ) : (
                    <span className="font-mono text-[10px] text-muted-foreground">No data yet</span>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        ) : (
          <motion.button key="closed" layoutId="wheel-domain-picker" onClick={() => setOpen(true)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={{ borderRadius: 20 }}
            aria-label={`Domain: ${value ?? 'All domains'}. Open domain picker`}
            className="flex h-10 items-center gap-2 border border-border/60 bg-card/90 px-3 text-sm font-medium text-foreground shadow-soft backdrop-blur-md">
            <CurrentIcon size={16} style={{ color: value ? wheelHue(value) : undefined }} />
            {value ?? 'All domains'}
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
