(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('locker-appearance') || '{}')
    const theme = saved.theme || 'dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = theme === 'dark' || (theme !== 'light' && prefersDark)
    const root = document.documentElement
    root.dataset.theme = dark ? 'dark' : 'light'
    root.dataset.accent = saved.accent || 'brass'
    root.dataset.font = saved.fontSize || 'medium'
    root.style.colorScheme = dark ? 'dark' : 'light'
  } catch (error) {
    console.error('Could not apply saved appearance', error)
  }
})()
