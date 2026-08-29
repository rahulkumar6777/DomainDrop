import { useCallback, useEffect, useState } from 'react'
import {
  Clock3,
  Laptop,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { EmptyState, ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { sessionsApi } from './sessions.api.js'
import './sessions.css'

const sessionDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const formatSessionDate = (value) => value
  ? sessionDateFormatter.format(new Date(value))
  : 'Not available'

function DeviceIcon({ device }) {
  const normalizedDevice = device?.toLowerCase() || ''
  const Icon = normalizedDevice.includes('iphone') || normalizedDevice.includes('android')
    ? Smartphone
    : Laptop

  return <Icon size={20} aria-hidden="true" />
}

function SessionsPage() {
  const navigate = useNavigate()
  const { apiRequest, logout } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingSession, setPendingSession] = useState(null)
  const [confirmOthers, setConfirmOthers] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await sessionsApi.list(apiRequest)
      setSessions(result.sessions || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const revokeSelectedSession = async () => {
    if (!pendingSession) return

    setSaving(true)
    setError('')
    try {
      await sessionsApi.revoke(apiRequest, pendingSession.id)

      if (pendingSession.isCurrent) {
        await logout().catch(() => undefined)
        navigate('/login?sessionRevoked=1', { replace: true })
        return
      }

      setSessions((current) => current.filter((session) => session.id !== pendingSession.id))
      setPendingSession(null)
    } catch (requestError) {
      setError(requestError.message)
      setPendingSession(null)
    } finally {
      setSaving(false)
    }
  }

  const revokeOtherSessions = async () => {
    setSaving(true)
    setError('')
    try {
      await sessionsApi.revokeOthers(apiRequest)
      setSessions((current) => current.filter((session) => session.isCurrent))
      setConfirmOthers(false)
    } catch (requestError) {
      setError(requestError.message)
      setConfirmOthers(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Loading active sessions" />
  if (error && sessions.length === 0) return <ErrorState message={error} onRetry={load} />

  const otherSessionCount = sessions.filter((session) => !session.isCurrent).length

  return (
    <div className="app-page sessions-page">
      <AppPageHeader
        eyebrow="Account security"
        title="Active sessions"
        copy="Review the devices currently allowed to access your DomainDrop account."
        action={otherSessionCount > 0 ? (
          <button
            className="button button-small button-outline danger-text"
            type="button"
            onClick={() => setConfirmOthers(true)}
          >
            <LogOut size={16} />
            Sign out other sessions
          </button>
        ) : null}
      />

      <div className="security-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Session revocation is immediate</strong>
          <span>A revoked device cannot keep using its access token or refresh its session.</span>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {sessions.length > 0 ? (
        <div className="session-list">
          {sessions.map((session) => (
            <article className="session-item" key={session.id}>
              <span className="session-device-icon">
                <DeviceIcon device={session.device} />
              </span>

              <div className="session-main">
                <div className="session-title-row">
                  <h2>{session.device || 'Unknown device'}</h2>
                  {session.isCurrent && <span className="session-current">Current session</span>}
                </div>

                <p className="session-agent">{session.userAgent || 'Browser details were not recorded'}</p>

                <dl className="session-meta">
                  <div>
                    <dt>IP address</dt>
                    <dd>{session.ip || 'Not recorded'}</dd>
                  </div>
                  <div>
                    <dt>Last active</dt>
                    <dd><time dateTime={session.lastActiveAt || undefined}>{formatSessionDate(session.lastActiveAt)}</time></dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd><time dateTime={session.createdAt || undefined}>{formatSessionDate(session.createdAt)}</time></dd>
                  </div>
                  <div>
                    <dt>Expires</dt>
                    <dd><time dateTime={session.expiresAt || undefined}>{formatSessionDate(session.expiresAt)}</time></dd>
                  </div>
                </dl>
              </div>

              <button
                className="button button-small button-outline danger-text session-revoke"
                type="button"
                onClick={() => setPendingSession(session)}
              >
                {session.isCurrent ? 'Sign out' : 'Revoke'}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MonitorSmartphone}
          title="No active sessions"
          copy="Log in again to create a new account session."
        />
      )}

      <div className="session-footnote">
        <Clock3 size={16} />
        <span>Last activity updates when a refresh session rotates.</span>
      </div>

      {pendingSession && (
        <ConfirmDialog
          title={pendingSession.isCurrent ? 'Sign out this session?' : 'Revoke this session?'}
          copy={pendingSession.isCurrent
            ? 'This browser will lose account access and return to the login page.'
            : `${pendingSession.device || 'This device'} will need to log in again.`}
          confirmLabel={pendingSession.isCurrent ? 'Sign out' : 'Revoke session'}
          onConfirm={revokeSelectedSession}
          onClose={() => setPendingSession(null)}
          busy={saving}
        />
      )}

      {confirmOthers && (
        <ConfirmDialog
          title="Sign out other sessions?"
          copy={`${otherSessionCount} other ${otherSessionCount === 1 ? 'session' : 'sessions'} will be revoked. This device will stay signed in.`}
          confirmLabel="Sign out others"
          onConfirm={revokeOtherSessions}
          onClose={() => setConfirmOthers(false)}
          busy={saving}
        />
      )}
    </div>
  )
}

export default SessionsPage
