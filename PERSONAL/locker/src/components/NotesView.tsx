import { SquarePen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useVault } from '../state/useVault.ts'
import type { NotePane } from '../types.ts'
import { NoteEditor } from './NoteEditor.tsx'
import { NoteList } from './NoteList.tsx'

export const NotesView = ({ selectedId }: { selectedId: string | null }) => {
  const { data, saveNote } = useVault()
  const [currentId, setCurrentId] = useState<string | null>(selectedId)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [pane, setPane] = useState<NotePane>(selectedId ? 'editor' : 'list')

  useEffect(() => {
    if (!selectedId) return
    setCurrentId(selectedId)
    setPane('editor')
  }, [selectedId])

  if (!data) return null
  const note = data.notes.find((item) => item.id === currentId) ?? data.notes[0] ?? null
  const folders = data.folders.filter((folder) => folder.kind === 'notes')

  const openNote = (noteId: string) => {
    setCurrentId(noteId)
    setPane('editor')
  }

  const createNote = () => {
    const noteId = saveNote({ title: '', body: '', folderId: null })
    setFreshId(noteId)
    openNote(noteId)
  }

  return (
    <section className="notes-app" data-pane={pane}>
      <NoteList notes={data.notes} folders={folders} activeId={note?.id ?? null} onSelect={openNote} onCreate={createNote} />
      {note && (
        <NoteEditor
          key={note.id}
          note={note}
          folders={folders}
          autoFocusTitle={note.id === freshId}
          onSelect={openNote}
          onDeleted={() => { setCurrentId(null); setPane('list') }}
          onBack={() => setPane('list')}
        />
      )}
      {!note && (
        <div className="note-editor-pane note-blank">
          <p>Your notes stay encrypted on this device.</p>
          <button type="button" className="btn btn-primary" onClick={createNote}><SquarePen /> Write your first note</button>
        </div>
      )}
    </section>
  )
}
