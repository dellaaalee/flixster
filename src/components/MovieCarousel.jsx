import { useRef } from 'react'
import PropTypes from 'prop-types'
import MovieCard from './MovieCard'
import './MovieCarousel.css'

const MovieCarousel = ({ title, movies, emptyMessage, onSelectMovie }) => {
  const trackRef = useRef(null)

  // Scroll by roughly one viewport of the track.
  const scrollBy = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="carousel">
      <h2 className="carousel-title">{title}</h2>

      {movies.length === 0 ? (
        <p className="carousel-empty">{emptyMessage}</p>
      ) : (
        <div className="carousel-viewport">
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
          >
            ‹
          </button>

          <ul className="carousel-track" ref={trackRef}>
            {movies.map((movie) => (
              <li key={movie.id} className="carousel-item">
                <MovieCard movie={movie} onClick={onSelectMovie} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      )}
    </section>
  )
}

MovieCarousel.propTypes = {
  title: PropTypes.string.isRequired,
  movies: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
  emptyMessage: PropTypes.string,
  onSelectMovie: PropTypes.func,
}

MovieCarousel.defaultProps = {
  movies: [],
  emptyMessage: 'Nothing here yet.',
}

export default MovieCarousel
