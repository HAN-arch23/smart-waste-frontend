import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import IssueCard from '../../components/IssueCard/IssueCard'
import Timeline from '../../components/Timeline/Timeline'
import './Dashboard.css'
import API_BASE from '../../utils/api.js'

const COLORS = ['#2e7d32', '#01579b', '#ff8f00', '#6a1b9a', '#b71c1c', '#00695c']

const Dashboard = () => {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('issues') // 'issues' | 'analytics'
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)

  useEffect(() => {
    fetchIssues()
    fetchAnalytics()
  }, [])

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('swms_token')
      const res = await fetch(`${API_BASE}/api/issues/my`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('swms_token')
      const res = await fetch(`${API_BASE}/api/issues/my/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setAnalytics(data)
    } catch (err) { console.error(err) }
  }

  const openTimeline = async (issue) => {
    setSelectedIssue(issue)
    setTimelineLoading(true)
    try {
      const token = localStorage.getItem('swms_token')
      const res = await fetch(`${API_BASE}/api/issues/${issue._id}/timeline`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setTimeline(data.timeline || [])
    } catch (err) { console.error(err) }
    finally { setTimelineLoading(false) }
  }

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter)

  const counts = {
    all: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    'in-progress': issues.filter(i => ['assigned','collected','recycled'].includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  }

  // Bar chart
  const BarChart = ({ data }) => {
    if (!data || data.length === 0) return <p className="no-data">No data yet.</p>
    const max = Math.max(...data.map(d => d.count))
    return (
      <div className="mini-bar-chart">
        {data.map((d, i) => (
          <div key={d._id} className="mini-bar-col">
            <span className="mini-bar-count">{d.count}</span>
            <div className="mini-bar" style={{
              height: `${max > 0 ? (d.count / max) * 120 : 0}px`,
              background: COLORS[i % COLORS.length]
            }} />
            <span className="mini-bar-label">{d._id.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}.</p>
        </div>
        <Link to="/report" className="btn btn-primary">+ New Report</Link>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
          📋 My Reports
        </button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          📊 My Analytics
        </button>
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && analytics && (
        <div className="analytics-section">
          <div className="analytics-grid">
            <div className="analytic-card card">
              <span className="analytic-num" style={{ color: '#1b5e20' }}>{analytics.total}</span>
              <span className="analytic-label">Total Reported</span>
            </div>
            <div className="analytic-card card">
              <span className="analytic-num" style={{ color: '#e65100' }}>{analytics.pending}</span>
              <span className="analytic-label">Pending</span>
            </div>
            <div className="analytic-card card">
              <span className="analytic-num" style={{ color: '#6a1b9a' }}>{analytics.collected}</span>
              <span className="analytic-label">Collected</span>
            </div>
            <div className="analytic-card card">
              <span className="analytic-num" style={{ color: '#2e7d32' }}>{analytics.resolved}</span>
              <span className="analytic-label">Resolved</span>
            </div>
          </div>

          {/* Resolution rate */}
          <div className="card rate-card">
            <h3>Resolution Rate</h3>
            <div className="rate-bar-bg">
              <div className="rate-bar-fill" style={{ width: `${analytics.resolutionRate}%` }} />
            </div>
            <p className="rate-label">{analytics.resolutionRate}% of your reports have been resolved</p>
          </div>

          {/* Category breakdown */}
          <div className="card">
            <h3>Reports by Category</h3>
            <BarChart data={analytics.byCategory} />
          </div>
        </div>
      )}

      {/* ISSUES TAB */}
      {activeTab === 'issues' && (
        <>
          <div className="summary-grid">
            {Object.entries(counts).map(([key, count]) => (
              <div key={key} className={`summary-card ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                <span className="summary-count">{count}</span>
                <span className="summary-label">{key === 'all' ? 'Total' : key.replace('-', ' ')}</span>
              </div>
            ))}
          </div>

          <div className="issues-list">
            {loading ? (
              <p className="loading-text">Loading your reports...</p>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <span>📭</span>
                <p>No reports yet.</p>
                <Link to="/report" className="btn btn-outline">Report an Issue</Link>
              </div>
            ) : (
              filtered.map(issue => (
                <div key={issue._id} className="issue-with-timeline">
                  <IssueCard issue={issue} />
                  <button className="btn-timeline" onClick={() => openTimeline(issue)}>
                    🔍 Track
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Timeline Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔍 Traceability — {selectedIssue.title}</h3>
              <button className="modal-close" onClick={() => setSelectedIssue(null)}>✕</button>
            </div>
            {timelineLoading ? (
              <p className="loading-text">Loading timeline...</p>
            ) : (
              <Timeline timeline={timeline} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
