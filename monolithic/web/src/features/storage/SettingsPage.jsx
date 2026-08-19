import { useCallback, useEffect, useState } from 'react'
import { Check, Globe2, LoaderCircle, Lock } from 'lucide-react'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { formatBytes } from '../../lib/formatters.js'
import { storageApi } from './storage.api.js'

function SettingsPage() {
  const { apiRequest } = useAuth()
  const [storage, setStorage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmPublic, setConfirmPublic] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const result = await storageApi.get(apiRequest)
      setStorage(result.storage)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [apiRequest])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const applyPolicy = async (visibility) => {
    if (visibility === storage.policy.appliedVisibility) return
    setSaving(true)
    setError('')
    try {
      const result = await storageApi.updatePolicy(apiRequest, visibility)
      setStorage((current) => ({ ...current, policy: result.policy }))
      setConfirmPublic(false)
    } catch (requestError) {
      setError(requestError.message)
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (error && !storage) return <ErrorState message={error} onRetry={load} />
  if (!storage) return <LoadingState label="Loading bucket settings" />

  const publicBucket = storage.policy.appliedVisibility === 'public-read'

  return (
    <div className="app-page settings-page">
      <AppPageHeader eyebrow="One bucket per account" title="Bucket settings" copy="Visibility applies to every space, path, and file in this bucket." />
      {error && <ErrorState message={error} onRetry={load} />}

      <section className="settings-section">
        <div><h2>Bucket</h2><p>Provisioned object storage assigned to this account.</p></div>
        <dl>
          <div><dt>Name</dt><dd><code>{storage.bucket.name}</code></dd></div>
          <div><dt>Provider</dt><dd>{storage.bucket.provider}</dd></div>
          <div><dt>Status</dt><dd><span className={`status-dot ${storage.status}`}>{storage.status}</span></dd></div>
        </dl>
      </section>

      <section className="settings-section policy-settings">
        <div><h2>File delivery</h2><p>Choose how objects are served. This is a bucket-wide rule.</p></div>
        <div className="policy-choice" role="radiogroup" aria-label="Bucket visibility">
          <button type="button" className={!publicBucket ? 'selected' : ''} onClick={() => applyPolicy('private')} disabled={saving} role="radio" aria-checked={!publicBucket}>
            <Lock size={20} /><span><strong>Private</strong><small>Files require time-limited signed URLs.</small></span>{!publicBucket && <Check size={18} />}
          </button>
          <button type="button" className={publicBucket ? 'selected' : ''} onClick={() => !publicBucket && setConfirmPublic(true)} disabled={saving} role="radio" aria-checked={publicBucket}>
            <Globe2 size={20} /><span><strong>Public read</strong><small>Every file gets a stable public CDN URL.</small></span>{publicBucket && <Check size={18} />}
          </button>
        </div>
        {saving && <div className="policy-saving"><LoaderCircle className="spin" size={16} /> Applying policy to MinIO</div>}
      </section>

      <section className="settings-section quota-settings">
        <div><h2>Plan limits</h2><p>Current hard limits enforced before an upload starts.</p></div>
        <dl>
          <div><dt>Storage</dt><dd>{formatBytes(storage.quota.maxBytes)}</dd></div>
          <div><dt>Objects</dt><dd>{storage.quota.maxObjects.toLocaleString()}</dd></div>
          <div><dt>Max file size</dt><dd>{formatBytes(storage.quota.maxFileSize)}</dd></div>
        </dl>
      </section>

      {confirmPublic && (
        <ConfirmDialog
          title="Make the bucket public?"
          copy="Every current and future file in every space will become readable through its public URL."
          confirmLabel="Make public"
          tone="warning"
          onConfirm={() => applyPolicy('public-read')}
          onClose={() => setConfirmPublic(false)}
          busy={saving}
        />
      )}
    </div>
  )
}

export default SettingsPage
