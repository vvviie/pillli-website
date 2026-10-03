import type { MarkdownBlock } from '../lib/markdownTypes.ts'
import { MarkdownInline } from './MarkdownInline.tsx'
import { MarkdownList } from './MarkdownList.tsx'

type MarkdownBlockViewProps = { block: MarkdownBlock; onToggleTask?: (line: number) => void }

export const MarkdownBlockView = ({ block, onToggleTask }: MarkdownBlockViewProps) => {
  if (block.type === 'heading' && block.level === 1) return <h2><MarkdownInline tokens={block.tokens} /></h2>
  if (block.type === 'heading' && block.level === 2) return <h3><MarkdownInline tokens={block.tokens} /></h3>
  if (block.type === 'heading') return <h4><MarkdownInline tokens={block.tokens} /></h4>
  if (block.type === 'quote') return <blockquote><MarkdownInline tokens={block.tokens} /></blockquote>
  if (block.type === 'code') return <pre data-language={block.language || undefined}><code>{block.text}</code></pre>
  if (block.type === 'rule') return <hr />
  if (block.type === 'list') return <MarkdownList block={block} onToggleTask={onToggleTask} />
  return <p><MarkdownInline tokens={block.tokens} /></p>
}
