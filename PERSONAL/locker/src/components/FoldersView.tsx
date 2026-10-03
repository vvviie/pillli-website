import { LayoutGrid, List, Plus } from 'lucide-react'
import { useState } from 'react'
import { useVault } from '../state/useVault.ts'
import type { Folder, FolderKind } from '../types.ts'
import { EmptyState } from './EmptyState.tsx'
import { FavoriteButton } from './FavoriteButton.tsx'
import { FolderDialog } from './FolderDialog.tsx'
import { PageHeader } from './PageHeader.tsx'

export const FoldersView = () => {
  const { data, toggleFavorite } = useVault()
  const [kind, setKind] = useState<FolderKind>('vault')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [editing, setEditing] = useState<Folder | null | 'new'>(null)
  if (!data) return null
  const folders = data.folders.filter((folder) => folder.kind === kind)
  const countFor = (folderId: string) => kind === 'vault'
    ? data.credentials.filter((item) => item.folderId === folderId).length
    : data.notes.filter((item) => item.folderId === folderId).length

  return (
    <section className="stack">
      <PageHeader
        title="Folders"
        text="Password folders and note folders stay separate."
        action={<button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus /> New folder</button>}
      />
      <div className="toolbar">
        <div className="segment" aria-label="Folder type">
          <button type="button" className={kind === 'vault' ? 'on' : ''} onClick={() => setKind('vault')}>Passwords</button>
          <button type="button" className={kind === 'notes' ? 'on' : ''} onClick={() => setKind('notes')}>Notes</button>
        </div>
        <button type="button" className="icon-btn" aria-label="Grid view" onClick={() => setLayout('grid')}><LayoutGrid /></button>
        <button type="button" className="icon-btn" aria-label="List view" onClick={() => setLayout('list')}><List /></button>
      </div>
      {folders.length === 0 ? <EmptyState title="No folders in this group" text="Create one, then move credentials or notes into it from their editors." /> : (
        <div className={layout === 'grid' ? 'card-grid' : 'list'}>
          {folders.map((folder) => (
            <article key={folder.id} className="card" style={{ borderTop: `4px solid ${folder.color}` }}>
              <div className="toolbar">
                <button type="button" className="text-button" onClick={() => setEditing(folder)}><strong>{folder.name}</strong></button>
                <FavoriteButton active={folder.favorite} label={folder.name} onToggle={() => toggleFavorite('folder', folder.id)} />
              </div>
              <p className="muted">{countFor(folder.id)} items</p>
            </article>
          ))}
        </div>
      )}
      {editing ? <FolderDialog initial={editing === 'new' ? null : editing} kind={kind} onClose={() => setEditing(null)} /> : null}
    </section>
  )
}
