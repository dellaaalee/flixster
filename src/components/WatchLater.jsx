import PropTypes from 'prop-types'
import { useUserMovies } from '../context/UserMoviesContext'
import './WatchLater.css'

const WatchLater = ({ movie, onToggle }) => {
  const { isWatchLater, toggleWatchLater } = useUserMovies()
  const active = movie ? isWatchLater(movie.id) : false

  const handleClick = (e) => {
    e.stopPropagation()
    if (!movie) return
    toggleWatchLater(movie)
    onToggle?.(!active)
  }

  return (
    <button
      type="button"
      className={`card-action card-action-watchlater${active ? ' is-active' : ''}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from watch later' : 'Save to watch later'}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 16 14" />
      </svg>
    </button>
  )
}

WatchLater.propTypes = {
  movie: PropTypes.shape({ id: PropTypes.number }),
  onToggle: PropTypes.func,
}

export default WatchLater
