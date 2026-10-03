import { argon2idAsync } from '@noble/hashes/argon2.js'
import type { VaultData } from '../types.ts'
import { bytes } from './bytes.ts'
import { isVaultData } from './isVaultData.ts'

const timeCost = 2
const memoryKiB = 19456
const parallelism = 1
const recoveryAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export type WrappedKey = { ivB64: string; dataB64: string }

export type KdfSection = {
  saltB64: string
  timeCost: number
  memoryKiB: number
  parallelism: number
  wrappedDek: WrappedKey
}

export type VaultEnvelope = {
  version: 1
  kdf: 'argon2id'
  cipher: 'AES-256-GCM'
  password: KdfSection
  recovery: KdfSection
  payload: WrappedKey
}

const createRecoveryCode = () => {
  const sample = crypto.getRandomValues(new Uint8Array(24))
  return [...sample].map((value) => recoveryAlphabet[value % recoveryAlphabet.length] ?? 'A').join('')
}

const normalizeRecovery = (value: string) => value.toUpperCase().replace(/[^A-Z2-9]/g, '')

const copyBytes = (value: Uint8Array) => {
  const copy = new Uint8Array(value.length)
  copy.set(value)
  return copy
}

const deriveKek = async (secret: string, section: Pick<KdfSection, 'saltB64' | 'timeCost' | 'memoryKiB' | 'parallelism'>) => {
  const derived = await argon2idAsync(textEncoder.encode(secret), bytes.fromBase64(section.saltB64), {
    t: section.timeCost,
    m: section.memoryKiB,
    p: section.parallelism,
    dkLen: 32,
    asyncTick: 8,
    maxmem: 64 * 1024 * 1024,
  })
  return crypto.subtle.importKey('raw', copyBytes(derived), { name: 'AES-GCM' }, false, ['wrapKey', 'unwrapKey'])
}

const wrapDek = async (dek: CryptoKey, kek: CryptoKey): Promise<WrappedKey> => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const wrapped = await crypto.subtle.wrapKey('raw', dek, kek, { name: 'AES-GCM', iv })
  return { ivB64: bytes.toBase64(iv), dataB64: bytes.toBase64(new Uint8Array(wrapped)) }
}

const unwrapDek = async (wrapped: WrappedKey, kek: CryptoKey) =>
  crypto.subtle.unwrapKey(
    'raw',
    copyBytes(bytes.fromBase64(wrapped.dataB64)),
    kek,
    { name: 'AES-GCM', iv: copyBytes(bytes.fromBase64(wrapped.ivB64)) },
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )

const createSection = async (dek: CryptoKey, secret: string): Promise<KdfSection> => {
  const section = {
    saltB64: bytes.toBase64(crypto.getRandomValues(new Uint8Array(16))),
    timeCost,
    memoryKiB,
    parallelism,
    wrappedDek: { ivB64: '', dataB64: '' },
  }
  section.wrappedDek = await wrapDek(dek, await deriveKek(secret, section))
  return section
}

const userMessage = (error: unknown, fallback: string) => {
  console.error(fallback, error)
  if (error instanceof Error && /argon|memory/i.test(error.message)) {
    return 'This device could not derive the vault key. Try again.'
  }
  return fallback
}

const isEnvelopeRecord = (value: unknown): value is VaultEnvelope => {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Partial<VaultEnvelope>
  return record.version === 1 && record.kdf === 'argon2id' && Boolean(record.password && record.recovery && record.payload)
}

export const vaultCrypto = {
  formatRecoveryCode(code: string) {
    const normalized = normalizeRecovery(code)
    return normalized.match(/.{1,4}/g)?.join('-') ?? normalized
  },
  isEnvelope: isEnvelopeRecord,
  async seal(dek: CryptoKey, data: VaultData): Promise<WrappedKey> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dek, textEncoder.encode(JSON.stringify(data)))
    return { ivB64: bytes.toBase64(iv), dataB64: bytes.toBase64(new Uint8Array(cipher)) }
  },
  async open(dek: CryptoKey, payload: WrappedKey) {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: copyBytes(bytes.fromBase64(payload.ivB64)) },
      dek,
      copyBytes(bytes.fromBase64(payload.dataB64)),
    )
    const parsed: unknown = JSON.parse(textDecoder.decode(plain))
    if (!isVaultData(parsed)) throw new Error('Vault payload is not a Locker vault.')
    return parsed
  },
  async createEnvelope(password: string, data: VaultData) {
    const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
    const recoveryCode = createRecoveryCode()
    const envelope: VaultEnvelope = {
      version: 1,
      kdf: 'argon2id',
      cipher: 'AES-256-GCM',
      password: await createSection(dek, password),
      recovery: await createSection(dek, recoveryCode),
      payload: await this.seal(dek, data),
    }
    return { envelope, dek, recoveryCode, data }
  },
  async unlockWithPassword(envelope: VaultEnvelope, password: string) {
    try {
      const dek = await unwrapDek(envelope.password.wrappedDek, await deriveKek(password, envelope.password))
      return { dek, data: await this.open(dek, envelope.payload) }
    } catch (error) {
      throw new Error(userMessage(error, 'That master password does not match this vault.'))
    }
  },
  async unlockWithRecovery(envelope: VaultEnvelope, recoveryCode: string) {
    try {
      const secret = normalizeRecovery(recoveryCode)
      const dek = await unwrapDek(envelope.recovery.wrappedDek, await deriveKek(secret, envelope.recovery))
      return { dek, data: await this.open(dek, envelope.payload) }
    } catch (error) {
      throw new Error(userMessage(error, 'That recovery code does not match this vault.'))
    }
  },
  replacePassword(dek: CryptoKey, password: string) {
    return createSection(dek, password)
  },
  async replaceRecovery(dek: CryptoKey) {
    const recoveryCode = createRecoveryCode()
    return { recoveryCode, recovery: await createSection(dek, recoveryCode) }
  },
}
