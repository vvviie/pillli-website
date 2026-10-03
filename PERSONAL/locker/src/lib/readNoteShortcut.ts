import type { MarkdownFormat } from './markdownTypes.ts'

type ShortcutEvent = { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }

export const readNoteShortcut = (event: ShortcutEvent): MarkdownFormat | 'save' | null => {
  const hasModifier = (event.metaKey || event.ctrlKey) && !event.altKey
  if (!hasModifier) return null
  const key = event.key.toLowerCase()
  if (key === 's') return 'save'
  if (key === 'b') return 'bold'
  if (key === 'i') return 'italic'
  if (key === 'e') return 'code'
  if (event.shiftKey && key === 'x') return 'strike'
  return null
}
