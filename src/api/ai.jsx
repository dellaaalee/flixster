import axios from 'axios'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const AI_MODEL = 'openrouter/free'

// Role + constraints for the model (per planning.md AI Recommendation spec).
const SYSTEM_PROMPT = `You give a short, friendly take on whether a movie is worth someone's evening.

Rules:
- Write only 1-2 short sentences that capture the vibe of the movie and say why or why not it's worth watching.
- Use plain, easy words. Keep it casual and easy to read. No fancy or overly wordy language.
- Do not mention the director, runtime, or other basic facts about the movie.
- Do not use generic marketing language.
- Do not add any heading or label such as "Watch Recommendation". Reply with the sentences only.`

// Ask the AI for a short "is it worth watching?" recommendation, using the
// movie's title, genres, overview, and rating as context. Returns a 1-2
// sentence string, or throws on failure so the caller can show a fallback.
export const getWatchRecommendation = async ({
  title,
  genres = [],
  overview,
  rating,
}) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing VITE_OPENROUTER_API_KEY')
  }

  const genreList = genres.length ? genres.join(', ') : 'unknown'
  const userPrompt = `Title: ${title}
Genres: ${genreList}
Score: ${rating ?? 'unknown'} out of 10
Overview: ${overview || 'No overview available.'}`

  let data
  try {
    const res = await axios.post(
      OPENROUTER_URL,
      {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    data = res.data
  } catch (err) {
    throw new Error(`AI request failed (${err.response?.status ?? 'network'})`)
  }

  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new Error('AI returned an empty response')
  }
  return stripLeadingHeading(text)
}

// Models sometimes ignore the prompt and prefix a heading like
// "**Watch Recommendation**" (optionally bold and/or on its own line).
// Strip a leading "watch recommendation" label so it never reaches the UI.
const stripLeadingHeading = (text) =>
  text
    .replace(/^\s*[*_#>\s]*watch recommendation[*_:#-]*\s*/i, '')
    .trim()
