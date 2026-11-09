import { motion, AnimatePresence } from 'motion/react'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { PanelLeft } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Watermelon macos-sidebar: the spring width (240 ↔ 64), the toggle and the hover pill
// that follows the pointer. Changed for Quantum State: the nav is passed in as rows
// (SidebarItem) instead of a list of strings, the collapsed state keeps each row's icon
// as a rail with a hover label, Hugeicons became Lucide, and the colors are theme classes.

const OpenContext = createContext(true)
export const useSidebarOpen = () => useContext(OpenContext)

export interface MacOSSidebarProps {
  header?: ReactNode
  nav: ReactNode
  footer?: ReactNode
  defaultOpen?: boolean
  children?: ReactNode
  className?: string
}

export function MacOSSidebar({ header, nav, footer, defaultOpen = true, children, className = '' }: MacOSSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <OpenContext.Provider value={isOpen}>
      <div className={`relative flex w-full overflow-hidden rounded-3xl bg-muted p-3 ${className}`}>
        <motion.div
          animate={{ width: isOpen ? 260 : 64 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className={`flex shrink-0 flex-col rounded-2xl p-2 transition-colors duration-900 ease-out ${isOpen ? 'bg-sidebar shadow-soft' : 'bg-transparent'}`}
        >
          <div className={`flex w-full shrink-0 items-center gap-2 ${isOpen ? 'flex-row' : 'flex-col'}`}>
            <div className="min-w-0 flex-1">{header}</div>
            <button aria-label={isOpen ? 'Collapse the sidebar' : 'Expand the sidebar'} onClick={() => setIsOpen(!isOpen)} className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
              <PanelLeft size={18} />
            </button>
          </div>
          <nav className="mt-3 flex min-h-0 w-full flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto whitespace-nowrap">{nav}</nav>
          {footer && <div className="mt-2 w-full shrink-0 border-t border-sidebar-border pt-2">{footer}</div>}
        </motion.div>

        <div className="z-0 h-full min-h-full w-full flex-1 overflow-y-auto pl-4 lg:pl-6">{children}</div>
      </div>
    </OpenContext.Provider>
  )
}

// One row. Open: icon, label and a trailing slot. Collapsed: the icon alone, with the label on hover.
// slide: rows that share one slide id work as a switch, one active at a time, and the active pill slides between them.
export function SidebarItem({ icon, label, active, onClick, trailing, indent = 0, title, slide }: {
  icon: ReactNode
  label: ReactNode
  active?: boolean
  onClick?: () => void
  trailing?: ReactNode
  indent?: number
  title?: string
  slide?: string
}) {
  const isOpen = useSidebarOpen()
  const [hovered, setHovered] = useState(false)
  if (!isOpen && indent > 0) return null

  const row = (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex h-9 w-full shrink-0 items-center gap-2.5 rounded-md text-left text-sm ${isOpen ? 'px-2.5' : 'justify-center'}`}
      style={isOpen ? { paddingLeft: 10 + indent * 18 } : undefined}
    >
      <AnimatePresence>
        {active && slide && <motion.span layoutId={slide} className="absolute inset-0 z-0 rounded-md bg-sidebar-accent ring-1 ring-sidebar-border" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
        {active && !slide && <motion.span className="absolute inset-0 z-0 rounded-md bg-sidebar-accent ring-1 ring-sidebar-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} />}
        {hovered && !active && <motion.span layoutId="sidebar-hover-bg" className="absolute inset-0 z-0 rounded-md bg-sidebar-accent/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
      </AnimatePresence>
      <span className={`relative z-10 grid size-4 shrink-0 place-items-center ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{icon}</span>
      {isOpen && (
        <motion.span initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.2, ease: 'easeOut' }} className={`relative z-10 min-w-0 flex-1 truncate ${active ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
          {label}
        </motion.span>
      )}
      {isOpen && trailing && <span className="relative z-10 shrink-0">{trailing}</span>}
    </button>
  )

  if (isOpen) return row
  return (
    <Tooltip>
      <TooltipTrigger render={row} />
      <TooltipContent side="right">{title ?? label}</TooltipContent>
    </Tooltip>
  )
}

// A group heading. Hidden in the rail, where a thin rule keeps the groups apart.
export function SidebarGroup({ label, action }: { label: string; action?: ReactNode }) {
  const isOpen = useSidebarOpen()
  if (!isOpen) return <div className="mx-auto my-2 h-px w-6 shrink-0 bg-sidebar-border" />
  return (
    <div className="mt-4 mb-1 flex shrink-0 items-center justify-between px-2.5">
      <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
      {action}
    </div>
  )
}
