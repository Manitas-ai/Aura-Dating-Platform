import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdminAuth } from './context/AuthContext'
import AdminLayout   from './components/AdminLayout'
import LoginPage     from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage   from './pages/MembersPage'
import MatchesPage   from './pages/MatchesPage'
import MessagesPage  from './pages/MessagesPage'
import FeedbackPage    from './pages/FeedbackPage'
import UserLoginsPage  from './pages/UserLoginsPage'

export default function App() {
  const { authed } = useAdminAuth()

  if (!authed) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*"      element={<Navigate to="/login" replace />} />
    </Routes>
  )

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index              element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"   element={<DashboardPage />} />
        <Route path="members"     element={<MembersPage />} />
        <Route path="matches"     element={<MatchesPage />} />
        <Route path="messages"    element={<MessagesPage />} />
        <Route path="feedback"      element={<FeedbackPage />} />
        <Route path="user-logins"   element={<UserLoginsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
