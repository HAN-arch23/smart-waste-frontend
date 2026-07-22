import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import './Admin.css'
import API_BASE from '../../utils/api.js'

const statusOptions = ['pending', 'in-progress', 'resolved', 'rejected']

const Admin = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('swms_token')
      const res = await fetch(`${API_BASE}/api/issues`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) {
      console.error('Failed to fetch issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      const token = localStorage.getItem('swms_token')
      await fetch(`${API_BASE}/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      setIssues(prev =>
        prev.map(i => i._id === id ? { ...i, status } : i)
      )
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter)

  const counts = {
    all: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    'in-progress': issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  }

  return (
    <div className="admin container">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Manage and respond to all reported waste issues.</p>

      {/* Stats Row */}
      <div className="admin-stats">
        {Object.entries(counts).map(([key, count]) => (
          <div
            key={key}
            className={`admin-stat ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            <span className="stat-count">{count}</span>
            <span className="stat-label">{key === 'all' ? 'Total Issues' : key.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Issues Table */}
      <div className="admin-table-wrapper card">
        {loading ? (
          <p className="loading-text">Loading issues...</p>
        ) : filtered.length === 0 ? (
          <p className="loading-text">No issues found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(issue => (
                <tr key={issue._id}>
                  <td className="issue-title-cell">{issue.title}</td>
                  <td>{issue.category}</td>
                  <td>{issue.location}</td>
                  <td>{issue.reportedBy?.name || 'N/A'}</td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td>
                    <select
                      value={issue.status}
                      disabled={updating === issue._id}
                      onChange={(e) => updateStatus(issue._id, e.target.value)}
                      className="status-select"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Admin
