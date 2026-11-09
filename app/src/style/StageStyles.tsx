import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, Bot, Check, Circle, FileText, Mail, RefreshCw, Sparkles, X } from 'lucide-react'
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
    <div className="flex w-full flex-col gap-4">
      {/* Header: the question is the title, the focus sits under it. */}
      <div className="flex items-end justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-1">
          <span className={label}>Query</span>
          <h3 className="font-heading text-3xl font-semibold">Is the Q1 go-live ready?</h3>
          <p className="text-muted-foreground">Focus: can the consolidated ledger go live in Q1 FY27 without breaching the approved budget or the board's risk appetite?</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit the focus</Button>
          <Button>Open Board Simulation Room</Button>
        </div>
      </div>

      <div className="flex items-center gap-10 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-soft">
        <Stat name="Nodes" value={`${nodes.length} · ${links.length} links`} />
        <Stat name="What's new" value="2 since yesterday" />
        <Stat name="Readiness" value="Financial data: ERP live, read-only" />
        <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Owner · M. Vale</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-4">
        {/* The Query graph sits left, as in the mid-fi. */}
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

// ── Stage 6 · Board Simulation Room ────────────────────────────────────────────

type Agent = { lens: string; done: number; text: string; sources: string[]; stance?: string; missing?: boolean }

const agents: Agent[] = [
  { lens: 'Finance lens', done: 41, text: 'A one-quarter slip adds about AED 2.1m in parallel running costs, inside the 5% contingency.', sources: ['Report p.9', 'ERP'], stance: 'Delay is affordable' },
  { lens: 'Risk lens', done: 38, text: "Going live in Q1 with 4 open high risks breaches the board's stated appetite for finance systems.", sources: ['R-22', 'Risk appetite §3'], stance: 'Delay is safer' },
  { lens: 'Operations lens', done: 0, text: 'Regional training is the critical path. Its November dates are not confirmed in any source', sources: ['Report p.15'] },
  { lens: 'Challenger', done: 52, text: 'Neither report tests the vendor. If CoreSys support ends before go-live, both dates fail.', sources: ['CoreSys contract (unread)'], stance: 'Evidence missing', missing: true },
]

const emerged = [
  { kind: 'Agree', dot: 'bg-status-within', text: 'The one-quarter delay is affordable within contingency.', who: 'Finance, Risk' },
  { kind: 'Disagree', dot: 'bg-status-near', text: 'Finance weighs cost; Risk weighs appetite. They reach opposite recommendations on the same figures.', who: 'Finance vs Risk' },
  { kind: 'Missing', dot: 'border border-muted-foreground bg-transparent', text: "No agent could assess vendor continuity: the CoreSys contract hasn't been read.", who: 'Challenger' },
]

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function useTicker(start: number) {
  const [s, setS] = useState(start)
  useEffect(() => { const t = setInterval(() => setS(v => v + 1), 1000); return () => clearInterval(t) }, [])
  return s
}

function AgentCard({ agent }: { agent: Agent }) {
  const working = agent.done === 0
  return (
    // A working agent is AI in motion: rainbow edge and a pulsing status. Finished agents settle to a plain card.
    <div className={`flex min-h-56 flex-col gap-3 rounded-2xl p-4 shadow-soft ${working ? 'ai-edge' : 'border border-border/60 bg-card'}`}>
      <div className="flex items-center justify-between">
        <span className="font-heading font-semibold">{agent.lens}</span>
        {working
          ? <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><motion.span className="size-1.5 rounded-full bg-[#8338EC]" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />Working</span>
          : <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Check size={12} />Done · {agent.done} s</span>}
      </div>
      <p className={`text-sm leading-relaxed ${working ? 'text-muted-foreground' : ''}`}>
        {agent.text}{working && <motion.span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-[#8338EC]" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }} />}
      </p>
      <div className="flex flex-wrap gap-1.5">{agent.sources.map(s => <Source key={s} missing={agent.missing}>{s}</Source>)}</div>
      {agent.stance && <span className="mt-auto self-start rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">{agent.stance}</span>}
    </div>
  )
}

export function BoardRoomStyle() {
  const elapsed = useTicker(72)
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className={label}>Board Simulation Room · Is the Q1 go-live ready?</span>
          <h3 className="font-heading text-3xl font-semibold">Scenario: go-live slips one quarter</h3>
          <div className="flex gap-1.5">{['4 agents', 'Model: Local', 'Scope: this Query · 8 insights', 'Run 2'].map(t => <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs">{t}</span>)}</div>
        </div>
        <Button variant="outline">Edit the scenario details</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">{agents.map(a => <AgentCard key={a.lens} agent={a} />)}</div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* What emerged: compiled by AI from the parallel runs, so the edge; each line is plain to read. */}
        <div className="ai-edge flex flex-col gap-1 rounded-2xl p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between"><h4 className="font-heading text-lg font-semibold">What emerged</h4><span className="text-xs text-muted-foreground">3 of 4 agents finished</span></div>
          {emerged.map(e => (
            <div key={e.kind} className="grid grid-cols-[110px_1fr] gap-4 border-t border-border/60 py-3">
              <span className="flex items-center gap-2 text-sm font-medium"><span className={`size-2 rounded-full ${e.dot}`} />{e.kind}</span>
              <div className="flex flex-col gap-0.5"><p className="text-sm">{e.text}</p><span className="text-xs text-muted-foreground">{e.who}</span></div>
            </div>
          ))}
          <div className="mt-2 flex justify-end gap-2"><Button variant="outline">Review the artifact</Button><Button variant="outline">Save this version</Button><Button>Prepare for the board</Button></div>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h4 className="mb-1 font-heading text-lg font-semibold">Run status</h4>
          {agents.map(a => (
            <div key={a.lens} className="flex items-center justify-between text-sm">
              <span>{a.lens}</span>
              <span className="font-mono text-xs text-muted-foreground">{a.done ? `Done · ${a.done} s` : `Working · ${clock(elapsed)}`}</span>
            </div>
          ))}
          <p className="mt-auto pt-4 text-xs text-muted-foreground">Agents share one local GPU and run in turn. Nothing leaves the building.</p>
        </div>
      </div>
    </div>
  )
}

// ── Stage 7 · Export Query ─────────────────────────────────────────────────────

type Claim = { text: string; source: string; meta: string; confidence: number; flag?: string; ai?: boolean }

const claims: Claim[] = [
  { text: 'Spend stands at 62% of the approved AED 48m budget, in line with the phasing the board agreed in March.', source: 'Report p.9 · ERP', meta: 'Synced 2 h ago', confidence: 5 },
  { text: 'The programme office reports go-live milestone M3 as on track for Q1 FY27.', source: 'Programme report p.14', meta: 'Approved 22 Sep', confidence: 4, flag: 'Conflicts with the risk register (R-22)' },
  { text: 'The risk register rates the same milestone high risk, with four open risks, as of 18 September.', source: 'Risk register R-22', meta: 'Updated 18 Sep', confidence: 4 },
  { text: 'A one-quarter delay would cost about AED 2.1m, inside the 5% contingency. Finance and Risk agents reached opposite recommendations on these figures.', source: 'Board Simulation Room, run 2', meta: 'AI · local model', confidence: 3, flag: 'Simulation, not a forecast', ai: true },
  { text: 'Vendor continuity is not assessed: the CoreSys contract has not been read.', source: 'No source', meta: '—', confidence: 0, flag: 'Unknown' },
]

// Five square segments, after the KRI bar. AI-sourced confidence takes the rainbow.
function Confidence({ value, ai }: { value: number; ai?: boolean }) {
  return (
    <div className="flex gap-[3px]" aria-label={`confidence ${value} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`h-1.5 w-3 rounded-[1px] ${i < value ? (ai ? '' : 'bg-foreground') : 'bg-secondary'}`} style={i < value && ai ? { background: 'var(--ai-gradient)' } : undefined} />
      ))}
    </div>
  )
}

function Choice({ name, note, on, onClick, icon }: { name: string; note: string; on: boolean; onClick: () => void; icon?: ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${on ? 'border-foreground bg-card shadow-soft' : 'border-border/60 bg-card/60 hover:bg-card'}`}>
      <span className={`grid size-4 place-items-center rounded-full border ${on ? 'border-foreground' : 'border-muted-foreground/50'}`}>{on && <span className="size-2 rounded-full bg-foreground" />}</span>
      <span className="flex flex-col"><span className="flex items-center gap-1.5 text-sm font-medium">{icon}{name}</span><span className="text-xs text-muted-foreground">{note}</span></span>
    </button>
  )
}

export function ExportStyle() {
  const [level, setLevel] = useState('Standard')
  const [dest, setDest] = useState('Board portal')
  return (
    <div className="grid w-full grid-cols-[300px_1fr] gap-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/40 p-5">
        <h3 className="font-heading text-2xl font-semibold">Export Query</h3>
        <div className="flex flex-col gap-2">
          <span className={label}>Detail level</span>
          {[['Summary', '1 page'], ['Standard', 'Findings with sources'], ['Full evidence', 'Every passage attached']].map(([n, d]) => <Choice key={n} name={n} note={d} on={level === n} onClick={() => setLevel(n)} />)}
        </div>
        <div className="flex flex-col gap-2">
          <span className={label}>Send to</span>
          {[['Board portal', 'As a paper for the December pack', <Mail size={13} />], ['PDF', 'Download', <FileText size={13} />], ['Word', 'For the company secretary to edit', <FileText size={13} />]].map(([n, d, i]) => <Choice key={n as string} name={n as string} note={d as string} icon={i} on={dest === n} onClick={() => setDest(n as string)} />)}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={label}>Kept in the export</span>
          {['Sources beside each claim', 'Confidence and freshness', 'Open conflicts and unknowns', 'Which model wrote what'].map(k => <span key={k} className="flex items-center gap-2 text-sm"><Check size={14} className="text-primary" />{k}</span>)}
        </div>
        <div className="mt-auto flex flex-col gap-2"><Button>Export the material</Button><Button variant="outline">Change the scope</Button></div>
      </div>

      {/* The draft reads as paper: white, still, serious. Only the AI-sourced claim and the version chip carry AI marks. */}
      <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <span className={label}>Draft preview · {level}</span>
          <span className="ai-edge rounded-full px-2.5 py-0.5 font-mono text-[11px]">Query v3 · Analysis v3 · Room run 2</span>
        </div>
        <h3 className="mt-3 font-heading text-2xl font-semibold">Finance transformation: is the Q1 go-live ready?</h3>
        <p className="mt-1 text-sm text-muted-foreground">Paper for the Board · December · prepared with Quantum State for M. Vale</p>
        <div className="mt-5 flex flex-col">
          {claims.map(c => (
            <div key={c.text} className="grid grid-cols-[1fr_200px] gap-6 border-t border-border/60 py-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm leading-relaxed">{c.text}</p>
                {c.flag && <span className={`flex items-center gap-1.5 text-xs font-medium ${c.ai ? 'ai-text' : c.confidence === 0 ? 'text-muted-foreground' : 'text-status-near'}`}><Circle size={8} className={c.ai ? 'text-[#8338EC]' : ''} />{c.flag}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-semibold ${c.confidence === 0 ? 'text-muted-foreground' : ''}`}>{c.source}</span>
                <div className="flex items-center gap-2"><Confidence value={c.confidence} ai={c.ai} /><span className="font-mono text-[10px] text-muted-foreground">{c.meta}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
