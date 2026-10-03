import { parseMarkdown } from '../lib/parseMarkdown.ts'
import { MarkdownBlockView } from './MarkdownBlockView.tsx'

type MarkdownPreviewProps = { source: string; onToggleTask?: (line: number) => void }

export const MarkdownPreview = ({ source, onToggleTask }: MarkdownPreviewProps) => {
  const blocks = parseMarkdown(source)
  if (blocks.length === 0) return <p className="muted">Nothing to preview yet. Start writing on the left.</p>
  return (
    <div className="markdown">
      {blocks.map((block, index) => <MarkdownBlockView key={index} block={block} onToggleTask={onToggleTask} />)}
    </div>
  )
}
