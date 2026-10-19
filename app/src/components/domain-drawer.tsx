import { useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Banknote, Check, ClipboardCheck, Compass, Gavel, Landmark, ListFilter, Rocket, Shield, Sparkles, X, type LucideIcon } from 'lucide-react'
import type { Domain } from '@/types'

// The Graph's domain filter as a drawer inside the graph. Built from Watermelon's
// filter-disclosure (the pill that springs open into a card), made multi-select.

export const DEFAULT_DOMAINS: Domain[] = ['Strategic direction', 'Strategy execution', 'Financial stewardship', 'Risk and resilience', 'Controls and assurance', 'Major decisions', 'Remuneration']
const ICONS: Partial<Record<Domain, LucideIcon>> = {
  'Strategic direction': Compass,
  'Strategy execution': Rocket,
  'Financial stewardship': Landmark,
  'Risk and resilience': Shield,
  'Controls and assurance': ClipboardCheck,
  'Major decisions': Gavel,
  Remuneration: Banknote,
}
// Domains added in settings were sorted by AI, so they carry the AI mark.
export const domainIcon = (domain: Domain) => ICONS[domain] ?? Sparkles

// Each domain keeps its color from the first toy tokens. New domains take primary.
export const domainKey = (domain: Domain) => domain.toLowerCase().replace(/ and /g, '-').replace(/[^a-z]+/g, '-')
export const domainColor = (domain: Domain) => ICONS[domain] ? `var(--domain-${domainKey(domain)})` : 'var(--primary)'
// The 3-tone gradient from Figma (Toy Designs 204:6): neutral, a tint of the color, the color.
export const domainGradient = (color: string) => `linear-gradient(90deg, var(--muted) 0%, color-mix(in oklch, ${color} 45%, white) 50%, ${color} 100%)`

const ROW_SPRING = { type: 'spring', stiffness: 240, damping: 20, mass: 1 } as const

export function DomainDrawer({ domains = DEFAULT_DOMAINS, value, onChange, defaultOpen = true }: {
  domains?: Domain[]
  value: ReadonlySet<Domain>
  onChange: (next: Set<Domain>) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const toggle = (domain: Domain) => {
    const next = new Set(value)
    if (next.has(domain)) next.delete(domain)
    else next.add(domain)
    onChange(next)
  }
  const summary = value.size === 0 ? 'All domains' : `${value.size} of ${domains.length} domains`

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.div
            key="open"
            layoutId="domain-drawer"
            style={{ borderRadius: 20, transformOrigin: '0% 0%' }}
            className="flex w-64 flex-col gap-1 overflow-hidden border border-border/60 bg-card/90 p-2 shadow-soft backdrop-blur-md"
            role="group"
            aria-label="Filter by domain"
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{summary}</span>
              <button onClick={() => setOpen(false)} aria-label="Close domain filter" className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            {domains.map((domain, index) => {
              const Icon = domainIcon(domain)
              const color = domainColor(domain)
              const selected = value.has(domain)
              return (
                <motion.button
                  key={domain}
                  initial={{ opacity: 0, scale: 1.05, y: -16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ ...ROW_SPRING, delay: (2 + index) * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggle(domain)}
                  aria-pressed={selected}
                  style={{ '--row-gradient': domainGradient(color), background: selected ? 'var(--row-gradient)' : undefined } as React.CSSProperties}
                  className="flex w-full cursor-pointer items-center justify-between rounded-full px-2.5 py-1.5 text-left transition-[background] hover:[background:var(--row-gradient)]"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} style={{ color }} />
                    <span className="text-sm font-medium text-foreground">{domain}</span>
                  </span>
                  <motion.span
                    animate={{ backgroundColor: selected ? 'var(--foreground)' : 'rgba(0,0,0,0)' }}
                    style={{ borderColor: selected ? 'var(--foreground)' : undefined }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border"
                  >
                    <motion.span
                      animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                    >
                      <Check size={12} strokeWidth={3} className="text-background" />
                    </motion.span>
                  </motion.span>
                </motion.button>
              )
            })}
            {value.size > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onChange(new Set())}
                className="mt-1 rounded-xl px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Clear all
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            layoutId="domain-drawer"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{ borderRadius: 20 }}
            aria-label="Open domain filter"
            className="flex h-10 items-center gap-2 border border-border/60 bg-card/90 px-3 text-sm font-medium text-foreground shadow-soft backdrop-blur-md"
          >
            <ListFilter size={16} />
            {summary}
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
