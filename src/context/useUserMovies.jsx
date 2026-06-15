import { useContext } from 'react'
import { UserMoviesContext } from './UserMoviesContext'

// Consumer hook for the favorites / watch-later store.
export const useUserMovies = () => {
  const ctx = useContext(UserMoviesContext)
  if (!ctx) {
    throw new Error('useUserMovies must be used within a UserMoviesProvider')
  }
  return ctx
}
