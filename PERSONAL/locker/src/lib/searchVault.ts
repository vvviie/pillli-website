import type { VaultData } from '../types.ts'

const includes = (query: string, values: string[]) => values.join(' ').toLowerCase().includes(query)

export const searchVault = (data: VaultData, rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return { credentials: [], notes: [], tasks: [], income: [] }
  return {
    credentials: data.credentials.filter((item) => includes(query, [item.title, item.username, item.website, item.tags.join(' ')])),
    notes: data.notes.filter((item) => includes(query, [item.title, item.body])),
    tasks: data.tasks.filter((item) => includes(query, [item.title, item.description, item.tags.join(' ')])),
    income: data.income.filter((item) => includes(query, [item.source, item.category, item.notes])),
  }
}
