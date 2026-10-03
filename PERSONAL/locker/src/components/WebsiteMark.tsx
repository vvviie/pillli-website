import { useEffect, useState } from 'react'
import { readWebsiteLogoSources } from '../lib/readWebsiteLogoSources.ts'
import { useVault } from '../state/useVault.ts'

export const WebsiteMark = ({ website, title }: { website: string; title: string }) => {
  const { data } = useVault()
  const sources = readWebsiteLogoSources(website)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    setSourceIndex(0)
  }, [website])
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  const initial = title.trim().slice(0, 1).toUpperCase() || '?'
  const source = sources[sourceIndex]
  const showIcon = Boolean(source && online && data?.settings.showWebsiteIcons)
  if (!showIcon || !source) return <span className="mark">{initial}</span>
  return (
    <img
      className="site-logo"
      alt=""
      src={source}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  )
}
