import type { ReactNode } from 'react'

export const PageHeader = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <header className="page-head">
    <div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
    {action}
  </header>
)
