import './StatusBadge.css'

const statusMap = {
  pending:     { label: 'Pending',     color: 'warning' },
  'in-progress': { label: 'In Progress', color: 'info'    },
  resolved:    { label: 'Resolved',    color: 'success'  },
  rejected:    { label: 'Rejected',    color: 'danger'   },
}

const StatusBadge = ({ status }) => {
  const config = statusMap[status] || { label: status, color: 'default' }

  return (
    <span className={`status-badge status-${config.color}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge
