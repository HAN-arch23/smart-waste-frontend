import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Home.css'

const features = [
  { icon: '📝', title: 'Report Issues', desc: 'Quickly report overflowing bins, illegal dumping, or missed collections in your area.' },
  { icon: '📍', title: 'Geolocated Reports', desc: 'Attach your location to reports so authorities can find and address issues faster.' },
  { icon: '📊', title: 'Track Progress', desc: 'Monitor the status of your reports in real time from submission to resolution.' },
  { icon: '🏛️', title: 'Municipal Dashboard', desc: 'Authorities get a centralized view of all reports with analytics for better planning.' },
]

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Cleaner Cities Start with You</h1>
          <p>Report waste issues in your neighbourhood. Track responses. Hold municipalities accountable.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/report" className="btn btn-accent">Report an Issue</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-accent">Get Started</Link>
                <Link to="/login" className="btn btn-outline">Sign In</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">🏙️</div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">A simple, transparent platform connecting citizens and municipal authorities.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-num">1,240+</span>
              <span className="stat-label">Issues Reported</span>
            </div>
            <div className="stat">
              <span className="stat-num">890+</span>
              <span className="stat-label">Issues Resolved</span>
            </div>
            <div className="stat">
              <span className="stat-num">12</span>
              <span className="stat-label">Municipalities</span>
            </div>
            <div className="stat">
              <span className="stat-num">3,500+</span>
              <span className="stat-label">Registered Citizens</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to make a difference?</h2>
            <p>Join thousands of Kenyans reporting waste issues and building cleaner cities.</p>
            <Link to="/register" className="btn btn-primary">Create an Account</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
