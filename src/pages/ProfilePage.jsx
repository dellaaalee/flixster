import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MovieCarousel from '../components/MovieCarousel'
import MovieModal from '../components/MovieModal'
import { useUserMovies } from '../context/UserMoviesContext'
import './ProfilePage.css'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { favorites, watchLater } = useUserMovies()
  const [selectedMovie, setSelectedMovie] = useState(null)

  // Search from the profile header takes the user back to the browse page.
  const goHome = () => navigate('/')
  const handleSearch = (query) => {
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  return (
    <div className="App">
      <Header
        onLogoClick={goHome}
        onSearch={handleSearch}
        onSelectMovie={setSelectedMovie}
        onProfile={() => navigate('/profile')}
      />

      <main className="App-main">
        <section className="profile-hero">
          <span className="profile-hero-avatar" />
          <div className="profile-hero-text">
            <h1 className="profile-hero-name">My Profile</h1>
            <p className="profile-hero-stats">
              {favorites.length} favorite{favorites.length === 1 ? '' : 's'} ·{' '}
              {watchLater.length} to watch
            </p>
          </div>
        </section>

        <MovieCarousel
          title="Favorites"
          movies={favorites}
          emptyMessage="You haven’t favorited any movies yet. Tap the heart on a movie to add it here."
          onSelectMovie={setSelectedMovie}
        />

        <MovieCarousel
          title="Watch Later"
          movies={watchLater}
          emptyMessage="Nothing saved to watch later yet. Tap the clock on a movie to save it here."
          onSelectMovie={setSelectedMovie}
        />
      </main>

      <Footer />

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  )
}

export default ProfilePage
