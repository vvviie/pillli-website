import type { LineFormat, MarkdownFormat, TextSelection, WrapFormat } from './markdownTypes.ts'

const wrapFormats: Record<WrapFormat, { marker: string; placeholder: string }> = {
  bold: { marker: '**', placeholder: 'bold text' },
  italic: { marker: '*', placeholder: 'italic text' },
  strike: { marker: '~~', placeholder: 'struck text' },
  code: { marker: '`', placeholder: 'code' },
}

const lineFormats: Record<LineFormat, { pattern: RegExp; prefix: (index: number) => string }> = {
  heading: { pattern: /^#{1,6}\s+/, prefix: () => '## ' },
  bullet: { pattern: /^\s*[-*+]\s+(?!\[[ xX]\])/, prefix: () => '- ' },
  numbered: { pattern: /^\s*\d{1,9}[.)]\s+/, prefix: (index) => `${index + 1}. ` },
  task: { pattern: /^\s*[-*+]\s+\[[ xX]\]\s+/, prefix: () => '- [ ] ' },
  quote: { pattern: /^\s*>\s?/, prefix: () => '> ' },
}

const anyLinePrefix = /^\s*(?:[-*+]\s+\[[ xX]\]\s+|[-*+]\s+|\d{1,9}[.)]\s+|>\s?|#{1,6}\s+)/

const isWrapFormat = (format: MarkdownFormat): format is WrapFormat => format in wrapFormats
const isLineFormat = (format: MarkdownFormat): format is LineFormat => format in lineFormats

const replaceRange = (value: string, start: number, end: number, text: string) => value.slice(0, start) + text + value.slice(end)

const wrapSelection = ({ value, start, end }: TextSelection, format: WrapFormat): TextSelection => {
  const { marker, placeholder } = wrapFormats[format]
  const selected = value.slice(start, end)
  const isWrapped = value.slice(start - marker.length, start) === marker && value.slice(end, end + marker.length) === marker
  if (isWrapped) {
    const unwrapped = replaceRange(value, start - marker.length, end + marker.length, selected)
    return { value: unwrapped, start: start - marker.length, end: end - marker.length }
  }
  const text = selected || placeholder
  const textStart = start + marker.length
  return { value: replaceRange(value, start, end, `${marker}${text}${marker}`), start: textStart, end: textStart + text.length }
}

const prefixLines = ({ value, start, end }: TextSelection, format: LineFormat): TextSelection => {
  const rule = lineFormats[format]
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const nextBreak = value.indexOf('\n', end)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  const lines = value.slice(lineStart, lineEnd).split('\n')
  const allPrefixed = lines.every((line) => rule.pattern.test(line))
  const nextLines = lines.map((line, index) => {
    if (allPrefixed) return line.replace(rule.pattern, '')
    return rule.prefix(index) + line.replace(anyLinePrefix, '')
  })
  const block = nextLines.join('\n')
  const blockEnd = lineStart + block.length
  const selectionStart = start === end ? blockEnd : lineStart
  return { value: replaceRange(value, lineStart, lineEnd, block), start: selectionStart, end: blockEnd }
}

const insertLink = ({ value, start, end }: TextSelection): TextSelection => {
  const selected = value.slice(start, end)
  const selectedIsUrl = /^https?:\/\//i.test(selected)
  const text = selectedIsUrl || !selected ? 'link text' : selected
  const url = selectedIsUrl ? selected : 'https://'
  const inserted = `[${text}](${url})`
  if (selectedIsUrl) return { value: replaceRange(value, start, end, inserted), start: start + 1, end: start + 1 + text.length }
  const urlStart = start + text.length + 3
  return { value: replaceRange(value, start, end, inserted), start: urlStart, end: urlStart + url.length }
}

const readBlockLead = (value: string, start: number) => {
  if (start === 0) return ''
  if (value[start - 1] === '\n') return ''
  return '\n'
}

const insertCodeBlock = ({ value, start, end }: TextSelection): TextSelection => {
  const selected = value.slice(start, end)
  const lead = readBlockLead(value, start)
  const codeStart = start + lead.length + 4
  return { value: replaceRange(value, start, end, `${lead}\`\`\`\n${selected}\n\`\`\`\n`), start: codeStart, end: codeStart + selected.length }
}

const insertRule = ({ value, start, end }: TextSelection): TextSelection => {
  const inserted = `${readBlockLead(value, start)}\n---\n\n`
  const cursor = start + inserted.length
  return { value: replaceRange(value, start, end, inserted), start: cursor, end: cursor }
}

export const applyMarkdownFormat = (selection: TextSelection, format: MarkdownFormat): TextSelection => {
  if (format === 'link') return insertLink(selection)
  if (format === 'codeBlock') return insertCodeBlock(selection)
  if (format === 'rule') return insertRule(selection)
  if (isWrapFormat(format)) return wrapSelection(selection, format)
  if (isLineFormat(format)) return prefixLines(selection, format)
  return selection
}
