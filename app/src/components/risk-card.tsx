import { motion } from 'motion/react'
import { ArrowUpRight, Bot } from 'lucide-react'
import { domainOfTopic, findTopic, statusOf, TODAY } from '@/wheel/model'
import type { Status } from '@/wheel/model'
import { aiReading, labels, percent, worstKri } from '@/wheel/panel/text'

// The Wheel panel's topic view (status, appetite statement, KRIs, AI reading)
// in the Watermelon usage-card layout: mono type, header band, segmented bars.

const SEGMENTS = 40
const bg: Record<Status, string> = { within: 'bg-status-within', near: 'bg-status-near', over: 'bg-status-over' }
const text: Record<Status, string> = { within: 'text-status-within', near: 'text-status-near', over: 'text-status-over' }

function Source({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] tracking-wider text-muted-foreground uppercase">
      {text}<ArrowUpRight size={11} />
    </span>
  )
}

function KriBar({ value, threshold }: { value: number; threshold: number }) {
  const scale = Math.max(threshold * 1.5, value)
  const band = (at: number): Status => (at > threshold ? 'over' : at > threshold * 0.8 ? 'near' : 'within')
  return (
    <div className="relative flex h-3 gap-px" aria-hidden="true">
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const at = ((i + 0.5) / SEGMENTS) * scale
        const filled = at <= value
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.008, type: 'spring', stiffness: 300, damping: 24 }}
            className={`flex-1 rounded-full ${filled ? bg[band(at)] : 'bg-secondary'}`}
          />
        )
      })}
      <span className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-foreground" style={{ left: `${(threshold / scale) * 100}%` }} />
    </div>
  )
}

export function RiskCard({ topic: name, at = TODAY }: { topic: string; at?: number }) {
  const topic = findTopic(name)!
  const ratio = topic.riskScore[at]
  const status = statusOf(ratio)
  const worst = worstKri(topic, at)
  const reading = aiReading(topic, at)

  return (
    <div className="w-full max-w-135 overflow-hidden rounded-3xl border border-border bg-card font-mono text-foreground shadow-xl">
      <div className="flex items-start justify-between gap-4 bg-muted/50 px-6 py-5">
        <div>
          <h3 className="mb-1 text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Risk summary · {domainOfTopic(name)}</h3>
          <span className="font-heading text-2xl font-medium">{topic.topic}</span>
        </div>
        <div className="text-right">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-primary-foreground ${bg[status]}`}>{labels[status]}</span>
          <p className="mt-1 text-[10px] text-muted-foreground">worst KRI at {percent(ratio)} of threshold</p>
        </div>
      </div>

      {topic.appetiteStatement && (
        <div className="flex flex-col gap-2 bg-muted/50 px-6 pb-5">
          <h4 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Appetite statement</h4>
          <blockquote className="font-sans text-sm leading-relaxed">“{topic.appetiteStatement.text}”</blockquote>
          <Source text={topic.appetiteStatement.source} />
        </div>
      )}

      <div className="h-px w-full border-b-2 border-dashed border-border" />

      <div className="flex flex-col gap-4 px-6 py-5">
        <h4 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">KRIs</h4>
        {topic.kris?.map(kri => {
          const value = kri.values[at]
          const unit = kri.unit ? ` ${kri.unit}` : ''
          const kriStatus = statusOf(value / kri.threshold)
          return (
            <div key={kri.name} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4 text-[11px]">
                <span className="font-sans text-sm">{kri.name}</span>
                <span className="whitespace-nowrap text-muted-foreground"><b className="text-foreground">{value}{unit}</b> / {kri.threshold}{unit}</span>
              </div>
              <KriBar value={value} threshold={kri.threshold} />
              <div className={`flex justify-between text-[10px] font-bold tracking-wider uppercase ${text[kriStatus]}`}>
                <span>{labels[kriStatus]}</span>
                {kri === worst && <span className="text-muted-foreground">Sets the topic reading</span>}
              </div>
            </div>
          )
        })}
      </div>

      {reading && (
        <>
          <div className="h-px w-full border-b-2 border-dashed border-border" />
          <div className="flex flex-col gap-2 bg-muted/50 px-6 py-5">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase"><Bot size={12} />{reading.title}</h4>
            <p className="font-sans text-sm leading-relaxed">{reading.text}</p>
            <Source text={reading.source} />
            <p className="text-[10px] text-muted-foreground">{reading.confidence}</p>
          </div>
        </>
      )}
    </div>
  )
}
