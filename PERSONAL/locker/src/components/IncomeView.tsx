import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '../lib/formatMoney.ts'
import { summarizeIncome } from '../lib/summarizeIncome.ts'
import { vaultDates } from '../lib/vaultDates.ts'
import { useVault } from '../state/useVault.ts'
import type { IncomeEntry } from '../types.ts'
import { EmptyState } from './EmptyState.tsx'
import { IncomeChart } from './IncomeChart.tsx'
import { IncomeDialog } from './IncomeDialog.tsx'
import { PageHeader } from './PageHeader.tsx'

export const IncomeView = ({ selectedId }: { selectedId: string | null }) => {
  const { data } = useVault()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<IncomeEntry | null | 'new'>(null)
  const openedId = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedId || !data || openedId.current === selectedId) return
    openedId.current = selectedId
    const match = data.income.find((entry) => entry.id === selectedId)
    if (match) setEditing(match)
  }, [data, selectedId])
  if (!data) return null
  const summary = summarizeIncome(data.income)
  const needle = query.trim().toLowerCase()
  const visible = data.income.filter((entry) => `${entry.source} ${entry.category} ${entry.notes}`.toLowerCase().includes(needle))

  return (
    <section className="stack">
      <PageHeader
        title="Income"
        text="A local record of what came in. Totals stay separated by currency."
        action={<button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus /> Log income</button>}
      />
      <IncomeChart summary={summary} />
      <input aria-label="Search income" placeholder="Search source, category, or notes" value={query} onChange={(event) => setQuery(event.target.value)} />
      {visible.length === 0 ? <EmptyState title="No income yet" text="Log a payment and it will show on the calendar for that date." /> : (
        <div className="list">
          {visible.map((entry) => (
            <button type="button" className="list-button" key={entry.id} onClick={() => setEditing(entry)}>
              <span className="dot" />
              <span>
                <strong>{entry.source}</strong>
                <small className="muted" style={{ display: 'block' }}>{entry.category} · {vaultDates.medium(entry.date)}</small>
              </span>
              <strong>{formatMoney(entry.amount, entry.currency)}</strong>
            </button>
          ))}
        </div>
      )}
      {editing ? <IncomeDialog initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
    </section>
  )
}
