# Planning

> **Status: as-built reference.** This document reflects the architecture
> currently implemented in the project, not just the original plan.

## Component Architecture

The app uses **React Router** with a shared layout route. `App` provides global
context and routing; `Layout` renders the persistent shell (header/footer/modal)
once; pages render only their own content through an `<Outlet>`.

### Hierarchy

```
App  (src/App.jsx)
└── UserMoviesProvider              (context/UserMoviesContext.jsx)
    └── BrowserRouter
        └── Route element={<Layout />}        (components/Layout.jsx)
            ├── Header                         (components/Header.jsx)
            │   └── SearchBar                  (components/SearchBar.jsx)
            ├── <Outlet />  →  route content:
            │   ├── "/"        HomePage        (pages/HomePage.jsx)
            │   │              └── MovieList   (components/MovieList.jsx)
            │   │                  ├── MovieSort   (components/MovieSort.jsx)
            │   │                  └── MovieCard ×N (components/MovieCard.jsx)
            │   │                      ├── Favorite    (components/Favorite.jsx)
            │   │                      └── WatchLater  (components/WatchLater.jsx)
            │   └── "/profile" ProfilePage     (pages/ProfilePage.jsx)
            │                  └── MovieCarousel ×2 (components/MovieCarousel.jsx)
            │                      └── MovieCard ×N
            ├── Footer                         (components/Footer.jsx)
            └── MovieModal                     (components/MovieModal.jsx)
                └── AiRecommendation           (components/AiRecommendation.jsx)
```

### Components

| Component | Responsibility | Renders | Key props | Owns state? |
|---|---|---|---|---|
| **App** | Wire up global context + routing | Provider → Router → layout route | — | No |
| **Layout** | Persistent app shell; owns modal state | Header, `<main><Outlet/></main>`, Footer, MovieModal | — (shares `onSelectMovie` via Outlet context) | `selectedMovie` |
| **Header** | Top nav: logo, Browse, search, profile | logo button, nav, SearchBar, profile button | `onLogoClick`, `onSearch`, `onSelectMovie`, `onProfile` | No |
| **SearchBar** | Live debounced search + suggestions dropdown | input pill, Search/Clear buttons (shown when active), suggestions list | `value`, `onChange`, `onSearch`, `onSelectMovie`, `placeholder` | `internalQuery`, `suggestions`, `isOpen`, `isActive`, `isLoading`, `suggestError` |
| **HomePage** | Browse/search page | MovieList | — (reads `?q=` URL param, `onSelectMovie` from Outlet) | No (URL is source of truth) |
| **ProfilePage** | Saved favorites + watch-later | profile hero, 2× MovieCarousel | — (reads context + Outlet) | No |
| **MovieList** | Fetch + paginate + sort the grid | MovieSort, grid of MovieCards, Load More | `query`, `onSelectMovie` | `movies`, `isLoading`, `error`, `reloadKey`, `page`, `totalPages`, `isLoadingMore`, `loadMoreError`, `sortBy` |
| **MovieCard** | One movie in grid/carousel | poster (w/ fallback), rating, title, action buttons | `movie`, `onClick` | No |
| **MovieModal** | Full detail overlay | hero backdrop, poster, meta, genres, overview, AI rec, tabs (Cast & Crew / Trailer) | `movie`, `onClose` | `details`, `isLoading`, `error`, `activeTab` |
| **MovieCarousel** | Horizontal scrollable row | title, scroll arrows, MovieCards | `title`, `movies`, `emptyMessage`, `onSelectMovie` | `trackRef` only |
| **MovieSort** | Sort control (button row) | toggle buttons from `SORT_OPTIONS` | `value`, `onChange` | No |
| **Favorite / WatchLater** | Toggle a movie in a saved list | icon button | `movie`, `onToggle?` | No (reads/writes context) |
| **AiRecommendation** | Fetch + show AI watch take | heading + text / loading / error | `movieId`, `title`, `genres`, `overview`, `rating` | `text`, `isLoading`, `error` |
| **Footer** | Static footer | "© salesforce 2026. Della." | — | No |

### Supporting modules (non-component)

- **api/tmdb.jsx** — TMDb wrapper: `request()`, `imageUrl()`, `fetchNowPlaying()`, `searchMovies()`, `fetchMovieDetails()`.
- **api/ai.jsx** — OpenRouter wrapper: `getWatchRecommendation()`.
- **context/UserMoviesContext.jsx** — `UserMoviesProvider` + `useUserMovies()` hook.
- **components/SortOptions.jsx** — `SORT_OPTIONS` map (label + comparator per sort).
- **utils/posterFallback.jsx** — `FALLBACK_POSTER` + `handlePosterError()` for broken images.

> Note: `components/LoadMore.jsx` exists but is empty/unused — "Load More" is
> implemented inline inside `MovieList`.

## API Contracts

All TMDb calls go through one `request()` wrapper (`api/tmdb.jsx`) that injects
`api_key` (from `VITE_TMDB_API_KEY`), throws on non-OK HTTP status, and
normalizes a malformed 200 body to `{}`.

| Endpoint | URL | Params | Fields used | Errors handled |
|---|---|---|---|---|
| **Now Playing** | `GET /movie/now_playing` | `language`, `page` | `results[]` (id, title, poster_path, vote_average, release_date), `page`, `total_pages` | HTTP error → friendly card + retry; malformed body → empty list |
| **Search** | `GET /search/movie` | `language`, `query`, `page`, `include_adult=false` | same shape as Now Playing | suggestions: "Couldn't load suggestions"; grid: error card + retry |
| **Movie Details** | `GET /movie/{id}` | `language`, `append_to_response=credits,videos` | runtime, genres, overview, backdrop_path, release_date, `credits.crew` (Director), `credits.cast` (sorted by `order`), `videos.results` (YouTube trailer) | "Couldn't load full details, but here's what we have" |
| **AI Recommendation** | `POST openrouter…/chat/completions` (`api/ai.jsx`) | model, system+user messages | `choices[0].message.content` | "Recommendation unavailable — try again in a moment." |

List helpers (`fetchNowPlaying`/`searchMovies`) return a normalized
`{ movies, page, totalPages }` with `movies` always an array — so downstream
components never crash on missing fields.

## State Architecture

| State | Type | Initial | Owner | Triggered by |
|---|---|---|---|---|
| `favorites` | `Movie[]` | from localStorage | UserMoviesContext (global) | Favorite toggle; persisted to localStorage |
| `watchLater` | `Movie[]` | from localStorage | UserMoviesContext (global) | WatchLater toggle; persisted to localStorage |
| `selectedMovie` | `Movie \| null` | `null` | Layout | Card / suggestion click; cleared on modal close |
| search `query` | `string` (URL `?q=`) | `''` | URL (via `useSearchParams`) | SearchBar submit/clear, logo click |
| `movies` | `Movie[]` | `[]` | MovieList | Initial load, query change, Load More (append) |
| `page` / `totalPages` | `number` | `1` / `1` | MovieList | Load More; reset on query change |
| `sortBy` | `string` | `'title'` | MovieList | MovieSort selection |
| `isLoading` / `error` | `bool` / `string\|null` | `true` / `null` | MovieList, MovieModal, AiRecommendation | Fetch lifecycle |
| `details` | `object \| null` | `null` | MovieModal | `fetchMovieDetails` on open |
| `activeTab` | `string` | `'cast'` | MovieModal | Tab click; reset per movie |
| `suggestions` / `isOpen` / `isActive` | — | `[]` / `false` / `false` | SearchBar | Typing (debounced), focus, outside-click |

**Sorting** is derived, not stored: `MovieList` keeps `movies` in fetch order
and computes a sorted copy with `useMemo([movies, sortBy])`, so appended pages
fold into the current sort automatically.

## Data Flow

1. **Fetch → grid.** `MovieList` mounts → `fetchNowPlaying()` (or
   `searchMovies()` when `query` is set) via the `request()` wrapper. The
   response is normalized to `{ movies, page, totalPages }`, stored in state,
   sorted via `useMemo`, and `map()`-ed into `MovieCard`s. Posters are built
   with `imageUrl(poster_path)` and fall back to `no_poster_found.png` (on null
   path *and* on `onError`).
2. **Search.** Typing in `SearchBar` debounces a `searchMovies` call for the
   live dropdown. Submitting routes to `/?q=…`; `HomePage` reads it via
   `useSearchParams` and passes it to `MovieList`, which refetches. This keeps
   search in the URL so it survives navigation/back.
3. **Card click → modal.** `MovieCard` calls `onSelectMovie(movie)` →
   `Layout`'s `setSelectedMovie` (shared to pages through Outlet context, and to
   the Header directly). `MovieModal` receives the `movie`, then a `useEffect`
   calls `fetchMovieDetails(movie.id)` (with credits + videos appended). The
   modal closes via ×, overlay click, or Escape, clearing `selectedMovie`.
4. **Saved lists.** Favorite/WatchLater buttons call context togglers that store
   the whole movie object; `ProfilePage` reads `favorites`/`watchLater` straight
   from context into carousels — no re-fetch needed.

## AI Feature Spec
movie's title, genres, and overview as context to generate ai recommendation


## Which component will display the AI insight? (Hint: MovieModal)
What movie data will you send to the AI as context? (title, genres, overview)
What do you want the AI to return? (e.g., a 2–3 sentence "watch recommendation")
Where does the AI response live in state?

Before you reach Milestone 8, sketch what your AI feature will do. You'll refine this when you implement it, but starting with a rough plan here forces you to make architectural decisions early:

Role: What role should the model play?
the model should give a short 1-2 sentence description of the movie given.
Task: What is the model being asked to do? (generating a description for a music playlist based on its name, author, and song list)
Generate the description for AI-generated recommendation will appear alongside the movie details — giving users a personalized take on whether the film is worth their evening

Inputs: What playlist data will you pass to the model?
movie name, genre, description, score rating will be passed to the modal

Output format: What should the response look like? 
1-2 sentence description that captures the vibe of the movie. Explain why or why not the movie is worth watching. Use easy wording, something that is easy to read through

Constraints: What should the model avoid? (e.g., don't list the songs individually, don't use generic marketing language)
- don't list the director, runtime, or any basic information about the movie
- don't use generic marketing language
- don't put **Watch Recommendation** 
- don't use any sophisticated words or be overly worded

const AI_MODEL = "openrouter/free"

Failure behavior: What should the UI show if the API call fails or the model doesn't respond?
If the API call fails or the model doesn't respond, UI should show the fallback message of recommendation unavilable - try again in a moment

The feature is in the movie card modal. 


### AI Feature — Decisions Log
- **What the API returned initially:** [describe the first few responses — did they match your spec?]
The first few response was long and very wordly. It was longer than what I wanted to read for movie recommendation and too long sentence. I wanted the recommendation to be something that a friend would say rather than something a movie critic would say. 


- **What I changed in my prompt:** [any adjustments to the system message, user message, or constraints]
First prompt gave a long wordly explanation of the movie, I wanted the AI recommendation to be easy to read, not some critic explanation of the movie that no one is going read. I added more constraints and said to don't use any sophisticated words or be overly worded. 

- **What fallback behavior I implemented:** [what users see when the AI call fails]
If the API call fails or the model doesn't respond, UI should show the fallback message of recommendation unavilable - try again in a moment

- **What I learned:** [one thing about prompt engineering, React state for async features, or OpenRouter]
OpenRouter AI recommendation was similar implementation as the last project with the AI description but it was slightly different because of react component factor of it. Instead of .secret, I used .env. 



