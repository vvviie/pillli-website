import type { Note } from '../types.ts'
import { readDaysAgo } from './readDaysAgo.ts'

type NoteGroup = { label: string; notes: Note[] }

const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

const readGroupLabel = (note: Note, now: Date) => {
  if (note.favorite) return 'Pinned'
  const daysAgo = readDaysAgo(note.updatedAt, now)
  if (daysAgo <= 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 7) return 'Previous 7 Days'
  if (daysAgo < 30) return 'Previous 30 Days'
  return monthFormat.format(new Date(note.updatedAt))
}

export const readNoteGroups = (notes: Note[], now = new Date()): NoteGroup[] => {
  const groups = new Map<string, Note[]>()
  for (const note of notes) {
    const label = readGroupLabel(note, now)
    groups.set(label, [...(groups.get(label) ?? []), note])
  }
  return [...groups].map(([label, items]) => ({ label, notes: items }))
}
