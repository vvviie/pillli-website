import { vaultCrypto, type VaultEnvelope } from './vaultCrypto.ts'

const databaseName = 'locker'
const storeName = 'vault'
const recordKey = 'envelope'

let databasePromise: Promise<IDBDatabase> | null = null

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const openDatabase = () => {
  if (databasePromise) return databasePromise
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      databasePromise = null
      reject(request.error ?? new Error('Could not open the local database.'))
    }
  })
  return databasePromise
}

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local database request failed.'))
  })

const withRetry = async <T>(action: () => Promise<T>) => {
  const delays = [0, 40, 120]
  let lastError: unknown
  for (const delay of delays) {
    if (delay > 0) await wait(delay)
    try {
      return await action()
    } catch (error) {
      lastError = error
      console.error('Local vault storage failed', error)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Local vault storage failed.')
}

const store = async (mode: IDBTransactionMode) => {
  const database = await openDatabase()
  return database.transaction(storeName, mode).objectStore(storeName)
}

export const vaultDatabase = {
  readEnvelope() {
    return withRetry(async () => {
      const result = await requestToPromise((await store('readonly')).get(recordKey))
      if (!result) return null
      if (!vaultCrypto.isEnvelope(result)) throw new Error('The saved vault file is not a Locker backup.')
      return result
    })
  },
  updateEnvelope(envelope: VaultEnvelope) {
    return withRetry(async () => {
      await requestToPromise((await store('readwrite')).put(envelope, recordKey))
    })
  },
  deleteEnvelope() {
    return withRetry(async () => {
      await requestToPromise((await store('readwrite')).delete(recordKey))
    })
  },
}
