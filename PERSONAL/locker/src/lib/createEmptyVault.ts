import type { VaultData } from '../types.ts'

export const createEmptyVault = (displayName: string): VaultData => ({
  profile: {
    displayName: displayName.trim() || 'There',
    avatarDataUrl: null,
  },
  settings: {
    theme: 'dark',
    accent: 'brass',
    fontSize: 'medium',
    showWebsiteIcons: true,
    autoLockMinutes: 5,
    clipboardClearSeconds: 20,
    clocks: [
      { id: 'manila', label: 'Manila', timeZone: 'Asia/Manila' },
      { id: 'london', label: 'London', timeZone: 'Europe/London' },
      { id: 'new-york', label: 'New York', timeZone: 'America/New_York' },
    ],
  },
  folders: [],
  credentials: [],
  notes: [],
  tasks: [],
  income: [],
  activity: [],
})
