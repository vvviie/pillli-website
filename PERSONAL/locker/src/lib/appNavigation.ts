import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Folder, History, KeyRound, LayoutDashboard, Settings, SquareCheckBig, Star, StickyNote, TrendingUp, WandSparkles } from 'lucide-react'
import type { AppView } from '../types.ts'

const items: { view: AppView; label: string; icon: LucideIcon }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'vault', label: 'Vault', icon: KeyRound },
  { view: 'notes', label: 'Notes', icon: StickyNote },
  { view: 'tasks', label: 'Tasks', icon: SquareCheckBig },
  { view: 'calendar', label: 'Calendar', icon: CalendarDays },
  { view: 'income', label: 'Income', icon: TrendingUp },
  { view: 'folders', label: 'Folders', icon: Folder },
  { view: 'favorites', label: 'Favorites', icon: Star },
  { view: 'generator', label: 'Generator', icon: WandSparkles },
  { view: 'activity', label: 'Activity', icon: History },
  { view: 'settings', label: 'Settings', icon: Settings },
]

export const appNavigation = {
  items,
  read(hash: string): AppView {
    const value = hash.replace(/^#\/?/, '')
    return items.find((item) => item.view === value)?.view ?? 'dashboard'
  },
}
