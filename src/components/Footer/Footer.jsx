import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span>🗑️ SmartWaste KE</span>
          <p>Improving urban waste management across Kenya through technology.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/report">Report Issue</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Municipal Waste Department</p>
          <p>support@smartwaste.go.ke</p>
          <p>+254 700 000 000</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Smart Waste Management System — Kenya. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
