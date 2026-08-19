import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react'

export function LoadingState({ label = 'Loading workspace' }) {
  return (
    <div className="app-state" role="status">
      <LoaderCircle className="spin" size={24} />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="app-state app-state-error" role="alert">
      <AlertCircle size={22} />
      <div>
        <strong>Could not load this view</strong>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="button button-small button-outline" type="button" onClick={onRetry}>
          <RefreshCw size={15} /> Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, copy, action }) {
  return (
    <div className="app-empty">
      <span><Icon size={22} /></span>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action}
    </div>
  )
}
