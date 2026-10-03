const pools = {
  lowercase: 'abcdefghijkmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  numbers: '23456789',
  symbols: '!@#$%^&*-_=+?',
}

export type PasswordRecipe = {
  length: number
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
}

const randomIndex = (size: number) => {
  const limit = Math.floor(256 / size) * size
  let sample = 256
  while (sample >= limit) {
    sample = crypto.getRandomValues(new Uint8Array(1))[0] ?? 0
  }
  return sample % size
}

const shuffle = (characters: string[]) => {
  const next = [...characters]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1)
    const current = next[index] ?? ''
    next[index] = next[swapIndex] ?? ''
    next[swapIndex] = current
  }
  return next
}

export const generatePassword = (recipe: PasswordRecipe) => {
  const selected = [
    recipe.lowercase ? pools.lowercase : '',
    recipe.uppercase ? pools.uppercase : '',
    recipe.numbers ? pools.numbers : '',
    recipe.symbols ? pools.symbols : '',
  ].filter(Boolean)
  if (selected.length === 0) return ''
  const length = Math.min(64, Math.max(selected.length, recipe.length))
  const alphabet = selected.join('')
  const characters = selected.map((pool) => pool[randomIndex(pool.length)] ?? '')
  while (characters.length < length) characters.push(alphabet[randomIndex(alphabet.length)] ?? '')
  return shuffle(characters).join('')
}
