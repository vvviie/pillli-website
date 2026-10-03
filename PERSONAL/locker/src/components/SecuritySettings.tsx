import { useState } from 'react'
import { vaultCrypto } from '../lib/vaultCrypto.ts'
import { useVault } from '../state/useVault.ts'
import { Field } from './Field.tsx'
import { Modal } from './Modal.tsx'
import { SecretInput } from './SecretInput.tsx'

export const SecuritySettings = () => {
  const { data, updateSettings, changeMasterPassword, rotateRecoveryCode, copyText, busy, error } = useVault()
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  if (!data) return null
  const settings = data.settings
  const mismatch = confirmPassword.length > 0 && confirmPassword !== nextPassword
  const ready = currentPassword.length > 0 && nextPassword.length >= 8 && nextPassword === confirmPassword && !busy

  const rotate = async () => {
    setSaved(false)
    setRecoveryCode(vaultCrypto.formatRecoveryCode(await rotateRecoveryCode()))
  }

  return (
    <div className="stack">
      <h2>Security</h2>
      <Field label="Auto-lock">
        <select aria-label="Auto-lock" value={settings.autoLockMinutes} onChange={(event) => updateSettings({ ...settings, autoLockMinutes: Number(event.target.value) })}>
          <option value={1}>1 minute</option>
          <option value={5}>5 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={0}>Never</option>
        </select>
      </Field>
      <Field label="Clear copied secrets">
        <select aria-label="Clear copied secrets" value={settings.clipboardClearSeconds} onChange={(event) => updateSettings({ ...settings, clipboardClearSeconds: Number(event.target.value) })}>
          <option value={10}>After 10 seconds</option>
          <option value={20}>After 20 seconds</option>
          <option value={60}>After 60 seconds</option>
          <option value={0}>Do not clear</option>
        </select>
      </Field>
      <h3>Master password</h3>
      {error ? <p className="danger-text">{error}</p> : null}
      <SecretInput label="Current master password" value={currentPassword} autoComplete="current-password" onChange={setCurrentPassword} />
      <SecretInput label="New master password" value={nextPassword} autoComplete="new-password" onChange={setNextPassword} />
      <SecretInput label="Confirm new master password" value={confirmPassword} autoComplete="new-password" onChange={setConfirmPassword} />
      {mismatch ? <p className="danger-text">Those passwords do not match.</p> : null}
      <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => void changeMasterPassword(currentPassword, nextPassword)}>
        {busy ? 'Updating…' : 'Update master password'}
      </button>
      <h3>Recovery code</h3>
      <p className="muted">Replacing the recovery code retires the old one immediately.</p>
      <button type="button" className="btn" onClick={() => void rotate().catch((rotateError: unknown) => console.error('Recovery rotation failed', rotateError))}>
        Create a new recovery code
      </button>
      {recoveryCode ? (
        <Modal title="New recovery code" onClose={() => { if (saved) setRecoveryCode(null) }}>
          <p className="recovery-code">{recoveryCode}</p>
          <button type="button" className="btn" onClick={() => void copyText(recoveryCode)}>Copy code</button>
          <label className="check">
            <input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} />
            <span>I saved this recovery code</span>
          </label>
          <button type="button" className="btn btn-primary" disabled={!saved} onClick={() => setRecoveryCode(null)}>Done</button>
        </Modal>
      ) : null}
    </div>
  )
}
