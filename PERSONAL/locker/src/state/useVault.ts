import { useContext } from 'react'
import { vaultContext } from './vaultContext.ts'

export const useVault = () => {
  const value = useContext(vaultContext)
  if (!value) throw new Error('useVault must be used within VaultProvider')
  return value
}
