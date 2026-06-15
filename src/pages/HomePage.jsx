import { useOutletContext, useSearchParams } from 'react-router-dom'
import MovieList from '../components/MovieList'

const HomePage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { onSelectMovie } = useOutletContext()

  return <MovieList query={query} onSelectMovie={onSelectMovie} />
}

export default HomePage
