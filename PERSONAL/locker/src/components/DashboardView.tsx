import { readVaultStats } from '../lib/readVaultStats.ts'
import { summarizeIncome } from '../lib/summarizeIncome.ts'
import { vaultDates } from '../lib/vaultDates.ts'
import { useVault } from '../state/useVault.ts'
import { IncomeChart } from './IncomeChart.tsx'
import { WorldClockList } from './WorldClockList.tsx'

export const DashboardView = () => {
  const { data } = useVault()
  if (!data) return null
  const today = new Date()
  const hour = today.getHours()
  let greeting = 'Good evening'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 18) greeting = 'Good afternoon'
  const stats = readVaultStats(data)
  const summary = summarizeIncome(data.income)
  const lockLabel = data.settings.autoLockMinutes > 0 ? `${data.settings.autoLockMinutes} min` : 'Off'
  const clipboardLabel = data.settings.clipboardClearSeconds > 0 ? `${data.settings.clipboardClearSeconds}s` : 'Off'

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <p className="eyebrow">{vaultDates.long(today)}</p>
          <h1>{greeting}, {data.profile.displayName}</h1>
          <p>Your vault is unlocked in memory and sealed on disk.</p>
        </div>
      </header>
      <div className="stat-grid">
        <article className="stat"><span className="muted">Credentials</span><strong>{stats.credentialCount}</strong></article>
        <article className="stat"><span className="muted">Notes</span><strong>{stats.noteCount}</strong></article>
        <article className="stat"><span className="muted">Open tasks</span><strong>{stats.openTaskCount}</strong></article>
        <article className="stat"><span className="muted">Overdue</span><strong>{stats.overdue.length}</strong></article>
      </div>
      <div className="two">
        <article className="panel stack">
          <h2>Recent credentials</h2>
          {stats.recentCredentials.length === 0 ? <p>No logins saved yet.</p> : stats.recentCredentials.map((item) => (
            <p key={item.id}><strong>{item.title}</strong> <span className="muted">{item.username}</span></p>
          ))}
          <h2>Upcoming tasks</h2>
          {stats.upcoming.length === 0 ? <p>Nothing due soon.</p> : stats.upcoming.map((task) => (
            <p key={task.id}>{task.title} <span className="muted">{task.dueDate ? vaultDates.medium(task.dueDate) : ''}</span></p>
          ))}
          {stats.overdue.length > 0 ? (
            <>
              <h2>Overdue</h2>
              {stats.overdue.map((task) => <p key={task.id} className="danger-text">{task.title}</p>)}
            </>
          ) : null}
        </article>
        <article className="panel stack">
          <h2>Vault protection</h2>
          <p>Encryption · AES-256-GCM</p>
          <p>Key derivation · Argon2id</p>
          <p>Auto-lock · {lockLabel}</p>
          <p>Clipboard clear · {clipboardLabel}</p>
          <p>Storage · this browser only</p>
        </article>
      </div>
      <article className="panel">
        <h2>Income activity</h2>
        <IncomeChart summary={summary} />
      </article>
      <WorldClockList clocks={data.settings.clocks} />
    </section>
  )
}
