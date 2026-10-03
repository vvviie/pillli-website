import type { AccentName } from '../types.ts'

export const vaultOptions = {
  folderColors: ['#d4a15a', '#2f9e8a', '#6f93b5', '#c86b73', '#8d78b8', '#4f8f62'],
  currencies: ['PHP', 'USD', 'EUR', 'GBP', 'JPY'],
  incomeCategories: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'],
  accents: [
    { id: 'brass' as AccentName, label: 'Brass' },
    { id: 'teal' as AccentName, label: 'Teal' },
    { id: 'slate' as AccentName, label: 'Slate' },
    { id: 'rose' as AccentName, label: 'Rose' },
  ],
  clockPresets: [
    { label: 'Manila', timeZone: 'Asia/Manila' },
    { label: 'Singapore', timeZone: 'Asia/Singapore' },
    { label: 'Tokyo', timeZone: 'Asia/Tokyo' },
    { label: 'Sydney', timeZone: 'Australia/Sydney' },
    { label: 'London', timeZone: 'Europe/London' },
    { label: 'Paris', timeZone: 'Europe/Paris' },
    { label: 'New York', timeZone: 'America/New_York' },
    { label: 'Los Angeles', timeZone: 'America/Los_Angeles' },
    { label: 'UTC', timeZone: 'UTC' },
  ],
}
