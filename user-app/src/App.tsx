import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout        from './components/Layout'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import DiscoverPage  from './pages/DiscoverPage'
import ObservePage   from './pages/ObservePage'
import FlirtsPage    from './pages/FlirtsPage'
import MyProfilePage from './pages/MyProfilePage'

export default function App() {
  const { profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-aura-bg flex items-center justify-center">
      <div className="w-1 h-8 bg-aura-gold rounded-full animate-pulse" />
    </div>
  )

  if (!profile) return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  )

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index              element={<Navigate to="/discover" replace />} />
        <Route path="discover"   element={<DiscoverPage />} />
        <Route path="observe"    element={<ObservePage />} />
        <Route path="flirts"     element={<FlirtsPage />} />
        <Route path="flirts/:id" element={<FlirtsPage />} />
        <Route path="profile"    element={<MyProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/discover" replace />} />
    </Routes>
  )
}
