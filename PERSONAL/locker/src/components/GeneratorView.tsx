import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { generatePassword, type PasswordRecipe } from '../lib/generatePassword.ts'
import { useVault } from '../state/useVault.ts'
import { PageHeader } from './PageHeader.tsx'
import { StrengthMeter } from './StrengthMeter.tsx'

const initialRecipe: PasswordRecipe = { length: 20, lowercase: true, uppercase: true, numbers: true, symbols: true }

export const GeneratorView = ({ onUse }: { onUse: (password: string) => void }) => {
  const { copyText } = useVault()
  const [recipe, setRecipe] = useState<PasswordRecipe>(initialRecipe)
  const [password, setPassword] = useState(() => generatePassword(initialRecipe))
  const toggle = (key: keyof Omit<PasswordRecipe, 'length'>) => {
    const next = { ...recipe, [key]: !recipe[key] }
    if (!next.lowercase && !next.uppercase && !next.numbers && !next.symbols) return
    setRecipe(next)
    setPassword(generatePassword(next))
  }
  const options = [
    ['lowercase', 'Lowercase'],
    ['uppercase', 'Uppercase'],
    ['numbers', 'Numbers'],
    ['symbols', 'Symbols'],
  ] as const

  return (
    <section className="stack">
      <PageHeader title="Generator" text="Build a password here, then save it into a new credential. Ambiguous characters are left out." />
      <article className="panel stack">
        <p className="recovery-code">{password}</p>
        <StrengthMeter password={password} />
        <label className="field">
          <span>Length {recipe.length}</span>
          <input
            type="range"
            min={8}
            max={64}
            value={recipe.length}
            aria-label="Password length"
            onChange={(event) => {
              const next = { ...recipe, length: Number(event.target.value) }
              setRecipe(next)
              setPassword(generatePassword(next))
            }}
          />
        </label>
        <div className="choices">
          {options.map(([key, label]) => (
            <button type="button" key={key} className={recipe[key] ? 'btn choice-on' : 'btn'} aria-pressed={recipe[key]} onClick={() => toggle(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="row-actions">
          <button type="button" className="btn" onClick={() => setPassword(generatePassword(recipe))}><RefreshCw /> Regenerate</button>
          <button type="button" className="btn" onClick={() => void copyText(password)}><Copy /> Copy</button>
          <button type="button" className="btn btn-primary" onClick={() => onUse(password)}>Use in new credential</button>
        </div>
      </article>
    </section>
  )
}
