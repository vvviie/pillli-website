import type { CredentialDraft } from '../types.ts'
import { parseTags } from './parseTags.ts'

const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`

const parseCsv = (input: string) => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const text = input.replace(/^\uFEFF/, '')
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? ''
    const next = text[index + 1] ?? ''
    if (inQuotes && char === '"' && next === '"') {
      cell += '"'
      index += 1
      continue
    }
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && char === ',') {
      row.push(cell)
      cell = ''
      continue
    }
    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim().length > 0)) rows.push(row)
      row = []
      cell = ''
      continue
    }
    cell += char
  }
  row.push(cell)
  if (row.some((value) => value.trim().length > 0)) rows.push(row)
  return rows
}

const headers = ['title', 'username', 'password', 'website', 'notes', 'tags']

export const credentialsCsv = {
  template() {
    return `${headers.join(',')}\nExample,ada@example.com,change-me,example.com,Personal login,work;email\n`
  },
  stringify(rows: CredentialDraft[]) {
    const body = rows.map((row) =>
      [row.title, row.username, row.password, row.website, row.notes, row.tags.join(';')].map(escapeCell).join(','),
    )
    return `${headers.join(',')}\n${body.join('\n')}\n`
  },
  parse(input: string): CredentialDraft[] {
    const rows = parseCsv(input)
    const header = rows[0]?.map((cell) => cell.trim().toLowerCase()) ?? []
    const titleIndex = header.indexOf('title')
    if (titleIndex < 0) throw new Error('That CSV needs a title column.')
    const column = (name: string) => header.indexOf(name)
    return rows.slice(1).flatMap((row) => {
      const title = (row[titleIndex] ?? '').trim()
      if (!title) return []
      const tags = (row[column('tags')] ?? '').split(';').join(',')
      return [{
        title,
        username: row[column('username')] ?? '',
        password: row[column('password')] ?? '',
        website: row[column('website')] ?? '',
        notes: row[column('notes')] ?? '',
        tags: parseTags(tags),
        folderId: null,
      }]
    })
  },
}
