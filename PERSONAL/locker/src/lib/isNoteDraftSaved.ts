import type { Note, NoteDraft } from '../types.ts'

export const isNoteDraftSaved = (note: Note, draft: NoteDraft) =>
  note.title === draft.title && note.body === draft.body && note.folderId === draft.folderId
