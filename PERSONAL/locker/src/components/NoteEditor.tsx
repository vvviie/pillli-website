import { ChevronLeft, Eye, ListChecks, PencilLine, Type } from 'lucide-react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { applyMarkdownFormat } from '../lib/applyMarkdownFormat.ts'
import { continueMarkdownList } from '../lib/continueMarkdownList.ts'
import { downloadTextFile } from '../lib/downloadTextFile.ts'
import type { MarkdownFormat } from '../lib/markdownTypes.ts'
import { readNoteFilename } from '../lib/readNoteFilename.ts'
import { readNoteShortcut } from '../lib/readNoteShortcut.ts'
import { readNoteStats } from '../lib/readNoteStats.ts'
import { replaceTextareaValue } from '../lib/replaceTextareaValue.ts'
import { toggleMarkdownTask } from '../lib/toggleMarkdownTask.ts'
import { vaultDates } from '../lib/vaultDates.ts'
import { useNoteAutosave } from '../state/useNoteAutosave.ts'
import { useVault } from '../state/useVault.ts'
import type { Folder, Note, NoteDraft, NoteMode, NoteSaveState } from '../types.ts'
import { ConfirmDialog } from './ConfirmDialog.tsx'
import { MarkdownPreview } from './MarkdownPreview.tsx'
import { MarkdownToolbar } from './MarkdownToolbar.tsx'
import { NoteMoreMenu } from './NoteMoreMenu.tsx'

const saveLabels: Record<NoteSaveState, string> = { saved: 'Saved', pending: 'Editing', saving: 'Saving…' }

type NoteEditorProps = {
  note: Note
  folders: Folder[]
  autoFocusTitle: boolean
  onSelect: (noteId: string) => void
  onDeleted: () => void
  onBack: () => void
}

export const NoteEditor = ({ note, folders, autoFocusTitle, onSelect, onDeleted, onBack }: NoteEditorProps) => {
  const { duplicateNote, deleteNote, toggleFavorite, copyText } = useVault()
  const [draft, setDraft] = useState<NoteDraft>({ title: note.title, body: note.body, folderId: note.folderId })
  const [mode, setMode] = useState<NoteMode>(() => (note.body.trim() ? 'view' : 'edit'))
  const [formatting, setFormatting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const pendingEdit = useRef<{ format: MarkdownFormat | null } | null>(null)
  const { saveState, saveNow, flush, discard } = useNoteAutosave(note.id, draft)
  const stats = readNoteStats(draft.body)
  const viewing = mode === 'view'
  const wordLabel = stats.words === 1 ? '1 word' : `${stats.words} words`
  const taskLabel = stats.tasksTotal > 0 ? ` · ${stats.tasksDone} of ${stats.tasksTotal} done` : ''

  const updateBody = (body: string) => setDraft((current) => ({ ...current, body }))

  const format = (formatName: MarkdownFormat) => {
    const textarea = bodyRef.current
    if (!textarea) return
    const selection = { value: textarea.value, start: textarea.selectionStart, end: textarea.selectionEnd }
    replaceTextareaValue(textarea, applyMarkdownFormat(selection, formatName), updateBody)
  }

  const startEditing = (formatName: MarkdownFormat | null) => {
    if (!viewing) {
      if (formatName) format(formatName)
      return
    }
    pendingEdit.current = { format: formatName }
    setMode('edit')
  }

  useEffect(() => {
    const textarea = bodyRef.current
    const pending = pendingEdit.current
    if (mode !== 'edit' || !textarea || !pending) return
    pendingEdit.current = null
    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    if (!pending.format) return
    const lineBreak = textarea.value && !textarea.value.endsWith('\n') ? '\n' : ''
    const value = `${textarea.value}${lineBreak}`
    const selection = { value, start: value.length, end: value.length }
    replaceTextareaValue(textarea, applyMarkdownFormat(selection, pending.format), updateBody)
  }, [mode])

  const onPreviewClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target
    const isControl = target instanceof Element && Boolean(target.closest('a, label, input'))
    if (!isControl) startEditing(null)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const shortcut = readNoteShortcut(event)
    if (shortcut === 'save') {
      event.preventDefault()
      void saveNow()
      return
    }
    const textarea = bodyRef.current
    if (!textarea || event.target !== textarea) return
    if (shortcut) {
      event.preventDefault()
      format(shortcut)
      return
    }
    const continuesList = event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing
    if (!continuesList) return
    const next = continueMarkdownList({ value: textarea.value, start: textarea.selectionStart, end: textarea.selectionEnd })
    if (!next) return
    event.preventDefault()
    replaceTextareaValue(textarea, next, updateBody)
  }

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const textarea = bodyRef.current
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || !textarea) return
    event.preventDefault()
    textarea.focus()
    textarea.setSelectionRange(0, 0)
  }

  const exportMarkdown = () => {
    const title = draft.title || 'Untitled note'
    downloadTextFile(readNoteFilename(title), `# ${title}\n\n${draft.body}\n`, 'text/markdown')
  }

  const duplicate = () => {
    flush()
    onSelect(duplicateNote(note.id))
  }

  const remove = () => {
    discard()
    deleteNote(note.id)
    setConfirming(false)
    onDeleted()
  }

  return (
    <article className="note-editor-pane" onKeyDown={onKeyDown}>
      <div className="note-topbar">
        <button type="button" className="note-back" onClick={onBack}><ChevronLeft /> Notes</button>
        <span className="note-status" role="status">{saveLabels[saveState]}</span>
        <div className="note-tools">
          <button type="button" className="icon-btn" aria-label="Add checklist" title="Checklist" onMouseDown={(event) => event.preventDefault()} onClick={() => startEditing('task')}>
            <ListChecks />
          </button>
          <button type="button" className="icon-btn" aria-label="Formatting" title="Formatting" aria-pressed={formatting && !viewing} onClick={() => { setFormatting(viewing || !formatting); startEditing(null) }}>
            <Type />
          </button>
          <button type="button" className="icon-btn" aria-label={viewing ? 'Edit note' : 'Preview note'} title={viewing ? 'Edit' : 'Preview'} aria-pressed={viewing} onClick={() => (viewing ? startEditing(null) : setMode('view'))}>
            {viewing ? <PencilLine /> : <Eye />}
          </button>
          <NoteMoreMenu
            pinned={note.favorite}
            folders={folders}
            folderId={draft.folderId}
            onPin={() => toggleFavorite('note', note.id)}
            onMove={(folderId) => setDraft({ ...draft, folderId })}
            onCopy={() => void copyText(draft.body)}
            onExport={exportMarkdown}
            onDuplicate={duplicate}
            onDelete={() => setConfirming(true)}
          />
        </div>
      </div>
      {formatting && !viewing && <MarkdownToolbar onFormat={format} />}
      <div className="note-sheet">
        <time className="note-stamp" dateTime={note.updatedAt}>{vaultDates.noteStamp(note.updatedAt)}</time>
        <input
          className="note-title-input"
          aria-label="Title"
          placeholder="Title"
          value={draft.title}
          autoFocus={autoFocusTitle}
          onKeyDown={onTitleKeyDown}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        {!viewing && (
          <textarea
            ref={bodyRef}
            className="note-body"
            aria-label="Note"
            placeholder="Start writing…"
            value={draft.body}
            onChange={(event) => updateBody(event.target.value)}
          />
        )}
        {viewing && (
          <section className="note-preview" aria-label="Preview" onClick={onPreviewClick}>
            <MarkdownPreview source={draft.body} onToggleTask={(line) => updateBody(toggleMarkdownTask(draft.body, line))} />
          </section>
        )}
      </div>
      <footer className="note-foot">{wordLabel}{taskLabel}</footer>
      {confirming && (
        <ConfirmDialog
          title="Delete note"
          body={`Remove ${note.title || 'this note'}? This can't be undone.`}
          confirmLabel="Delete note"
          onClose={() => setConfirming(false)}
          onConfirm={remove}
        />
      )}
    </article>
  )
}
