import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Plus, ShieldCheck } from 'lucide-react'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { EmptyState, ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { formatDate } from '../../lib/formatters.js'
import CreateApiKeyDialog from './CreateApiKeyDialog.jsx'
import { apiKeysApi } from './apiKeys.api.js'
import { allApiKeyScopes } from './apiKeyScopes.js'

const emptyForm = { name: '', scopes: allApiKeyScopes, expiresAt: '' }

function ApiKeysPage() {
  const { apiRequest } = useAuth()
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rawKey, setRawKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [pendingRevoke, setPendingRevoke] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await apiKeysApi.list(apiRequest)
      setKeys(result.keys)
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

  const closeCreate = () => {
    if (saving) return
    setCreating(false)
    setRawKey('')
    setCopied(false)
    setError('')
    setForm(emptyForm)
  }

  const createKey = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const result = await apiKeysApi.create(apiRequest, {
        apiKeyName: form.name,
        apiKeyScope: form.scopes,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      })
      setRawKey(result.apiKey)
      setKeys((current) => [result.key, ...current])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const revokeKey = async () => {
    setSaving(true)
    try {
      await apiKeysApi.revoke(apiRequest, pendingRevoke.id)
      setKeys((current) => current.map((key) => key.id === pendingRevoke.id ? { ...key, status: 'revoked' } : key))
      setPendingRevoke(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-page">
      <AppPageHeader
        eyebrow="Developer access"
        title="API keys"
        copy="Server-side credentials for the REST API and SDKs."
        action={<button className="button button-small button-dark" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Create key</button>}
      />
      <div className="security-note"><ShieldCheck size={18} /><div><strong>Keys are shown once</strong><span>Only the prefix remains visible after creation. Keep full keys outside browser code.</span></div></div>
      {error && !creating && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState label="Loading API keys" /> : keys.length ? (
        <div className="api-key-list">
          {keys.map((key) => (
            <article key={key.id}>
              <span className="key-icon"><KeyRound size={18} /></span>
              <div className="key-main">
                <div><h2>{key.name}</h2><span className={`status-dot ${key.status}`}>{key.status}</span></div>
                <code>{key.keyPrefix}...</code>
                <p>{key.scopes.join(' / ')}</p>
                <small>Created {formatDate(key.createdAt)} | Last used {formatDate(key.lastUsedAt)} | Expires {formatDate(key.expiresAt, 'Never')}</small>
              </div>
              {key.status === 'active' && <button className="button button-small button-outline danger-text" type="button" onClick={() => setPendingRevoke(key)}>Revoke</button>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={KeyRound} title="No API keys" copy="Create a scoped key when your server or package needs API access." action={<button className="button button-small button-dark" type="button" onClick={() => setCreating(true)}>Create key</button>} />
      )}

      {creating && (
        <CreateApiKeyDialog
          form={form}
          rawKey={rawKey}
          error={error}
          saving={saving}
          copied={copied}
          onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))}
          onToggleScope={(scope) => setForm((current) => ({ ...current, scopes: current.scopes.includes(scope) ? current.scopes.filter((item) => item !== scope) : [...current.scopes, scope] }))}
          onCopy={async () => {
            await navigator.clipboard.writeText(rawKey)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          }}
          onSubmit={createKey}
          onClose={closeCreate}
        />
      )}

      {pendingRevoke && (
        <ConfirmDialog
          title="Revoke API key?"
          copy={`${pendingRevoke.name} will stop authenticating immediately.`}
          confirmLabel="Revoke key"
          onConfirm={revokeKey}
          onClose={() => setPendingRevoke(null)}
          busy={saving}
        />
      )}
    </div>
  )
}

export default ApiKeysPage
