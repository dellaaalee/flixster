import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { UserMoviesProvider } from './context/UserMoviesContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'

const App = () => {
  return (
    <UserMoviesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserMoviesProvider>
  )
}

export default App
