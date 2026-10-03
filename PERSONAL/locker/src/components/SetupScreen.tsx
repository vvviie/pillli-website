import { useState } from 'react'
import { useVault } from '../state/useVault.ts'
import { Field } from './Field.tsx'
import { GateLayout } from './GateLayout.tsx'
import { SecretInput } from './SecretInput.tsx'
import { StrengthMeter } from './StrengthMeter.tsx'

export const SetupScreen = () => {
  const { createVault, busy, error, clearError } = useVault()
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password
  const ready = displayName.trim().length > 0 && password.length >= 8 && password === confirmPassword && !busy

  return (
    <GateLayout>
      <p className="eyebrow">First run</p>
      <h2>Create a local vault</h2>
      <p className="muted">Choose a master password you can remember. Locker cannot reset it without the recovery code shown next.</p>
      {error ? <p className="danger-text" role="alert">{error}</p> : null}
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready) return
          void createVault(displayName.trim(), password)
        }}
      >
        <Field label="Display name">
          <input value={displayName} autoComplete="nickname" maxLength={40} onChange={(event) => setDisplayName(event.target.value)} />
        </Field>
        <SecretInput label="Master password" value={password} autoComplete="new-password" onChange={(value) => { clearError(); setPassword(value) }} />
        {password.length > 0 ? <StrengthMeter password={password} /> : null}
        <SecretInput label="Confirm master password" value={confirmPassword} autoComplete="new-password" onChange={setConfirmPassword} />
        {mismatch ? <p className="danger-text">Those passwords do not match.</p> : null}
        {password.length > 0 && password.length < 8 ? <p className="muted">Use at least 8 characters. A longer passphrase is stronger.</p> : null}
        <button className="btn btn-primary" type="submit" disabled={!ready}>{busy ? 'Creating vault…' : 'Create vault'}</button>
      </form>
    </GateLayout>
  )
}
