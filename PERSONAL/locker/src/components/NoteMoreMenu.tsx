import { Copy, CopyPlus, Download, Ellipsis, FolderInput, Pin, PinOff, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDismiss } from '../state/useDismiss.ts'
import type { Folder } from '../types.ts'

type NoteMoreMenuProps = {
  pinned: boolean
  folders: Folder[]
  folderId: string | null
  onPin: () => void
  onMove: (folderId: string | null) => void
  onCopy: () => void
  onExport: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export const NoteMoreMenu = ({ pinned, folders, folderId, onPin, onMove, onCopy, onExport, onDuplicate, onDelete }: NoteMoreMenuProps) => {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)
  useDismiss(wrapRef, open, close)
  const choose = (action: () => void) => () => {
    close()
    action()
  }
  return (
    <div className="note-menu-wrap" ref={wrapRef}>
      <button type="button" className="icon-btn" aria-label="More note actions" title="More" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Ellipsis />
      </button>
      {open && (
        <div className="note-menu" role="menu">
          <button type="button" role="menuitem" onClick={choose(onPin)}>
            {pinned ? <PinOff /> : <Pin />} {pinned ? 'Unpin note' : 'Pin note'}
          </button>
          {folders.length > 0 && (
            <label className="note-menu-field">
              <FolderInput />
              <select aria-label="Move to folder" value={folderId ?? ''} onChange={(event) => choose(() => onMove(event.target.value || null))()}>
                <option value="">No folder</option>
                {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
              </select>
            </label>
          )}
          <button type="button" role="menuitem" onClick={choose(onCopy)}><Copy /> Copy markdown</button>
          <button type="button" role="menuitem" onClick={choose(onExport)}><Download /> Export as .md</button>
          <button type="button" role="menuitem" onClick={choose(onDuplicate)}><CopyPlus /> Duplicate</button>
          <hr />
          <button type="button" role="menuitem" className="danger-text" onClick={choose(onDelete)}><Trash2 /> Delete note</button>
        </div>
      )}
    </div>
  )
}
