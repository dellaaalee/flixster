import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { fetchMovieDetails, imageUrl } from '../api/tmdb'
import { FALLBACK_POSTER, handlePosterError } from '../utils/posterFallback'
import AiRecommendation from './AiRecommendation'
import './MovieModal.css'

const MovieModal = ({ movie, onClose }) => {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch full details (runtime, genres, overview) when a movie opens.
  useEffect(() => {
    if (!movie) return

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchMovieDetails(movie.id)
        if (!cancelled) setDetails(data)
      } catch (err) {
        console.error('Failed to load movie details:', err)
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [movie])

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (!movie) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
    }
  }, [movie, onClose])

  if (!movie) return null

  // Prefer fresh detail fields, fall back to the card's data while loading.
  const title = details?.title ?? movie.title
  const backdrop = imageUrl(details?.backdrop_path, 'w780')
  const poster =
    imageUrl(details?.poster_path ?? movie.poster_path) ?? FALLBACK_POSTER
  const releaseDate = details?.release_date ?? movie.release_date
  // Format the full release date (e.g. "June 12, 2026"); fall back to the
  // raw string if it can't be parsed.
  const formattedDate = releaseDate
    ? new Date(`${releaseDate}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null
  const rating =
    typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : null
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : null
  const genres = details?.genres?.map((g) => g.name) ?? []

  return (
    <div
      className="movie-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="movie-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div
          className="movie-modal-hero"
          style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
        >
          <div className="movie-modal-hero-fade" />
        </div>

        <div className="movie-modal-body">
          <div className="movie-modal-header">
            <img
              className="movie-modal-poster"
              src={poster}
              alt={title}
              onError={handlePosterError}
            />

            <div className="movie-modal-info">
              <h2 className="movie-modal-title">{title}</h2>

              <div className="movie-modal-meta">
                {formattedDate && <span>{formattedDate}</span>}
                {runtime && <span>{runtime}</span>}
                {rating && (
                  <span className="movie-modal-rating">
                    <span aria-hidden="true">★</span> {rating}
                  </span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="movie-modal-genres">
                  {genres.map((g) => (
                    <span key={g} className="movie-modal-genre">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full-width content below the poster/title/genre row. */}
          <div className="movie-modal-content">
            {isLoading && (
              <p className="movie-modal-status">Loading details…</p>
            )}
            {error && (
              <p className="movie-modal-status movie-modal-status-error">
                Couldn’t load full details, but here’s what we have.
              </p>
            )}
            {details?.overview && (
              <p className="movie-modal-overview">{details.overview}</p>
            )}

            {/* AI insight: render once details load so genres/overview exist. */}
            {!isLoading && details && (
              <AiRecommendation
                movieId={movie.id}
                title={title}
                genres={genres}
                overview={details.overview}
                rating={details.vote_average ?? movie.vote_average}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

MovieModal.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
  }),
  onClose: PropTypes.func,
}

export default MovieModal
