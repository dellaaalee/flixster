// Sort options and their comparators. Sorting happens on a derived copy at
// render time (in MovieList's useMemo) so the fetched order stays intact.
export const SORT_OPTIONS = {
  title: {
    label: 'Title (A-Z)',
    short: 'Title A-Z',
    compare: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
  },
  release: {
    label: 'Release Date (Newest)',
    short: 'Newest',
    // Empty dates sort to the bottom.
    compare: (a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''),
  },
  rating: {
    label: 'Vote Average (Highest)',
    short: 'Top Rated',
    compare: (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
  },
}
