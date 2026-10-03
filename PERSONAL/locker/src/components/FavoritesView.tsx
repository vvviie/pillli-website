import { useState } from 'react'
import { useVault } from '../state/useVault.ts'
import { EmptyState } from './EmptyState.tsx'
import { FavoriteButton } from './FavoriteButton.tsx'
import { PageHeader } from './PageHeader.tsx'

type FavoriteTab = 'folders' | 'passwords' | 'notes'

export const FavoritesView = () => {
  const { data, toggleFavorite } = useVault()
  const [tab, setTab] = useState<FavoriteTab>('passwords')
  if (!data) return null
  const folders = data.folders.filter((item) => item.favorite)
  const passwords = data.credentials.filter((item) => item.favorite)
  const notes = data.notes.filter((item) => item.favorite)

  return (
    <section className="stack">
      <PageHeader title="Favorites" text="Starred folders, passwords, and notes collected in one place." />
      <div className="segment" aria-label="Favorite type">
        <button type="button" className={tab === 'folders' ? 'on' : ''} onClick={() => setTab('folders')}>Folders</button>
        <button type="button" className={tab === 'passwords' ? 'on' : ''} onClick={() => setTab('passwords')}>Passwords</button>
        <button type="button" className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}>Notes</button>
      </div>
      {tab === 'folders' && (folders.length === 0 ? <EmptyState title="No favorite folders" text="Star a folder from the Folders page." /> : folders.map((folder) => (
        <article className="list-button" key={folder.id}>
          <span className="dot" style={{ background: folder.color }} />
          <strong>{folder.name}</strong>
          <FavoriteButton active label={folder.name} onToggle={() => toggleFavorite('folder', folder.id)} />
        </article>
      )))}
      {tab === 'passwords' && (passwords.length === 0 ? <EmptyState title="No favorite passwords" text="Star a credential from the vault." /> : passwords.map((item) => (
        <article className="list-button" key={item.id}>
          <span className="dot" />
          <span><strong>{item.title}</strong><small className="muted" style={{ display: 'block' }}>{item.username}</small></span>
          <FavoriteButton active label={item.title} onToggle={() => toggleFavorite('credential', item.id)} />
        </article>
      )))}
      {tab === 'notes' && (notes.length === 0 ? <EmptyState title="No favorite notes" text="Star a note from the editor." /> : notes.map((item) => (
        <article className="list-button" key={item.id}>
          <span className="dot" />
          <strong>{item.title || 'Untitled note'}</strong>
          <FavoriteButton active label={item.title || 'note'} onToggle={() => toggleFavorite('note', item.id)} />
        </article>
      )))}
    </section>
  )
}
