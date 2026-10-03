import { createContext } from 'react'
import type { CredentialDraft, FavoriteKind, FolderDraft, IncomeDraft, NoteDraft, Profile, Settings, TaskDraft, VaultData, VaultPhase } from '../types.ts'

export type VaultContextValue = {
  phase: VaultPhase
  data: VaultData | null
  error: string | null
  notice: string | null
  recoveryCode: string | null
  busy: boolean
  clearError: () => void
  createVault: (displayName: string, password: string) => Promise<void>
  confirmRecoveryCode: () => Promise<void>
  discardSetup: () => void
  unlock: (password: string) => Promise<void>
  unlockWithRecovery: (recoveryCode: string) => Promise<void>
  lock: () => Promise<void>
  whenVaultIdle: () => Promise<void>
  copyText: (value: string) => Promise<void>
  saveCredential: (draft: CredentialDraft, credentialId?: string) => void
  deleteCredential: (credentialId: string) => void
  saveNote: (draft: NoteDraft, noteId?: string) => string
  deleteNote: (noteId: string) => void
  duplicateNote: (noteId: string) => string
  saveTask: (draft: TaskDraft, taskId?: string) => void
  deleteTask: (taskId: string) => void
  saveIncome: (draft: IncomeDraft, incomeId?: string) => void
  deleteIncome: (incomeId: string) => void
  saveFolder: (draft: FolderDraft, folderId?: string) => void
  deleteFolder: (folderId: string) => void
  toggleFavorite: (kind: FavoriteKind, itemId: string) => void
  updateProfile: (profile: Profile) => void
  updateSettings: (settings: Settings) => void
  changeMasterPassword: (currentPassword: string, nextPassword: string) => Promise<void>
  rotateRecoveryCode: () => Promise<string>
  exportBackup: () => Promise<void>
  importBackup: (file: File) => Promise<void>
  exportCredentialsCsv: () => void
  downloadCsvTemplate: () => void
  importCredentialsCsv: (file: File) => Promise<void>
  clearActivity: () => void
  resetVault: () => Promise<void>
}

export const vaultContext = createContext<VaultContextValue | null>(null)
