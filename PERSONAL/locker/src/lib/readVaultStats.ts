import type { VaultData } from '../types.ts'
import { vaultDates } from './vaultDates.ts'

export const readVaultStats = (data: VaultData, todayKey = vaultDates.todayKey()) => {
  const openTasks = data.tasks.filter((task) => task.status !== 'done')
  const overdue = openTasks.filter((task) => task.dueDate !== null && task.dueDate < todayKey)
  const upcoming = openTasks
    .filter((task) => task.dueDate !== null && task.dueDate >= todayKey)
    .sort((left, right) => (left.dueDate ?? '').localeCompare(right.dueDate ?? ''))
    .slice(0, 5)
  const recentCredentials = [...data.credentials].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, 5)
  return {
    credentialCount: data.credentials.length,
    noteCount: data.notes.length,
    openTaskCount: openTasks.length,
    overdue,
    upcoming,
    recentCredentials,
  }
}
