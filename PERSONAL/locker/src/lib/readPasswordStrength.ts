const labels = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent']

export const readPasswordStrength = (password: string) => {
  if (password.length < 8) return { score: 0, label: labels[0] }
  let score = 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  const varieties = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length
  if (varieties >= 3) score += 1
  const capped = Math.min(score, 4)
  return { score: capped, label: labels[capped] ?? 'Weak' }
}
