import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Marketplace.css'
import API_BASE from '../../utils/api.js'

const wasteTypeOptions = [
  'Plastic', 'Paper', 'Glass', 'Metal', 'E-waste',
  'Organic', 'Hazardous', 'Textile', 'Rubber', 'General'
]

const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Other']

const Marketplace = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCounty, setFilterCounty] = useState('')

  const [form, setForm] = useState({
    name: '', type: 'collector', county: '',
    wasteTypes: [], contact: '', description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchListings() }, [filterType, filterCounty])

  const token = () => localStorage.getItem('swms_token')

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.set('type', filterType)
      if (filterCounty) params.set('county', filterCounty)
      const res = await fetch(`${API_BASE}/api/marketplace?${params}`)
      const data = await res.json()
      setListings(data.listings || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleWasteType = (type) => {
    setForm(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(type)
        ? prev.wasteTypes.filter(t => t !== type)
        : [...prev.wasteTypes, type]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/api/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setSuccess('Listing added successfully!')
        setShowForm(false)
        setForm({ name: '', type: 'collector', county: '', wasteTypes: [], contact: '', description: '' })
        fetchListings()
      }
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    try {
      await fetch(`${API_BASE}/api/marketplace/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      })
      fetchListings()
    } catch (err) { console.error(err) }
  }

  const typeLabel = { collector: '🚛 Collector', recycler: '♻️ Recycler' }

  return (
    <div className="marketplace container">
      <div className="marketplace-header">
        <div>
          <h1 className="page-title">Waste Marketplace</h1>
          <p className="page-subtitle">Find collectors and recyclers across Kenya who accept your waste.</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Listing'}
          </button>
        )}
      </div>

      {success && <p className="success-msg">{success}</p>}

      {/* Add Listing Form */}
      {showForm && (
        <div className="listing-form card">
          <h3>Add Your Listing</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Business / Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Green Collect Nairobi" required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="collector">Collector</option>
                  <option value="recycler">Recycler</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>County *</label>
                <select value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} required>
                  <option value="">Select county</option>
                  {counties.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Contact *</label>
                <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="+254 7XX XXX XXX" required />
              </div>
            </div>

            <div className="form-group">
              <label>Waste Types Accepted</label>
              <div className="waste-type-grid">
                {wasteTypeOptions.map(type => (
                  <label key={type} className={`waste-tag ${form.wasteTypes.includes(type) ? 'selected' : ''}`}>
                    <input type="checkbox" style={{ display: 'none' }} checked={form.wasteTypes.includes(type)} onChange={() => toggleWasteType(type)} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Tell citizens what you offer..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Listing'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="market-filters card">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
          <option value="">All Types</option>
          <option value="collector">Collectors</option>
          <option value="recycler">Recyclers</option>
        </select>
        <select value={filterCounty} onChange={e => setFilterCounty(e.target.value)} className="filter-select">
          <option value="">All Counties</option>
          {counties.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-outline" onClick={() => { setFilterType(''); setFilterCounty('') }}>Reset</button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <p className="loading-text">Loading listings...</p>
      ) : listings.length === 0 ? (
        <div className="empty-market">
          <span>🏪</span>
          <p>No listings found. Be the first to add one!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(l => (
            <div key={l._id} className="listing-card card">
              <div className="listing-top">
                <div>
                  <span className={`listing-type-badge ${l.type}`}>{typeLabel[l.type]}</span>
                  <h3 className="listing-name">{l.name}</h3>
                  <p className="listing-county">📍 {l.county}</p>
                </div>
                {user && (user.role === 'admin' || String(l.createdBy?._id) === user._id) && (
                  <button className="btn-delete" onClick={() => deleteListing(l._id)}>🗑</button>
                )}
              </div>

              {l.description && <p className="listing-desc">{l.description}</p>}

              {l.wasteTypes.length > 0 && (
                <div className="listing-waste-types">
                  {l.wasteTypes.map(t => <span key={t} className="waste-pill">{t}</span>)}
                </div>
              )}

              <a href={`tel:${l.contact}`} className="btn btn-outline listing-contact">
                📞 {l.contact}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Marketplace
