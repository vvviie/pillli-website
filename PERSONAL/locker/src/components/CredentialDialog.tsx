import { Copy, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { vaultDates } from '../lib/vaultDates.ts'
import { readWebsiteHost } from '../lib/readWebsiteHost.ts'
import { useVault } from '../state/useVault.ts'
import type { Credential, CredentialDraft } from '../types.ts'
import { ConfirmDialog } from './ConfirmDialog.tsx'
import { FavoriteButton } from './FavoriteButton.tsx'
import { Field } from './Field.tsx'
import { Modal } from './Modal.tsx'
import { SecretInput } from './SecretInput.tsx'
import { parseTags } from '../lib/parseTags.ts'
import { WebsiteMark } from './WebsiteMark.tsx'

type CredentialDialogProps = {
  initial: Credential | null
  draftPassword: string
  onClose: () => void
}

const emptyDraft = (password = ''): CredentialDraft => ({
  title: '',
  username: '',
  password,
  website: '',
  notes: '',
  tags: [],
  folderId: null,
})

export const CredentialDialog = ({ initial, draftPassword, onClose }: CredentialDialogProps) => {
  const { data, saveCredential, deleteCredential, copyText, toggleFavorite } = useVault()
  const [draft, setDraft] = useState<CredentialDraft>(() => initial ? {
    title: initial.title,
    username: initial.username,
    password: initial.password,
    website: initial.website,
    notes: initial.notes,
    tags: initial.tags,
    folderId: initial.folderId,
  } : emptyDraft(draftPassword))
  const [tagText, setTagText] = useState(initial?.tags.join(', ') ?? '')
  const [confirming, setConfirming] = useState(false)
  const folders = data?.folders.filter((folder) => folder.kind === 'vault') ?? []
  const host = readWebsiteHost(draft.website)

  useEffect(() => {
    if (!initial && draftPassword) setDraft((current) => ({ ...current, password: draftPassword }))
  }, [draftPassword, initial])

  const save = () => {
    if (!draft.title.trim()) return
    saveCredential({ ...draft, title: draft.title.trim(), tags: parseTags(tagText) }, initial?.id)
    onClose()
  }

  return (
    <Modal title={initial ? initial.title : 'New credential'} onClose={onClose}>
      <Field label="Title">
        <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      </Field>
      <Field label="Username or email">
        <input value={draft.username} autoComplete="off" onChange={(event) => setDraft({ ...draft, username: event.target.value })} />
      </Field>
      <SecretInput label="Password" value={draft.password} autoComplete="new-password" onChange={(password) => setDraft({ ...draft, password })} />
      <div className="row-actions">
        <button type="button" className="btn" onClick={() => void copyText(draft.password)}><Copy /> Copy password</button>
        {initial ? <FavoriteButton active={initial.favorite} label={initial.title} onToggle={() => toggleFavorite('credential', initial.id)} /> : null}
      </div>
      <Field label="Website">
        <input value={draft.website} placeholder="example.com" onChange={(event) => setDraft({ ...draft, website: event.target.value })} />
      </Field>
      {host ? (
        <div className="row-actions">
          <WebsiteMark website={draft.website} title={draft.title || host} />
          <a href={`https://${host}`} target="_blank" rel="noreferrer">{host}</a>
        </div>
      ) : null}
      <Field label="Folder">
        <select value={draft.folderId ?? ''} onChange={(event) => setDraft({ ...draft, folderId: event.target.value || null })}>
          <option value="">No folder</option>
          {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
        </select>
      </Field>
      <Field label="Tags">
        <input value={tagText} placeholder="work, email" onChange={(event) => setTagText(event.target.value)} />
      </Field>
      <Field label="Notes">
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
      </Field>
      {initial ? <p className="muted">Updated {vaultDates.activityTime(initial.updatedAt)}</p> : null}
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={save}><Plus /> Save credential</button>
        {initial ? <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>Delete</button> : null}
      </div>
      {confirming && initial ? (
        <ConfirmDialog
          title="Delete credential"
          body={`Remove ${initial.title} from this vault?`}
          confirmLabel="Delete credential"
          onClose={() => setConfirming(false)}
          onConfirm={() => { deleteCredential(initial.id); onClose() }}
        />
      ) : null}
    </Modal>
  )
}
