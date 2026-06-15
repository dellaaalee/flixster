import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { UserMoviesProvider } from './context/UserMoviesContext'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'

const App = () => {
  return (
    <UserMoviesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </UserMoviesProvider>
  )
}

export default App
