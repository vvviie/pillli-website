export type InlineToken =
  | { type: 'text' | 'strong' | 'em' | 'code' | 'strike'; text: string }
  | { type: 'link'; text: string; href: string }

export type MarkdownListItem = { tokens: InlineToken[]; checked: boolean | null; line: number }

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; tokens: InlineToken[] }
  | { type: 'paragraph'; tokens: InlineToken[] }
  | { type: 'list'; ordered: boolean; start: number; items: MarkdownListItem[] }
  | { type: 'quote'; tokens: InlineToken[] }
  | { type: 'code'; text: string; language: string }
  | { type: 'rule' }

export type WrapFormat = 'bold' | 'italic' | 'strike' | 'code'
export type LineFormat = 'heading' | 'bullet' | 'numbered' | 'task' | 'quote'
export type MarkdownFormat = WrapFormat | LineFormat | 'link' | 'codeBlock' | 'rule'

export type TextSelection = { value: string; start: number; end: number }
