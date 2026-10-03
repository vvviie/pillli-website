import { describe, expect, it } from 'vitest'
import { applyMarkdownFormat } from './applyMarkdownFormat.ts'
import { continueMarkdownList } from './continueMarkdownList.ts'
import { parseMarkdown } from './parseMarkdown.ts'
import { readNoteSnippet } from './readNoteSnippet.ts'
import { readNoteStats } from './readNoteStats.ts'
import { toggleMarkdownTask } from './toggleMarkdownTask.ts'

describe('parseMarkdown', () => {
  it('reads headings, tasks, ordered lists, rules, and fenced code', () => {
    const blocks = parseMarkdown('# Title\n- [ ] buy milk\n- [x] pay rent\n\n1. one\n2. two\n\n---\n```js\nconst a = 1\n```')
    expect(blocks.map((block) => block.type)).toEqual(['heading', 'list', 'list', 'rule', 'code'])
    expect(blocks[1]).toMatchObject({ ordered: false, items: [{ checked: false, line: 1 }, { checked: true, line: 2 }] })
    expect(blocks[2]).toMatchObject({ ordered: true, start: 1 })
    expect(blocks[4]).toMatchObject({ language: 'js', text: 'const a = 1' })
  })

  it('keeps unsafe links as plain text', () => {
    const [safe] = parseMarkdown('[site](https://example.com)')
    const [unsafe] = parseMarkdown('[bad](javascript:alert(1))')
    expect(safe).toMatchObject({ tokens: [{ type: 'link', href: 'https://example.com' }] })
    expect(unsafe).toMatchObject({ type: 'paragraph' })
    expect(JSON.stringify(unsafe)).not.toContain('"type":"link"')
  })

  it('does not italicize snake_case words', () => {
    const [block] = parseMarkdown('my_var_name and _real_')
    expect(block).toMatchObject({ tokens: [{ type: 'text', text: 'my_var_name and ' }, { type: 'em', text: 'real' }] })
  })
})

describe('applyMarkdownFormat', () => {
  it('wraps and unwraps bold', () => {
    const wrapped = applyMarkdownFormat({ value: 'hello world', start: 6, end: 11 }, 'bold')
    expect(wrapped).toEqual({ value: 'hello **world**', start: 8, end: 13 })
    expect(applyMarkdownFormat(wrapped, 'bold')).toEqual({ value: 'hello world', start: 6, end: 11 })
  })

  it('numbers selected lines and toggles them back', () => {
    const numbered = applyMarkdownFormat({ value: 'a\nb', start: 0, end: 3 }, 'numbered')
    expect(numbered.value).toBe('1. a\n2. b')
    expect(applyMarkdownFormat(numbered, 'numbered').value).toBe('a\nb')
  })

  it('switches a bullet to a checklist item', () => {
    expect(applyMarkdownFormat({ value: '- milk', start: 2, end: 2 }, 'task').value).toBe('- [ ] milk')
  })

  it('inserts a link with the url selected', () => {
    expect(applyMarkdownFormat({ value: 'docs', start: 0, end: 4 }, 'link')).toEqual({ value: '[docs](https://)', start: 7, end: 15 })
  })
})

describe('continueMarkdownList', () => {
  it('continues ordered and task lists', () => {
    expect(continueMarkdownList({ value: '1. one', start: 6, end: 6 })?.value).toBe('1. one\n2. ')
    expect(continueMarkdownList({ value: '- [x] done', start: 10, end: 10 })?.value).toBe('- [x] done\n- [ ] ')
  })

  it('ends the list on an empty item', () => {
    expect(continueMarkdownList({ value: 'a\n- ', start: 4, end: 4 })).toEqual({ value: 'a\n', start: 2, end: 2 })
  })

  it('ignores plain lines', () => {
    expect(continueMarkdownList({ value: 'plain', start: 5, end: 5 })).toBeNull()
  })
})

describe('note helpers', () => {
  it('toggles a checklist line', () => {
    expect(toggleMarkdownTask('x\n- [ ] task', 1)).toBe('x\n- [x] task')
    expect(toggleMarkdownTask('x\n- [x] task', 1)).toBe('x\n- [ ] task')
  })

  it('counts words and tasks', () => {
    expect(readNoteStats('Hello there\n- [x] one\n- [ ] two')).toMatchObject({ words: 4, tasksDone: 1, tasksTotal: 2 })
  })

  it('builds a plain snippet', () => {
    expect(readNoteSnippet('# Plan\n- [ ] **ship** [docs](https://x.io)')).toBe('Plan ship docs')
  })
})
