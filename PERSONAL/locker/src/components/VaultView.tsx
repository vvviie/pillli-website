import { LayoutGrid, List, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useVault } from '../state/useVault.ts'
import type { Credential } from '../types.ts'
import { CredentialDialog } from './CredentialDialog.tsx'
import { EmptyState } from './EmptyState.tsx'
import { FavoriteButton } from './FavoriteButton.tsx'
import { PageHeader } from './PageHeader.tsx'
import { TagList } from './TagList.tsx'
import { WebsiteMark } from './WebsiteMark.tsx'

type VaultViewProps = {
  selectedId: string | null
  draftPassword: string | null
  onDraftConsumed: () => void
}

export const VaultView = ({ selectedId, draftPassword, onDraftConsumed }: VaultViewProps) => {
  const { data, toggleFavorite } = useVault()
  const [query, setQuery] = useState('')
  const [folderId, setFolderId] = useState('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [editing, setEditing] = useState<Credential | null | 'new'>(draftPassword ? 'new' : null)
  const [generatedPassword, setGeneratedPassword] = useState(draftPassword ?? '')
  const openedId = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedId || !data || openedId.current === selectedId) return
    openedId.current = selectedId
    const match = data.credentials.find((item) => item.id === selectedId)
    if (match) setEditing(match)
  }, [data, selectedId])

  if (!data) return null
  const folders = data.folders.filter((folder) => folder.kind === 'vault')
  const needle = query.trim().toLowerCase()
  const visible = data.credentials.filter((item) => {
    const folderMatches = folderId === 'all' || item.folderId === folderId
    const text = `${item.title} ${item.username} ${item.website} ${item.tags.join(' ')}`.toLowerCase()
    return folderMatches && (!needle || text.includes(needle))
  })
  const editingCredential = editing && editing !== 'new' ? editing : null

  return (
    <section className="stack">
      <PageHeader
        title="Vault"
        text="Logins stay encrypted in this browser. Reveal and copy them only when you need them."
        action={<button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus /> Add credential</button>}
      />
      <div className="toolbar">
        <input aria-label="Filter credentials" placeholder="Filter by title, username, or tag" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select aria-label="Folder" value={folderId} onChange={(event) => setFolderId(event.target.value)}>
          <option value="all">All folders</option>
          {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
        </select>
        <button type="button" className="icon-btn" aria-label="Grid view" onClick={() => setLayout('grid')}><LayoutGrid /></button>
        <button type="button" className="icon-btn" aria-label="List view" onClick={() => setLayout('list')}><List /></button>
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No credentials yet" text="Add a login, or import a CSV from Settings." />
      ) : (
        <div className={layout === 'grid' ? 'card-grid' : 'list'}>
          {visible.map((item) => (
            <article key={item.id} className={layout === 'grid' ? 'card vault-card' : 'list-button vault-card'}>
              <WebsiteMark website={item.website} title={item.title} />
              <button type="button" className="text-button" onClick={() => setEditing(item)}>
                <strong>{item.title}</strong>
                <span className="muted" style={{ display: 'block' }}>{item.username || 'No username'}</span>
              </button>
              <FavoriteButton active={item.favorite} label={item.title} onToggle={() => toggleFavorite('credential', item.id)} />
              <TagList tags={item.tags} />
            </article>
          ))}
        </div>
      )}
      {editing ? (
        <CredentialDialog
          initial={editingCredential}
          draftPassword={editing === 'new' ? generatedPassword : ''}
          onClose={() => { setEditing(null); setGeneratedPassword(''); onDraftConsumed() }}
        />
      ) : null}
    </section>
  )
}
