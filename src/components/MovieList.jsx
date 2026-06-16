import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { fetchNowPlaying, searchMovies } from '../api/tmdb'
import MovieCard from './MovieCard'
import MovieSort from './MovieSort'
import { SORT_OPTIONS } from './SortOptions'
import './MovieList.css'

const MovieList = ({ query = '', onSelectMovie }) => {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // Bump to re-trigger the initial load when the user retries.
  const [reloadKey, setReloadKey] = useState(0)
  // Pagination: which page we're on and how many exist for this query.
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(null)
  const [sortBy, setSortBy] = useState('title')

  const trimmedQuery = query.trim()
  const isSearching = trimmedQuery.length > 0

  // Fetch a single page using the right endpoint for the current mode.
  const fetchPage = (pageNum) =>
    isSearching ? searchMovies(trimmedQuery, pageNum) : fetchNowPlaying(pageNum)

  // Initial load (page 1). Runs on mount, on retry, and whenever the
  // query changes — replacing the list and resetting pagination.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { movies: results, totalPages: total } = await fetchPage(1)
        if (!cancelled) {
          setMovies([...results].sort(SORT_OPTIONS[sortBy].compare))
          setPage(1)
          setTotalPages(total)
        }
      } catch (err) {
        // Keep the technical detail in the console for debugging,
        // but show the user a friendly, actionable message.
        console.error('Failed to load movies:', err)
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, isSearching, trimmedQuery])

  // Load More: fetch the next page and append (don't replace) the results.
  const handleLoadMore = async () => {
    const nextPage = page + 1
    setIsLoadingMore(true)
    setLoadMoreError(null)
    try {
      const { movies: results, totalPages: total } = await fetchPage(nextPage)
      // Guard against duplicate ids TMDb can return across pages.
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id))
        return [...prev, ...results.filter((m) => !seen.has(m.id))]
      })
      setPage(nextPage)
      setTotalPages(total)
    } catch (err) {
      // Leave the already-loaded grid intact; surface an inline retry instead.
      console.error('Failed to load more movies:', err)
      setLoadMoreError('Couldn’t load more movies. Please try again.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const hasMore = page < totalPages

  // Re-sort the already-loaded cards in place when the user picks a new sort.
  // Load More never triggers this, so appending new movies leaves the cards
  // already on screen exactly where they are.
  const handleSortChange = (nextSort) => {
    setSortBy(nextSort)
    setMovies((prev) => [...prev].sort(SORT_OPTIONS[nextSort].compare))
  }

  if (isLoading) {
    return <p className="movie-list-status">Loading movies…</p>
  }

  if (error) {
    return (
      <div className="movie-list-error" role="alert">
        <p className="movie-list-error-title">We couldn’t load movies right now</p>
        <p className="movie-list-error-detail">
          Something went wrong while reaching the movie service. Please check
          your connection and try again.
        </p>
        <button
          type="button"
          className="movie-list-retry"
          onClick={() => setReloadKey((k) => k + 1)}
        >
          Try again
        </button>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <p className="movie-list-status">
        {isSearching
          ? `No movies found for “${trimmedQuery}”.`
          : 'No movies found.'}
      </p>
    )
  }

  return (
    <>
      <MovieSort value={sortBy} onChange={handleSortChange} />

      <div className="movie-grid">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="movie-grid-item"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <MovieCard movie={movie} onClick={onSelectMovie} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="movie-list-more">
          {loadMoreError && (
            <p className="movie-list-more-error">{loadMoreError}</p>
          )}
          <button
            type="button"
            className="movie-list-more-button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore
              ? 'Loading…'
              : loadMoreError
                ? 'Try again'
                : 'Load More'}
          </button>
        </div>
      )}
    </>
  )
}

MovieList.propTypes = {
  query: PropTypes.string,
  onSelectMovie: PropTypes.func,
}

export default MovieList
