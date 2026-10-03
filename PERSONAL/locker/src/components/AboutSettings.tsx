import { LOCKER_VERSION } from '../lib/lockerVersion.ts'

export const AboutSettings = () => (
  <div className="stack">
    <h2>About</h2>
    <p>Locker {LOCKER_VERSION} is a local-first personal security vault. The workspace follows the KeepR case study: passwords, notes, tasks, calendar, income, folders, favorites, a password generator, an activity log, and encrypted backup.</p>
    <p className="muted">Keys are derived with Argon2id and records are sealed with AES-256-GCM. After the app has loaded once, a service worker keeps it available offline. Nothing is sent to an account server.</p>
    <p className="muted">Anyone who can open this browser profile can reach the lock screen. The master password and recovery code are what protect the vault.</p>
  </div>
)
