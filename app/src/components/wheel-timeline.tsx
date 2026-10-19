import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { Select } from '@base-ui/react/select'
import { Tabs } from '@base-ui/react/tabs'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CirclePlay, GitCommitHorizontal, Pause, Play, SkipBack, SkipForward, Sparkles } from 'lucide-react'
import { fixture, LAST_STOP, pointsAt, stopName, TODAY } from '@/wheel/model'
import type { WheelActions, WheelState } from '@/wheel/model'
import { clampTime, playbackTime, slideText, stepDestination, tooltipLeft } from '@/wheel/drawer/drawerLogic'

// The Wheel's timeline on the preset: Governance History (a carousel of stops) and Governance Playback (scrub, play, step).
// History stops are plain; AI projection stops are tinted. Behavior and keyboard are wheel/drawer/WheelDrawer's.

const stopTitle = (i: number) => stopName(i) === 'Last board' ? 'Last Board' : stopName(i)
const pickLabel = (i: number) => fixture.timeframes[i].label.replace('\nAI projection', '').replace('\n', ', ')
const focus = 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'
const round = `grid shrink-0 place-items-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-muted data-[disabled]:cursor-default data-[disabled]:opacity-35 data-[disabled]:hover:bg-card ${focus}`
const float = 'border border-border/60 bg-card/90 shadow-soft backdrop-blur-md'

export function WheelTimeline({ state, actions }: { state: WheelState; actions: WheelActions }) {
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
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotion)
    return () => {
      halt()
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
  const projection = state.mode === 'projection'
  const title = state.drawerView === 'history' ? 'Governance History' : 'Governance Playback'
  const subtitle = state.drawerView === 'history' ? 'Step through each timeframe and see what changed.' : state.mode === 'history'
    ? 'Play the readings from Q3 2025 to today, or pick a timeframe.' : 'See where the AI expects each reading to go. Estimates, not evidence.'
  const slides = useMemo(() => fixture.timeframes.map((_, i) => slideText(pointsAt(state.domain, i), i ? pointsAt(state.domain, i - 1) : null, i ? stopTitle(i - 1) : '', i > TODAY)), [state.domain])
  const items = fixture.timeframes.flatMap((stop, i) => stop.projection === projection ? [{ value: i, label: pickLabel(i) }] : [])
  const chapter = Math.min(TODAY - 1, Math.floor(state.t))
  const Toggle = state.drawerOpen ? ChevronDown : ChevronUp

  return <div ref={root} className="flex min-w-0 flex-col items-center gap-1.5">
    <Button ref={pull} className={`flex h-7 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground ${float} ${focus}`}
      aria-expanded={state.drawerOpen} aria-controls={id} aria-label={`${state.drawerOpen ? 'Close' : 'Open'} ${title}`} onClick={() => actions.setDrawerOpen(!state.drawerOpen)}>
      <Toggle size={16} />
    </Button>
    <div id={id} hidden={!state.drawerOpen} inert={!state.drawerOpen} role="region" aria-label={title}
      className={`w-full rounded-3xl px-5 py-4 transition-colors ${float} ${projection ? 'border-primary/30' : ''}`}
      onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <Tabs.Root value={state.drawerView} onValueChange={view => { halt(); actions.setDrawerView(view as WheelState['drawerView']) }}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 font-heading text-base leading-tight font-semibold">{title}</h2>
            <p className="m-0 mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <Tabs.List className="flex shrink-0 gap-1 rounded-full border border-border/60 bg-muted/50 p-1" aria-label="Playback view">
            {([['history', 'Governance History', GitCommitHorizontal], ['playback', 'Governance Playback', CirclePlay]] as const).map(([value, label, Icon]) => (
              <Tabs.Tab key={value} value={value} aria-label={label} title={label}
                className={`grid h-7 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground data-[active]:bg-card data-[active]:text-foreground data-[active]:shadow-soft ${focus}`}>
                <Icon size={16} />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </div>

        <Tabs.Panel value="history" className="flex flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2" role="region" aria-roledescription="carousel" aria-label="Timeframes">
            <Button className={`size-8 ${round}`} focusableWhenDisabled aria-label="Previous timeframe" disabled={here === 0} onClick={() => histGo((goal.current ?? Math.round(position.current)) - 1)}><ChevronLeft size={16} /></Button>
            <div className="min-w-0 flex-1 touch-pan-y overflow-hidden rounded-2xl"
              onPointerDown={event => { swipe.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId) }}
              onPointerUp={event => { const dx = event.clientX - (swipe.current ?? event.clientX); swipe.current = null; if (Math.abs(dx) > 40) histGo((goal.current ?? Math.round(position.current)) + (dx < 0 ? 1 : -1)) }}
              onPointerCancel={() => { swipe.current = null }}>
              <div className="relative transition-transform duration-[350ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none" style={{ transform: `translateX(${-k * 100}%)` }}>
                {slides.map((text, i) => {
                  const ai = i > TODAY
                  return <div key={i} style={{ left: `${i * 100}%` }} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${fixture.timeframes.length}`} aria-hidden={i !== k}
                    className={`${i === k ? 'relative' : 'absolute'} top-0 min-h-[84px] w-full min-w-0 touch-pan-y rounded-2xl border px-4 py-3 ${ai ? 'border-primary/20 bg-accent/30' : 'border-transparent bg-muted/50'}`}>
                    <h3 className="m-0 mb-1 flex items-center gap-1.5 font-heading text-sm font-semibold">{ai && <Sparkles size={13} className="text-primary" />}{stopTitle(i)}</h3>
                    <p className="m-0 text-sm leading-relaxed">{text}</p>
                  </div>
                })}
              </div>
            </div>
            <Button className={`size-8 ${round}`} focusableWhenDisabled aria-label="Next timeframe" disabled={here === LAST_STOP} onClick={() => histGo((goal.current ?? Math.round(position.current)) + 1)}><ChevronRight size={16} /></Button>
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">{stopTitle(k)}</p>
          <div className="flex items-center justify-center gap-1" role="group" aria-label="Pick a timeframe">
            {fixture.timeframes.map((stop, i) => <Button key={i} aria-label={stopTitle(i)} aria-current={k === i ? 'true' : 'false'} onClick={() => histGo(i)}
              className={`relative h-2 rounded-full p-0 transition-[width,background-color] duration-200 before:absolute before:-inset-x-0.5 before:-inset-y-1.5 motion-reduce:transition-none ${focus} ${k === i ? 'w-5.5' : 'w-2'} ${stop.projection ? (k === i ? 'bg-primary' : 'bg-primary/35') : (k === i ? 'bg-foreground' : 'bg-muted-foreground/35')}`} />)}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="playback" className="flex items-center gap-4">
          {state.mode === 'history' && <div className="flex min-w-0 flex-1 items-center gap-1">
            <Button className={`size-8.5 ${round}`} focusableWhenDisabled aria-label="Previous stop" disabled={state.t === 0 && goal.current === null} onClick={() => goTo(stepDestination(position.current, goal.current, -1, TODAY))}><SkipBack size={15} /></Button>
            <Button className={`grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 ${focus}`} aria-label={playing ? 'Pause' : 'Play history'} aria-pressed={playing} onClick={play}>
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="translate-x-px" />}
            </Button>
            <Button className={`size-8.5 ${round}`} focusableWhenDisabled aria-label="Next stop" disabled={state.t === TODAY && goal.current === null} onClick={() => goTo(stepDestination(position.current, goal.current, 1, TODAY))}><SkipForward size={15} /></Button>
            <div className={`relative ml-2 flex h-6 min-w-6 flex-1 cursor-pointer touch-none items-center gap-1 rounded-sm ${focus}`} role="slider" tabIndex={0} aria-label="Time in history" aria-valuemin={0} aria-valuemax={TODAY} aria-valuenow={Math.round(state.t * 100) / 100} aria-valuetext={pickLabel(k)} onKeyDown={seekKey}
              onPointerDown={event => { if (event.button !== 0) return; halt(); dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); const next = seekAt(event); writeTime(next.t); setHover(next) }}
              onPointerMove={event => { const next = seekAt(event); setHover(next); if (dragging.current) writeTime(next.t) }}
              onPointerUp={event => { if (!dragging.current) return; dragging.current = false; event.currentTarget.releasePointerCapture(event.pointerId); goTo(Math.round(position.current), 220) }}
              onPointerCancel={() => { dragging.current = false; setHover(null); goTo(Math.round(position.current), 0) }}
              onLostPointerCapture={() => { dragging.current = false }}
              onPointerLeave={() => { if (!dragging.current) setHover(null) }}>
              {Array.from({ length: TODAY }, (_, i) => <span key={i} className={`flex-1 overflow-hidden rounded-full bg-border transition-[height] duration-150 ${hover !== null && Math.min(TODAY - 1, Math.floor(hover.t)) === i ? 'h-1.5' : 'h-1'}`}>
                <span className="block h-full bg-foreground" style={{ width: `${clampTime(state.t - i, 1) * 100}%` }} />
              </span>)}
              <span className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow-soft"
                style={{ left: `calc(${state.t / TODAY * 100}% + ${4 * (chapter - state.t / TODAY * (TODAY - 1))}px)` }} />
              {hover !== null && <span className="pointer-events-none absolute bottom-7.5 z-10 -translate-x-1/2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-soft" style={{ left: `${hover.x}px` }}>
                {stopTitle(Math.min(TODAY - 1, Math.floor(hover.t)))} to {stopTitle(Math.min(TODAY - 1, Math.floor(hover.t)) + 1)}
              </span>}
            </div>
          </div>}
          <Select.Root items={items} value={k} onValueChange={value => { if (value !== null) goTo(value) }}>
            <Select.Trigger aria-label="Timeframe"
              className={`flex h-9 w-56 shrink-0 items-center justify-between rounded-full border bg-card px-3.5 font-mono text-xs ${projection ? 'border-primary/30' : 'border-border/60'} ${focus}`}>
              <Select.Value /><Select.Icon><ChevronDown size={14} className="text-muted-foreground" /></Select.Icon>
            </Select.Trigger>
            <Select.Portal><Select.Positioner sideOffset={6} className="z-50"><Select.Popup className="min-w-(--anchor-width) rounded-2xl border border-border/60 bg-popover p-1 text-popover-foreground shadow-soft"><Select.List>
              {items.map(item => <Select.Item key={item.value} value={item.value} className="cursor-pointer rounded-xl px-2.5 py-2 font-mono text-xs outline-none data-[highlighted]:bg-muted data-[selected]:bg-muted"><Select.ItemText>{item.label}</Select.ItemText></Select.Item>)}
            </Select.List></Select.Popup></Select.Positioner></Select.Portal>
          </Select.Root>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  </div>
}
