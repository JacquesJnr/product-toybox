import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Brain, Check, FileOutput, Layers, MessageCircle, Network, Pin, Plus, Presentation, Radar, ScrollText, Search, Vault } from 'lucide-react'
import { MacOSSidebar, SidebarGroup, SidebarItem, useSidebarOpen } from '@/components/watermelon/macos-sidebar'
import DropdownMenu14, { type Workspace } from '@/components/watermelon/dropdown-menu-14'
import Avatar3 from '@/components/watermelon/avatar-3'
import { ContinuousTabs } from '@/components/watermelon/continuous-tabs'
import { Button } from '@/components/ui/button'
import type { Domain } from '@/types'
import { BoardRoomStyle, ExportStyle, QueryStyle } from './StageStyles'
import { NewQueryDialog, type NewQuery } from './NewQueryDialog'

// The app sidebar with the Query hub. The sidebar frames the whole app; the Query hub is
// where Queries are kept. A Query's Room and Export live under that Query, not at the top.
// Style rule: vault parts are plain and still; AI parts are tinted, glow or move.

type State = 'gathering' | 'analysis' | 'simulation' | 'exported'
type Query = { id: string; question: string; focus?: string; domain: Domain; state: State; insights: number; updated: string; pinned?: boolean }

const initialQueries: Query[] = [
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

// Iconography rule for the sidebar (Jacques, 09-Nov): an item's icon shows its type, never its domain.
// Three types, one icon each, the same in the rail and expanded: Query = Layers, Chat = MessageCircle,
// Search = Search. No tint on type icons; the AI shows in the state marks. Places (Brain, Graph, Wheel,
// Room, Export, Vault) keep their own icons; Smart Search is a search, so it takes the search icon.
const TYPE_ICON = { query: Layers, chat: MessageCircle, search: Search }
function TypeIcon({ type, size = 16 }: { type: keyof typeof TYPE_ICON; size?: number }) {
  const Icon = TYPE_ICON[type]
  return <Icon size={size} />
}

// A Query row: the query icon, with the state mark on its corner in the rail.
function QueryIcon({ query }: { query: Query }) {
  const open = useSidebarOpen()
  return (
    <span className="relative">
      <TypeIcon type="query" />
      {!open && <span className="absolute -right-1.5 -bottom-1 grid size-3 place-items-center rounded-full bg-muted"><StateMark state={query.state} /></span>}
    </span>
  )
}

const boards: Workspace[] = [
  { id: 1, name: 'Meridian Group', plan: 'Board · Audit committee chair', members: 9, icon: 'MG' },
  { id: 2, name: 'Halden Ports Authority', plan: 'Independent director', members: 7, icon: 'HP' },
  { id: 3, name: 'Corvane Insurance', plan: 'Risk committee member', members: 11, icon: 'CI' },
]

// Past chats and Smart Search asks, newest first. Context is where each one was opened from.
type Chat = { id: string; type: 'chat' | 'search'; title: string; context: string; when: string }
const chats: Chat[] = [
  { id: 'disagree', type: 'chat', title: 'Why do the programme report and risk register disagree?', context: 'Is the Q1 go-live ready?', when: '2 h' },
  { id: 'policies', type: 'search', title: 'Which policies changed after the September minutes?', context: 'Smart Search', when: '1 d' },
  { id: 'supplier', type: 'chat', title: 'What does the supplier review mean for the audit committee?', context: 'Node · Supplier review', when: '2 d' },
  { id: 'liquidity', type: 'search', title: 'Where is liquidity close to its threshold?', context: 'Smart Search', when: '5 d' },
]

type BrainView = 'graph' | 'wheel' | 'search'
type Page = string

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
  const [queries, setQueries] = useState(initialQueries)
  const [creating, setCreating] = useState(false)
  // The Brain's views work as its view switch: one active at a time, and the Brain reopens on the last one.
  const [brainView, setBrainView] = useState<BrainView>('graph')
  const openView = (v: BrainView) => { setBrainView(v); setPage(v) }
  const activeQuery = page.endsWith(':analysis') || page.endsWith(':room') || page.endsWith(':export') ? page.split(':')[0] : null
  const inBrain = page === 'graph' || page === 'wheel' || page === 'search'
  const create = ({ question, focus, insights }: NewQuery) => {
    const id = `new-${queries.length}`
    setQueries([{ id, question, focus, domain: 'Strategic direction', state: 'gathering', insights, updated: 'Just now' }, ...queries])
    setCreating(false)
    setPage(`${id}:analysis`)
  }
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
      <SidebarItem icon={<Brain size={16} />} label="Governance Brain" active={inBrain} onClick={() => setPage(brainView)} />
      {inBrain && <>
        <SidebarItem indent={1} slide="brain-view" icon={<Network size={15} />} label="Graph" active={page === 'graph'} onClick={() => openView('graph')} />
        <SidebarItem indent={1} slide="brain-view" icon={<Radar size={15} />} label="Wheel" active={page === 'wheel'} onClick={() => openView('wheel')} />
        <SidebarItem indent={1} slide="brain-view" icon={<TypeIcon type="search" size={15} />} label="Smart Search" active={page === 'search'} onClick={() => openView('search')} />
      </>}

      <SidebarGroup label="Queries" action={<button aria-label="New Query" onClick={() => setCreating(true)} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><Plus size={14} /></button>} />
      <SidebarItem icon={<TypeIcon type="query" />} label="All Queries" active={page === 'hub'} onClick={() => setPage('hub')} trailing={<span className="font-mono text-[11px] text-muted-foreground">{queries.length}</span>} />
      <SubLabel><Pin size={10} />Pinned</SubLabel>
      {pinned.map(queryRow)}
      <SubLabel>Recent</SubLabel>
      {recent.map(queryRow)}

      <SidebarGroup label="Chats and searches" />
      {chats.map(c => (
        <SidebarItem key={c.id} icon={<TypeIcon type={c.type} />} label={c.title} title={`${c.title} · ${c.context}`} active={page === `chat:${c.id}`} onClick={() => setPage(`chat:${c.id}`)}
          trailing={<span className="font-mono text-[10px] text-muted-foreground">{c.when}</span>} />
      ))}

      <div className="mt-auto pt-4" />
      <SidebarItem icon={<Vault size={16} />} label="Vault" active={page === 'vault'} onClick={() => setPage('vault')} trailing={<span className="font-mono text-[11px] text-muted-foreground">142 sources</span>} />
    </>
  )

  return (
    <MacOSSidebar className="h-[900px]" header={<Header />} nav={nav} footer={<User />}>
      <Content page={page} queries={queries} onOpen={setPage} onNew={() => setCreating(true)} />
      <NewQueryDialog open={creating} onOpenChange={setCreating} onCreate={create} />
    </MacOSSidebar>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  const open = useSidebarOpen()
  if (!open) return <div className="mx-auto my-1.5 h-px w-4 shrink-0 bg-sidebar-border" />
  return <span className="mt-2 mb-0.5 flex shrink-0 items-center gap-1 px-2.5 text-[11px] text-muted-foreground">{children}</span>
}

// What the sidebar opens. Only the Q1 go-live Query has full example content; it is the one on the mid-fi screens.
function Content({ page, queries, onOpen, onNew }: { page: Page; queries: Query[]; onOpen: (p: Page) => void; onNew: () => void }) {
  if (page === 'hub') return <QueryHub queries={queries} onOpen={onOpen} onNew={onNew} />
  const chat = chats.find(c => page === `chat:${c.id}`)
  if (chat) return <Placeholder>{chat.type === 'chat' ? 'AI Chat' : 'Smart Search'} · "{chat.title}" · opened from {chat.context}. Not drawn yet.</Placeholder>
  if (page === 'q1:analysis') return <QueryStyle />
  if (page === 'q1:room') return <BoardRoomStyle />
  if (page === 'q1:export') return <ExportStyle />
  const notes: Record<string, string> = { graph: 'The Graph view. See "Graph · live" above.', wheel: 'The Wheel view. See "Wheel · live" above.', search: 'Smart Search. See "Smart Search · live" above.', vault: 'The Governance Vault: sources, owners and access. Not drawn yet.' }
  const q = queries.find(x => page.startsWith(x.id + ':'))
  return <Placeholder>{notes[page] ?? `${q?.question}${q?.focus ? ` · Focus: ${q.focus}` : ''} · example content exists only for "Is the Q1 go-live ready?"`}</Placeholder>
}

function Placeholder({ children }: { children: ReactNode }) {
  return <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">{children}</div>
}

// The Query hub: every Query on this board, with its state. Vault material, so plain; the state marks carry the AI.
function QueryHub({ queries, onOpen, onNew }: { queries: Query[]; onOpen: (p: Page) => void; onNew: () => void }) {
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
        <Button onClick={onNew}><Plus size={14} />New Query</Button>
      </div>
      <ContinuousTabs onChange={setFilter} defaultActiveId="all" tabs={[
        { id: 'all', label: 'All' },
        ...(['gathering', 'analysis', 'simulation', 'exported'] as State[]).map(s => ({ id: s, label: stateLabel[s], icon: <StateMark state={s} /> })),
      ]} />
      <div className="flex flex-col rounded-2xl border border-border/60 bg-card shadow-soft">
        {shown.map(q => {
          return (
            <button key={q.id} onClick={() => onOpen(`${q.id}:analysis`)} className="grid grid-cols-[28px_1fr_150px_90px_100px_32px] items-center gap-4 border-b border-border/60 px-5 py-4 text-left last:border-0 hover:bg-muted/50">
              <span className="text-muted-foreground"><TypeIcon type="query" size={18} /></span>
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
