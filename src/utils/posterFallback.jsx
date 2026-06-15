import noPosterFound from '../assets/img/no_poster_found.png'

// Shared poster fallback: shown when a movie has no poster path, and when a
// poster/backdrop URL is valid but the image itself fails to load.
export const FALLBACK_POSTER = noPosterFound

// <img onError> handler — swap a broken image for the fallback. Clears the
// handler first so a (hypothetical) failure of the fallback can't loop.
export const handlePosterError = (e) => {
  if (e.target.src === FALLBACK_POSTER) return
  e.target.onerror = null
  e.target.src = FALLBACK_POSTER
}
