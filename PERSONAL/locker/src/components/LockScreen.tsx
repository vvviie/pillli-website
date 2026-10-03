import { useState } from 'react'
import { useVault } from '../state/useVault.ts'
import { Field } from './Field.tsx'
import { GateLayout } from './GateLayout.tsx'
import { SecretInput } from './SecretInput.tsx'

export const LockScreen = () => {
  const { unlock, unlockWithRecovery, busy, error, clearError } = useVault()
  const [password, setPassword] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)

  const submitPassword = () => {
    if (!password || busy) return
    void unlock(password)
  }

  return (
    <GateLayout>
      <p className="eyebrow">{useRecovery ? 'Recovery' : 'Locked'}</p>
      <h2>Unlock your vault</h2>
      <p className="muted">The master password never leaves this browser. Locker only unwraps the vault in memory.</p>
      {error ? <p className="danger-text" role="alert">{error}</p> : null}
      {useRecovery ? (
        <form className="stack" onSubmit={(event) => { event.preventDefault(); void unlockWithRecovery(recoveryCode) }}>
          <Field label="Recovery code">
            <input value={recoveryCode} autoComplete="off" onChange={(event) => { clearError(); setRecoveryCode(event.target.value) }} />
          </Field>
          <button className="btn btn-primary" type="submit" disabled={busy || recoveryCode.trim().length < 8}>
            {busy ? 'Checking…' : 'Unlock with recovery code'}
          </button>
        </form>
      ) : (
        <form className="stack" onSubmit={(event) => { event.preventDefault(); submitPassword() }}>
          <SecretInput label="Master password" value={password} autoComplete="current-password" onChange={(value) => { clearError(); setPassword(value) }} />
          <button className="btn btn-primary" type="submit" disabled={busy || password.length === 0}>
            {busy ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>
      )}
      <button type="button" className="btn btn-ghost" onClick={() => { clearError(); setUseRecovery((current) => !current) }}>
        {useRecovery ? 'Use master password' : 'Use recovery code'}
      </button>
    </GateLayout>
  )
}
