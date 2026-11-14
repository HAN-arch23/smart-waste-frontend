import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import AdminCharts from '../../components/AdminCharts/AdminCharts'
import './Admin.css'
import API_BASE from '../../utils/api.js'

const statusOptions = ['pending', 'assigned', 'collected', 'recycled', 'resolved', 'rejected']
const categories = ['Overflowing Bin', 'Illegal Dumping', 'Missed Collection', 'Hazardous Waste', 'Blocked Drain', 'Other']
const IN_PROGRESS = ['assigned', 'collected', 'recycled']
const PAGE_SIZE = 10

const Admin = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchIssues()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filter, category, search])

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('swms_token')}`,
  })

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/issues?limit=500`, { headers: authHeaders() })
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) {
      console.error('Failed to fetch issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    const note = window.prompt(`Add a note for changing this issue to "${status}" (optional):`, '')
    if (note === null) return // admin cancelled
    setUpdating(id)
    try {
      const res = await fetch(`${API_BASE}/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status, note: note.trim() || undefined }),
      })
      if (!res.ok) throw new Error('Update rejected by server')
      setIssues(prev => prev.map(i => (i._id === id ? { ...i, status } : i)))
      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('Update failed:', err)
      alert('Status update failed. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const deleteIssue = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return
    setUpdating(id)
    try {
      const res = await fetch(`${API_BASE}/api/issues/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Delete rejected by server')
      setIssues(prev => prev.filter(i => i._id !== id))
      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const q = search.trim().toLowerCase()
  const matches = (i) => {
    if (filter === 'in-progress' && !IN_PROGRESS.includes(i.status)) return false
    if (filter !== 'all' && filter !== 'in-progress' && i.status !== filter) return false
    if (category && i.category !== category) return false
    if (!q) return true
    return [i.title, i.location, i.description, i.category, i.reportedBy?.name]
      .some(v => (v || '').toLowerCase().includes(q))
  }
  const filtered = issues.filter(matches)

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const counts = {
    all: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    'in-progress': issues.filter(i => IN_PROGRESS.includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    rejected: issues.filter(i => i.status === 'rejected').length,
  }

  const clearFilters = () => {
    setFilter('all')
    setCategory('')
    setSearch('')
  }
  const hasFilters = filter !== 'all' || category || search

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

      {/* Charts */}
      <AdminCharts refreshKey={refreshKey} />

      {/* Search and filters */}
      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Search by title, location, reporter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasFilters && (
          <button className="admin-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>
      {!loading && (
        <p className="admin-count">
          Showing {pageItems.length} of {filtered.length} issue{filtered.length === 1 ? '' : 's'}
        </p>
      )}

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(issue => (
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
                  <td>
                    <button
                      className="btn-del"
                      disabled={updating === issue._id}
                      onClick={() => deleteIssue(issue._id, issue.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="admin-pager">
          <button disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
          <span>Page {current} of {pages}</span>
          <button disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default Admin
