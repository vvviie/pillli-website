import type { MarkdownListItem } from '../lib/markdownTypes.ts'
import { MarkdownInline } from './MarkdownInline.tsx'

type MarkdownListItemViewProps = { item: MarkdownListItem; onToggleTask?: (line: number) => void }

export const MarkdownListItemView = ({ item, onToggleTask }: MarkdownListItemViewProps) => {
  if (item.checked === null) return <li><MarkdownInline tokens={item.tokens} /></li>
  return (
    <li className="task-item">
      <label className={item.checked ? 'task-label done' : 'task-label'}>
        <input type="checkbox" checked={item.checked} disabled={!onToggleTask} onChange={() => onToggleTask?.(item.line)} />
        <span><MarkdownInline tokens={item.tokens} /></span>
      </label>
    </li>
  )
}
