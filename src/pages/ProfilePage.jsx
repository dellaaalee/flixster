import { useOutletContext } from 'react-router-dom'
import MovieCarousel from '../components/MovieCarousel'
import { useUserMovies } from '../context/UserMoviesContext'
import './ProfilePage.css'

const ProfilePage = () => {
  const { favorites, watchLater } = useUserMovies()
  const { onSelectMovie } = useOutletContext()

  return (
    <>
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
        onSelectMovie={onSelectMovie}
      />

      <MovieCarousel
        title="Watch Later"
        movies={watchLater}
        emptyMessage="Nothing saved to watch later yet. Tap the clock on a movie to save it here."
        onSelectMovie={onSelectMovie}
      />
    </>
  )
}

export default ProfilePage
