import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🗑️</span>
          <span className="brand-text">SmartWaste <span>KE</span></span>
        </Link>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/marketplace">Marketplace</Link></li>

          {user ? (
            <>
              {user.role === 'admin' && <li><Link to="/admin">Admin Panel</Link></li>}
              {user.role === 'collector' && <li><Link to="/collector">My Tasks</Link></li>}
              {user.role === 'citizen' && (
                <>
                  <li><Link to="/report">Report Issue</Link></li>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                </>
              )}
              <li><span className="navbar-username">👤 {user.name}</span></li>
              <li><button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary btn-sm">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
