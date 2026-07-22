import './Timeline.css'

const statusConfig = {
  reported:   { icon: '📝', label: 'Reported',   color: '#ff8f00' },
  assigned:   { icon: '🚛', label: 'Assigned',   color: '#01579b' },
  collected:  { icon: '♻️', label: 'Collected',  color: '#6a1b9a' },
  recycled:   { icon: '🔄', label: 'Recycled',   color: '#00695c' },
  resolved:   { icon: '✅', label: 'Resolved',   color: '#2e7d32' },
  rejected:   { icon: '❌', label: 'Rejected',   color: '#b71c1c' },
}

const Timeline = ({ timeline = [] }) => {
  if (!timeline.length) return <p className="timeline-empty">No timeline events yet.</p>

  return (
    <div className="timeline">
      {timeline.map((event, i) => {
        const cfg = statusConfig[event.status] || { icon: '🔵', label: event.status, color: '#555' }
        const isLast = i === timeline.length - 1
        return (
          <div key={i} className={`timeline-item ${isLast ? 'latest' : ''}`}>
            <div className="timeline-left">
              <div className="timeline-dot" style={{ background: cfg.color }}>
                <span>{cfg.icon}</span>
              </div>
              {!isLast && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-status" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="timeline-time">
                  {new Date(event.timestamp).toLocaleString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {event.note && <p className="timeline-note">{event.note}</p>}
              {event.updatedBy && (
                <p className="timeline-actor">by {event.updatedBy.name} ({event.updatedBy.role})</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
