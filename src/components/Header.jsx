import PropTypes from 'prop-types'
import './Header.css'
import SearchBar from './SearchBar'


const Header = ({ onLogoClick, onBrowse, onProfile, onSearch, onSelectMovie }) => {
  return (
    <header className="header">
      <button
        type="button"
        className="header-logo"
        onClick={onLogoClick}
      >
        TheaterNow
      </button>

      <nav className="header-nav">
        <button type="button" className="header-tab" onClick={onBrowse}>
          Browse
        </button>
      </nav>

      <SearchBar onSearch={onSearch} onSelectMovie={onSelectMovie} />


      <div className="header-actions">
        <button
          type="button"
          className="header-profile"
          onClick={onProfile}
          aria-label="Profile"
        >
          <span className="header-profile-avatar" />
        </button>
      </div>
    </header>
  )
}

Header.propTypes = {
  onLogoClick: PropTypes.func,
  onBrowse: PropTypes.func,
  onProfile: PropTypes.func,
  onSearch: PropTypes.func,
  onSelectMovie: PropTypes.func,
  onNotifications: PropTypes.func,
}

export default Header
