import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Report.css'
import API_BASE from '../../utils/api.js'

const categories = [
  'Overflowing Bin',
  'Illegal Dumping',
  'Missed Collection',
  'Hazardous Waste',
  'Blocked Drain',
  'Other',
]

const Report = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', category: '', location: '', description: '', image: null
  })
  const [useGPS, setUseGPS] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = (e) => {
    setForm({ ...form, image: e.target.files[0] })
  }

  const handleGPS = () => {
    setGpsStatus('Detecting location...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
        setForm((prev) => ({ ...prev, location: coords }))
        setGpsStatus('✅ Location detected')
      },
      () => {
        setGpsStatus('❌ Could not detect location. Enter manually.')
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('swms_token')
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v) })

      const res = await fetch(`${API_BASE}/api/issues`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to submit report.')
      } else {
        setSuccess('✅ Report submitted successfully! Authorities have been notified.')
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    } catch (err) {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="report-page container">
      <h1 className="page-title">Report a Waste Issue</h1>
      <p className="page-subtitle">Help us keep your area clean. Fill in the details below.</p>

      <div className="report-card card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Overflowing bin near market" required />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <div className="location-row">
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Tom Mboya Street, Nairobi"
                required
              />
              <button type="button" className="btn btn-outline gps-btn" onClick={handleGPS}>
                📍 Use GPS
              </button>
            </div>
            {gpsStatus && <small className="gps-status">{gpsStatus}</small>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide more detail about the issue..."
            />
          </div>

          <div className="form-group">
            <label>Upload Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="file-input" />
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <div className="report-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : '📤 Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Report
