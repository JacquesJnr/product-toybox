import { useId } from 'react'
import { Tabs } from '@base-ui/react/tabs'
import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { DOMAINS, fixture, isDomain } from '../model'
import type { TimeMode, WheelActions, WheelState } from '../model'
import './controls.css'

const ALL = 'All domains'
const EXAMPLE = fixture.fullKriDomain
const note = `Example data covers ${EXAMPLE} only`

// Wheel chips (Figma 187:47): single select. Only the example domain has a domain wheel.
export function WheelChips({ state, actions }: { state: WheelState; actions: WheelActions }) {
  const noteId = useId()
  return (
    <>
      <ToggleGroup className="wheel-chips" aria-label="Domain" aria-describedby={noteId} value={[state.domain ?? ALL]}
        onValueChange={values => { const v = values[0]; if (v) actions.setDomain(isDomain(v) ? v : null) }}>
        <Toggle className="wheel-chip" value={ALL}>{ALL}</Toggle>
        {DOMAINS.map(d => (
          <Toggle key={d} className={`wheel-chip wheel-chip--${d.toLowerCase()}`} value={d}
            disabled={d !== EXAMPLE} title={d !== EXAMPLE ? note : undefined}>
            <span className="wheel-chip-hue" aria-hidden="true" />{d}
          </Toggle>
        ))}
      </ToggleGroup>
      <span id={noteId} className="visually-hidden">{note}</span>
    </>
  )
}

// Chart top bar: the legend (187:87) centered, the History / AI projection tabs (187:109) at the right.
export function ChartTopBar({ state, actions }: { state: WheelState; actions: WheelActions }) {
  return (
    <div className="wheel-topbar">
      <div className="wheel-legend">
        <span><svg width="22" height="2" aria-hidden="true"><line y1="1" x2="22" y2="1" strokeDasharray="4 3" /></svg>KRI threshold (set by the board)</span>
        <span><svg width="22" height="2" aria-hidden="true"><line y1="1" x2="22" y2="1" strokeWidth="2" /></svg>Reading</span>
        <span><i className="wheel-legend-over" aria-hidden="true" />Over threshold</span>
      </div>
      <Tabs.Root value={state.mode} onValueChange={value => actions.setMode(value as TimeMode)}>
        <Tabs.List className="wheel-mode-tabs" aria-label="Time mode">
          <Tabs.Tab value="history" aria-label="History" title="History">
            <span className="material-symbols-rounded" aria-hidden="true">history</span>
          </Tabs.Tab>
          <Tabs.Tab value="projection" aria-label="AI projection" title="AI projection">
            <span className="material-symbols-rounded" aria-hidden="true">auto_awesome</span>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </div>
  )
}
