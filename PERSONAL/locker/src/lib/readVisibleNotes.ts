import type { Note } from '../types.ts'

type NoteListOptions = { query: string; folder: string }

const compareNotes = (left: Note, right: Note) => {
  if (left.favorite !== right.favorite) return left.favorite ? -1 : 1
  return right.updatedAt.localeCompare(left.updatedAt)
}

const matchesFolder = (note: Note, folder: string) => {
  if (folder === 'all') return true
  return note.folderId === folder
}

export const readVisibleNotes = (notes: Note[], { query, folder }: NoteListOptions) => {
  const needle = query.trim().toLowerCase()
  return notes
    .filter((note) => matchesFolder(note, folder) && `${note.title} ${note.body}`.toLowerCase().includes(needle))
    .sort(compareNotes)
}
