import { useState, type ReactNode } from 'react'
import { Sparkles, Paperclip, AtSign, Search, Clock, History, Telescope, Network, Radar } from 'lucide-react'
import { PiCompass, PiChartLineUp, PiCoins, PiShieldWarning, PiSealCheck, PiGavel, PiUsersThree } from 'react-icons/pi'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContinuousTabs } from '@/components/watermelon/continuous-tabs'
import { CommandSearch } from '@/components/watermelon/command-search'
import { FilterDisclosure } from '@/components/watermelon/filter-disclosure'
import { RiskCard } from '@/components/risk-card'
import { DiscreteTabs } from '@/components/watermelon/discrete-tabs'
import { FrequencySelector, type FrequencyData } from '@/components/watermelon/frequency-selector'
import { CarouselNavigator } from '@/components/watermelon/carousel-navigator'
import { AccordionApp } from '@/components/watermelon/card-split-accordian'
import { ContextualAIBar } from '@/components/watermelon/contextual-ai-bar'
import Dialog4 from '@/components/watermelon/dialog-4'
import { GraphPreview, WheelPreview } from './LivePreviews'
import { DEFAULT_DOMAINS, domainColor, domainGradient, domainIcon } from '@/components/domain-drawer'

// The style index: every picked component and the preset variables on one page.
// Change the variables in src/index.css and this whole page follows.

// The color tokens in use, grouped by job. Each swatch reads the live CSS variable.
const colorGroups: { title: string; note: string; names: string[] }[] = [
  { title: 'Surfaces', note: 'The ladder: page, stage (Graph and Wheel fields), card. Depth comes from shadow-soft.', names: ['background', 'stage', 'card', 'muted', 'hairline', 'border'] },
  { title: 'Text and action', note: 'From preset b6Tpl9I9Z2.', names: ['foreground', 'muted-foreground', 'primary', 'primary-foreground', 'ring', 'destructive'] },
  { title: 'Risk status', note: 'Within, near and over threshold.', names: ['status-within', 'status-near', 'status-over'] },
  { title: 'Charts', note: 'From the preset.', names: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
]

const domains = [
  { id: 'strategic-direction', label: 'Strategic direction', icon: PiCompass },
  { id: 'strategy-execution', label: 'Strategy execution', icon: PiChartLineUp },
  { id: 'financial-stewardship', label: 'Financial stewardship', icon: PiCoins },
  { id: 'risk-resilience', label: 'Risk and resilience', icon: PiShieldWarning },
  { id: 'controls-assurance', label: 'Controls and assurance', icon: PiSealCheck },
  { id: 'major-decisions', label: 'Major decisions', icon: PiGavel },
  { id: 'remuneration', label: 'Remuneration', icon: PiUsersThree },
]

const docs = ['Board pack Q3', 'Strategy note', 'Charter', 'Policy v4', 'Controls memo', 'Minutes · Sep']

function Section({ title, replaces, children }: { title: string; replaces: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">replaces {replaces}</span>
      </header>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  )
}

export function StylePage() {
  const [frequency, setFrequency] = useState<FrequencyData>({ type: 'Monthly' })
  const [slide, setSlide] = useState(0)

  return (
    <TooltipProvider>
      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold">Governance Brain · style</h1>
          <p className="text-muted-foreground">shadcn preset b6Tpl9I9Z2 and the Watermelon picks. Example data.</p>
        </header>

        <Section title="Graph · live" replaces="the app's Graph view">
          <GraphPreview />
        </Section>

        <Section title="Wheel · live" replaces="the app's Wheel view">
          <WheelPreview />
        </Section>

        <Section title="Colors" replaces="tokens.css">
          <div className="flex w-full flex-col gap-6">
            {colorGroups.map(group => (
              <div key={group.title} className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3"><h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{group.title}</h3><span className="text-xs text-muted-foreground">{group.note}</span></div>
                <div className="flex flex-wrap gap-3">{group.names.map(name => (
                  <div key={name} className="flex w-28 flex-col gap-1">
                    <div className="h-14 rounded-xl border border-border/60 shadow-soft" style={{ background: `var(--${name})` }} />
                    <span className="font-mono text-[11px]">{name}</span>
                  </div>))}</div>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3"><h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Domains</h3><span className="text-xs text-muted-foreground">Each domain's color, and its 3-tone gradient for hover and select (Toy Designs 204:6).</span></div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">{DEFAULT_DOMAINS.map(domain => { const Icon = domainIcon(domain); const color = domainColor(domain); return (
                <div key={domain} className="flex flex-col gap-1.5">
                  <div className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium" style={{ background: domainGradient(color) }}><Icon size={16} style={{ color }} />{domain}</div>
                  <span className="font-mono text-[11px] text-muted-foreground">{color.slice(4, -1)}</span>
                </div>) })}</div>
            </div>
          </div>
        </Section>

        <Section title="Type" replaces="Instrument Sans, Nunito">
          <div className="flex flex-col gap-2">
            <p className="font-heading text-3xl font-semibold">Heading · Board pack Q3</p>
            <p className="text-lg font-semibold">Title · Risk and resilience</p>
            <p>Body · The board's appetite for supplier risk is low. Two KRIs are over their threshold.</p>
            <p className="font-mono text-xs">Data · 128% · 2025-09-30 · KRI-07</p>
          </div>
        </Section>

        <Section title="View switch" replaces="ToggleGroup">
          <ContinuousTabs tabs={[{ id: 'graph', label: 'Graph', icon: <Network size={18} /> }, { id: 'wheel', label: 'Wheel', icon: <Radar size={18} /> }, { id: 'search', label: 'Smart Search', icon: <Sparkles size={18} /> }]} defaultActiveId="graph" />
        </Section>

        <Section title="Header search" replaces="Field + Input">
          <CommandSearch items={docs.map(title => ({ id: title, title, section: 'Suggestions' as const, icon: <Search size={16} />, action: () => {} }))} />
        </Section>

        <Section title="Domain chips" replaces="Toggle">
          <FilterDisclosure items={domains} defaultActiveId="risk-resilience" />
        </Section>

        <Section title="Risk summary" replaces="Wheel panel topic view">
          <RiskCard topic="Supplier risk" />
        </Section>

        <Section title="History / AI projection" replaces="Tabs">
          <DiscreteTabs
            tabs={[
              { id: 'history', icon: <History size={16} />, label: 'History', activeColor: 'var(--primary)' },
              { id: 'projection', icon: <Telescope size={16} />, label: 'AI projection', activeColor: 'var(--chart-3)' },
            ]}
            defaultTab="history"
          />
        </Section>

        <Section title="Timeframe" replaces="Tabs + Select">
          <FrequencySelector value={frequency} onChange={setFrequency} />
        </Section>

        <Section title="Governance History" replaces="custom carousel">
          <CarouselNavigator totalSlides={6} currentIndex={slide} onIndexChange={setSlide} />
        </Section>

        <Section title="Panel lists" replaces="Collapsible">
          <AccordionApp
            items={[
              { id: 1, title: 'Supplier risk', icon: <PiShieldWarning />, content: 'Two of three KRIs are near or over the threshold. The AI reads this as rising.' },
              { id: 2, title: 'Cyber resilience', icon: <PiSealCheck />, content: 'All KRIs are within appetite this quarter.' },
              { id: 3, title: 'Liquidity', icon: <PiCoins />, content: 'One KRI is near its threshold after the Q3 capex.' },
            ]}
          />
        </Section>

        <Section title="Smart Search input" replaces="Field + Input">
          <ContextualAIBar placeholder="Ask the Governance Brain…" musicIcon={<Clock size={18} />} sparkleIcon={<Sparkles size={18} />} tools={[<Paperclip key="a" size={18} />, <AtSign key="b" size={18} />]} />
        </Section>

        <Section title="Source viewer" replaces="Dialog">
          <Dialog4 />
        </Section>

        <Section title="shadcn base" replaces="Button, Tooltip, ScrollArea">
          <Button>Create a query</Button>
          <Button variant="outline">Animate</Button>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost">Hover me</Button>} />
            <TooltipContent>Board pack Q3 · Strategic direction</TooltipContent>
          </Tooltip>
          <ScrollArea className="h-32 w-72 rounded-md border p-3">
            {docs.concat(docs).map((d, i) => <p key={i} className="text-sm">Agent · read {d}</p>)}
          </ScrollArea>
        </Section>
      </main>
    </TooltipProvider>
  )
}
