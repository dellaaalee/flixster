import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { imageUrl, searchMovies } from '../api/tmdb'
import { FALLBACK_POSTER, handlePosterError } from '../utils/posterFallback'
import './SearchBar.css'

const MAX_SUGGESTIONS = 6

const SearchBar = ({
  value,
  onChange,
  onSearch,
  onSelectMovie,
  placeholder = 'search for movie',
}) => {
  const [internalQuery, setInternalQuery] = useState('')

  // Support both controlled (value/onChange) and uncontrolled usage.
  const isControlled = value !== undefined
  const query = isControlled ? value : internalQuery

  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestError, setSuggestError] = useState(false)
  const containerRef = useRef(null)

  // Live search: debounce the query and fetch matching movies as the user types.
  useEffect(() => {
    const trimmed = query.trim()
    setSuggestError(false)
    if (trimmed.length === 0) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const { movies } = await searchMovies(trimmed, 1)
        if (!cancelled) {
          setSuggestions(movies.slice(0, MAX_SUGGESTIONS))
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Search suggestions failed:', err)
        if (!cancelled) {
          setSuggestions([])
          setSuggestError(true)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  // Close the dropdown when clicking outside the search area.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const next = e.target.value
    if (!isControlled) setInternalQuery(next)
    onChange?.(next)
    setIsOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsOpen(false)
    onSearch?.(query.trim())
  }

  const handleSelect = (movie) => {
    setIsOpen(false)
    onSelectMovie?.(movie)
  }

  const showDropdown = isOpen && query.trim().length > 0

  return (
    <div className="searchbar-wrap" ref={containerRef}>
      <form className="searchbar" onSubmit={handleSubmit} role="search">
        <button type="submit" className="searchbar-icon" aria-label="Search">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </button>
        <input
          type="text"
          className="searchbar-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          aria-label={placeholder}
          autoComplete="off"
        />
      </form>

      {showDropdown && (
        <ul className="searchbar-dropdown" role="listbox">
          {suggestions.map((movie) => (
            <li key={movie.id} role="option" aria-selected="false">
              <button
                type="button"
                className="searchbar-suggestion"
                onClick={() => handleSelect(movie)}
              >
                <img
                  className="searchbar-suggestion-poster"
                  src={imageUrl(movie.poster_path, 'w92') ?? FALLBACK_POSTER}
                  alt=""
                  loading="lazy"
                  onError={handlePosterError}
                />
                <span className="searchbar-suggestion-title">
                  {movie.title}
                  {movie.release_date && (
                    <span className="searchbar-suggestion-year">
                      {movie.release_date.slice(0, 4)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}

          {suggestions.length === 0 && (
            <li
              className={`searchbar-empty${
                suggestError ? ' searchbar-empty-error' : ''
              }`}
            >
              {isLoading
                ? 'Searching…'
                : suggestError
                  ? 'Couldn’t load suggestions'
                  : 'No matches'}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onSelectMovie: PropTypes.func,
  placeholder: PropTypes.string,
}

export default SearchBar
