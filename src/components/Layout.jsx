import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MovieModal from './MovieModal'

// App shell rendered once for every route: header, footer, and the movie
// modal. Owns the selected-movie state and shares the open-modal setter with
// routed pages via Outlet context.
const Layout = () => {
  const navigate = useNavigate()
  const [selectedMovie, setSelectedMovie] = useState(null)

  const handleSearch = (query) => {
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  return (
    <div className="App">
      <Header
        onLogoClick={() => navigate('/')}
        onSearch={handleSearch}
        onSelectMovie={setSelectedMovie}
        onProfile={() => navigate('/profile')}
      />
      <main className="App-main">
        <Outlet context={{ onSelectMovie: setSelectedMovie }} />
      </main>
      <Footer />
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}

export default Layout
