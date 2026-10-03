import { useState } from 'react'
import { vaultDates } from '../lib/vaultDates.ts'
import { useVault } from '../state/useVault.ts'
import { PageHeader } from './PageHeader.tsx'
import { TaskDialog } from './TaskDialog.tsx'

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const CalendarView = () => {
  const { data } = useVault()
  const [cursor, setCursor] = useState(() => new Date())
  const [mode, setMode] = useState<'week' | 'month' | 'year'>('month')
  const [selectedKey, setSelectedKey] = useState(vaultDates.todayKey())
  const [adding, setAdding] = useState(false)
  if (!data) return null

  const shift = (direction: number) => {
    if (mode === 'week') setCursor(vaultDates.addDays(cursor, direction * 7))
    else if (mode === 'year') setCursor(vaultDates.addMonths(cursor, direction * 12))
    else setCursor(vaultDates.addMonths(cursor, direction))
  }
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const monthDays = Array.from({ length: 42 }, (_, index) => vaultDates.addDays(vaultDates.startOfWeek(monthStart), index))
  const weekDays = Array.from({ length: 7 }, (_, index) => vaultDates.addDays(vaultDates.startOfWeek(cursor), index))
  const itemsFor = (key: string) => ({
    tasks: data.tasks.filter((task) => task.dueDate === key),
    income: data.income.filter((entry) => entry.date === key),
  })
  const selected = itemsFor(selectedKey)
  const title = mode === 'year' ? String(cursor.getFullYear()) : mode === 'week' ? `Week of ${vaultDates.medium(vaultDates.toKey(weekDays[0] ?? cursor))}` : vaultDates.monthTitle(cursor)

  return (
    <section className="stack">
      <PageHeader title="Calendar" text="Tasks and income land on their dates. Add a task without leaving the month." />
      <div className="toolbar">
        <div className="segment" aria-label="Calendar range">
          {(['week', 'month', 'year'] as const).map((option) => (
            <button type="button" key={option} className={mode === option ? 'on' : ''} onClick={() => setMode(option)}>{option}</button>
          ))}
        </div>
        <button type="button" className="btn" onClick={() => shift(-1)}>Previous</button>
        <strong>{title}</strong>
        <button type="button" className="btn" onClick={() => shift(1)}>Next</button>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>Add task</button>
      </div>
      {mode === 'month' ? (
        <div className="calendar-grid">
          {weekdayLabels.map((label) => <span key={label} className="muted">{label}</span>)}
          {monthDays.map((day) => {
            const key = vaultDates.toKey(day)
            const items = itemsFor(key)
            const outside = day.getMonth() !== cursor.getMonth()
            return (
              <button type="button" key={key} className={selectedKey === key ? `day on${outside ? ' outside' : ''}` : `day${outside ? ' outside' : ''}`} onClick={() => setSelectedKey(key)}>
                <strong>{day.getDate()}</strong>
                <small>{items.tasks.length > 0 ? `${items.tasks.length} tasks` : ''}</small>
                <em>{items.income.length > 0 ? `${items.income.length} income` : ''}</em>
              </button>
            )
          })}
        </div>
      ) : null}
      {mode === 'week' ? (
        <div className="week-grid">
          {weekDays.map((day) => {
            const key = vaultDates.toKey(day)
            const items = itemsFor(key)
            return (
              <button type="button" key={key} className={selectedKey === key ? 'day on' : 'day'} onClick={() => setSelectedKey(key)}>
                <span className="muted">{weekdayLabels[(day.getDay() + 6) % 7]}</span>
                <strong>{day.getDate()}</strong>
                {items.tasks.map((task) => <small key={task.id}>{task.title}</small>)}
                {items.income.map((entry) => <em key={entry.id}>{entry.source}</em>)}
              </button>
            )
          })}
        </div>
      ) : null}
      {mode === 'year' ? (
        <div className="year-grid">
          {Array.from({ length: 12 }, (_, month) => {
            const date = new Date(cursor.getFullYear(), month, 1)
            const key = vaultDates.monthKey(date)
            const count = data.tasks.filter((task) => task.dueDate?.startsWith(key)).length + data.income.filter((entry) => entry.date.startsWith(key)).length
            return (
              <button type="button" className="panel" key={key} onClick={() => { setCursor(date); setMode('month') }}>
                <strong>{vaultDates.shortMonth(key)}</strong>
                <p className="muted">{count} items</p>
              </button>
            )
          })}
        </div>
      ) : null}
      <article className="panel stack">
        <h2>{vaultDates.medium(selectedKey)}</h2>
        {selected.tasks.length === 0 && selected.income.length === 0 ? <p className="muted">Nothing scheduled.</p> : null}
        {selected.tasks.map((task) => <p key={task.id}>{task.title} · {task.status}</p>)}
        {selected.income.map((entry) => <p key={entry.id}>{entry.source} · {entry.currency} {entry.amount}</p>)}
      </article>
      {adding ? <TaskDialog initial={null} dueDate={selectedKey} onClose={() => setAdding(false)} /> : null}
    </section>
  )
}
