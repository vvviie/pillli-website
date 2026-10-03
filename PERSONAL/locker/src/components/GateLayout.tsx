import type { ReactNode } from 'react'
import { LockMark } from './LockMark.tsx'

export const GateLayout = ({ children }: { children: ReactNode }) => (
  <main className="gate">
    <section className="gate-brand">
      <LockMark />
      <p className="eyebrow">Personal security vault</p>
      <h1 className="wordmark">Locker</h1>
      <p className="lede">
        Passwords, notes, tasks, and income stay encrypted on this device. Open Locker once, then keep using it offline.
      </p>
      <ul className="facts">
        <li>Argon2id key derivation and AES-256-GCM encryption</li>
        <li>No account server and no cloud copy</li>
        <li>Auto-lock, recovery code, and encrypted backup</li>
      </ul>
    </section>
    <section className="gate-panel">{children}</section>
  </main>
)
