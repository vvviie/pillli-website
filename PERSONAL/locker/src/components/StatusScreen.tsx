import { GateLayout } from './GateLayout.tsx'

export const StatusScreen = ({ title, text }: { title: string; text: string }) => (
  <GateLayout>
    <p className="eyebrow">Locker</p>
    <h2>{title}</h2>
    <p className="muted">{text}</p>
  </GateLayout>
)
