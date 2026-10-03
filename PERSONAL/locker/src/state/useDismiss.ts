import type { RefObject } from 'react'
import { useEffect } from 'react'

export const useDismiss = (ref: RefObject<HTMLElement | null>, active: boolean, onDismiss: () => void) => {
  useEffect(() => {
    if (!active) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target
      if (ref.current && target instanceof Node && !ref.current.contains(target)) onDismiss()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [active, onDismiss, ref])
}
