import { readPasswordStrength } from '../lib/readPasswordStrength.ts'

export const StrengthMeter = ({ password }: { password: string }) => {
  const strength = readPasswordStrength(password)
  return (
    <div className="strength" aria-live="polite">
      <div className="strength-bar">
        <span style={{ width: `${(strength.score / 4) * 100}%` }} />
      </div>
      <span className="muted">{strength.label}</span>
    </div>
  )
}
