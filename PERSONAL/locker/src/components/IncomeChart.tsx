import { formatMoney } from '../lib/formatMoney.ts'
import type { IncomeSummary } from '../lib/summarizeIncome.ts'

export const IncomeChart = ({ summary }: { summary: IncomeSummary }) => {
  const hasAmount = summary.months.some((month) => month.total > 0)
  if (!hasAmount) return <p className="muted">No income logged yet.</p>
  const peak = Math.max(...summary.months.map((month) => month.total), 1)
  return (
    <div className="stack">
      <p className="muted">Last six months in {summary.currency}</p>
      <div className="chart" aria-hidden="true">
        {summary.months.map((month) => (
          <div key={month.key}>
            <i style={{ height: `${Math.max(6, (month.total / peak) * 110)}px` }} />
            <span>{month.label}</span>
          </div>
        ))}
      </div>
      <ul className="list">
        {summary.totalsByCurrency.map((total) => (
          <li key={total.currency} className="muted">
            {total.currency}: {formatMoney(total.thisMonth, total.currency)} this month · {formatMoney(total.allTime, total.currency)} all time
          </li>
        ))}
      </ul>
    </div>
  )
}
