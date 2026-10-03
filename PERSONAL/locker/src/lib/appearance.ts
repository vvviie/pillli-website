import type { Settings, ThemeMode } from '../types.ts'

const storageKey = 'locker-appearance'

export type Appearance = {
  theme: ThemeMode
  accent: Settings['accent']
  fontSize: Settings['fontSize']
}

const fallback: Appearance = { theme: 'dark', accent: 'brass', fontSize: 'medium' }

const isAppearance = (value: unknown): value is Partial<Appearance> => typeof value === 'object' && value !== null

export const appearancePreferences = {
  read(): Appearance {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return fallback
      const parsed: unknown = JSON.parse(raw)
      if (!isAppearance(parsed)) return fallback
      return {
        theme: parsed.theme ?? fallback.theme,
        accent: parsed.accent ?? fallback.accent,
        fontSize: parsed.fontSize ?? fallback.fontSize,
      }
    } catch (error) {
      console.error('Could not read appearance preferences', error)
      return fallback
    }
  },
  apply(appearance: Appearance) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = appearance.theme === 'dark' || (appearance.theme === 'system' && prefersDark)
    const root = document.documentElement
    root.dataset.theme = dark ? 'dark' : 'light'
    root.dataset.accent = appearance.accent
    root.dataset.font = appearance.fontSize
    root.style.colorScheme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#12110f' : '#f3ecdf')
  },
  update(settings: Appearance) {
    const appearance: Appearance = {
      theme: settings.theme,
      accent: settings.accent,
      fontSize: settings.fontSize,
    }
    localStorage.setItem(storageKey, JSON.stringify(appearance))
    this.apply(appearance)
  },
}
