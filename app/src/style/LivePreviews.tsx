import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PanelRightOpen, X } from 'lucide-react'
import documents from '@/data/documents.json'
import type { Doc, Domain } from '@/types'
import { Graph } from '@/graph/Graph'
import { SpiderChart } from '@/wheel/chart/SpiderChart'
import { WheelSidePanel } from '@/components/wheel-panel'
import { WheelTimeline } from '@/components/wheel-timeline'
import { WheelDomainPicker, wheelHue } from '@/components/wheel-domain-picker'
import { WheelSettings, WheelModeToggle } from '@/components/wheel-controls'
import { LAST_STOP, TODAY, topicsOf } from '@/wheel/model'
import { C, H, R, W } from '@/wheel/chart/geometry'
import type { WheelActions, WheelState } from '@/wheel/model'
import { visibleIds } from '@/filters/visible'
import { DEFAULT_DOMAINS, DomainDrawer } from '@/components/domain-drawer'
import { GraphSettings } from '@/components/graph-settings'
import { GraphSearch } from '@/components/graph-search'
import { applyProposals } from '@/components/domain-sorting'
import { DocPanel } from '@/components/doc-panel'
import { syncWheelDomains } from '@/components/wheel-domains'
import './live-previews.css'

// The app's own Graph and Wheel, live, so motion and interaction can be tuned here.

const docs = documents as Doc[]

// The vault and its domain list, shared by the Graph and the Wheel: a domain added on the Graph adds a vertex to the Wheel.
export function useSharedVault() {
  // The vault as settings change it. The Graph keeps the original list, so adding a domain does not reset the layout.
  const [vault, setVault] = useState(docs)
  const [domainList, setDomainList] = useState<Domain[]>(DEFAULT_DOMAINS)
  return { vault, setVault, domainList, setDomainList }
}
type SharedVault = ReturnType<typeof useSharedVault>

export function GraphPreview({ shared: { vault, setVault, domainList, setDomainList } }: { shared: SharedVault }) {
  const [domains, setDomains] = useState<Set<Domain>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animateRun, setAnimateRun] = useState(0)
  const [showOrphans, setShowOrphans] = useState(true)
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const ids = visibleIds(vault, domains, query, domainList.length)
    if (!showOrphans) for (const doc of vault) if (!vault.some(other => other.id === doc.id ? other.links.length : other.links.some(l => l.targetId === doc.id))) ids.delete(doc.id)
    return ids
  }, [vault, domains, domainList, showOrphans, query])
  const selected = vault.find(doc => doc.id === selectedId)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex h-[640px] gap-6">
        <div className="relative flex min-w-0 flex-1">
          <Graph revealRun={0} foundLinks={[]} docs={docs} visibleIds={visible} selectedId={selectedId} onSelect={setSelectedId} active animateRun={animateRun} />
          <div className="absolute top-3 left-3 z-10">
            <DomainDrawer domains={domainList} value={domains} onChange={setDomains} />
          </div>
          {/* As wide as the gap between the drawer (16rem) and settings allows, up to 24rem. */}
          <div className="absolute top-3 left-1/2 z-10 w-[min(24rem,calc(100%-36rem))] -translate-x-1/2">
            <GraphSearch value={query} onChange={setQuery} matches={visible.size} total={vault.length} />
          </div>
          <div className="absolute top-3 right-3 z-10">
            <GraphSettings docs={vault} domains={domainList} showOrphans={showOrphans} onShowOrphans={setShowOrphans}
              onAddDomain={(domain, accepted) => { setDomainList(list => [...list, domain]); setVault(v => applyProposals(v, domain, accepted)) }}
              onAnimate={() => setAnimateRun(run => run + 1)} />
          </div>
        </div>
        {selected && <DocPanel doc={selected} onClose={() => setSelectedId(null)} onSelect={setSelectedId} />}
      </div>
    </div>
  )
}

const wheelStart: WheelState = { domain: null, picked: null, t: TODAY, mode: 'history', drawerView: 'history', drawerOpen: true }

// Scale the whole wheel, labels included, so it fits the box with padding on each side and never runs under the panel.
// The fit measures what is drawn (the rim and every label), not the fixed 784 × 555 frame, because long domain names
// reach past the frame. It re-measures after each render, so new domains, a domain wheel or a resize refit it.
const PAD_X = 32, PAD_Y = 8
function useFit() {
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, dx: 0, dy: 0 })
  const measure = useRef(() => {})
  measure.current = () => {
    const b = box.current, f = frame.current
    if (!b || !f) return
    const fr = f.getBoundingClientRect(), s = fr.width / W
    let l = C.x - R, r = C.x + R, t = C.y - R, btm = C.y + R
    for (const el of f.querySelectorAll('.spider-label, .spider-pct, .spider-ring-label')) {
      const q = el.getBoundingClientRect()
      l = Math.min(l, (q.left - fr.left) / s); r = Math.max(r, (q.right - fr.left) / s)
      t = Math.min(t, (q.top - fr.top) / s); btm = Math.max(btm, (q.bottom - fr.top) / s)
    }
    const scale = Math.min(1, (b.clientWidth - 2 * PAD_X) / (r - l), (b.clientHeight - 2 * PAD_Y) / (btm - t))
    const next = { scale, dx: (W / 2 - (l + r) / 2) * scale, dy: (H / 2 - (t + btm) / 2) * scale }
    setFit(prev => Math.abs(prev.scale - next.scale) < 0.002 && Math.abs(prev.dx - next.dx) < 0.5 && Math.abs(prev.dy - next.dy) < 0.5 ? prev : next)
  }
  useLayoutEffect(() => measure.current())
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => measure.current())
    observer.observe(box.current!)
    return () => observer.disconnect()
  }, [])
  return { box, frame, ...fit }
}

// The Wheel's parts in one stage, like the Graph: the domain picker and controls on top, the chart scaled to fit,
// the timeline at the bottom and the panel floating on the right. State and actions are the ones WheelView uses.
export function WheelPreview({ shared: { vault, domainList } }: { shared: SharedVault }) {
  // Runs before the Wheel's parts render, so they all read the Graph's domains.
  useMemo(() => syncWheelDomains(domainList, vault), [domainList, vault])
  const [state, setState] = useState(wheelStart)
  // The details panel starts collapsed and opens when a node is picked, so the wheel has the whole stage until then.
  const [panelOpen, setPanelOpen] = useState(false)
  const set = (patch: Partial<WheelState>) => setState(s => ({ ...s, ...patch }))
  const actions: WheelActions = {
    setDomain: domain => setState(s => {
      if (!domain) return { ...s, domain, picked: null }
      const topics = topicsOf(domain).map(x => x.topic)
      return { ...s, domain, picked: s.picked && topics.includes(s.picked) ? s.picked : topics[0] }
    }),
    // Picking a node opens the details panel. The panel's own back button picks null and keeps it open.
    pick: name => { set({ picked: name }); if (name) setPanelOpen(true) },
    setTime: t => set({ t: Math.max(0, Math.min(LAST_STOP, t)) }),
    setMode: mode => setState(s => ({ ...s, mode, t: mode === 'projection' ? Math.max(s.t, TODAY + 1) : Math.min(s.t, TODAY) })),
    setDrawerView: drawerView => set({ drawerView }),
    setDrawerOpen: drawerOpen => set({ drawerOpen }),
  }
  const { box, frame, scale, dx, dy } = useFit()
  const [revealRun, setRevealRun] = useState(0)

  return (
    <div className="wheel-stage relative h-[920px] w-full min-w-0 overflow-clip rounded-3xl border border-border/60 bg-stage">
      {/* With the panel open, the chart column leaves room for it (400px) and the gaps on its right. The wheel refits as it moves. */}
      <div className={`absolute inset-y-3 left-3 flex min-w-0 flex-col gap-2 transition-[right] duration-300 ease-out ${panelOpen ? 'right-[424px]' : 'right-3'}`}>
        {/* The picker opens over the chart, as the Graph's domain drawer does. */}
        <div className="relative z-20 h-10 shrink-0">
          <div className="absolute top-0 left-0"><WheelDomainPicker value={state.domain} onChange={actions.setDomain} /></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2"><WheelModeToggle mode={state.mode} onChange={actions.setMode} /></div>
          <div className="absolute top-0 right-0 flex items-start gap-2">
            {/* The way into the details panel without picking a node: it opens on the vault overview. */}
            <AnimatePresence initial={false}>
              {!panelOpen && <motion.button key="details" onClick={() => setPanelOpen(true)} aria-label="Open details"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex h-10 items-center gap-2 rounded-full border border-border/60 bg-card/90 px-4 text-sm font-medium text-foreground shadow-soft backdrop-blur-md">
                <PanelRightOpen size={16} />Details
              </motion.button>}
            </AnimatePresence>
            <WheelSettings projection={state.mode === 'projection'} onAnimate={() => setRevealRun(run => run + 1)} />
          </div>
        </div>
        <div ref={box} className="relative min-h-0 flex-1">
          <div ref={frame} className="absolute top-1/2 left-1/2" style={{ width: W, height: H, transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`, '--wheel-hue': state.domain ? wheelHue(state.domain) : 'var(--foreground)' } as React.CSSProperties}>
            {/* A new key remounts the chart, which plays its reveal: on load, on a domain change and on Animate. */}
            <SpiderChart key={`${state.domain}-${revealRun}`} state={state} actions={actions} />
          </div>
        </div>
        <WheelTimeline state={state} actions={actions} />
      </div>
      <AnimatePresence>
        {panelOpen && (
          <motion.div key="panel" className="absolute inset-y-3 right-3 flex w-[400px]"
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 32 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}>
            <WheelSidePanel state={state} actions={actions} />
            {/* Closing deselects, as closing the Graph's document panel does. */}
            <button aria-label="Close details" onClick={() => { setPanelOpen(false); actions.pick(null) }}
              className="absolute top-3 right-3 z-10 rounded-full bg-card/80 p-1.5 text-muted-foreground shadow-soft backdrop-blur-md hover:bg-muted hover:text-foreground">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
