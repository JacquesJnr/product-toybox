import { motion } from 'motion/react'
import { Tabs } from '@base-ui/react/tabs'
import { History, Sparkles } from 'lucide-react'
import type { TimeMode } from '@/wheel/model'

// The Wheel's floating controls, in the style of the Graph's search and settings:
// the History / AI projection toggle and the chart legend.

const float = 'border border-border/60 bg-card/90 shadow-soft backdrop-blur-md'

export function WheelModeToggle({ mode, onChange }: { mode: TimeMode; onChange: (mode: TimeMode) => void }) {
  const tabs = [
    { value: 'history' as const, label: 'History', Icon: History },
    { value: 'projection' as const, label: 'AI projection', Icon: Sparkles },
  ]
  return (
    <Tabs.Root value={mode} onValueChange={value => onChange(value as TimeMode)}>
      <Tabs.List className={`flex h-10 items-center gap-1 rounded-full p-1 ${float}`} aria-label="Time mode">
        {tabs.map(({ value, label, Icon }) => {
          const active = mode === value
          const ai = value === 'projection'
          return (
            <Tabs.Tab key={value} value={value} aria-label={label} title={label}
              className={`relative flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${active ? (ai ? 'text-primary' : 'text-background') : 'text-muted-foreground hover:text-foreground'}`}>
              {active && <motion.span layoutId="wheel-mode-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={`absolute inset-0 rounded-full ${ai ? 'border border-primary/30 bg-accent' : 'bg-foreground'}`} />}
              <Icon size={15} className="relative" />
              <span className="relative">{label}</span>
            </Tabs.Tab>
          )
        })}
      </Tabs.List>
    </Tabs.Root>
  )
}

export function WheelLegend({ projection }: { projection: boolean }) {
  const reading = projection ? 'var(--primary)' : 'var(--foreground)'
  return (
    <div className={`flex flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 text-[11px] font-medium text-muted-foreground ${float}`}>
      <span className="flex items-center gap-2"><svg width="20" height="2" aria-hidden="true"><line y1="1" x2="20" y2="1" stroke="var(--foreground)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>KRI threshold (set by the board)</span>
      <span className="flex items-center gap-2"><svg width="20" height="2" aria-hidden="true"><line y1="1" x2="20" y2="1" stroke={reading} strokeWidth="2" /></svg>Reading</span>
      <span className="flex items-center gap-2"><span className="flex w-5 justify-center" aria-hidden="true"><i className="size-2 rounded-full bg-status-over" /></span>Over threshold</span>
    </div>
  )
}
