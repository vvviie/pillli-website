const pad = (value: number) => String(value).padStart(2, '0')

export const vaultDates = {
  toKey(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  },
  todayKey() {
    return this.toKey(new Date())
  },
  monthKey(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
  },
  parseKey(key: string) {
    const [year, month, day] = key.split('-').map(Number)
    return new Date(year || 1970, (month || 1) - 1, day || 1)
  },
  addMonths(date: Date, count: number) {
    return new Date(date.getFullYear(), date.getMonth() + count, 1)
  },
  addDays(date: Date, count: number) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    next.setDate(next.getDate() + count)
    return next
  },
  startOfWeek(date: Date) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const mondayOffset = (next.getDay() + 6) % 7
    next.setDate(next.getDate() - mondayOffset)
    return next
  },
  long(date: Date) {
    return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
  },
  medium(key: string) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(this.parseKey(key))
  },
  shortMonth(monthKey: string) {
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(this.parseKey(`${monthKey}-01`))
  },
  monthTitle(date: Date) {
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date)
  },
  timeInZone(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone }).format(date)
  },
  noteStamp(iso: string) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso))
  },
  activityTime(iso: string) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
  },
}
