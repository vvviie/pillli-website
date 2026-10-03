import type { TextSelection } from './markdownTypes.ts'

const listLinePattern = /^(\s*)([-*+]\s+\[[ xX]\]\s+|[-*+]\s+|\d{1,9}[.)]\s+|>\s?)(.*)$/
const orderedMarkerPattern = /^(\d{1,9})([.)])/

const readNextMarker = (marker: string) => {
  const ordered = orderedMarkerPattern.exec(marker)
  if (ordered) return `${Number(ordered[1]) + 1}${ordered[2]} `
  return marker.replace(/\[[xX]\]/, '[ ]')
}

export const continueMarkdownList = ({ value, start, end }: TextSelection): TextSelection | null => {
  if (start !== end) return null
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const nextBreak = value.indexOf('\n', start)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  const match = listLinePattern.exec(value.slice(lineStart, lineEnd))
  if (!match) return null
  const [, indent = '', marker = '', content = ''] = match
  const prefixEnd = lineStart + indent.length + marker.length
  if (start < prefixEnd) return null
  if (!content.trim()) {
    return { value: value.slice(0, lineStart) + value.slice(lineEnd), start: lineStart, end: lineStart }
  }
  const inserted = `\n${indent}${readNextMarker(marker)}`
  const cursor = start + inserted.length
  return { value: value.slice(0, start) + inserted + value.slice(end), start: cursor, end: cursor }
}
