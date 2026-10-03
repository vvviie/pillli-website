import { Star } from 'lucide-react'

type FavoriteButtonProps = {
  active: boolean
  label: string
  onToggle: () => void
}

export const FavoriteButton = ({ active, label, onToggle }: FavoriteButtonProps) => (
  <button
    type="button"
    className={active ? 'icon-btn star-on' : 'icon-btn'}
    aria-label={active ? `Unfavorite ${label}` : `Favorite ${label}`}
    aria-pressed={active}
    onClick={onToggle}
  >
    <Star fill={active ? 'currentColor' : 'none'} />
  </button>
)
