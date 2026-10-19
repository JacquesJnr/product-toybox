import { useMemo, useState } from 'react'
import documents from '@/data/documents.json'
import type { Doc, Domain } from '@/types'
import { Graph } from '@/graph/Graph'
import { WheelView } from '@/wheel/WheelView'
import { visibleIds } from '@/filters/visible'
import { DEFAULT_DOMAINS, DomainDrawer } from '@/components/domain-drawer'
import { GraphSettings } from '@/components/graph-settings'
import { applyProposals } from '@/components/domain-sorting'
import { DocPanel } from '@/components/doc-panel'
import './live-previews.css'

// The app's own Graph and Wheel, live, so motion and interaction can be tuned here.

const docs = documents as Doc[]

export function GraphPreview() {
  const [domains, setDomains] = useState<Set<Domain>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animateRun, setAnimateRun] = useState(0)
  // The vault as settings change it. The Graph keeps the original list, so adding a domain does not reset the layout.
  const [vault, setVault] = useState(docs)
  const [domainList, setDomainList] = useState<Domain[]>(DEFAULT_DOMAINS)
  const [showOrphans, setShowOrphans] = useState(true)
  const visible = useMemo(() => {
    const ids = visibleIds(vault, domains, '', domainList.length)
    if (!showOrphans) for (const doc of vault) if (!vault.some(other => other.id === doc.id ? other.links.length : other.links.some(l => l.targetId === doc.id))) ids.delete(doc.id)
    return ids
  }, [vault, domains, domainList, showOrphans])
  const selected = vault.find(doc => doc.id === selectedId)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex h-[640px] gap-6">
        <div className="relative flex min-w-0 flex-1">
          <Graph revealRun={0} foundLinks={[]} docs={docs} visibleIds={visible} selectedId={selectedId} onSelect={setSelectedId} active animateRun={animateRun} />
          <div className="absolute top-3 left-3 z-10">
            <DomainDrawer domains={domainList} value={domains} onChange={setDomains} />
          </div>
          <div className="absolute top-3 right-3 z-10">
            <GraphSettings docs={vault} domains={domainList} showOrphans={showOrphans} onShowOrphans={setShowOrphans}
              onAddDomain={(domain, accepted) => { setDomainList(list => [...list, domain]); setVault(v => applyProposals(v, domain, accepted)) }}
              onAnimate={() => setAnimateRun(run => run + 1)} />
          </div>
        </div>
        {selected && <DocPanel doc={selected} onClose={() => setSelectedId(null)} onSelect={setSelectedId} />}
      </div>
    </div>
  )
}

export function WheelPreview() {
  return (
    <div className="flex h-[880px] w-full flex-col">
      <WheelView hidden={false} />
    </div>
  )
}
