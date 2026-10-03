import { LockScreen } from './components/LockScreen.tsx'
import { RecoveryScreen } from './components/RecoveryScreen.tsx'
import { SetupScreen } from './components/SetupScreen.tsx'
import { StatusScreen } from './components/StatusScreen.tsx'
import { Workspace } from './components/Workspace.tsx'
import { VaultProvider } from './state/VaultProvider.tsx'
import { useVault } from './state/useVault.ts'

const LockerApp = () => {
  const { phase, error } = useVault()
  if (phase === 'loading') return <StatusScreen title="Opening Locker" text="Reading the encrypted vault on this device." />
  if (phase === 'error') return <StatusScreen title="Vault unavailable" text={error ?? 'Locker could not open the local database.'} />
  if (phase === 'setup') return <SetupScreen />
  if (phase === 'recovery') return <RecoveryScreen />
  if (phase === 'locked') return <LockScreen />
  return <Workspace />
}

export const App = () => (
  <VaultProvider>
    <LockerApp />
  </VaultProvider>
)
