import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import documents from '@/data/documents.json'
import type { Doc, Domain } from '@/types'
import { Graph } from '@/graph/Graph'
import { SpiderChart } from '@/wheel/chart/SpiderChart'
import { WheelDrawer } from '@/wheel/drawer/WheelDrawer'
import { WheelPanel } from '@/wheel/panel/WheelPanel'
import { ChartTopBar, WheelChips } from '@/wheel/controls/WheelControls'
import { LAST_STOP, TODAY, topicsOf } from '@/wheel/model'
import { H, W } from '@/wheel/chart/geometry'
import type { WheelActions, WheelState } from '@/wheel/model'
import { visibleIds } from '@/filters/visible'
import { DEFAULT_DOMAINS, DomainDrawer } from '@/components/domain-drawer'
import { GraphSettings } from '@/components/graph-settings'
import { GraphSearch } from '@/components/graph-search'
import { applyProposals } from '@/components/domain-sorting'
import { DocPanel } from '@/components/doc-panel'
import './live-previews.css'

// The app's own Graph and Wheel, live, so motion and interaction can be tuned here.

const docs = documents as Doc[]

export function GraphPreview() {
  const [domains, setDomains] = useState<Set<Domain>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animateRun, setAnimateRun] = useState(0)
  // The vault as settings change it. The Graph keeps the original list, so adding a domain does not reset the layout.
  const [vault, setVault] = useState(docs)
  const [domainList, setDomainList] = useState<Domain[]>(DEFAULT_DOMAINS)
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

// Scale the chart's fixed 784 × 555 frame (SVG and its HTML labels together) to fit the box it sits in, never above 1.
// The frame's outer 24 px on each side hold no labels, so they may run into the column's margin.
const FIT_W = W - 48
function useFit() {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = box.current!
    const observer = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / FIT_W, el.clientHeight / H)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { box, scale }
}

// The Wheel's parts in one stage, like the Graph: chips and controls on top, the chart scaled to fit,
// the timeline at the bottom and the panel floating on the right. State and actions are the ones WheelView uses.
export function WheelPreview() {
  const [state, setState] = useState(wheelStart)
  const set = (patch: Partial<WheelState>) => setState(s => ({ ...s, ...patch }))
  const actions: WheelActions = {
    setDomain: domain => setState(s => {
      if (!domain) return { ...s, domain, picked: null }
      const topics = topicsOf(domain).map(x => x.topic)
      return { ...s, domain, picked: s.picked && topics.includes(s.picked) ? s.picked : topics[0] }
    }),
    pick: name => set({ picked: name }),
    setTime: t => set({ t: Math.max(0, Math.min(LAST_STOP, t)) }),
    setMode: mode => setState(s => ({ ...s, mode, t: mode === 'projection' ? Math.max(s.t, TODAY + 1) : Math.min(s.t, TODAY) })),
    setDrawerView: drawerView => set({ drawerView }),
    setDrawerOpen: drawerOpen => set({ drawerOpen }),
  }
  const { box, scale } = useFit()

  return (
    <div className="wheel-stage relative h-[920px] w-full min-w-0 overflow-clip rounded-3xl border border-border/60 bg-stage">
      {/* The chart column leaves room for the panel (400px) and the gaps on its right. */}
      <div className="absolute inset-y-3 left-3 right-[424px] flex min-w-0 flex-col gap-2">
        <WheelChips state={state} actions={actions} />
        <ChartTopBar state={state} actions={actions} />
        <div ref={box} className="relative min-h-0 flex-1">
          <div className="absolute top-1/2 left-1/2" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}>
            <SpiderChart state={state} actions={actions} />
          </div>
        </div>
        <WheelDrawer state={state} actions={actions} />
      </div>
      <div className="absolute inset-y-3 right-3 flex w-[400px]">
        <WheelPanel state={state} actions={actions} />
      </div>
    </div>
  )
}
