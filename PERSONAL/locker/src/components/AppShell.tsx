import { Lock, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { appNavigation } from '../lib/appNavigation.ts'
import { useVault } from '../state/useVault.ts'
import type { AppView } from '../types.ts'

type AppShellProps = {
  view: AppView
  onView: (view: AppView) => void
  onSearch: () => void
  children: ReactNode
}

export const AppShell = ({ view, onView, onSearch, children }: AppShellProps) => {
  const { data, lock, notice, error, clearError } = useVault()
  const [menuOpen, setMenuOpen] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  const openView = (next: AppView) => {
    setMenuOpen(false)
    onView(next)
  }
  const presence = online ? 'On this device' : 'Offline · still available'
  return (
    <div className="shell">
      {menuOpen ? <button type="button" className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}
      <aside className={menuOpen ? 'side open' : 'side'}>
        <div className="side-brand">
          <strong>Locker</strong>
        </div>
        {appNavigation.items.map((item) => {
          const Icon = item.icon
          return (
            <button
              type="button"
              key={item.view}
              className={item.view === view ? 'nav-btn on' : 'nav-btn'}
              onClick={() => openView(item.view)}
            >
              <Icon />
              {item.label}
            </button>
          )
        })}
        <div className="side-foot profile-chip">
          <span className="avatar">
            {data?.profile.avatarDataUrl ? <img alt="" src={data.profile.avatarDataUrl} /> : (data?.profile.displayName.slice(0, 1) ?? 'L')}
          </span>
          <span>{data?.profile.displayName}</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <button type="button" className="search-launch" onClick={onSearch}>Search Locker</button>
          <span className="presence">{presence}</span>
          <button type="button" className="icon-btn" aria-label="Lock vault" onClick={lock}>
            <Lock />
          </button>
        </header>
        <div className="content">
          {error ? (
            <div className="banner" role="alert">
              <span>{error}</span>
              <button type="button" className="btn btn-ghost" onClick={clearError}>Dismiss</button>
            </div>
          ) : null}
          {children}
        </div>
      </div>
      {notice ? <div className="toast" role="status">{notice}</div> : null}
    </div>
  )
}
