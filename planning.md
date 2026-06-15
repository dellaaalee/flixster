# Planning 

## component architecture
List every component your app will need. For each component, define: responsibility (one sentence), what it renders, what props it receives, and whether it manages any state. Also document the parent-child hierarchy — which component renders which. Your list should include at minimum: App, MovieList, MovieCard, SearchBar, MovieModal, Header, Footer, and a sort control.

header - 
houses logo, navbar, and searchbar. It will stay in the top of the page no matter what page I go into. 
TheaterNow title/logo at the left most of the screen, browse tab to the next to the screen, and search next to the screen, the very right of the screen is a profile picture. The search will use assets/img/search_icon.png and will have a round input box with "search movie" as a default text. When you click on the TheaterNowlogo, it should take you to the TheaterNow page. 

footer - 
there's a footer on the page with "© salesforce 2026. Della."

movielist -
fetching movie data and rendering a MovieCard for each result.
Use useState and useEffect to fetch the Now Playing movies when the component mounts and store the results in state.
Use map() to render a MovieCard for each movie in the results array.

moviecard -
displays movie data. It has movie poster, vote average, and movie title

searchbar

moviemodal -
detail view of each movie. Moviemodal will show on the page when the user clicks on the moviecard and 
What props does it receive? (At minimum: a movie ID and an onClose callback)
What does it render? (backdrop image, title, runtime, release date, genres, overview)
How does the user open and close it?
///
When a MovieCard is clicked, store the selected movie's id in state (in App or whichever component owns the modal state, per your spec).
Use a useEffect to fetch the detailed movie data when a movie ID is set in state.
Pass the fetched details as props to MovieModal and render them: backdrop image, title, runtime, release date, genres (as a comma-separated list or tags), and overview.
Provide a way to close the modal (an X button, clicking outside the modal, or pressing Escape) that clears the selected movie ID from state.
Style the modal as a centered overlay with a semi-transparent backdrop.
Handle the case where the details API call fails — the user should see a helpful message, not a broken modal.

LoadMore -



sort control


## API Contracts
Identify every TMDb endpoint your app will use. For each one, define: the endpoint URL, required parameters, the response fields your components will actually use, and the error cases to handle. You'll need at minimum: the Now Playing endpoint, the Search endpoint, and the Movie Details endpoint (the modal needs runtime and genres, which aren't in the Now Playing response).



## State Architecture
List every piece of state your app needs to manage. For each one, define: the variable name and data type, its initial value, which component owns it, and what triggers an update. Think about: the current movie list, active search query, current page number, selected movie for the modal, sort option, loading state, and error state.


## Data Flow
Describe in a short paragraph or simple diagram how data moves from the TMDb API to the rendered MovieCard. Does the raw API response need any transformation before it reaches your components? When a user clicks a MovieCard, how does the movie's ID reach the fetch call for details?

## AI Feature Spec
Before you reach Milestone 8, sketch what your AI feature will do. You'll refine this when you implement it, but starting with a rough plan here forces you to make architectural decisions early:


## Which component will display the AI insight? (Hint: MovieModal)
What movie data will you send to the AI as context? (title, genres, overview)
What do you want the AI to return? (e.g., a 2–3 sentence "watch recommendation")
Where does the AI response live in state?




movie's title, genres, and overview as context


### AI Feature — Decisions Log
- **What the API returned initially:** [describe the first few responses — did they match your spec?]
- **What I changed in my prompt:** [any adjustments to the system message, user message, or constraints]
- **What fallback behavior I implemented:** [what users see when the AI call fails]
- **What I learned:** [one thing about prompt engineering, React state for async features, or OpenRouter]


## AI Recommendation

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