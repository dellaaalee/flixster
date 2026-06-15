import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { UserMoviesContext } from './UserMoviesContext'

const STORAGE_KEY = 'flixster:user-movies'

// Read the persisted lists once at startup; tolerate missing/corrupt data.
const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { favorites: [], watchLater: [] }
    const parsed = JSON.parse(raw)
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      watchLater: Array.isArray(parsed.watchLater) ? parsed.watchLater : [],
    }
  } catch (err) {
    console.error('Failed to read saved movies:', err)
    return { favorites: [], watchLater: [] }
  }
}

export const UserMoviesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => loadInitial().favorites)
  const [watchLater, setWatchLater] = useState(() => loadInitial().watchLater)

  // Persist both lists whenever either changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ favorites, watchLater }),
      )
    } catch (err) {
      console.error('Failed to save movies:', err)
    }
  }, [favorites, watchLater])

  const value = useMemo(() => {
    // Toggle a movie in a list by id; store the whole movie so the
    // profile carousels can render without re-fetching.
    const toggle = (setList) => (movie) =>
      setList((prev) =>
        prev.some((m) => m.id === movie.id)
          ? prev.filter((m) => m.id !== movie.id)
          : [movie, ...prev],
      )

    return {
      favorites,
      watchLater,
      toggleFavorite: toggle(setFavorites),
      toggleWatchLater: toggle(setWatchLater),
      isFavorite: (id) => favorites.some((m) => m.id === id),
      isWatchLater: (id) => watchLater.some((m) => m.id === id),
    }
  }, [favorites, watchLater])

  return (
    <UserMoviesContext.Provider value={value}>
      {children}
    </UserMoviesContext.Provider>
  )
}

UserMoviesProvider.propTypes = {
  children: PropTypes.node,
}
