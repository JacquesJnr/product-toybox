import { useState } from 'react'
import { SpiderChart } from './chart/SpiderChart'
import { WheelDrawer } from './drawer/WheelDrawer'
import { WheelPanel } from './panel/WheelPanel'
import { ChartTopBar, WheelChips } from './controls/WheelControls'
import { LAST_STOP, TODAY, topicsOf } from './model'
import type { WheelActions, WheelState } from './model'
import './wheel-view.css'

const initial: WheelState = { domain: null, picked: null, t: TODAY, mode: 'history', drawerView: 'history', drawerOpen: true }

export function WheelView({ hidden }: { hidden: boolean }) {
  const [state, setState] = useState(initial)
  const set = (patch: Partial<WheelState>) => setState(s => ({ ...s, ...patch }))

  const actions: WheelActions = {
    setDomain: domain => setState(s => {
      if (!domain) return { ...s, domain, picked: null }
      const topics = topicsOf(domain).map(x => x.topic)
      return { ...s, domain, picked: s.picked && topics.includes(s.picked) ? s.picked : topics[0] }
    }),
    pick: name => set({ picked: name }),
    setTime: t => set({ t: Math.max(0, Math.min(LAST_STOP, t)) }),
    // History never shows a projection stop, and the AI projection never shows history.
    setMode: mode => setState(s => ({ ...s, mode, t: mode === 'projection' ? Math.max(s.t, TODAY + 1) : Math.min(s.t, TODAY) })),
    setDrawerView: drawerView => set({ drawerView }),
    setDrawerOpen: drawerOpen => set({ drawerOpen }),
  }

  return (
    <main className="wheel-view" hidden={hidden} aria-label="Wheel view">
      <div className="wheel-view-chips">
        <WheelChips state={state} actions={actions} />
      </div>
      <div className="wheel-view-top">
        <ChartTopBar state={state} actions={actions} />
      </div>
      <div className="wheel-view-chart">
        <SpiderChart state={state} actions={actions} />
      </div>
      <WheelPanel state={state} actions={actions} />
      <WheelDrawer state={state} actions={actions} />
    </main>
  )
}
