import { readNoteRowDate } from '../lib/readNoteRowDate.ts'
import { readNoteSnippet } from '../lib/readNoteSnippet.ts'
import type { Note } from '../types.ts'

type NoteListItemProps = { note: Note; active: boolean; onSelect: (noteId: string) => void }

export const NoteListItem = ({ note, active, onSelect }: NoteListItemProps) => (
  <button
    type="button"
    className={active ? 'note-row on' : 'note-row'}
    aria-current={active ? 'true' : undefined}
    onClick={() => onSelect(note.id)}
  >
    <strong>{note.title || 'New Note'}</strong>
    <span className="note-row-meta">
      <time dateTime={note.updatedAt}>{readNoteRowDate(note.updatedAt)}</time>
      <span>{readNoteSnippet(note.body) || 'No additional text'}</span>
    </span>
  </button>
)
