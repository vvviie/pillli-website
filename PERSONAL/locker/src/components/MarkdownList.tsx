import type { MarkdownBlock } from '../lib/markdownTypes.ts'
import { MarkdownListItemView } from './MarkdownListItemView.tsx'

type MarkdownListProps = {
  block: Extract<MarkdownBlock, { type: 'list' }>
  onToggleTask?: (line: number) => void
}

export const MarkdownList = ({ block, onToggleTask }: MarkdownListProps) => {
  const items = block.items.map((item) => <MarkdownListItemView key={item.line} item={item} onToggleTask={onToggleTask} />)
  if (block.ordered) return <ol start={block.start}>{items}</ol>
  return <ul>{items}</ul>
}
