import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getWatchRecommendation } from '../api/ai'
import './AiRecommendation.css'

// Fetches and displays a short AI "watch recommendation" for a movie.
// Self-contained: owns its loading/error/text state and refetches whenever
// the movie identity changes.
const AiRecommendation = ({ movieId, title, genres, overview, rating }) => {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Wait until we have a title to send as context.
    if (!title) return

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(false)
      try {
        const result = await getWatchRecommendation({
          title,
          genres,
          overview,
          rating,
        })
        if (!cancelled) setText(result)
      } catch (err) {
        console.error('AI recommendation failed:', err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // Refetch when the movie changes; genres/overview are tied to movieId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, title])

  return (
    <section className="ai-rec" aria-live="polite">
      <h3 className="ai-rec-heading">
        <span className="ai-rec-spark" aria-hidden="true">✦</span>
        AI Watch Recommendation
      </h3>

      {isLoading && (
        <p className="ai-rec-text ai-rec-loading">Generating recommendation…</p>
      )}
      {!isLoading && error && (
        <p className="ai-rec-text ai-rec-error">
          Recommendation unavailable — try again in a moment.
        </p>
      )}
      {!isLoading && !error && <p className="ai-rec-text">{text}</p>}
    </section>
  )
}

AiRecommendation.propTypes = {
  movieId: PropTypes.number,
  title: PropTypes.string,
  genres: PropTypes.arrayOf(PropTypes.string),
  overview: PropTypes.string,
  rating: PropTypes.number,
}

export default AiRecommendation
