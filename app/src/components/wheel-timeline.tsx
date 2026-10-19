import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Pagination } from '@/components/watermelon/pagination'
import { fixture, isProjection, LAST_STOP, stopName, TODAY } from '@/wheel/model'
import type { WheelActions, WheelState } from '@/wheel/model'
import { clampTime, playbackTime, stepDestination, tooltipLeft } from '@/wheel/drawer/drawerLogic'

// The Wheel's timeline on the preset: Governance Playback (scrub, play, step) over a timeframe pagination.
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
  const here = goal.current ?? Math.round(state.t)
  const projection = state.mode === 'projection'
  // The same names as the badge in the center of the wheel: "Q3 2025", "Last Board", "Today", "Q4 2026 (AI)".
  const stopLabel = (i: number) => isProjection(i) ? `${stopName(i)} (AI)` : stopTitle(i)
  const tb = Math.min(state.t, TODAY)
  const chapter = Math.min(TODAY - 1, Math.floor(tb))
  const Toggle = state.drawerOpen ? ChevronDown : ChevronUp

  // A bottom-aligned stack: the timeframe pagination, always visible, over the playback card (collapsible, open by
  // default, fixed layout). Playback covers history only, so the AI projection disables it.
  return <div ref={root} className="flex min-w-0 flex-col items-center gap-2">
    <Pagination totalPages={LAST_STOP + 1} value={here + 1} onChange={page => histGo(page - 1)} label={page => stopLabel(page - 1)} ai={page => isProjection(page - 1)} />
    <Button ref={pull} className={`flex h-7 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground ${float} ${focus}`}
      aria-expanded={state.drawerOpen} aria-controls={id} aria-label={`${state.drawerOpen ? 'Collapse' : 'Expand'} Governance Playback`} onClick={() => actions.setDrawerOpen(!state.drawerOpen)}>
      <Toggle size={16} />
    </Button>
    <div id={id} hidden={!state.drawerOpen} inert={!state.drawerOpen} role="region" aria-label="Governance Playback"
      className={`w-full rounded-3xl px-5 py-3 ${float}`}
      onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <div className={`flex min-w-0 items-center gap-1 transition-opacity ${projection ? 'pointer-events-none opacity-40' : ''}`} aria-disabled={projection || undefined}>
        <Button className={`size-8.5 ${round}`} focusableWhenDisabled aria-label="Previous stop" disabled={projection || (state.t === 0 && goal.current === null)} onClick={() => goTo(stepDestination(position.current, goal.current, -1, TODAY))}><SkipBack size={15} /></Button>
        <Button className={`grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 ${focus}`} disabled={projection} aria-label={playing ? 'Pause' : 'Play history'} aria-pressed={playing} onClick={play}>
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="translate-x-px" />}
        </Button>
        <Button className={`size-8.5 ${round}`} focusableWhenDisabled aria-label="Next stop" disabled={projection || (state.t === TODAY && goal.current === null)} onClick={() => goTo(stepDestination(position.current, goal.current, 1, TODAY))}><SkipForward size={15} /></Button>
            <div className={`relative ml-2 flex h-6 min-w-6 flex-1 cursor-pointer touch-none items-center gap-1 rounded-sm ${focus}`} role="slider" tabIndex={0} aria-label="Time in history" aria-valuemin={0} aria-valuemax={TODAY} aria-valuenow={Math.round(state.t * 100) / 100} aria-valuetext={pickLabel(Math.round(tb))} onKeyDown={seekKey}
              onPointerDown={event => { if (event.button !== 0) return; halt(); dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); const next = seekAt(event); writeTime(next.t); setHover(next) }}
              onPointerMove={event => { const next = seekAt(event); setHover(next); if (dragging.current) writeTime(next.t) }}
              onPointerUp={event => { if (!dragging.current) return; dragging.current = false; event.currentTarget.releasePointerCapture(event.pointerId); goTo(Math.round(position.current), 220) }}
              onPointerCancel={() => { dragging.current = false; setHover(null); goTo(Math.round(position.current), 0) }}
              onLostPointerCapture={() => { dragging.current = false }}
              onPointerLeave={() => { if (!dragging.current) setHover(null) }}>
              {Array.from({ length: TODAY }, (_, i) => <span key={i} className={`flex-1 overflow-hidden rounded-full bg-border transition-[height] duration-150 ${hover !== null && Math.min(TODAY - 1, Math.floor(hover.t)) === i ? 'h-1.5' : 'h-1'}`}>
                <span className="block h-full bg-foreground" style={{ width: `${clampTime(tb - i, 1) * 100}%` }} />
              </span>)}
              <span className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow-soft"
                style={{ left: `calc(${tb / TODAY * 100}% + ${4 * (chapter - tb / TODAY * (TODAY - 1))}px)` }} />
              {hover !== null && <span className="pointer-events-none absolute bottom-7.5 z-10 -translate-x-1/2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-soft" style={{ left: `${hover.x}px` }}>
                {stopTitle(Math.min(TODAY - 1, Math.floor(hover.t)))} to {stopTitle(Math.min(TODAY - 1, Math.floor(hover.t)) + 1)}
              </span>}
            </div>
      </div>
    </div>
  </div>
}
