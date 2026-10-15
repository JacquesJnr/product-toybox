export interface Reading { name: string; ratio: number }

export const clampTime = (t: number, last: number) => Math.max(0, Math.min(last, t))
export const playbackTime = (from: number, elapsed: number, today: number) =>
  clampTime(from + Math.max(0, elapsed) / 1400, today)

export function tooltipLeft(x: number, width: number) {
  const inset = Math.min(60, width / 2)
  return Math.max(inset, Math.min(width - inset, x))
}

export function stepDestination(t: number, goal: number | null, direction: number, last: number) {
  const nearest = Math.round(t)
  const start = goal ?? (Math.abs(t - nearest) < .01 ? nearest : direction < 0 ? Math.ceil(t) : Math.floor(t))
  return clampTime(start + direction, last)
}

export function slideText(current: Reading[], previous: Reading[] | null, previousTitle: string, projection: boolean) {
  const over = current.filter(x => x.ratio > 1).map(x => x.name)
  let text = `${over.length} of ${current.length} over threshold${over.length ? ': ' + over.join(', ') : ''}.`
  if (!previous) text += ' This is the first timeframe in the history.'
  else {
    const was = previous.filter(x => x.ratio > 1).map(x => x.name)
    const crossed = over.filter(x => !was.includes(x))
    const back = was.filter(x => !over.includes(x))
    if (crossed.length) text += ` Crossed since ${previousTitle}: ${crossed.join(', ')}.`
    if (back.length) text += ` Back under: ${back.join(', ')}.`
    const move = current.map((x, i) => ({ name: x.name, delta: Math.round((x.ratio - previous[i].ratio) * 100) }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0]
    if (move?.delta) text += ` Biggest move: ${move.name}, ${move.delta > 0 ? 'up' : 'down'} ${Math.abs(move.delta)} points.`
  }
  return (projection ? 'AI projection, an estimate from the trend. ' : '') + text
}
