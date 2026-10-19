import { useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Tabs } from '@base-ui/react/tabs'
import { History, Play, Settings2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TimeMode } from '@/wheel/model'

// The Wheel's floating controls, in the style of the Graph's search and settings:
// the History / AI projection toggle and the settings, which hold the chart legend.

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
              className={`relative flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${active ? (ai ? 'text-foreground' : 'text-background') : 'text-muted-foreground hover:text-foreground'}`}>
              {active && <motion.span layoutId="wheel-mode-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={`absolute inset-0 rounded-full ${ai ? 'ai-edge ai-glow' : 'bg-foreground'}`} />}
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
    <div className="flex flex-col gap-2 px-2 text-xs font-medium text-muted-foreground">
      <span className="flex items-center gap-2"><svg width="20" height="2" aria-hidden="true"><line y1="1" x2="20" y2="1" stroke="var(--foreground)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>KRI threshold (set by the board)</span>
      <span className="flex items-center gap-2"><svg width="20" height="2" aria-hidden="true"><line y1="1" x2="20" y2="1" stroke={reading} strokeWidth="2" /></svg>Reading</span>
      <span className="flex items-center gap-2"><span className="flex w-5 justify-center" aria-hidden="true"><i className="size-2 rounded-full bg-status-over" /></span>Over threshold</span>
    </div>
  )
}

// Wheel settings, anchored to the stage's top right like the Graph's: a button that unfolds into a card.
export function WheelSettings({ projection, onAnimate }: { projection: boolean; onAnimate: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.div key="open" layoutId="wheel-settings" style={{ borderRadius: 20, transformOrigin: '100% 0%' }}
            className="flex w-80 flex-col overflow-hidden border border-border/60 bg-card/90 shadow-soft backdrop-blur-md">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-heading text-sm font-semibold">Wheel settings</span>
              <button aria-label="Close settings" onClick={() => setOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X size={14} /></button>
            </header>
            <section className="flex flex-col gap-2 px-4 pt-4">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Motion</h3>
              <Button variant="outline" onClick={onAnimate}><Play />Animate</Button>
              <p className="text-[11px] leading-snug text-muted-foreground">Replays the reveal: the rings sweep in clockwise, then the labels, then the readings.</p>
            </section>
            <section className="flex flex-col gap-2 p-4">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Legend</h3>
              <WheelLegend projection={projection} />
            </section>
          </motion.div>
        ) : (
          <motion.button key="closed" layoutId="wheel-settings" onClick={() => setOpen(true)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            style={{ borderRadius: 20 }} aria-label="Open wheel settings"
            className="flex h-10 w-10 items-center justify-center border border-border/60 bg-card/90 text-foreground shadow-soft backdrop-blur-md">
            <Settings2 size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
