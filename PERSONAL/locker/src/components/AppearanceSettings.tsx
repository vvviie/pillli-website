import { createIdentifier } from '../lib/createIdentifier.ts'
import { vaultOptions } from '../lib/vaultOptions.ts'
import { useVault } from '../state/useVault.ts'
import type { AccentName, FontSize, ThemeMode } from '../types.ts'

export const AppearanceSettings = () => {
  const { data, updateSettings } = useVault()
  if (!data) return null
  const settings = data.settings
  const patch = (partial: Partial<typeof settings>) => updateSettings({ ...settings, ...partial })
  const remaining = vaultOptions.clockPresets.filter((preset) => !settings.clocks.some((clock) => clock.timeZone === preset.timeZone))

  return (
    <div className="stack">
      <h2>Appearance</h2>
      <p className="muted">Theme, type size, and clocks are saved with the vault and remembered on the lock screen.</p>
      <div className="segment" aria-label="Theme">
        {(['dark', 'light', 'system'] as ThemeMode[]).map((theme) => (
          <button type="button" key={theme} className={settings.theme === theme ? 'on' : ''} onClick={() => patch({ theme })}>{theme}</button>
        ))}
      </div>
      <div className="segment" aria-label="Font size">
        {(['small', 'medium', 'large'] as FontSize[]).map((fontSize) => (
          <button type="button" key={fontSize} className={settings.fontSize === fontSize ? 'on' : ''} onClick={() => patch({ fontSize })}>{fontSize}</button>
        ))}
      </div>
      <div className="choices" aria-label="Accent color">
        {vaultOptions.accents.map((accent) => (
          <button type="button" key={accent.id} className={settings.accent === accent.id ? 'btn choice-on' : 'btn'} onClick={() => patch({ accent: accent.id as AccentName })}>
            {accent.label}
          </button>
        ))}
      </div>
      <label className="check">
        <input type="checkbox" checked={settings.showWebsiteIcons} onChange={(event) => patch({ showWebsiteIcons: event.target.checked })} />
        <span>Show the site logo from the website address when online. Offline, Locker uses a letter instead.</span>
      </label>
      <h3>World clocks</h3>
      <div className="list">
        {settings.clocks.map((clock) => (
          <div className="list-button" key={clock.id}>
            <span className="dot" />
            <span>{clock.label}</span>
            <button type="button" className="btn" onClick={() => patch({ clocks: settings.clocks.filter((item) => item.id !== clock.id) })}>Remove</button>
          </div>
        ))}
      </div>
      {remaining.length > 0 && settings.clocks.length < 4 ? (
        <label className="field">
          <span>Add a clock</span>
          <select aria-label="Add a clock" value="" onChange={(event) => {
            const preset = remaining.find((item) => item.timeZone === event.target.value)
            if (!preset) return
            patch({ clocks: [...settings.clocks, { id: createIdentifier(), label: preset.label, timeZone: preset.timeZone }] })
          }}>
            <option value="">Choose a city</option>
            {remaining.map((preset) => <option key={preset.timeZone} value={preset.timeZone}>{preset.label}</option>)}
          </select>
        </label>
      ) : null}
    </div>
  )
}
