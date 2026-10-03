import { useState } from 'react'
import { vaultOptions } from '../lib/vaultOptions.ts'
import { useVault } from '../state/useVault.ts'
import type { Folder, FolderDraft, FolderKind } from '../types.ts'
import { Field } from './Field.tsx'
import { Modal } from './Modal.tsx'

export const FolderDialog = ({ initial, kind, onClose }: { initial: Folder | null; kind: FolderKind; onClose: () => void }) => {
  const { saveFolder, deleteFolder } = useVault()
  const [draft, setDraft] = useState<FolderDraft>({
    name: initial?.name ?? '',
    color: initial?.color ?? vaultOptions.folderColors[0] ?? '#d4a15a',
    kind: initial?.kind ?? kind,
  })
  const save = () => {
    if (!draft.name.trim()) return
    saveFolder({ ...draft, name: draft.name.trim() }, initial?.id)
    onClose()
  }
  return (
    <Modal title={initial ? 'Edit folder' : 'New folder'} onClose={onClose}>
      <Field label="Name">
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </Field>
      <p className="muted">{draft.kind === 'vault' ? 'Password folder' : 'Note folder'}</p>
      <div className="swatches" aria-label="Folder color">
        {vaultOptions.folderColors.map((color) => (
          <button
            type="button"
            key={color}
            className={draft.color === color ? 'swatch swatch-on' : 'swatch'}
            style={{ background: color }}
            aria-label={`Use color ${color}`}
            onClick={() => setDraft({ ...draft, color })}
          />
        ))}
      </div>
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={save}>Save folder</button>
        {initial ? <button type="button" className="btn btn-danger" onClick={() => { deleteFolder(initial.id); onClose() }}>Delete</button> : null}
      </div>
    </Modal>
  )
}
