import type { InlineToken } from '../lib/markdownTypes.ts'

export const MarkdownInline = ({ tokens }: { tokens: InlineToken[] }) => (
  <>
    {tokens.map((token, index) => {
      if (token.type === 'link') return <a key={index} href={token.href} target="_blank" rel="noreferrer noopener">{token.text}</a>
      if (token.type === 'strong') return <strong key={index}>{token.text}</strong>
      if (token.type === 'em') return <em key={index}>{token.text}</em>
      if (token.type === 'code') return <code key={index}>{token.text}</code>
      if (token.type === 'strike') return <del key={index}>{token.text}</del>
      return <span key={index}>{token.text}</span>
    })}
  </>
)
