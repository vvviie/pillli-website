export const readNoteSnippet = (body: string) => body
  .replace(/```[\s\S]*?(```|$)/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/^ {0,3}([-*_])(\s*\1){2,}\s*$/gm, ' ')
  .replace(/^\s*(#{1,6}|>|[-*+](\s+\[[ xX]\])?|\d{1,9}[.)])\s+/gm, '')
  .replace(/[*_~`]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 120)
