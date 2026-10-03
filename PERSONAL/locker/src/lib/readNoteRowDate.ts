import { readDaysAgo } from './readDaysAgo.ts'

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'long' })
const shortFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' })

export const readNoteRowDate = (iso: string, now = new Date()) => {
  const date = new Date(iso)
  const daysAgo = readDaysAgo(iso, now)
  if (daysAgo <= 0) return timeFormat.format(date)
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 7) return weekdayFormat.format(date)
  return shortFormat.format(date)
}
