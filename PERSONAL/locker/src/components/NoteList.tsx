import { Search, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { readNoteGroups } from '../lib/readNoteGroups.ts'
import { readVisibleNotes } from '../lib/readVisibleNotes.ts'
import type { Folder, Note } from '../types.ts'
import { NoteListItem } from './NoteListItem.tsx'

type NoteListProps = {
  notes: Note[]
  folders: Folder[]
  activeId: string | null
  onSelect: (noteId: string) => void
  onCreate: () => void
}

export const NoteList = ({ notes, folders, activeId, onSelect, onCreate }: NoteListProps) => {
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState('all')
  const visible = readVisibleNotes(notes, { query, folder })
  const groups = readNoteGroups(visible)
  const emptyText = query.trim() ? 'No results' : 'No notes'
  const countLabel = notes.length === 1 ? '1 note' : `${notes.length} notes`
  return (
    <aside className="notes-list-pane">
      <header className="notes-list-head">
        <div>
          <h1>Notes</h1>
          <span>{countLabel}</span>
        </div>
        <button type="button" className="icon-btn compose" aria-label="New note" title="New note" onClick={onCreate}><SquarePen /></button>
      </header>
      <label className="notes-search">
        <Search aria-hidden="true" />
        <input type="search" aria-label="Search notes" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {folders.length > 0 && (
        <div className="note-chips" role="group" aria-label="Folders">
          <button type="button" className={folder === 'all' ? 'on' : ''} aria-pressed={folder === 'all'} onClick={() => setFolder('all')}>All</button>
          {folders.map((item) => (
            <button key={item.id} type="button" className={folder === item.id ? 'on' : ''} aria-pressed={folder === item.id} onClick={() => setFolder(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
      )}
      <div className="note-groups">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2>{group.label}</h2>
            <div className="note-rows">
              {group.notes.map((note) => <NoteListItem key={note.id} note={note} active={note.id === activeId} onSelect={onSelect} />)}
            </div>
          </section>
        ))}
        {visible.length === 0 && <p className="notes-none">{emptyText}</p>}
      </div>
    </aside>
  )
}
