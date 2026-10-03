import { readWebsiteHost } from './readWebsiteHost.ts'

const readLogoDomain = (website: string) => {
  const host = readWebsiteHost(website)
  if (!host) return null
  return host.replace(/^www\./i, '').toLowerCase()
}

export const readWebsiteLogoSources = (website: string) => {
  const domain = readLogoDomain(website)
  if (!domain) return []
  const encodedDomain = encodeURIComponent(domain)
  return [
    `https://www.google.com/s2/favicons?domain=${encodedDomain}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${encodedDomain}.ico`,
  ]
}
