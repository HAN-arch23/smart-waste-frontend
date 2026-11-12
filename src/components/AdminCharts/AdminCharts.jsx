import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts'
import API_BASE from '../../utils/api.js'
import './AdminCharts.css'

const STATUS_COLORS = {
  pending: '#ff8f00',
  assigned: '#01579b',
  collected: '#6a1b9a',
  recycled: '#00695c',
  resolved: '#2e7d32',
  rejected: '#b71c1c',
}

const formatDuration = (hours) => {
  if (hours === null || hours === undefined) return 'No data yet'
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`
  if (hours < 48) return `${hours} hrs`
  return `${(hours / 24).toFixed(1)} days`
}

const AdminCharts = ({ refreshKey }) => {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('swms_token')
        const res = await fetch(`${API_BASE}/api/issues/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Request failed')
        setStats(await res.json())
        setError(false)
      } catch (err) {
        console.error('Failed to load stats:', err)
        setError(true)
      }
    }
    load()
  }, [refreshKey])

  if (error) return <p className="charts-note">Charts could not be loaded.</p>
  if (!stats) return <p className="charts-note">Loading charts...</p>
  if (stats.total === 0) return <p className="charts-note">Charts will appear once issues are reported.</p>

  const statusData = (stats.byStatus || []).map(s => ({ name: s._id, value: s.count }))
  const categoryData = (stats.byCategory || []).map(c => ({ name: c._id, count: c.count }))
  const resolutionRate = Math.round((stats.resolved / stats.total) * 100)

  return (
    <section className="charts">
      <div className="kpi-row">
        <div className="kpi">
          <span className="kpi-value">{formatDuration(stats.avgResolutionHours)}</span>
          <span className="kpi-label">Average resolution time</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{resolutionRate}%</span>
          <span className="kpi-label">Resolution rate</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{stats.pending}</span>
          <span className="kpi-label">Awaiting a collector</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Issues by status</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {statusData.map(s => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#888'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Reports by category</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2e7d32" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card wide">
          <h3>Reports received, last 14 days</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.overTime} margin={{ left: 0, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Reports" stroke="#ff8f00" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminCharts
