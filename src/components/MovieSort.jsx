import PropTypes from 'prop-types'
import { SORT_OPTIONS } from './SortOptions'
import './MovieSort.css'

const MovieSort = ({ value, onChange }) => {
  return (
    <div className="movie-list-toolbar">
      <span className="movie-sort-label">Sort by</span>
      <div className="movie-sort" role="group" aria-label="Sort movies">
        {Object.entries(SORT_OPTIONS).map(([key, { label, short }]) => {
          const active = key === value
          return (
            <button
              key={key}
              type="button"
              className={`movie-sort-button${active ? ' is-active' : ''}`}
              onClick={() => onChange(key)}
              aria-pressed={active}
              title={label}
            >
              {short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

MovieSort.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default MovieSort
