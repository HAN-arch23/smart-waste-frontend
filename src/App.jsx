import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Report from './pages/Report/Report'
import Dashboard from './pages/Dashboard/Dashboard'
import Admin from './pages/Admin/Admin'
import CollectorDashboard from './pages/CollectorDashboard/CollectorDashboard'
import Marketplace from './pages/Marketplace/Marketplace'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />

            {/* Citizen */}
            <Route path="/report" element={<ProtectedRoute role="citizen"><Report /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute role="citizen"><Dashboard /></ProtectedRoute>} />

            {/* Collector */}
            <Route path="/collector" element={<ProtectedRoute role="collector"><CollectorDashboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
