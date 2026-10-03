import { createEmptyVault } from './createEmptyVault.ts'
import { vaultCrypto } from './vaultCrypto.ts'
import { describe, expect, it } from 'vitest'

describe('vaultCrypto', () => {
  it('unlocks with the master password and the recovery code', async () => {
    const vault = createEmptyVault('Ada')
    vault.credentials.push({
      id: 'cred-1',
      title: 'Mail',
      username: 'ada@example.com',
      password: 'correct horse battery',
      website: 'mail.example',
      notes: '',
      tags: ['work'],
      folderId: null,
      favorite: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const created = await vaultCrypto.createEnvelope('long-master-password', vault)
    const unlocked = await vaultCrypto.unlockWithPassword(created.envelope, 'long-master-password')
    expect(unlocked.data.profile.displayName).toBe('Ada')
    expect(unlocked.data.credentials[0]?.password).toBe('correct horse battery')
    const recovered = await vaultCrypto.unlockWithRecovery(created.envelope, vaultCrypto.formatRecoveryCode(created.recoveryCode))
    expect(recovered.data.credentials).toHaveLength(1)
    await expect(vaultCrypto.unlockWithPassword(created.envelope, 'wrong-password')).rejects.toThrow(/master password/i)
  }, 30000)
})
