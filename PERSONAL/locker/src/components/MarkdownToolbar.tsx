import type { LucideIcon } from 'lucide-react'
import { Bold, Code, Heading2, Italic, Link, List, ListOrdered, Minus, Quote, SquareCode, Strikethrough } from 'lucide-react'
import type { MarkdownFormat } from '../lib/markdownTypes.ts'

type Tool = { format: MarkdownFormat; label: string; shortcut?: string; Icon: LucideIcon }

const toolGroups: Tool[][] = [
  [
    { format: 'heading', label: 'Heading', Icon: Heading2 },
    { format: 'bold', label: 'Bold', shortcut: '⌘/Ctrl+B', Icon: Bold },
    { format: 'italic', label: 'Italic', shortcut: '⌘/Ctrl+I', Icon: Italic },
    { format: 'strike', label: 'Strikethrough', shortcut: '⌘/Ctrl+Shift+X', Icon: Strikethrough },
  ],
  [
    { format: 'bullet', label: 'Bulleted list', Icon: List },
    { format: 'numbered', label: 'Numbered list', Icon: ListOrdered },
    { format: 'quote', label: 'Quote', Icon: Quote },
  ],
  [
    { format: 'code', label: 'Inline code', shortcut: '⌘/Ctrl+E', Icon: Code },
    { format: 'codeBlock', label: 'Code block', Icon: SquareCode },
    { format: 'link', label: 'Link', Icon: Link },
    { format: 'rule', label: 'Divider', Icon: Minus },
  ],
]

export const MarkdownToolbar = ({ onFormat }: { onFormat: (format: MarkdownFormat) => void }) => (
  <div className="md-toolbar" role="toolbar" aria-label="Formatting">
    {toolGroups.map((group, groupIndex) => (
      <div className="md-group" key={groupIndex}>
        {group.map(({ format, label, shortcut, Icon }) => (
          <button
            key={format}
            type="button"
            className="icon-btn"
            aria-label={label}
            title={shortcut ? `${label} (${shortcut})` : label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onFormat(format)}
          >
            <Icon />
          </button>
        ))}
      </div>
    ))}
  </div>
)
