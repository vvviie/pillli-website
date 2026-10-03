import { useEffect, useState } from 'react'
import { appNavigation } from '../lib/appNavigation.ts'
import type { AppView } from '../types.ts'
import { ActivityView } from './ActivityView.tsx'
import { AppShell } from './AppShell.tsx'
import { CalendarView } from './CalendarView.tsx'
import { DashboardView } from './DashboardView.tsx'
import { FavoritesView } from './FavoritesView.tsx'
import { FoldersView } from './FoldersView.tsx'
import { GeneratorView } from './GeneratorView.tsx'
import { IncomeView } from './IncomeView.tsx'
import { NotesView } from './NotesView.tsx'
import { SearchDialog } from './SearchDialog.tsx'
import { SettingsView } from './SettingsView.tsx'
import { TasksView } from './TasksView.tsx'
import { VaultView } from './VaultView.tsx'

export const Workspace = () => {
  const [view, setView] = useState<AppView>(() => appNavigation.read(window.location.hash))
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draftPassword, setDraftPassword] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setView(appNavigation.read(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openView = (next: AppView, itemId?: string) => {
    window.location.hash = `/${next}`
    setView(next)
    setSelectedId(itemId ?? null)
    setSearchOpen(false)
  }

  return (
    <AppShell view={view} onView={(next) => openView(next)} onSearch={() => setSearchOpen(true)}>
      {view === 'dashboard' ? <DashboardView /> : null}
      {view === 'vault' ? <VaultView selectedId={selectedId} draftPassword={draftPassword} onDraftConsumed={() => setDraftPassword(null)} /> : null}
      {view === 'notes' ? <NotesView selectedId={selectedId} /> : null}
      {view === 'tasks' ? <TasksView selectedId={selectedId} /> : null}
      {view === 'calendar' ? <CalendarView /> : null}
      {view === 'income' ? <IncomeView selectedId={selectedId} /> : null}
      {view === 'folders' ? <FoldersView /> : null}
      {view === 'favorites' ? <FavoritesView /> : null}
      {view === 'generator' ? <GeneratorView onUse={(password) => { setDraftPassword(password); openView('vault') }} /> : null}
      {view === 'activity' ? <ActivityView /> : null}
      {view === 'settings' ? <SettingsView /> : null}
      {searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} onOpen={openView} /> : null}
    </AppShell>
  )
}
