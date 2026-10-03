import type { TextSelection } from './markdownTypes.ts'
import { readTextChange } from './readTextChange.ts'

export const replaceTextareaValue = (textarea: HTMLTextAreaElement, next: TextSelection, fallback: (value: string) => void) => {
  const change = readTextChange(textarea.value, next.value)
  const hasChange = change.start !== change.end || change.text.length > 0
  textarea.focus()
  if (hasChange) {
    textarea.setSelectionRange(change.start, change.end)
    const command = change.text ? 'insertText' : 'delete'
    const applied = document.execCommand(command, false, change.text)
    if (!applied) {
      fallback(next.value)
      requestAnimationFrame(() => textarea.setSelectionRange(next.start, next.end))
      return
    }
  }
  textarea.setSelectionRange(next.start, next.end)
}
