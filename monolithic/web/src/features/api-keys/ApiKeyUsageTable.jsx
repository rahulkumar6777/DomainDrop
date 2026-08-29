import { Activity } from 'lucide-react'
import { EmptyState } from '../../components/app/AppStates.jsx'

const requestDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
})

const formatTimestamp = (value) => value
  ? requestDateFormatter.format(new Date(value))
  : 'Not available'

function ApiKeyUsageTable({ usage }) {
  if (!usage.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No requests found"
        copy="Requests made with this API key will appear here after the usage worker saves them."
      />
    )
  }

  return (
    <div className="usage-table">
      <div className="usage-table-head" aria-hidden="true">
        <span>Time</span>
        <span>Request</span>
        <span>Status</span>
        <span>Duration</span>
        <span>IP address</span>
      </div>

      {usage.map((item) => (
        <div className="usage-row" key={item.id}>
          <time dateTime={item.timestamp}>{formatTimestamp(item.timestamp)}</time>
          <div className="usage-request">
            <span className={`usage-method method-${item.method?.toLowerCase()}`}>{item.method}</span>
            <code title={item.endpoint}>{item.endpoint}</code>
          </div>
          <span className={`usage-status status-${Math.floor(item.statusCode / 100)}xx`}>{item.statusCode}</span>
          <span>{Math.round(item.durationMs)} ms</span>
          <code className="usage-ip">{item.ipAddress || 'Not recorded'}</code>
        </div>
      ))}
    </div>
  )
}

export default ApiKeyUsageTable
