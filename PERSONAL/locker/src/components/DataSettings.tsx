import { useState } from 'react'
import { useVault } from '../state/useVault.ts'

export const DataSettings = () => {
  const { exportBackup, importBackup, exportCredentialsCsv, downloadCsvTemplate, importCredentialsCsv, resetVault, busy } = useVault()
  const [resetText, setResetText] = useState('')
  const [confirmImport, setConfirmImport] = useState<File | null>(null)

  return (
    <div className="stack">
      <h2>Data</h2>
      <p className="muted">Encrypted backups can move the vault between browsers. CSV files are plain text and include passwords.</p>
      <div className="row-actions">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void exportBackup()}>Download encrypted backup</button>
      </div>
      <label className="field">
        <span>Restore an encrypted backup</span>
        <input
          type="file"
          accept="application/json,.json"
          aria-label="Restore an encrypted backup"
          onChange={(event) => setConfirmImport(event.target.files?.[0] ?? null)}
        />
      </label>
      {confirmImport ? (
        <div className="panel stack">
          <p>Replace the vault on this device with {confirmImport.name}? The current vault stays only if you exported it first.</p>
          <div className="row-actions">
            <button type="button" className="btn btn-danger" onClick={() => { void importBackup(confirmImport); setConfirmImport(null) }}>Replace vault</button>
            <button type="button" className="btn" onClick={() => setConfirmImport(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
      <div className="row-actions">
        <button type="button" className="btn" onClick={exportCredentialsCsv}>Export CSV</button>
        <button type="button" className="btn" onClick={downloadCsvTemplate}>Download CSV template</button>
      </div>
      <label className="field">
        <span>Import credentials CSV</span>
        <input type="file" accept="text/csv,.csv" aria-label="Import credentials CSV" onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void importCredentialsCsv(file)
          event.target.value = ''
        }} />
      </label>
      <h3>Reset vault</h3>
      <p className="muted">This deletes the encrypted vault from this browser. Type RESET to confirm.</p>
      <input aria-label="Type RESET to confirm" value={resetText} onChange={(event) => setResetText(event.target.value)} />
      <button type="button" className="btn btn-danger" disabled={resetText !== 'RESET' || busy} onClick={() => void resetVault()}>Delete vault from this device</button>
    </div>
  )
}
