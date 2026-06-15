import PropTypes from 'prop-types'
import { imageUrl } from '../api/tmdb'
import { FALLBACK_POSTER, handlePosterError } from '../utils/posterFallback'
import Favorite from './Favorite'
import WatchLater from './WatchLater'
import './MovieCard.css'

const MovieCard = ({ movie, onClick }) => {
  const { title, poster_path, vote_average } = movie

  const posterSrc = imageUrl(poster_path) ?? FALLBACK_POSTER
  const rating = typeof vote_average === 'number' ? vote_average.toFixed(1) : '—'

  const handleSelect = () => onClick?.(movie)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  return (
    <div
      className="movie-card"
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={title}
    >
      <div className="movie-card-poster">
        <img
          src={posterSrc}
          alt={title}
          loading="lazy"
          onError={handlePosterError}
        />
        <div className="movie-card-actions">
          <Favorite movie={movie} />
          <WatchLater movie={movie} />
        </div>
        <span className="movie-card-rating">
          <span className="movie-card-star" aria-hidden="true">★</span>
          {rating}
        </span>
      </div>
      <h3 className="movie-card-title">{title}</h3>
    </div>
  )
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    poster_path: PropTypes.string,
    vote_average: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
}

export default MovieCard
