import { useState } from 'react'
import { readAvatarDataUrl } from '../lib/readAvatarDataUrl.ts'
import { useVault } from '../state/useVault.ts'
import { Field } from './Field.tsx'

export const AccountSettings = () => {
  const { data, updateProfile } = useVault()
  const [displayName, setDisplayName] = useState(data?.profile.displayName ?? '')
  const [message, setMessage] = useState<string | null>(null)
  if (!data) return null

  const save = () => {
    if (!displayName.trim()) return
    updateProfile({ ...data.profile, displayName: displayName.trim() })
    setMessage('Profile saved')
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 2_000_000) {
      setMessage('Choose a picture under 2 MB.')
      return
    }
    try {
      const avatarDataUrl = await readAvatarDataUrl(file)
      updateProfile({ displayName: displayName.trim() || data.profile.displayName, avatarDataUrl })
      setMessage('Picture saved')
    } catch (error) {
      console.error('Avatar update failed', error)
      setMessage(error instanceof Error ? error.message : 'Could not use that picture.')
    }
  }

  return (
    <div className="stack">
      <h2>Account</h2>
      <div className="profile-chip">
        <span className="avatar">{data.profile.avatarDataUrl ? <img alt="" src={data.profile.avatarDataUrl} /> : displayName.slice(0, 1)}</span>
        <span className="muted">Shown in the sidebar. Stored inside the encrypted vault.</span>
      </div>
      <Field label="Display name">
        <input value={displayName} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} />
      </Field>
      <Field label="Profile picture">
        <input type="file" accept="image/*" aria-label="Profile picture" onChange={(event) => void onFile(event.target.files?.[0])} />
      </Field>
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={save}>Save profile</button>
        {data.profile.avatarDataUrl ? (
          <button type="button" className="btn" onClick={() => updateProfile({ ...data.profile, displayName: displayName.trim() || data.profile.displayName, avatarDataUrl: null })}>Remove picture</button>
        ) : null}
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  )
}
