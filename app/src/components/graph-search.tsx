import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X } from 'lucide-react'

// The Graph's search, anchored top center between the domain drawer and the settings.
// It filters the graph live; "/" focuses it and Escape clears it.

export function GraphSearch({ value, onChange, matches, total }: { value: string; onChange: (value: string) => void; matches: number; total: number }) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(event.target.tagName)
      if (event.key === '/' && !typing) { event.preventDefault(); input.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <motion.label
      className="flex h-10 w-full items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3.5 shadow-soft backdrop-blur-md focus-within:border-ring">
      <Search size={16} className="shrink-0 text-muted-foreground" />
      <input ref={input} value={value} onChange={event => onChange(event.target.value)} placeholder="Search the vault"
        onKeyDown={event => { if (event.key === 'Escape') { onChange(''); input.current?.blur() } }}
        aria-label="Search the vault" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      <AnimatePresence mode="popLayout" initial={false}>
        {value ? (
          <motion.span key="count" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-muted-foreground">{matches} of {total}</span>
            <button onClick={() => onChange('')} aria-label="Clear search" className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={14} /></button>
          </motion.span>
        ) : (
          <motion.kbd key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-md border border-border px-1.5 font-mono text-[11px] text-muted-foreground">/</motion.kbd>
        )}
      </AnimatePresence>
    </motion.label>
  )
}
