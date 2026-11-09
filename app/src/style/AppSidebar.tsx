import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Brain, Check, FileOutput, LayoutList, Network, Pin, Plus, Presentation, Radar, ScrollText, Sparkles, Vault } from 'lucide-react'
import { MacOSSidebar, SidebarGroup, SidebarItem, useSidebarOpen } from '@/components/watermelon/macos-sidebar'
import DropdownMenu14, { type Workspace } from '@/components/watermelon/dropdown-menu-14'
import Avatar3 from '@/components/watermelon/avatar-3'
import { ContinuousTabs } from '@/components/watermelon/continuous-tabs'
import { Button } from '@/components/ui/button'
import { domainColor, domainIcon } from '@/components/domain-drawer'
import type { Domain } from '@/types'
import { BoardRoomStyle, ExportStyle, QueryStyle } from './StageStyles'

// The app sidebar with the Query hub. The sidebar frames the whole app; the Query hub is
// where Queries are kept. A Query's Room and Export live under that Query, not at the top.
// Style rule: vault parts are plain and still; AI parts are tinted, glow or move.

type State = 'gathering' | 'analysis' | 'simulation' | 'exported'
type Query = { id: string; question: string; domain: Domain; state: State; insights: number; updated: string; pinned?: boolean }

const queries: Query[] = [
  { id: 'q1', question: 'Is the Q1 go-live ready?', domain: 'Strategy execution', state: 'simulation', insights: 8, updated: '18 min ago', pinned: true },
  { id: 'gulf', question: 'Can we fund the Gulf expansion from operating cash?', domain: 'Financial stewardship', state: 'analysis', insights: 11, updated: 'Yesterday', pinned: true },
  { id: 'supplier', question: 'Is supplier concentration inside our risk appetite?', domain: 'Risk and resilience', state: 'gathering', insights: 3, updated: '2 days ago' },
  { id: 'coresys', question: 'Should we extend the CoreSys contract?', domain: 'Major decisions', state: 'analysis', insights: 6, updated: '4 days ago' },
  { id: 'audit', question: 'Will the audit findings close before year-end?', domain: 'Controls and assurance', state: 'gathering', insights: 2, updated: '1 week ago' },
  { id: 'bonus', question: 'Should the 2026 bonus pool vest after the restatement?', domain: 'Remuneration', state: 'exported', insights: 9, updated: '12 Oct' },
]

const stateLabel: Record<State, string> = { gathering: 'Gathering', analysis: 'Analysis ready', simulation: 'In simulation', exported: 'Exported' }

// Gathering and Exported are the director's work: plain. Analysis ready is AI-written: the rainbow.
// In simulation is AI at work: it pulses.
function StateMark({ state }: { state: State }) {
  if (state === 'gathering') return <span className="block size-2 rounded-full border border-muted-foreground" />
  if (state === 'exported') return <Check size={11} className="text-muted-foreground" />
  if (state === 'analysis') return <span className="ai-glow block size-2 rounded-full" style={{ background: 'var(--ai-gradient)' }} />
  return <motion.span className="block size-2 rounded-full bg-[#8338EC]" animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
}

// A Query row: its main domain's icon, with the state mark on the icon's corner in the rail.
function QueryIcon({ query }: { query: Query }) {
  const open = useSidebarOpen()
  const Icon = domainIcon(query.domain)
  return (
    <span className="relative">
      <Icon size={16} style={{ color: domainColor(query.domain) }} />
      {!open && <span className="absolute -right-1.5 -bottom-1 grid size-3 place-items-center rounded-full bg-muted"><StateMark state={query.state} /></span>}
    </span>
  )
}

const boards: Workspace[] = [
  { id: 1, name: 'Meridian Group', plan: 'Board · Audit committee chair', members: 9, icon: 'MG' },
  { id: 2, name: 'Halden Ports Authority', plan: 'Independent director', members: 7, icon: 'HP' },
  { id: 3, name: 'Corvane Insurance', plan: 'Risk committee member', members: 11, icon: 'CI' },
]

type Page = 'graph' | 'wheel' | 'search' | 'hub' | 'vault' | `${string}:${'analysis' | 'room' | 'export'}`

function Header() {
  const open = useSidebarOpen()
  return <DropdownMenu14 workspaces={boards} compact={!open} title="Boards" note="Each board keeps its own vault" members="directors" create="Add a board" manage="Manage boards" />
}

function User() {
  const open = useSidebarOpen()
  return (
    <div className={`flex items-center gap-2.5 rounded-md p-1.5 ${open ? '' : 'justify-center'}`}>
      <Avatar3 name="M. Vale" size="sm" />
      {open && <span className="flex min-w-0 flex-col leading-tight"><span className="truncate text-sm font-medium">M. Vale</span><span className="truncate text-xs text-muted-foreground">Independent director</span></span>}
    </div>
  )
}

export function AppSidebarStyle() {
  const [page, setPage] = useState<Page>('q1:analysis')
  const activeQuery = page.includes(':') ? page.split(':')[0] : null
  const inBrain = page === 'graph' || page === 'wheel' || page === 'search'
  const pinned = queries.filter(q => q.pinned)
  const recent = queries.filter(q => !q.pinned).slice(0, 3)

  const queryRow = (q: Query) => (
    <div key={q.id} className="contents">
      <SidebarItem icon={<QueryIcon query={q} />} label={q.question} title={`${q.question} · ${stateLabel[q.state]}`} active={page === `${q.id}:analysis`} onClick={() => setPage(`${q.id}:analysis`)} trailing={<StateMark state={q.state} />} />
      {activeQuery === q.id && <>
        <SidebarItem indent={1} icon={<Presentation size={15} />} label="Board Simulation Room" active={page === `${q.id}:room`} onClick={() => setPage(`${q.id}:room`)}
          trailing={q.state === 'simulation' ? <span className="font-mono text-[10px] text-[#8338EC]">Run 2</span> : undefined} />
        <SidebarItem indent={1} icon={<FileOutput size={15} />} label="Export" active={page === `${q.id}:export`} onClick={() => setPage(`${q.id}:export`)} />
      </>}
    </div>
  )

  const nav = (
    <>
      <SidebarItem icon={<Brain size={16} />} label="Governance Brain" active={inBrain} onClick={() => setPage('graph')} />
      {inBrain && <>
        <SidebarItem indent={1} icon={<Network size={15} />} label="Graph" active={page === 'graph'} onClick={() => setPage('graph')} />
        <SidebarItem indent={1} icon={<Radar size={15} />} label="Wheel" active={page === 'wheel'} onClick={() => setPage('wheel')} />
        <SidebarItem indent={1} icon={<Sparkles size={15} className="ai-glow text-[#8338EC]" />} label="Smart Search" active={page === 'search'} onClick={() => setPage('search')} />
      </>}

      <SidebarGroup label="Queries" action={<button aria-label="New Query" className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><Plus size={14} /></button>} />
      <SidebarItem icon={<LayoutList size={16} />} label="All Queries" active={page === 'hub'} onClick={() => setPage('hub')} trailing={<span className="font-mono text-[11px] text-muted-foreground">{queries.length}</span>} />
      <SubLabel><Pin size={10} />Pinned</SubLabel>
      {pinned.map(queryRow)}
      <SubLabel>Recent</SubLabel>
      {recent.map(queryRow)}

      <div className="mt-auto pt-4" />
      <SidebarItem icon={<Vault size={16} />} label="Vault" active={page === 'vault'} onClick={() => setPage('vault')} trailing={<span className="font-mono text-[11px] text-muted-foreground">142 sources</span>} />
    </>
  )

  return (
    <MacOSSidebar className="h-[900px]" header={<Header />} nav={nav} footer={<User />}>
      <Content page={page} onOpen={setPage} />
    </MacOSSidebar>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  const open = useSidebarOpen()
  if (!open) return <div className="mx-auto my-1.5 h-px w-4 shrink-0 bg-sidebar-border" />
  return <span className="mt-2 mb-0.5 flex shrink-0 items-center gap-1 px-2.5 text-[11px] text-muted-foreground">{children}</span>
}

// What the sidebar opens. Only the Q1 go-live Query has full example content; it is the one on the mid-fi screens.
function Content({ page, onOpen }: { page: Page; onOpen: (p: Page) => void }) {
  if (page === 'hub') return <QueryHub onOpen={onOpen} />
  if (page === 'q1:analysis') return <QueryStyle />
  if (page === 'q1:room') return <BoardRoomStyle />
  if (page === 'q1:export') return <ExportStyle />
  const notes: Record<string, string> = { graph: 'The Graph view. See "Graph · live" above.', wheel: 'The Wheel view. See "Wheel · live" above.', search: 'Smart Search. See "Smart Search · live" above.', vault: 'The Governance Vault: sources, owners and access. Not drawn yet.' }
  const q = queries.find(x => page.startsWith(x.id + ':'))
  return <Placeholder>{notes[page] ?? `${q?.question} · example content exists only for "Is the Q1 go-live ready?"`}</Placeholder>
}

function Placeholder({ children }: { children: ReactNode }) {
  return <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">{children}</div>
}

// The Query hub: every Query on this board, with its state. Vault material, so plain; the state marks carry the AI.
function QueryHub({ onOpen }: { onOpen: (p: Page) => void }) {
  const [filter, setFilter] = useState('all')
  const shown = queries.filter(q => filter === 'all' || q.state === filter)
  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Meridian Group</span>
          <h3 className="font-heading text-3xl font-semibold">Queries</h3>
          <p className="text-muted-foreground">One board question each. Kept here until the board has decided.</p>
        </div>
        <Button><Plus size={14} />New Query</Button>
      </div>
      <ContinuousTabs onChange={setFilter} defaultActiveId="all" tabs={[
        { id: 'all', label: 'All' },
        ...(['gathering', 'analysis', 'simulation', 'exported'] as State[]).map(s => ({ id: s, label: stateLabel[s], icon: <StateMark state={s} /> })),
      ]} />
      <div className="flex flex-col rounded-2xl border border-border/60 bg-card shadow-soft">
        {shown.map(q => {
          const Icon = domainIcon(q.domain)
          return (
            <button key={q.id} onClick={() => onOpen(`${q.id}:analysis`)} className="grid grid-cols-[28px_1fr_150px_90px_100px_32px] items-center gap-4 border-b border-border/60 px-5 py-4 text-left last:border-0 hover:bg-muted/50">
              <Icon size={18} style={{ color: domainColor(q.domain) }} />
              <span className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-medium">{q.question}</span><span className="text-xs text-muted-foreground">{q.domain}</span></span>
              <span className="flex items-center gap-2 text-sm"><StateMark state={q.state} />{stateLabel[q.state]}</span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"><ScrollText size={12} />{q.insights}</span>
              <span className="text-xs text-muted-foreground">{q.updated}</span>
              <Avatar3 name="M. Vale" size="sm" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
