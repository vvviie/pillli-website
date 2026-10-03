import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

type SecretInputProps = {
  label: string
  value: string
  autoComplete: string
  onChange: (value: string) => void
}

export const SecretInput = ({ label, value, autoComplete, onChange }: SecretInputProps) => {
  const [visible, setVisible] = useState(false)
  const fieldId = useId()
  const toggleLabel = visible ? 'Hide password' : 'Show password'
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <div className="secret">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="icon-btn" aria-label={toggleLabel} onClick={() => setVisible((current) => !current)}>
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  )
}
