import { useState } from 'react'
import { vaultDates } from '../lib/vaultDates.ts'
import { useVault } from '../state/useVault.ts'
import { ConfirmDialog } from './ConfirmDialog.tsx'
import { EmptyState } from './EmptyState.tsx'
import { PageHeader } from './PageHeader.tsx'

export const ActivityView = () => {
  const { data, clearActivity } = useVault()
  const [confirming, setConfirming] = useState(false)
  if (!data) return null
  return (
    <section className="stack">
      <PageHeader
        title="Activity"
        text="Created, updated, deleted, imported, and backup actions. Passwords are never written here."
        action={<button type="button" className="btn" onClick={() => setConfirming(true)}>Clear log</button>}
      />
      {data.activity.length === 0 ? <EmptyState title="No activity yet" text="Changes inside Locker will show up here." /> : (
        <div className="list">
          {data.activity.map((event) => (
            <article className="list-button" key={event.id}>
              <span className="dot" />
              <span>
                <strong>{event.module}</strong>
                <small className="muted" style={{ display: 'block' }}>{event.action} · {event.itemName}</small>
              </span>
              <span className="muted">{vaultDates.activityTime(event.at)}</span>
            </article>
          ))}
        </div>
      )}
      {confirming ? (
        <ConfirmDialog
          title="Clear activity"
          body="This removes the log from the encrypted vault."
          confirmLabel="Clear log"
          onClose={() => setConfirming(false)}
          onConfirm={() => { clearActivity(); setConfirming(false) }}
        />
      ) : null}
    </section>
  )
}
