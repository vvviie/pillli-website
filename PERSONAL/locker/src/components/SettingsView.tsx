import { useState } from 'react'
import { AboutSettings } from './AboutSettings.tsx'
import { AccountSettings } from './AccountSettings.tsx'
import { AppearanceSettings } from './AppearanceSettings.tsx'
import { DataSettings } from './DataSettings.tsx'
import { PageHeader } from './PageHeader.tsx'
import { SecuritySettings } from './SecuritySettings.tsx'

const tabs = ['Account', 'Appearance', 'Security', 'Data', 'About'] as const
type SettingsTab = (typeof tabs)[number]

export const SettingsView = () => {
  const [tab, setTab] = useState<SettingsTab>('Account')
  return (
    <section className="stack">
      <PageHeader title="Settings" text="Account, appearance, security, and the data that lives on this device." />
      <div className="settings-grid">
        <div className="setting-tabs" role="tablist" aria-label="Settings sections">
          {tabs.map((item) => (
            <button type="button" key={item} className={tab === item ? 'nav-btn on' : 'nav-btn'} onClick={() => setTab(item)}>{item}</button>
          ))}
        </div>
        <div className="panel">
          {tab === 'Account' ? <AccountSettings /> : null}
          {tab === 'Appearance' ? <AppearanceSettings /> : null}
          {tab === 'Security' ? <SecuritySettings /> : null}
          {tab === 'Data' ? <DataSettings /> : null}
          {tab === 'About' ? <AboutSettings /> : null}
        </div>
      </div>
    </section>
  )
}
