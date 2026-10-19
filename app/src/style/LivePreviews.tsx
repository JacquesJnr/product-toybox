import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import documents from '@/data/documents.json'
import type { Doc, Domain } from '@/types'
import { Graph } from '@/graph/Graph'
import { WheelView } from '@/wheel/WheelView'
import { visibleIds } from '@/filters/visible'
import { DomainChips } from '@/filters/DomainChips'
import { DetailsPanel } from '@/details/DetailsPanel'
import './live-previews.css'

// The app's own Graph and Wheel, live, so motion and interaction can be tuned here.

const docs = documents as Doc[]

export function GraphPreview() {
  const [domains, setDomains] = useState<Set<Domain>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animateRun, setAnimateRun] = useState(0)
  const visible = useMemo(() => visibleIds(docs, domains, ''), [domains])
  const selected = docs.find(doc => doc.id === selectedId)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setAnimateRun(run => run + 1)}><Play />Animate</Button>
        <DomainChips value={domains} onChange={setDomains} />
      </div>
      <div className="flex h-[640px] gap-6">
        <div className="relative flex min-w-0 flex-1">
          <Graph revealRun={0} foundLinks={[]} docs={docs} visibleIds={visible} selectedId={selectedId} onSelect={setSelectedId} active animateRun={animateRun} />
        </div>
        {selected && <DetailsPanel doc={selected} onClose={() => setSelectedId(null)} />}
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
