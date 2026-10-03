import type { InlineToken } from './markdownTypes.ts'
import { readSafeLink } from './readSafeLink.ts'

const inlinePattern = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*|(?<!\w)_[^_\s][^_]*_(?!\w))/g
const linkPattern = /^\[([^\]]+)\]\(([^)\s]+)\)$/

const readLinkToken = (found: string): InlineToken => {
  const match = linkPattern.exec(found)
  const text = match?.[1] ?? found
  const href = readSafeLink(match?.[2] ?? '')
  if (!href) return { type: 'text', text }
  return { type: 'link', text, href }
}

const readToken = (found: string): InlineToken => {
  if (found.startsWith('`')) return { type: 'code', text: found.slice(1, -1) }
  if (found.startsWith('**')) return { type: 'strong', text: found.slice(2, -2) }
  if (found.startsWith('~~')) return { type: 'strike', text: found.slice(2, -2) }
  if (found.startsWith('[')) return readLinkToken(found)
  return { type: 'em', text: found.slice(1, -1) }
}

export const readInlineTokens = (source: string): InlineToken[] => {
  const tokens: InlineToken[] = []
  let cursor = 0
  for (const match of source.matchAll(inlinePattern)) {
    const index = match.index ?? 0
    if (index > cursor) tokens.push({ type: 'text', text: source.slice(cursor, index) })
    tokens.push(readToken(match[0]))
    cursor = index + match[0].length
  }
  if (cursor < source.length) tokens.push({ type: 'text', text: source.slice(cursor) })
  return tokens
}
