export const parseTags = (value: string) =>
  [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 12)
