import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export const Modal = ({ title, onClose, children, wide = false }: ModalProps) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const dialogClass = wide ? 'modal modal-wide' : 'modal'
  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div
        className={dialogClass}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="stack" style={{ marginTop: '0.9rem' }}>{children}</div>
      </div>
    </div>
  )
}
