import StatusBadge from '../StatusBadge/StatusBadge'
import './IssueCard.css'

const IssueCard = ({ issue }) => {
  const { title, category, location, status, description, createdAt } = issue

  return (
    <div className="issue-card">
      <div className="issue-card-header">
        <h3 className="issue-title">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="issue-category">📂 {category}</p>
      <p className="issue-location">📍 {location}</p>
      {description && <p className="issue-desc">{description}</p>}
      <p className="issue-date">🕐 {new Date(createdAt).toLocaleDateString('en-KE', {
        year: 'numeric', month: 'short', day: 'numeric'
      })}</p>
    </div>
  )
}

export default IssueCard
