import { useEffect, useState } from 'react'
import { searchVault } from '../lib/searchVault.ts'
import { useVault } from '../state/useVault.ts'
import type { AppView } from '../types.ts'
import { Modal } from './Modal.tsx'

type SearchDialogProps = {
  onClose: () => void
  onOpen: (view: AppView, itemId: string) => void
}

export const SearchDialog = ({ onClose, onOpen }: SearchDialogProps) => {
  const { data } = useVault()
  const [query, setQuery] = useState('')
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  if (!data) return null
  const results = searchVault(data, query)
  const groups = [
    { view: 'vault' as const, label: 'Vault', items: results.credentials.map((item) => ({ id: item.id, title: item.title, meta: item.username })) },
    { view: 'notes' as const, label: 'Notes', items: results.notes.map((item) => ({ id: item.id, title: item.title || 'Untitled note', meta: 'Note' })) },
    { view: 'tasks' as const, label: 'Tasks', items: results.tasks.map((item) => ({ id: item.id, title: item.title, meta: item.status })) },
    { view: 'income' as const, label: 'Income', items: results.income.map((item) => ({ id: item.id, title: item.source, meta: item.category })) },
  ]
  return (
    <Modal title="Search" onClose={onClose}>
      <input
        autoFocus
        placeholder={online ? 'Search titles, usernames, notes, tasks' : 'Search this device'}
        value={query}
        aria-label="Search Locker"
        onChange={(event) => setQuery(event.target.value)}
      />
      {query.trim() ? groups.map((group) => (
        <section className="stack" key={group.view}>
          <p className="eyebrow">{group.label}</p>
          {group.items.length === 0 ? <p className="muted">Nothing in {group.label.toLowerCase()}.</p> : group.items.map((item) => (
            <button type="button" className="list-button" key={item.id} onClick={() => onOpen(group.view, item.id)}>
              <span className="dot" />
              <span>
                <strong>{item.title}</strong>
                <small className="muted" style={{ display: 'block' }}>{item.meta}</small>
              </span>
            </button>
          ))}
        </section>
      )) : <p className="muted">Search does not look through passwords.</p>}
    </Modal>
  )
}
