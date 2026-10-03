import type { VaultData } from '../types.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const isVaultData = (value: unknown): value is VaultData => {
  if (!isRecord(value)) return false
  const profileReady = isRecord(value.profile) && typeof value.profile.displayName === 'string'
  const settingsReady = isRecord(value.settings) && Array.isArray(value.settings.clocks)
  const listsReady = [
    value.folders,
    value.credentials,
    value.notes,
    value.tasks,
    value.income,
    value.activity,
  ].every(Array.isArray)
  return profileReady && settingsReady && listsReady
}
