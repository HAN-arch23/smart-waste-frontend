import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import Timeline from '../../components/Timeline/Timeline'
import './CollectorDashboard.css'
import API_BASE from '../../utils/api.js'

const CollectorDashboard = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('available') // 'available' | 'mine'
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchIssues() }, [tab])

  const token = () => localStorage.getItem('swms_token')

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/issues/collector?status=${tab === 'mine' ? 'mine' : ''}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const claimIssue = async (id) => {
    setUpdating(id)
    try {
      await fetch(`${API_BASE}/api/issues/${id}/claim`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token()}` }
      })
      fetchIssues()
    } catch (err) { console.error(err) }
    finally { setUpdating(null) }
  }

  const updateProgress = async (id, status) => {
    setUpdating(id)
    try {
      await fetch(`${API_BASE}/api/issues/${id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status })
      })
      fetchIssues()
    } catch (err) { console.error(err) }
    finally { setUpdating(null) }
  }

  const openTimeline = async (issue) => {
    setSelectedIssue(issue)
    setTimelineLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/issues/${issue._id}/timeline`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      setTimeline(data.timeline || [])
    } catch (err) { console.error(err) }
    finally { setTimelineLoading(false) }
  }

  return (
    <div className="collector-dashboard container">
      <h1 className="page-title">Collector Dashboard</h1>
      <p className="page-subtitle">Welcome, {user?.name}. Claim and manage waste collection tasks.</p>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}>
          📋 Available Issues
        </button>
        <button className={`tab-btn ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
          🚛 My Assignments
        </button>
      </div>

      <div className="collector-table-wrapper card">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : issues.length === 0 ? (
          <p className="loading-text">
            {tab === 'available' ? 'No available issues right now.' : 'You have no assigned issues.'}
          </p>
        ) : (
          <table className="collector-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue._id}>
                  <td className="issue-title-cell">{issue.title}</td>
                  <td>{issue.category}</td>
                  <td>{issue.location}</td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td>
                    <div className="action-btns">
                      {tab === 'available' && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updating === issue._id}
                          onClick={() => claimIssue(issue._id)}
                        >
                          {updating === issue._id ? '...' : '🚛 Claim'}
                        </button>
                      )}
                      {tab === 'mine' && issue.status === 'assigned' && (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={updating === issue._id}
                          onClick={() => updateProgress(issue._id, 'collected')}
                        >
                          ♻️ Mark Collected
                        </button>
                      )}
                      {tab === 'mine' && issue.status === 'collected' && (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={updating === issue._id}
                          onClick={() => updateProgress(issue._id, 'recycled')}
                        >
                          🔄 Mark Recycled
                        </button>
                      )}
                      <button
                        className="btn-timeline-sm"
                        onClick={() => openTimeline(issue)}
                      >
                        🔍 Track
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Timeline Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔍 {selectedIssue.title}</h3>
              <button className="modal-close" onClick={() => setSelectedIssue(null)}>✕</button>
            </div>
            {timelineLoading ? <p className="loading-text">Loading...</p> : <Timeline timeline={timeline} />}
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectorDashboard
