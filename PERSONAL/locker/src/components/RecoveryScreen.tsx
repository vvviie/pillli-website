import { useState } from 'react'
import { vaultCrypto } from '../lib/vaultCrypto.ts'
import { useVault } from '../state/useVault.ts'
import { GateLayout } from './GateLayout.tsx'

export const RecoveryScreen = () => {
  const { recoveryCode, confirmRecoveryCode, discardSetup, copyText, busy, error } = useVault()
  const [saved, setSaved] = useState(false)
  const formatted = vaultCrypto.formatRecoveryCode(recoveryCode ?? '')

  return (
    <GateLayout>
      <p className="eyebrow">Save this once</p>
      <h2>Recovery code</h2>
      <p className="muted">
        This code can unlock the vault if you forget the master password. Locker will not show it again. Store it somewhere separate from this device.
      </p>
      {error ? <p className="danger-text" role="alert">{error}</p> : null}
      <p className="recovery-code">{formatted}</p>
      <div className="row-actions">
        <button type="button" className="btn" onClick={() => void copyText(formatted)}>Copy code</button>
        <button type="button" className="btn btn-ghost" onClick={discardSetup}>Start over</button>
      </div>
      <label className="check">
        <input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} />
        <span>I saved this recovery code</span>
      </label>
      <button type="button" className="btn btn-primary" disabled={!saved || busy} onClick={() => void confirmRecoveryCode()}>
        {busy ? 'Saving…' : 'Open Locker'}
      </button>
    </GateLayout>
  )
}
