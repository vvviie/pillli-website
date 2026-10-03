import type { IncomeEntry } from '../types.ts'
import { vaultDates } from './vaultDates.ts'

export type IncomeSummary = {
  currency: string
  months: { key: string; label: string; total: number }[]
  totalsByCurrency: { currency: string; thisMonth: number; allTime: number }[]
}

const sumAmounts = (entries: IncomeEntry[]) => entries.reduce((sum, entry) => sum + entry.amount, 0)

export const summarizeIncome = (entries: IncomeEntry[], now = new Date()): IncomeSummary => {
  const monthKeys = Array.from({ length: 6 }, (_, index) => vaultDates.monthKey(vaultDates.addMonths(now, index - 5)))
  const currencies = [...new Set(entries.map((entry) => entry.currency))]
  const currentKey = vaultDates.monthKey(now)
  const totalsByCurrency = (currencies.length > 0 ? currencies : ['PHP']).map((currency) => {
    const matching = entries.filter((entry) => entry.currency === currency)
    return {
      currency,
      thisMonth: sumAmounts(matching.filter((entry) => entry.date.startsWith(currentKey))),
      allTime: sumAmounts(matching),
    }
  })
  const ranked = [...totalsByCurrency].sort((left, right) => right.thisMonth - left.thisMonth || right.allTime - left.allTime)
  const currency = ranked[0]?.currency ?? 'PHP'
  const months = monthKeys.map((key) => ({
    key,
    label: vaultDates.shortMonth(key),
    total: sumAmounts(entries.filter((entry) => entry.currency === currency && entry.date.startsWith(key))),
  }))
  return { currency, months, totalsByCurrency }
}
