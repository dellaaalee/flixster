const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Build a TMDb image URL. size defaults to w500 (used for posters).
export const imageUrl = (path, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null

// Shared fetch wrapper: injects the api_key, parses JSON, throws on failure.
const request = async (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`TMDb request failed (${res.status}): ${res.statusText}`)
  }

  const data = await res.json()
  // A 200 with a non-object body means the response shape is unexpected;
  // hand back an empty object so callers can normalize without crashing.
  return data && typeof data === 'object' ? data : {}
}

// Now Playing — returns 20 movies per page.
// Response fields used per movie: id, title, poster_path, vote_average, release_date.
export const fetchNowPlaying = async (page = 1) => {
  const data = await request('/movie/now_playing', { language: 'en-US', page })
  return {
    movies: Array.isArray(data.results) ? data.results : [],
    page: data.page ?? 1,
    totalPages: data.total_pages ?? 1,
  }
}

// Movie Details — the modal needs runtime and genres, which Now Playing omits.
// Response fields used: title, runtime, release_date, genres, overview, backdrop_path.
export const fetchMovieDetails = (id) =>
  request(`/movie/${id}`, { language: 'en-US' })

// Search — title query, returns the same movie shape as Now Playing.
export const searchMovies = async (query, page = 1) => {
  const data = await request('/search/movie', {
    language: 'en-US',
    query,
    page,
    include_adult: false,
  })
  return {
    movies: Array.isArray(data.results) ? data.results : [],
    page: data.page ?? 1,
    totalPages: data.total_pages ?? 1,
  }
}
