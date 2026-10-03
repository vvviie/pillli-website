export const readWebsiteHost = (website: string) => {
  const trimmed = website.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return new URL(withProtocol).hostname || null
  } catch {
    return null
  }
}
