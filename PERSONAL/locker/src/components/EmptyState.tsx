import type { ReactNode } from 'react'

export const EmptyState = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <div className="empty">
    <strong>{title}</strong>
    <p className="muted">{text}</p>
    {action}
  </div>
)
