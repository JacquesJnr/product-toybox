import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Bot, Check, ChevronDown, ChevronUp, Circle, Download, FileCode, Pencil, RefreshCw, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QueryGraph, startLinks, startNodes, suggestion, type QLink, type QNode } from './QueryGraph'

// Style directions for app-map stages 5, 6 and 7 (Query, Board Simulation Room, Export Query).
// Content from the mid-fi screens on the wiki. The rule from the style page holds:
// vault parts (sources, documents) are plain and still; AI parts are tinted, glow or move.

const label = 'text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase'

// A source chip: vault material, so plain and still.
function Source({ children, missing }: { children: ReactNode; missing?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide ${missing ? 'border-dashed border-border text-muted-foreground' : 'border-border/80 bg-muted/60 text-foreground'}`}>
      {children}{!missing && <ArrowUpRight size={10} />}
    </span>
  )
}

// One stat in a header strip.
function Stat({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={label}>{name}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

// ── Stage 5 · Query ────────────────────────────────────────────────────────────

type Finding = { kind: 'agree' | 'conflict' | 'assume' | 'unknown'; title: string; text: string; sources: string[] }

const findings: Finding[] = [
  { kind: 'agree', title: 'Where the evidence agrees', text: 'Spend is on budget: 62% committed against a phased plan the board approved in March.', sources: ['Report p.9', 'ERP · Aug actuals'] },
  { kind: 'conflict', title: 'Where it conflicts', text: 'The programme report says M3 is on track; the risk register rates the same milestone high risk with 4 open risks. The two were updated 4 days apart.', sources: ['Report p.14', 'R-22'] },
  { kind: 'assume', title: 'Assumptions', text: 'Regional training finishes before go-live. No source confirms the training dates are fixed.', sources: ['Report p.15'] },
  { kind: 'unknown', title: "What isn't known", text: "Vendor exit terms: the CoreSys contract hasn't been read yet.", sources: [] },
]

const findingStyle: Record<Finding['kind'], string> = {
  agree: '',
  conflict: 'rounded-xl bg-status-near/10 p-3 ring-1 ring-status-near/30',
  assume: '',
  unknown: 'rounded-xl border border-dashed border-border p-3',
}

export function QueryStyle() {
  const [accepted, setAccepted] = useState<boolean | null>(null)
  const [added, setAdded] = useState<{ nodes: QNode[]; links: QLink[] }>({ nodes: [], links: [] })
  const [suggested, setSuggested] = useState<'open' | 'accepted' | 'rejected'>('open')
  // An accepted suggestion becomes a plain vault node and link.
  const keep = suggested === 'accepted'
  const nodes = [...startNodes, ...(keep ? [suggestion] : []), ...added.nodes]
  const links = [...startLinks, ...(keep ? [{ ...suggestion.link, text: 'M3 depends on regional training finishing first.' }] : []), ...added.links]
  return (
    // One centered vertical chain: header, stats, Query graph, Analysis, suggested change.
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {/* Header: the question is the title, the focus sits under it. */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={label}>Query</span>
          <h3 className="font-heading text-3xl font-semibold">Is the Q1 go-live ready?</h3>
          <p className="text-muted-foreground">Focus: can the consolidated ledger go live in Q1 FY27 without breaching the approved budget or the board's risk appetite?
            <Button variant="ghost" size="icon-xs" aria-label="Edit the focus" title="Edit the focus" className="ml-1 align-middle text-muted-foreground"><Pencil /></Button>
          </p>
        </div>
        <div className="flex gap-2">
          <Button>Open Board Simulation Room</Button>
        </div>
      </div>

      <div className="flex items-center gap-10 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-soft">
        <Stat name="Nodes" value={`${nodes.length} · ${links.length} links`} />
        <Stat name="What's new" value="2 since yesterday" />
        <Stat name="Readiness" value="Financial data: ERP live, read-only" />
        <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Owner · M. Vale</span>
      </div>

      <div className="flex flex-col gap-4">
        <QueryGraph nodes={nodes} links={links} suggestionState={suggested} onSuggestion={setSuggested}
          onAdd={(n, l) => setAdded({ nodes: [...added.nodes, ...n], links: [...added.links, ...l] })} />

        <div className="flex flex-col gap-4">
        {/* The Analysis is AI-written, so it carries the rainbow edge. */}
        <div className="ai-edge flex flex-col gap-4 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-heading text-lg font-semibold"><Sparkles size={16} className="ai-glow text-[#8338EC]" />Analysis</h4>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">Local model · version 3 · 18 min ago</span>
              <Button variant="outline" size="sm"><RefreshCw size={14} />Regenerate</Button>
            </div>
          </div>
          {findings.map((f, i) => (
            <motion.div key={f.kind} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className={`flex flex-col gap-2 ${findingStyle[f.kind]}`}>
              <span className={`flex items-center gap-1.5 ${label}`}>
                {f.kind === 'conflict' && <span className="size-1.5 rounded-full bg-status-near" />}
                {f.kind === 'unknown' && <Circle size={9} />}
                {f.title}
              </span>
              <p className="text-sm leading-relaxed">{f.text}</p>
              {f.sources.length > 0 && <div className="flex flex-wrap gap-1.5">{f.sources.map(s => <Source key={s}>{s}</Source>)}</div>}
            </motion.div>
          ))}
        </div>

          {/* A suggested change from AI Chat. Accept or reject; the director decides. */}
          <div className="ai-edge flex flex-col gap-3 rounded-2xl p-4 shadow-soft [--ai-fill:color-mix(in_oklch,var(--card)_94%,#8338EC)]">
            <span className={`flex items-center gap-1.5 ${label}`}><Bot size={12} />Suggested change to Analysis</span>
            <p className="text-sm leading-relaxed">+ Regional training is scheduled for November, one month before the readiness review. If it slips, M3 has no buffer.</p>
            <Source>Report p.15</Source>
            {accepted === null
              ? <div className="flex gap-2"><Button size="sm" onClick={() => setAccepted(true)}><Check size={14} />Accept</Button><Button size="sm" variant="outline" onClick={() => setAccepted(false)}><X size={14} />Reject</Button></div>
              : <button className="self-start text-xs text-muted-foreground underline" onClick={() => setAccepted(null)}>{accepted ? 'Added to Assumptions' : 'Rejected'} · undo</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Style-page state switcher ──────────────────────────────────────────────────
// Not product UI: a dashed strip so Jacques can jump between states. Builders drop it.

function StateSwitcher<T extends string>({ states, current, onPick, note }: { states: readonly T[]; current: T; onPick: (s: T) => void; note?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2">
      <span className={`mr-1 ${label}`}>Style page · state</span>
      {states.map(s => (
        <button key={s} onClick={() => onPick(s)} className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${s === current ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{s}</button>
      ))}
      {note && <span className="ml-auto text-[11px] text-muted-foreground">{note}</span>}
    </div>
  )
}

const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const timeOf = (ms: number) => new Date(ms).toLocaleTimeString('en-GB')

// ── Stage 6 · Board Simulation Room ────────────────────────────────────────────
// Example content: the app map's Meridian go-live case. Builders take the real text from stage-script.json.

const scenario = 'Can we proceed with the decision in this Query, and under what conditions?'
const STEP_MS = 2000 // steps complete at 2, 4, 6 and 8 s
const RUN_MS = STEP_MS * 4

type Lens = { name: string; weighs: string; text: string; reasoning: string; sources: string[]; stance: string; missing?: boolean }

const lenses: Lens[] = [
  { name: 'Finance', weighs: 'Cost and contingency', stance: 'Proceed in Q2 on contingency',
    text: 'A one-quarter slip adds about AED 2.1m in parallel running costs, inside the 5% contingency.',
    reasoning: 'Contingency is 5% of AED 48m, about AED 2.4m. The slip costs about AED 2.1m, so a Q2 date is affordable without new money.',
    sources: ['Report p.9', 'ERP · Aug actuals'] },
  { name: 'Risk', weighs: "The board's risk appetite", stance: 'Not in Q1',
    text: "Going live in Q1 with 4 open high risks breaches the board's stated appetite for finance systems.",
    reasoning: 'Cost is not the test; appetite is. M3 carries four open high risks, so any date holds only once R-22 is back within appetite.',
    sources: ['R-22', 'Risk appetite §3'] },
  { name: 'Operations', weighs: 'Delivery and readiness', stance: 'Only if training is fixed',
    text: 'Regional training is the critical path. Its November dates are not confirmed in any source.',
    reasoning: 'Q2 gives one month of buffer after training. If training slips, Q2 has none, so the date depends on fixing training first.',
    sources: ['Report p.15'] },
  { name: 'Challenger', weighs: 'What the others assume', stance: 'Evidence missing', missing: true,
    text: 'Neither report tests the vendor. If CoreSys support ends before go-live, both dates fail.',
    reasoning: 'Every lens assumes CoreSys supports the ledger through Q2. The contract is not in the vault, so nobody can test that.',
    sources: ['CoreSys contract'] },
]

const emerged = [
  { kind: 'Agree', dot: 'bg-status-within', text: 'A one-quarter slip is affordable: about AED 2.1m, inside the 5% contingency.', who: 'Finance and Risk', sources: ['Report p.9', 'ERP · Aug actuals'] },
  { kind: 'Disagree', dot: 'bg-status-near', text: 'Whether to proceed. Finance would go live in Q2 on contingency; Risk would not go live while M3 carries four open high risks.', who: 'Finance vs Risk', sources: ['Report p.9', 'R-22'] },
  { kind: 'Missing', dot: 'border border-muted-foreground bg-transparent', text: "Vendor continuity: the CoreSys contract isn't in the vault, so no lens could test whether support lasts past go-live.", who: 'Challenger', sources: [] },
]

const assumptionsShared = [
  { text: 'Both lenses use the same AED 2.1m slip cost.', source: 'Report p.9' },
  { text: 'Contingency is not drawn on elsewhere before Q2. No source confirms it.', source: '' },
  { text: 'Regional training finishes in November. The dates are not fixed.', source: 'Report p.15' },
]

type Run = { startedAt: number; completedAt: number | null; opened: boolean; prepared: boolean; replaced: boolean }
const roomStates = ['Setup', 'Running', 'Completed', 'Detail opened', 'Prepared', 'Rerun'] as const
type RoomState = typeof roomStates[number]

function roomStateOf(run: Run | null): RoomState {
  if (!run) return 'Setup'
  if (run.replaced && !run.opened) return 'Rerun'
  if (run.completedAt === null) return 'Running'
  return run.prepared ? 'Prepared' : run.opened ? 'Detail opened' : 'Completed'
}

type LensStatus = 'waiting' | 'queued' | 'working' | 'done'

function LensCard({ lens, status, doneAt }: { lens: Lens; status: LensStatus; doneAt: number }) {
  const working = status === 'working'
  const done = status === 'done'
  return (
    // Working is AI in motion: rainbow edge and a pulse. Done settles to a plain card. Waiting and queued are quiet.
    <div className={`flex min-h-52 flex-col gap-3 rounded-2xl p-4 shadow-soft ${working ? 'ai-edge' : done ? 'border border-border/60 bg-card' : 'border border-dashed border-border bg-card/60'}`}>
      <div className="flex items-center justify-between">
        <span className="font-heading font-semibold">{lens.name}</span>
        {working && <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><motion.span className="size-1.5 rounded-full bg-[#8338EC]" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />Working</span>}
        {done && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Check size={12} />Done · {doneAt} s</span>}
        {status === 'queued' && <span className="text-[11px] text-muted-foreground">Queued</span>}
      </div>
      <span className="text-xs text-muted-foreground">Weighs: {lens.weighs}</span>
      {done && <p className="text-sm leading-relaxed">{lens.text}</p>}
      {working && <p className="text-sm text-muted-foreground">Reading the Query evidence<motion.span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-[#8338EC]" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }} /></p>}
      {done && <div className="flex flex-wrap gap-1.5">{lens.sources.map(s => <Source key={s} missing={lens.missing}>{lens.missing ? `${s} · not in the vault` : s}</Source>)}</div>}
      {done && <span className="mt-auto self-start rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">{lens.stance}</span>}
    </div>
  )
}

export function BoardRoomStyle() {
  const [run, setRun] = useState<Run | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [detailOpen, setDetailOpen] = useState(false) // shown or hidden; run.opened is the review gate and stays set

  // One timer while running; it stops at completion and the completion time stays fixed.
  useEffect(() => {
    if (!run || run.completedAt !== null) return
    const t = setInterval(() => {
      const n = Date.now()
      setNow(n)
      if (n - run.startedAt >= RUN_MS) setRun(r => r && { ...r, completedAt: r.startedAt + RUN_MS })
    }, 100)
    return () => clearInterval(t)
  }, [run])

  const start = (replaced: boolean) => { const n = Date.now(); setNow(n); setDetailOpen(false); setRun({ startedAt: n, completedAt: null, opened: false, prepared: false, replaced }) }
  const finished = (extra: Partial<Run>) => { const n = Date.now(); setRun({ startedAt: n - RUN_MS, completedAt: n, opened: false, prepared: false, replaced: false, ...extra }) }
  const pick = (s: RoomState) => {
    setDetailOpen(s === 'Detail opened' || s === 'Prepared')
    if (s === 'Setup') setRun(null)
    else if (s === 'Running') start(false)
    else if (s === 'Completed') finished({})
    else if (s === 'Detail opened') finished({ opened: true })
    else if (s === 'Prepared') finished({ opened: true, prepared: true })
    else start(true)
  }

  const running = run !== null && run.completedAt === null
  const complete = run?.completedAt != null
  const elapsed = run ? Math.min(RUN_MS, Math.max(0, (run.completedAt ?? now) - run.startedAt)) : 0
  const steps = Math.floor(elapsed / STEP_MS)
  const statusOf = (i: number): LensStatus => !run ? 'waiting' : i < steps ? 'done' : i === steps ? 'working' : 'queued'
  const statusText = (i: number) => ({ waiting: 'Not started', queued: 'Queued', working: 'Working', done: `Done · ${(i + 1) * 2} s` })[statusOf(i)]

  return (
    <div id="room-style" className="flex w-full scroll-mt-6 flex-col gap-4">
      <StateSwitcher states={roomStates} current={roomStateOf(run)} onPick={pick} note="Running and Rerun play the real 8 s run." />

      {/* Header: the fixed scenario is the title; the slip framing and the fixed facts sit under it. No setup controls. */}
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className={label}>Board Simulation Room · Is the Q1 go-live ready?</span>
          <h3 className="max-w-2xl font-heading text-3xl font-semibold">{scenario}</h3>
          <p className="text-muted-foreground">Tested against one change: go-live slips one quarter, from Q1 to Q2 FY27.</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs">4 fixed lenses</span>
            <span className="ai-edge flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"><Bot size={12} />Scripted local-model representation, not a running model</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {!complete
            ? <Button disabled={running} onClick={() => start(false)}>{running ? 'Running…' : 'Run simulation'}</Button>
            : <Button variant="outline" onClick={() => start(true)}><RefreshCw size={14} />Run again</Button>}
          {complete && <span className="text-[11px] text-muted-foreground">Replaces this result</span>}
        </div>
      </div>

      {run?.replaced && (
        <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm">
          <RefreshCw size={14} className="text-muted-foreground" />
          This run replaces the previous result. The previous export draft is gone; review and prepare this run to export it.
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">{lenses.map((l, i) => <LensCard key={l.name} lens={l} status={statusOf(i)} doneAt={(i + 1) * 2} />)}</div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {!complete ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border p-5 text-center">
            <h4 className="font-heading text-lg font-semibold">What emerged</h4>
            <p className="max-w-sm text-sm text-muted-foreground">{running ? `Appears when all four lenses finish. ${4 - steps} to go.` : 'Appears when all four lenses finish, about 8 seconds after you run the simulation.'}</p>
          </div>
        ) : (
          // What emerged: compiled by AI from the four steps, so the edge; each line is plain to read.
          <div className="ai-edge flex flex-col gap-1 rounded-2xl p-5 shadow-soft">
            <div className="mb-2 flex items-center justify-between"><h4 className="font-heading text-lg font-semibold">What emerged</h4><span className="text-xs text-muted-foreground">4 of 4 lenses · scripted</span></div>
            {emerged.map(e => {
              const disagree = e.kind === 'Disagree'
              return (
                <div key={e.kind} className={`grid grid-cols-[110px_1fr] gap-4 border-t border-border/60 py-3`}>
                  <span className="flex items-center gap-2 text-sm font-medium"><span className={`size-2 rounded-full ${e.dot}`} />{e.kind}</span>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm">{e.text}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-xs text-muted-foreground">{e.who}</span>
                      {e.sources.map(s => <Source key={s}>{s}</Source>)}
                      {e.kind === 'Missing' && <Source missing>CoreSys contract · not in the vault</Source>}
                    </div>
                    {disagree && !detailOpen && (
                      <Button size="sm" variant="outline" className="mt-1 self-start" onClick={() => { setRun({ ...run, opened: true }); setDetailOpen(true) }}>Open the disagreement<ChevronDown size={14} /></Button>
                    )}
                    {disagree && detailOpen && <DisagreementDetail onClose={() => setDetailOpen(false)} />}
                  </div>
                </div>
              )
            })}
            {/* Prepare is gated on having opened the disagreement once. Closing it again keeps the gate open. */}
            <div className="mt-2 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              {run.prepared ? (
                <>
                  <span className="flex items-center gap-1.5 text-sm"><Check size={14} className="text-primary" />Prepared for the board · this result goes to Export</span>
                  <Button onClick={() => goTo('export-style')}>Open Export Query<ArrowRight size={14} /></Button>
                </>
              ) : (
                <>
                  {!run.opened && <span className="text-xs text-muted-foreground">Open the disagreement before you prepare</span>}
                  <Button disabled={!run.opened} onClick={() => setRun({ ...run, prepared: true })}>Prepare for the board</Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-1 flex items-baseline justify-between">
            <h4 className="font-heading text-lg font-semibold">Run status</h4>
            <span className="font-mono text-xs text-muted-foreground">{(elapsed / 1000).toFixed(1)} s</span>
          </div>
          <div className="flex gap-1" aria-label={`${steps} of 4 steps complete`}>
            {lenses.map((l, i) => <span key={l.name} className={`h-1.5 flex-1 rounded-full ${i < steps ? 'bg-foreground' : 'bg-secondary'}`} />)}
          </div>
          <span className="mb-1 text-xs text-muted-foreground">{!run ? 'Not started' : complete ? 'Complete · 4 of 4 steps' : `Step ${steps + 1} of 4`}</span>
          {lenses.map((l, i) => (
            <div key={l.name} className="flex items-center justify-between text-sm">
              <span>{l.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{statusText(i)}</span>
            </div>
          ))}
          {complete && <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs">Stopped at 8.0 s · completed {timeOf(run.completedAt!)}</p>}
          <p className="mt-auto pt-4 text-xs text-muted-foreground">The four steps are written in advance and play back at 2, 4, 6 and 8 s. No model runs, and nothing leaves the building.</p>
        </div>
      </div>
    </div>
  )
}

// One level down from Disagree: each lens's reasoning, the shared assumptions and the sources.
function DisagreementDetail({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-2 flex flex-col gap-4 rounded-xl bg-status-near/10 p-4 ring-1 ring-status-near/30">
      <div className="flex items-center justify-between">
        <span className={label}>Disagreement detail</span>
        <button onClick={onClose} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">Close<ChevronUp size={12} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {lenses.map(l => {
          const side = l.name === 'Finance' || l.name === 'Risk'
          return (
            <div key={l.name} className={`flex flex-col gap-2 rounded-lg p-3 ${side ? 'bg-card ring-1 ring-border' : 'bg-card/50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{l.name}{side && <span className="ml-1.5 font-normal text-muted-foreground">· in the disagreement</span>}</span>
                <span className="text-[11px] text-muted-foreground">{l.stance}</span>
              </div>
              <p className="text-sm leading-relaxed">{l.reasoning}</p>
              <div className="flex flex-wrap gap-1.5">{l.sources.map(s => <Source key={s} missing={l.missing}>{l.missing ? `${s} · not in the vault` : s}</Source>)}</div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-col gap-2">
        <span className={label}>Assumptions they share</span>
        {assumptionsShared.map(a => (
          <div key={a.text} className="flex items-center justify-between gap-4 text-sm">
            <span>{a.text}</span>
            {a.source ? <Source>{a.source}</Source> : <Source missing>No source</Source>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stage 7 · Export Query ─────────────────────────────────────────────────────
// Standard detail and an HTML file only. The preview is the file: same snapshot, same fields, same order.

const refs = [
  { n: 1, doc: 'FY26 Transformation programme report', passage: 'p.9' },
  { n: 2, doc: 'ERP · finance ledger', passage: 'August actuals' },
  { n: 3, doc: 'FY26 Transformation programme report', passage: 'p.14' },
  { n: 4, doc: 'Risk register', passage: 'R-22' },
  { n: 5, doc: 'Risk appetite statement', passage: '§3' },
  { n: 6, doc: 'FY26 Transformation programme report', passage: 'p.15' },
  { n: 7, doc: 'CoreSys contract', passage: '', unavailable: 'Not in the vault. Its terms cannot be inferred from citations.' },
]

type PaperClaim = { text: string; refs: number[]; tag?: { text: string; tone: 'conflict' | 'ai' | 'unknown' } }

const paper: { title: string; ai?: boolean; claims: PaperClaim[] }[] = [
  { title: 'Analysis', claims: [
    { text: 'Spend stands at 62% of the approved AED 48m budget, in line with the phasing the board agreed in March.', refs: [1, 2] },
    { text: 'The programme report says go-live milestone M3 is on track; the risk register rates the same milestone high risk, with four open risks.', refs: [3, 4], tag: { text: 'Open conflict', tone: 'conflict' } },
  ] },
  { title: 'Board Simulation Room findings', ai: true, claims: [
    { text: 'Agree: a one-quarter slip is affordable, about AED 2.1m inside the 5% contingency.', refs: [1, 2] },
    { text: 'Disagree: Finance would go live in Q2 on contingency; Risk would not go live while M3 carries four open high risks.', refs: [1, 4, 5], tag: { text: 'Simulation, not a forecast', tone: 'ai' } },
    { text: 'Missing evidence: no lens could test vendor continuity.', refs: [7], tag: { text: 'Evidence missing', tone: 'unknown' } },
  ] },
  { title: 'Assumptions', claims: [
    { text: 'Regional training finishes in November. No source fixes the dates.', refs: [6] },
    { text: 'Contingency is not drawn on elsewhere before Q2.', refs: [], tag: { text: 'No source', tone: 'unknown' } },
  ] },
  { title: 'Unknowns', claims: [
    { text: "Vendor continuity: whether CoreSys support lasts past go-live. The contract isn't in the vault.", refs: [7], tag: { text: 'Unknown', tone: 'unknown' } },
  ] },
]

const tagTone = { conflict: 'text-status-near', ai: 'ai-text', unknown: 'text-muted-foreground' }

// A metadata value is either shown or marked unavailable, with the reason. Never left blank.
function Meta({ name, value, unavailable, ai }: { name: string; value?: string; unavailable?: string; ai?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg px-3 py-2 ${unavailable ? 'border border-dashed border-border' : ai ? 'ai-edge' : 'bg-muted/60'}`}>
      <span className={label}>{name}</span>
      {unavailable
        ? <span className="flex items-start gap-1.5 text-xs text-muted-foreground"><Circle size={8} className="mt-1 shrink-0" />Unavailable: {unavailable}</span>
        : <span className="text-xs">{value}</span>}
    </div>
  )
}

const exportStates = ['Preview', 'Download started', 'Blocked'] as const
type ExportState = typeof exportStates[number]
const filename = 'is-the-q1-go-live-ready-board-paper.html'

export function ExportStyle() {
  const [state, setState] = useState<ExportState>('Preview')
  const [tries, setTries] = useState(0)
  const download = () => { setTries(t => t + 1); setState('Download started') }
  const pick = (s: ExportState) => { setTries(s === 'Download started' ? 1 : 0); setState(s) }

  return (
    <div id="export-style" className="flex w-full scroll-mt-6 flex-col gap-4">
      <StateSwitcher states={exportStates} current={state} onPick={pick} note="The style page writes no file." />

      {state === 'Blocked' ? (
        // The Export gate: no prepared, reviewed Room result. A rerun lands here too.
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
          <h3 className="font-heading text-2xl font-semibold">Nothing to export yet</h3>
          <p className="max-w-md text-sm text-muted-foreground">Export uses a Board Simulation Room result you have reviewed and prepared for the board. Run the Room, open its disagreement, then prepare it. A rerun discards the earlier draft.</p>
          <Button variant="outline" onClick={() => goTo('room-style')}>Open Board Simulation Room</Button>
        </div>
      ) : (
        <div className="grid w-full grid-cols-[280px_1fr] gap-4">
          <div className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-muted/40 p-5">
            <h3 className="font-heading text-2xl font-semibold">Export Query</h3>
            <div className="flex flex-col gap-1">
              <span className={label}>Detail</span>
              <span className="text-sm font-medium">Standard</span>
              <span className="text-xs text-muted-foreground">Findings with their sources, assumptions and unknowns</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={label}>File</span>
              <span className="flex items-center gap-1.5 text-sm font-medium"><FileCode size={14} />HTML</span>
              <span className="text-xs text-muted-foreground">One self-contained file. Opens offline in any browser.</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={label}>Kept in the file</span>
              {['Sources beside each claim', 'Confidence and freshness', 'Open conflicts and unknowns', 'Which model wrote what'].map(k => <span key={k} className="flex items-center gap-2 text-sm"><Check size={14} className="text-primary" />{k}</span>)}
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <Button onClick={download}><Download size={14} />{state === 'Download started' ? 'Download HTML again' : 'Download HTML'}</Button>
              {state === 'Download started' && (
                // Only that the download started: the browser, not Quantum State, knows whether it saved.
                <div className="flex flex-col gap-1 rounded-lg bg-card px-3 py-2.5 text-xs shadow-soft">
                  <span className="font-medium">Download started{tries > 1 ? ` · attempt ${tries}` : ''}</span>
                  <span className="break-all font-mono text-[11px]">{filename}</span>
                  <span className="text-muted-foreground">Check your browser's downloads to find the file.</span>
                </div>
              )}
            </div>
          </div>

          {/* The draft reads as paper: plain and still. AI-written parts carry the AI marks. */}
          <div className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
            <div className="flex items-center justify-between">
              <span className={label}>Preview · the file as it downloads</span>
              <span className="font-mono text-[11px] text-muted-foreground">From the Room result prepared 14:32:08</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-2xl font-semibold">Is the Q1 go-live ready?</h3>
              <p className="text-sm">Focus: can the consolidated ledger go live in Q1 FY27 without breaching the approved budget or the board's risk appetite?</p>
              <p className="text-xs text-muted-foreground">Board paper · Standard detail · prepared with Quantum State for M. Vale</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Meta name="Confidence" value="Medium: two sources conflict and one is missing" />
              <Meta name="Freshness" unavailable="the risk appetite statement has no issue date" />
              <Meta name="Model" value="Local model (representation)" ai />
              <Meta name="Scripted" value="Demo script, not a running model" ai />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={label}>Evidence summary</span>
              <p className="text-sm leading-relaxed">Six passages from four documents in Meridian Group's vault, plus live ERP actuals. One cited document, the CoreSys contract, is not in the vault.</p>
            </div>

            {paper.map(sec => (
              <div key={sec.title} className="flex flex-col">
                <span className={`mb-1 flex items-center gap-1.5 ${label}`}>{sec.ai && <Sparkles size={11} className="text-[#8338EC]" />}{sec.title}{sec.ai && <span className="ml-1 font-normal tracking-normal normal-case">· scripted local-model representation</span>}</span>
                {sec.claims.map(c => (
                  <div key={c.text} className="grid grid-cols-[1fr_160px] gap-6 border-t border-border/60 py-3">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm leading-relaxed">{c.text}</p>
                      {c.tag && <span className={`flex items-center gap-1.5 text-xs font-medium ${tagTone[c.tag.tone]}`}><Circle size={8} className={c.tag.tone === 'ai' ? 'text-[#8338EC]' : ''} />{c.tag.text}</span>}
                    </div>
                    <div className="flex flex-wrap content-start gap-1">
                      {c.refs.length ? c.refs.map(n => <Source key={n} missing={refs[n - 1].unavailable !== undefined}>[{n}]</Source>) : <Source missing>No source</Source>}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="ai-edge flex flex-col gap-1.5 rounded-xl p-4">
              <span className={`flex items-center gap-1.5 ${label}`}><Sparkles size={11} className="text-[#8338EC]" />Reasoning summary · scripted local-model representation</span>
              <p className="text-sm leading-relaxed">Proceeding is possible only under conditions: a Q2 date paid from contingency, R-22 brought back within appetite, regional training dates fixed, and the CoreSys contract read before the board decides. The lenses agree on cost and split on appetite.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={label}>Source references</span>
              <ol className="flex flex-col gap-1 text-xs">
                {refs.map(r => (
                  <li key={r.n} className={`grid grid-cols-[28px_1fr] ${r.unavailable ? 'text-muted-foreground' : ''}`}>
                    <span className="font-mono">[{r.n}]</span>
                    <span>{r.doc}{r.passage && ` · ${r.passage}`}{r.unavailable && <span className="ml-1.5 rounded border border-dashed border-border px-1.5">Unavailable: {r.unavailable}</span>}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
