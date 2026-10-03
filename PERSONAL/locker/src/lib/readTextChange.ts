export const readTextChange = (previous: string, next: string) => {
  const limit = Math.min(previous.length, next.length)
  let prefix = 0
  while (prefix < limit && previous[prefix] === next[prefix]) prefix += 1
  let suffix = 0
  while (suffix < limit - prefix && previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix += 1
  return { start: prefix, end: previous.length - suffix, text: next.slice(prefix, next.length - suffix) }
}
