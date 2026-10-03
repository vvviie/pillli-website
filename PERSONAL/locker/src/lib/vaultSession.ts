import type { VaultData } from '../types.ts'
import type { VaultEnvelope } from './vaultCrypto.ts'
import { createEmptyVault } from './createEmptyVault.ts'
import { vaultCrypto } from './vaultCrypto.ts'
import { vaultDatabase } from './vaultDatabase.ts'
import { vaultMutations } from './vaultMutations.ts'

export const createVaultSession = (onSaveError: (message: string) => void) => {
  let envelope: VaultEnvelope | null = null
  let dek: CryptoKey | null = null
  let data: VaultData | null = null
  let pending = false
  let queue: Promise<void> = Promise.resolve()

  const persist = (next: VaultData) => {
    data = next
    const run = async () => {
      if (!dek || !envelope || pending) return
      const payload = await vaultCrypto.seal(dek, next)
      envelope = { ...envelope, payload }
      await vaultDatabase.updateEnvelope(envelope)
    }
    queue = queue.then(run).catch((error: unknown) => {
      console.error('Failed to save vault', error)
      onSaveError('Locker could not save the latest change on this device.')
    })
    return queue
  }

  return {
    getData: () => data,
    async load() {
      envelope = await vaultDatabase.readEnvelope()
      return envelope ? 'locked' as const : 'setup' as const
    },
    async beginSetup(displayName: string, password: string) {
      const created = await vaultCrypto.createEnvelope(password, createEmptyVault(displayName))
      envelope = created.envelope
      dek = created.dek
      data = created.data
      pending = true
      return created.recoveryCode
    },
    async confirmSetup() {
      if (!envelope || !data || !pending) throw new Error('There is no new vault to save.')
      await vaultDatabase.updateEnvelope(envelope)
      pending = false
      return data
    },
    discardSetup() {
      envelope = null
      dek = null
      data = null
      pending = false
    },
    async unlock(password: string) {
      if (!envelope) throw new Error('Create a vault before unlocking.')
      const opened = await vaultCrypto.unlockWithPassword(envelope, password)
      dek = opened.dek
      data = opened.data
      pending = false
      return opened.data
    },
    async unlockWithRecovery(recoveryCode: string) {
      if (!envelope) throw new Error('Create a vault before unlocking.')
      const opened = await vaultCrypto.unlockWithRecovery(envelope, recoveryCode)
      dek = opened.dek
      data = opened.data
      pending = false
      return opened.data
    },
    async lock() {
      let pendingQueue = queue
      do {
        pendingQueue = queue
        await pendingQueue
      } while (queue !== pendingQueue)
      dek = null
      data = null
      pending = false
    },
    whenIdle() {
      return queue
    },
    commit(recipe: (current: VaultData) => VaultData) {
      if (!data || pending) return null
      const next = recipe(data)
      void persist(next)
      return next
    },
    async changePassword(currentPassword: string, nextPassword: string) {
      if (!envelope || !dek || !data) throw new Error('Unlock Locker before changing the master password.')
      await vaultCrypto.unlockWithPassword(envelope, currentPassword)
      const password = await vaultCrypto.replacePassword(dek, nextPassword)
      envelope = { ...envelope, password }
      const next = vaultMutations.addActivity(data, 'Security', 'updated', 'Master password')
      return persist(next).then(() => next)
    },
    async rotateRecovery() {
      if (!envelope || !dek || !data) throw new Error('Unlock Locker before replacing the recovery code.')
      const rotated = await vaultCrypto.replaceRecovery(dek)
      envelope = { ...envelope, recovery: rotated.recovery }
      const next = vaultMutations.addActivity(data, 'Security', 'updated', 'Recovery code')
      await persist(next)
      return { recoveryCode: rotated.recoveryCode, data: next }
    },
    async exportEnvelope() {
      if (!data) throw new Error('Unlock Locker before exporting a backup.')
      const next = vaultMutations.addActivity(data, 'Data', 'exported', 'Encrypted backup')
      await persist(next)
      if (!envelope) throw new Error('Nothing to export.')
      return { envelope, data: next }
    },
    async importEnvelope(nextEnvelope: VaultEnvelope) {
      await vaultDatabase.updateEnvelope(nextEnvelope)
      envelope = nextEnvelope
      dek = null
      data = null
      pending = false
    },
    async reset() {
      await vaultDatabase.deleteEnvelope()
      envelope = null
      dek = null
      data = null
      pending = false
    },
  }
}

export type VaultSession = ReturnType<typeof createVaultSession>
