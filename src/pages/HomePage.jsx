import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MovieList from '../components/MovieList'
import MovieModal from '../components/MovieModal'

const HomePage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [selectedMovie, setSelectedMovie] = useState(null)

  // Drive search through the URL so it survives navigation/back.
  const handleSearch = (next) => {
    setSearchParams(next ? { q: next } : {})
  }

  const goToTheaterNow = () => {
    setSearchParams({})
  }

  return (
    <div className="App">
      <Header
        onLogoClick={goToTheaterNow}
        onSearch={handleSearch}
        onSelectMovie={setSelectedMovie}
        onProfile={() => navigate('/profile')}
      />
      <main className="App-main">
        <MovieList query={query} onSelectMovie={setSelectedMovie} />
      </main>
      <Footer />
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}

export default HomePage
