import { createContext } from 'react'

// The context object only. Provider lives in UserMoviesProvider.jsx and the
// consumer hook in useUserMovies.jsx — kept separate so each file exports a
// single kind of thing (satisfies react-refresh / fast-refresh).
export const UserMoviesContext = createContext(null)
