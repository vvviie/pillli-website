const taskLinePattern = /^(\s*(?:[-*+]|\d{1,9}[.)])\s+\[)( |x|X)(\])/

export const toggleMarkdownTask = (source: string, line: number) => {
  const lines = source.split('\n')
  const current = lines[line]
  if (current === undefined) return source
  lines[line] = current.replace(taskLinePattern, (_match, prefix: string, mark: string, close: string) => {
    const nextMark = mark === ' ' ? 'x' : ' '
    return `${prefix}${nextMark}${close}`
  })
  return lines.join('\n')
}
