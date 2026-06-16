import axios from 'axios'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

const IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Build a TMDb image URL. size defaults to w500 (used for posters).
export const imageUrl = (path, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null

// Pre-configured axios instance: base URL set once, api_key attached to every
// request's query string via the default params.
const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: { api_key: TMDB_API_KEY },
})

// Shared request wrapper: axios rejects on non-2xx and parses JSON for us, so
// we just normalize the body. A non-object payload means an unexpected shape;
// hand back an empty object so callers can normalize without crashing.
const request = async (path, params = {}) => {
  try {
    const { data } = await tmdb.get(path, { params })
    return data && typeof data === 'object' ? data : {}
  } catch (err) {
    const status = err.response?.status
    throw new Error(
      `TMDb request failed${status ? ` (${status})` : ''}: ${err.message}`,
    )
  }
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
// append_to_response=credits,videos also brings back cast + crew and the
// trailer/clip list in one request.
// Response fields used: title, runtime, release_date, genres, overview,
// backdrop_path, credits.cast, credits.crew, videos.results.
export const fetchMovieDetails = (id) =>
  request(`/movie/${id}`, {
    language: 'en-US',
    append_to_response: 'credits,videos',
  })

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
