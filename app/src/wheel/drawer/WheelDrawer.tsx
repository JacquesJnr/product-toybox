import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { Select } from '@base-ui/react/select'
import { Tabs } from '@base-ui/react/tabs'
import { fixture, LAST_STOP, pointsAt, stopName, TODAY } from '../model'
import type { WheelActions, WheelState } from '../model'
import { clampTime, playbackTime, slideText, stepDestination, tooltipLeft } from './drawerLogic'
import knob from './knob.svg'
import './wheel-drawer.css'

const stopTitle = (i: number) => stopName(i) === 'Last board' ? 'Last Board' : stopName(i)
const pickLabel = (i: number) => fixture.timeframes[i].label.replace('\nAI projection', '').replace('\n', ', ')
const Icon = ({ name }: { name: string }) => <span className="material-symbols-rounded" aria-hidden="true">{name}</span>

export function WheelDrawer({ state, actions }: { state: WheelState; actions: WheelActions }) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const pull = useRef<HTMLButtonElement>(null)
  const latest = useRef({ state, actions })
  const position = useRef(state.t)
  const goal = useRef<number | null>(null)
  const frame = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedHistory = useRef(Math.min(state.t, TODAY))
  const ownModeChange = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [hover, setHover] = useState<{ t: number; x: number } | null>(null)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const dragging = useRef(false)
  const swipe = useRef<number | null>(null)

  function halt() {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    if (timer.current !== null) clearTimeout(timer.current)
    frame.current = null
    timer.current = null
    goal.current = null
    setPlaying(false)
  }
  function writeTime(t: number) {
    position.current = t
    latest.current.actions.setTime(t)
  }
  function goTo(target: number, duration = 500) {
    halt()
    const from = position.current
    if (reduced || from === target || !duration) { writeTime(target); return }
    goal.current = target
    // Keep the held time when setMode clamps the shared state to its first stop.
    writeTime(from)
    // The first frame establishes the clock; time always starts from the held timeline position.
    let start: number | null = null
    function step(now: number) {
      start ??= now
      const k = Math.max(0, Math.min(1, (now - start) / duration))
      const eased = k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2
      writeTime(from + (target - from) * eased)
      if (k < 1) frame.current = requestAnimationFrame(step)
      else { frame.current = null; goal.current = null }
    }
    frame.current = requestAnimationFrame(step)
  }
  function histGo(target: number) {
    target = clampTime(target, LAST_STOP)
    const mode = target > TODAY ? 'projection' : 'history'
    if (mode !== latest.current.state.mode) {
      ownModeChange.current = true
      actions.setMode(mode)
    }
    goTo(target)
  }
  function play() {
    if (playing) { halt(); return }
    if (state.mode !== 'history') return
    halt()
    const from = position.current >= TODAY - .01 ? 0 : position.current
    writeTime(reduced ? Math.floor(from) : from)
    setPlaying(true)
    if (reduced) {
      function next() {
        timer.current = setTimeout(() => {
          writeTime(Math.min(TODAY, position.current + 1))
          if (position.current < TODAY) next()
          else { timer.current = null; setPlaying(false) }
        }, 1400)
      }
      next()
    } else {
      let start: number | null = null
      function step(now: number) {
        start ??= now
        const t = playbackTime(from, now - start, TODAY)
        writeTime(t)
        if (t < TODAY) frame.current = requestAnimationFrame(step)
        else { frame.current = null; setPlaying(false) }
      }
      frame.current = requestAnimationFrame(step)
    }
  }

  useLayoutEffect(() => {
    const previous = latest.current.state
    latest.current = { state, actions }
    position.current = state.t
    if (previous.mode !== state.mode) {
      if (!ownModeChange.current) halt()
      if (state.mode === 'projection') savedHistory.current = previous.t
      else if (!ownModeChange.current) writeTime(savedHistory.current)
      ownModeChange.current = false
    }
    if (previous.drawerView !== state.drawerView) halt()
  })

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => { halt(); setReduced(media.matches) }
    const onVisibility = () => { if (document.hidden || root.current?.closest('[hidden]')) halt() }
    // WheelView stays mounted while hidden and does not pass an active prop.
    const observer = new MutationObserver(onVisibility)
    const wheel = root.current?.closest('.wheel-view')
    if (wheel) observer.observe(wheel, { attributes: true, attributeFilter: ['hidden'] })
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotion)
    return () => {
      halt()
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotion)
    }
  }, [])

  function close() {
    actions.setDrawerOpen(false)
    pull.current?.focus()
  }
  function seekAt(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    // Match the five equal chapter widths, excluding their four-pixel gaps.
    const width = (bounds.width - (TODAY - 1) * 4) / TODAY
    const x = Math.max(0, event.clientX - bounds.left)
    const chapter = Math.min(TODAY - 1, Math.floor(x / (width + 4)))
    return { t: clampTime(chapter + Math.min(1, (x - chapter * (width + 4)) / width), TODAY), x: tooltipLeft(x, bounds.width) }
  }
  function seekKey(event: KeyboardEvent<HTMLDivElement>) {
    const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 0
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? TODAY : direction ? stepDestination(position.current, goal.current, direction, TODAY) : null
    if (target !== null) { event.preventDefault(); goTo(target, 400) }
  }
  const k = Math.round(state.t)
  const here = goal.current ?? k
  const title = state.drawerView === 'history' ? 'Governance History' : 'Governance Playback'
  const subtitle = state.drawerView === 'history' ? 'Step through each timeframe and see what changed.' : state.mode === 'history'
    ? 'Play the readings from Q3 2025 to today, or pick a timeframe.' : 'See where the AI expects each reading to go. Estimates, not evidence.'
  const slides = useMemo(() => fixture.timeframes.map((_, i) => slideText(pointsAt(state.domain, i), i ? pointsAt(state.domain, i - 1) : null, i ? stopTitle(i - 1) : '', i > TODAY)), [state.domain])
  const items = fixture.timeframes.flatMap((stop, i) => stop.projection === (state.mode === 'projection') ? [{ value: i, label: pickLabel(i) }] : [])
  const chapter = Math.min(TODAY - 1, Math.floor(state.t))

  return <div ref={root} className={`wheel-drawer${state.mode === 'projection' ? ' wheel-drawer--projection' : ''}`}>
    <Button ref={pull} className="wheel-drawer__pull" aria-expanded={state.drawerOpen} aria-controls={id} aria-label={`${state.drawerOpen ? 'Close' : 'Open'} ${title}`} onClick={() => actions.setDrawerOpen(!state.drawerOpen)}>
      <Icon name={state.drawerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'} />
    </Button>
    <div id={id} className="wheel-drawer__dock" hidden={!state.drawerOpen} inert={!state.drawerOpen} role="region" aria-label={title}
      onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <Tabs.Root value={state.drawerView} onValueChange={view => { halt(); actions.setDrawerView(view as WheelState['drawerView']) }}>
        <div className="wheel-drawer__head">
          <div><h2>{title}</h2><p className="wheel-drawer__subtitle">{subtitle}</p></div>
          <Tabs.List className="wheel-drawer__tabs" aria-label="Playback view">
            <Tabs.Tab value="history" aria-label="Governance History" title="Governance History"><Icon name="commit" /></Tabs.Tab>
            <Tabs.Tab value="playback" aria-label="Governance Playback" title="Governance Playback"><Icon name="play_circle" /></Tabs.Tab>
          </Tabs.List>
        </div>
        <Tabs.Panel value="history" className="wheel-drawer__history">
          <div className="wheel-drawer__carousel" role="region" aria-roledescription="carousel" aria-label="Timeframes">
            <Button className="wheel-drawer__nav" focusableWhenDisabled aria-label="Previous timeframe" disabled={here === 0} onClick={() => histGo((goal.current ?? Math.round(position.current)) - 1)}><Icon name="chevron_left" /></Button>
            <div className="wheel-drawer__viewport"
              onPointerDown={event => { swipe.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId) }}
              onPointerUp={event => { const dx = event.clientX - (swipe.current ?? event.clientX); swipe.current = null; if (Math.abs(dx) > 40) histGo((goal.current ?? Math.round(position.current)) + (dx < 0 ? 1 : -1)) }}
              onPointerCancel={() => { swipe.current = null }}>
              <div className="wheel-drawer__track" style={{ transform: `translateX(${-k * 100}%)` }}>
                {slides.map((text, i) => <div key={i} className="wheel-drawer__slide" style={{ left: `${i * 100}%` }} data-current={i === k || undefined} data-projection={i > TODAY || undefined}
                  role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${fixture.timeframes.length}`} aria-hidden={i !== k}>
                  <h3>{stopTitle(i)}</h3><p>{text}</p>
                </div>)}
              </div>
            </div>
            <Button className="wheel-drawer__nav" focusableWhenDisabled aria-label="Next timeframe" disabled={here === LAST_STOP} onClick={() => histGo((goal.current ?? Math.round(position.current)) + 1)}><Icon name="chevron_right" /></Button>
          </div>
          <p className="wheel-drawer__live" aria-live="polite" aria-atomic="true">{stopTitle(k)}</p>
          <div className="wheel-drawer__dots" role="group" aria-label="Pick a timeframe">
            {fixture.timeframes.map((stop, i) => <Button key={i} aria-label={stopTitle(i)} aria-current={k === i ? 'true' : 'false'} data-projection={stop.projection || undefined} onClick={() => histGo(i)} />)}
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="playback" className="wheel-drawer__playback">
          {state.mode === 'history' && <div className="wheel-drawer__media">
            <Button className="wheel-drawer__media-button" focusableWhenDisabled aria-label="Previous stop" disabled={state.t === 0 && goal.current === null} onClick={() => goTo(stepDestination(position.current, goal.current, -1, TODAY))}><Icon name="skip_previous" /></Button>
            <Button className="wheel-drawer__media-button wheel-drawer__play" aria-label={playing ? 'Pause' : 'Play history'} aria-pressed={playing} onClick={play}><Icon name={playing ? 'pause' : 'play_arrow'} /></Button>
            <Button className="wheel-drawer__media-button" focusableWhenDisabled aria-label="Next stop" disabled={state.t === TODAY && goal.current === null} onClick={() => goTo(stepDestination(position.current, goal.current, 1, TODAY))}><Icon name="skip_next" /></Button>
            <div className="wheel-drawer__bar" role="slider" tabIndex={0} aria-label="Time in history" aria-valuemin={0} aria-valuemax={TODAY} aria-valuenow={Math.round(state.t * 100) / 100} aria-valuetext={pickLabel(k)} onKeyDown={seekKey}
              onPointerDown={event => { if (event.button !== 0) return; halt(); dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); const next = seekAt(event); writeTime(next.t); setHover(next) }}
              onPointerMove={event => { const next = seekAt(event); setHover(next); if (dragging.current) writeTime(next.t) }}
              onPointerUp={event => { if (!dragging.current) return; dragging.current = false; event.currentTarget.releasePointerCapture(event.pointerId); goTo(Math.round(position.current), 220) }}
              onPointerCancel={() => { dragging.current = false; setHover(null); goTo(Math.round(position.current), 0) }}
              onLostPointerCapture={() => { dragging.current = false }}
              onPointerLeave={() => { if (!dragging.current) setHover(null) }}>
              {Array.from({ length: TODAY }, (_, i) => <span className="wheel-drawer__chapter" data-hover={hover !== null && Math.min(TODAY - 1, Math.floor(hover.t)) === i || undefined} key={i}>
                <span style={{ width: `${clampTime(state.t - i, 1) * 100}%` }} />
              </span>)}
              <img className="wheel-drawer__knob" src={knob} alt="" style={{ left: `calc(${state.t / TODAY * 100}% + ${4 * (chapter - state.t / TODAY * (TODAY - 1))}px)` }} />
              {hover !== null && <span className="wheel-drawer__tooltip" style={{ left: `${hover.x}px` }}>{stopTitle(Math.min(TODAY - 1, Math.floor(hover.t)))} to {stopTitle(Math.min(TODAY - 1, Math.floor(hover.t)) + 1)}</span>}
            </div>
          </div>}
          <Select.Root items={items} value={k} onValueChange={value => { if (value !== null) goTo(value) }}>
            <Select.Trigger className="wheel-drawer__pick" aria-label="Timeframe"><Select.Value /><Select.Icon><Icon name="expand_more" /></Select.Icon></Select.Trigger>
            <Select.Portal><Select.Positioner sideOffset={4} className="wheel-drawer__pick-positioner"><Select.Popup className="wheel-drawer__pick-popup"><Select.List>
              {items.map(item => <Select.Item key={item.value} value={item.value} className="wheel-drawer__pick-item"><Select.ItemText>{item.label}</Select.ItemText></Select.Item>)}
            </Select.List></Select.Popup></Select.Positioner></Select.Portal>
          </Select.Root>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  </div>
}
