import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const roleHome = { admin: '/admin', collector: '/collector', citizen: '/dashboard' }

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={roleHome[user.role] || '/'} replace />

  return children
}

export default ProtectedRoute
