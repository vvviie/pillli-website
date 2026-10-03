import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { appearancePreferences } from '../lib/appearance.ts'
import { createIdentifier } from '../lib/createIdentifier.ts'
import { credentialsCsv } from '../lib/credentialsCsv.ts'
import { downloadTextFile } from '../lib/downloadTextFile.ts'
import { readFileText } from '../lib/readFileText.ts'
import { createVaultSession, type VaultSession } from '../lib/vaultSession.ts'
import { vaultCrypto } from '../lib/vaultCrypto.ts'
import { vaultMutations } from '../lib/vaultMutations.ts'
import { yieldToPaint } from '../lib/yieldToPaint.ts'
import type { CredentialDraft, FavoriteKind, FolderDraft, IncomeDraft, NoteDraft, Profile, Settings, TaskDraft, VaultData, VaultPhase } from '../types.ts'
import { vaultContext } from './vaultContext.ts'

const messageFrom = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback)

export const VaultProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhase] = useState<VaultPhase>('loading')
  const [data, setData] = useState<VaultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const errorHandler = useRef<(message: string) => void>(() => {})
  const sessionRef = useRef<VaultSession | null>(null)
  errorHandler.current = (message) => setError(message)
  if (!sessionRef.current) sessionRef.current = createVaultSession((message) => errorHandler.current(message))
  const session = sessionRef.current

  const publishNotice = useCallback((message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 2600)
  }, [])

  const enter = useCallback((next: VaultData) => {
    appearancePreferences.update(next.settings)
    setData(next)
    setError(null)
    setRecoveryCode(null)
    setPhase('unlocked')
  }, [])

  const commit = useCallback((recipe: (current: VaultData) => VaultData) => {
    const next = session.commit(recipe)
    if (next) setData(next)
    return next
  }, [session])

  useEffect(() => {
    let active = true
    appearancePreferences.apply(appearancePreferences.read())
    session.load().then((nextPhase) => {
      if (!active) return
      setPhase(nextPhase)
    }).catch((loadError: unknown) => {
      console.error('Failed to read vault', loadError)
      if (!active) return
      setError('Locker could not open the vault saved in this browser.')
      setPhase('error')
    })
    return () => { active = false }
  }, [session])

  useEffect(() => {
    if (!data) return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (data.settings.theme === 'system') appearancePreferences.apply(data.settings)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [data])

  const lock = useCallback(async () => {
    await session.lock()
    setData(null)
    setPhase('locked')
    setError(null)
  }, [session])

  useEffect(() => {
    if (phase !== 'unlocked' || !data || data.settings.autoLockMinutes <= 0) return undefined
    let lastActivity = Date.now()
    const mark = () => { lastActivity = Date.now() }
    const limit = data.settings.autoLockMinutes * 60_000
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity >= limit) lock()
    }, 5000)
    window.addEventListener('pointerdown', mark)
    window.addEventListener('keydown', mark)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pointerdown', mark)
      window.removeEventListener('keydown', mark)
    }
  }, [data, lock, phase])

  const runBusy = useCallback(async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    await yieldToPaint()
    try {
      await action()
    } catch (actionError: unknown) {
      console.error('Vault action failed', actionError)
      setError(messageFrom(actionError, 'Locker could not finish that action.'))
    } finally {
      setBusy(false)
    }
  }, [])

  const value = useMemo(() => ({
    phase, data, error, notice, recoveryCode, busy,
    clearError: () => setError(null),
    createVault: (displayName: string, password: string) => runBusy(async () => {
      setRecoveryCode(await session.beginSetup(displayName, password))
      setPhase('recovery')
    }),
    confirmRecoveryCode: () => runBusy(async () => {
      enter(await session.confirmSetup())
      publishNotice('Vault created on this device')
    }),
    discardSetup: () => {
      session.discardSetup()
      setRecoveryCode(null)
      setPhase('setup')
    },
    unlock: (password: string) => runBusy(async () => enter(await session.unlock(password))),
    unlockWithRecovery: (code: string) => runBusy(async () => enter(await session.unlockWithRecovery(code))),
    lock,
    whenVaultIdle: () => session.whenIdle(),
    copyText: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        publishNotice('Copied')
        const seconds = session.getData()?.settings.clipboardClearSeconds ?? 0
        if (seconds > 0) {
          window.setTimeout(() => {
            navigator.clipboard.writeText('').catch((copyError: unknown) => console.error('Clipboard clear failed', copyError))
          }, seconds * 1000)
        }
      } catch (copyError: unknown) {
        console.error('Clipboard write failed', copyError)
        setError('Locker could not copy that to the clipboard.')
      }
    },
    saveCredential: (draft: CredentialDraft, credentialId?: string) => commit((current) => vaultMutations.saveCredential(current, draft, credentialId)),
    deleteCredential: (credentialId: string) => commit((current) => vaultMutations.deleteCredential(current, credentialId)),
    saveNote: (draft: NoteDraft, noteId?: string) => {
      const id = noteId ?? createIdentifier()
      commit((current) => vaultMutations.saveNote(current, draft, id, !noteId))
      return id
    },
    deleteNote: (noteId: string) => commit((current) => vaultMutations.deleteNote(current, noteId)),
    duplicateNote: (noteId: string) => {
      const copyId = createIdentifier()
      commit((current) => vaultMutations.duplicateNote(current, noteId, copyId))
      return copyId
    },
    saveTask: (draft: TaskDraft, taskId?: string) => commit((current) => vaultMutations.saveTask(current, draft, taskId)),
    deleteTask: (taskId: string) => commit((current) => vaultMutations.deleteTask(current, taskId)),
    saveIncome: (draft: IncomeDraft, incomeId?: string) => commit((current) => vaultMutations.saveIncome(current, draft, incomeId)),
    deleteIncome: (incomeId: string) => commit((current) => vaultMutations.deleteIncome(current, incomeId)),
    saveFolder: (draft: FolderDraft, folderId?: string) => commit((current) => vaultMutations.saveFolder(current, draft, folderId)),
    deleteFolder: (folderId: string) => commit((current) => vaultMutations.deleteFolder(current, folderId)),
    toggleFavorite: (kind: FavoriteKind, itemId: string) => commit((current) => vaultMutations.toggleFavorite(current, kind, itemId)),
    updateProfile: (profile: Profile) => commit((current) => vaultMutations.updateProfile(current, profile)),
    updateSettings: (settings: Settings) => {
      appearancePreferences.update(settings)
      commit((current) => vaultMutations.updateSettings(current, settings))
    },
    changeMasterPassword: (currentPassword: string, nextPassword: string) => runBusy(async () => {
      enter(await session.changePassword(currentPassword, nextPassword))
      publishNotice('Master password updated')
    }),
    rotateRecoveryCode: async () => {
      const rotated = await session.rotateRecovery()
      setData(rotated.data)
      return rotated.recoveryCode
    },
    exportBackup: () => runBusy(async () => {
      const exported = await session.exportEnvelope()
      setData(exported.data)
      downloadTextFile('locker-backup.json', JSON.stringify(exported.envelope), 'application/json')
      publishNotice('Encrypted backup downloaded')
    }),
    importBackup: (file: File) => runBusy(async () => {
      const parsed: unknown = JSON.parse(await readFileText(file))
      if (!vaultCrypto.isEnvelope(parsed)) throw new Error('That file is not a Locker backup.')
      await session.importEnvelope(parsed)
      setData(null)
      setPhase('locked')
      publishNotice('Backup restored. Unlock it with that vault’s master password.')
    }),
    exportCredentialsCsv: () => {
      const current = session.getData()
      if (!current) return
      downloadTextFile('locker-credentials.csv', credentialsCsv.stringify(current.credentials), 'text/csv')
      publishNotice('CSV downloaded — it is not encrypted')
    },
    downloadCsvTemplate: () => downloadTextFile('locker-template.csv', credentialsCsv.template(), 'text/csv'),
    importCredentialsCsv: (file: File) => runBusy(async () => {
      const drafts = credentialsCsv.parse(await readFileText(file))
      if (drafts.length === 0) throw new Error('That CSV did not include any credentials.')
      commit((current) => vaultMutations.importCredentials(current, drafts))
      publishNotice(`Imported ${drafts.length} credentials`)
    }),
    clearActivity: () => commit((current) => vaultMutations.clearActivity(current)),
    resetVault: () => runBusy(async () => {
      await session.reset()
      setData(null)
      setRecoveryCode(null)
      setPhase('setup')
      publishNotice('Vault removed from this device')
    }),
  }), [busy, commit, data, enter, error, lock, notice, phase, publishNotice, recoveryCode, runBusy, session])

  return <vaultContext.Provider value={value}>{children}</vaultContext.Provider>
}
