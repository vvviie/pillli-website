import type { MarkdownBlock, MarkdownListItem } from './markdownTypes.ts'
import { readInlineTokens } from './readInlineTokens.ts'

const fencePattern = /^\s*```\s*([\w+-]*)/
const rulePattern = /^ {0,3}([-*_])(\s*\1){2,}\s*$/
const headingPattern = /^(#{1,6})\s+(.*)$/
const quotePattern = /^\s*>\s?(.*)$/
const bulletPattern = /^\s*[-*+]\s+(.*)$/
const orderedPattern = /^\s*(\d{1,9})[.)]\s+(.*)$/
const taskPattern = /^\[( |x|X)\]\s+(.*)$/
const blockPatterns = [fencePattern, rulePattern, headingPattern, quotePattern, bulletPattern, orderedPattern]

const isBlockStart = (line: string) => blockPatterns.some((pattern) => pattern.test(line))

const readListItem = (content: string, line: number): MarkdownListItem => {
  const task = taskPattern.exec(content)
  if (!task) return { tokens: readInlineTokens(content), checked: null, line }
  return { tokens: readInlineTokens(task[2] ?? ''), checked: task[1] !== ' ', line }
}

const readHeadingLevel = (marks: string): 1 | 2 | 3 => {
  if (marks.length === 1) return 1
  if (marks.length === 2) return 2
  return 3
}

export const parseMarkdown = (source: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = []
  const lines = source.replaceAll('\r\n', '\n').split('\n')
  const lineAt = (position: number) => lines[position] ?? ''
  let index = 0
  while (index < lines.length) {
    const line = lineAt(index)
    const fence = fencePattern.exec(line)
    const heading = headingPattern.exec(line)
    const ordered = orderedPattern.exec(line)
    if (!line.trim()) {
      index += 1
      continue
    }
    if (fence) {
      const code: string[] = []
      index += 1
      while (index < lines.length && !fencePattern.test(lineAt(index))) {
        code.push(lineAt(index))
        index += 1
      }
      index += 1
      blocks.push({ type: 'code', text: code.join('\n'), language: fence[1] ?? '' })
      continue
    }
    if (rulePattern.test(line)) {
      blocks.push({ type: 'rule' })
      index += 1
      continue
    }
    if (heading) {
      blocks.push({ type: 'heading', level: readHeadingLevel(heading[1] ?? '#'), tokens: readInlineTokens(heading[2] ?? '') })
      index += 1
      continue
    }
    if (quotePattern.test(line)) {
      const quote: string[] = []
      while (index < lines.length && quotePattern.test(lineAt(index))) {
        quote.push(quotePattern.exec(lineAt(index))?.[1] ?? '')
        index += 1
      }
      blocks.push({ type: 'quote', tokens: readInlineTokens(quote.join('\n')) })
      continue
    }
    if (bulletPattern.test(line)) {
      const items: MarkdownListItem[] = []
      while (index < lines.length && bulletPattern.test(lineAt(index))) {
        items.push(readListItem(bulletPattern.exec(lineAt(index))?.[1] ?? '', index))
        index += 1
      }
      blocks.push({ type: 'list', ordered: false, start: 1, items })
      continue
    }
    if (ordered) {
      const items: MarkdownListItem[] = []
      while (index < lines.length && orderedPattern.test(lineAt(index))) {
        items.push(readListItem(orderedPattern.exec(lineAt(index))?.[2] ?? '', index))
        index += 1
      }
      blocks.push({ type: 'list', ordered: true, start: Number(ordered[1]), items })
      continue
    }
    const paragraph = [line]
    index += 1
    while (index < lines.length && lineAt(index).trim() && !isBlockStart(lineAt(index))) {
      paragraph.push(lineAt(index))
      index += 1
    }
    blocks.push({ type: 'paragraph', tokens: readInlineTokens(paragraph.join('\n')) })
  }
  return blocks
}
