import type { ReactNode } from 'react'
import { Brain, FileOutput, Layers, Plus, Presentation } from 'lucide-react'
import { MacOSSidebar, SidebarGroup, useSidebarOpen } from '../components/watermelon/macos-sidebar'
import { Button } from '../components/ui/button'
import type { StagePage, StageState } from './contracts'
import { exportReady, roomReady } from './state'

function Row({ label, icon, active, disabled = false, indent = false, onClick, title = label }: {
  label: string; icon: ReactNode; active: boolean; disabled?: boolean; indent?: boolean; onClick(): void; title?: string
}) {
  const open = useSidebarOpen()
  return <Button variant="ghost" className={`stage-nav-row ${indent && open ? 'stage-nav-child' : ''}`}
    disabled={disabled} aria-current={active ? 'page' : undefined} aria-label={label} title={title} onClick={onClick}>
    {icon}{open && <span>{label}</span>}
  </Button>
}

export function StageSidebar({ page, state, onNavigate, children }: {
  page: StagePage; state: StageState; onNavigate(page: StagePage): void; children: ReactNode
}) {
  const nav = <>
    <Row label="Governance Brain" icon={<Brain size={16} />} active={page === 'brain'} onClick={() => onNavigate('brain')} />
    <SidebarGroup label="Queries" />
    <Row label="New Query" icon={<Plus size={16} />} active={page === 'query' && !state.query}
      disabled={!!state.query} title={state.query ? 'One Query at a time. Reload to start again.' : 'New Query'} onClick={() => onNavigate('query')} />
    {state.query && <>
      <Row label={state.query.question} icon={<Layers size={16} />} active={page === 'query'} onClick={() => onNavigate('query')} />
      <Row label="Board Simulation Room" icon={<Presentation size={16} />} indent active={page === 'room'}
        disabled={!roomReady(state)} title={roomReady(state) ? 'Board Simulation Room' : 'Generate Analysis to open the Room.'} onClick={() => onNavigate('room')} />
      <Row label="Export" icon={<FileOutput size={16} />} indent active={page === 'export'}
        disabled={!exportReady(state)} title={exportReady(state) ? 'Export' : 'Review the disagreement and prepare the Room result to export.'} onClick={() => onNavigate('export')} />
    </>}
  </>
  return <MacOSSidebar className="stage-shell" header={<Brand />} nav={nav}>{children}</MacOSSidebar>
}

function Brand() {
  const open = useSidebarOpen()
  return <span className="stage-brand">{open ? 'Quantum State' : 'QS'}</span>
}
