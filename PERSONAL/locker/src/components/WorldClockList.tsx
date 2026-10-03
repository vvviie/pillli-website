import { useEffect, useState } from 'react'
import { vaultDates } from '../lib/vaultDates.ts'
import type { WorldClock } from '../types.ts'

export const WorldClockList = ({ clocks }: { clocks: WorldClock[] }) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <div className="clocks">
      {clocks.map((clock) => (
        <article className="panel" key={clock.id}>
          <p className="eyebrow">{clock.label}</p>
          <strong>{vaultDates.timeInZone(now, clock.timeZone)}</strong>
        </article>
      ))}
    </div>
  )
}
