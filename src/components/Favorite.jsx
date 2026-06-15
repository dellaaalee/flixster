import PropTypes from 'prop-types'
import { useUserMovies } from '../context/useUserMovies'
import './Favorite.css'

const Favorite = ({ movie, onToggle }) => {
  const { isFavorite, toggleFavorite } = useUserMovies()
  const active = movie ? isFavorite(movie.id) : false

  const handleClick = (e) => {
    e.stopPropagation()
    if (!movie) return
    toggleFavorite(movie)
    onToggle?.(!active)
  }

  return (
    <button
      type="button"
      className={`card-action card-action-favorite${active ? ' is-active' : ''}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  )
}

Favorite.propTypes = {
  movie: PropTypes.shape({ id: PropTypes.number }),
  onToggle: PropTypes.func,
}

export default Favorite
