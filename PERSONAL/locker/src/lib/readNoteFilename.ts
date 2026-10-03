export const readNoteFilename = (title: string) => {
  const slug = title.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return `${slug || 'note'}.md`
}
