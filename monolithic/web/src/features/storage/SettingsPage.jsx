import { useCallback, useEffect, useState } from 'react'
import { Check, Globe2, LoaderCircle, Lock, Save, ShieldCheck } from 'lucide-react'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { formatBytes } from '../../lib/formatters.js'
import { storageApi } from './storage.api.js'

const corsMethods = ['GET', 'HEAD', 'PUT', 'POST', 'DELETE']

const corsFormFromStorage = (cors) => {
  const configuration = cors?.configuration || {}
  return {
    allowedOrigins: (configuration.allowedOrigins || []).join('\n'),
    allowedMethods: configuration.allowedMethods || ['GET', 'HEAD', 'PUT'],
    allowedHeaders: (configuration.allowedHeaders || ['*']).join(', '),
    exposeHeaders: (configuration.exposeHeaders || ['ETag']).join(', '),
    maxAgeSeconds: String(configuration.maxAgeSeconds ?? 3600),
  }
}

const splitValues = (value) => [...new Set(
  value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
)]

function SettingsPage() {
  const { apiRequest } = useAuth()
  const [storage, setStorage] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingCors, setSavingCors] = useState(false)
  const [corsForm, setCorsForm] = useState(() => corsFormFromStorage())
  const [confirmPublic, setConfirmPublic] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const result = await storageApi.get(apiRequest)
      setStorage(result.storage)
      setCorsForm(corsFormFromStorage(result.storage.cors))
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

  const toggleCorsMethod = (method) => {
    setCorsForm((current) => ({
      ...current,
      allowedMethods: current.allowedMethods.includes(method)
        ? current.allowedMethods.filter((value) => value !== method)
        : [...current.allowedMethods, method],
    }))
  }

  const saveCors = async (event) => {
    event.preventDefault()
    if (corsForm.allowedMethods.length === 0) {
      setError('Select at least one allowed method')
      return
    }

    setSavingCors(true)
    setError('')
    try {
      const result = await storageApi.updateCors(apiRequest, {
        allowedOrigins: splitValues(corsForm.allowedOrigins),
        allowedMethods: corsForm.allowedMethods,
        allowedHeaders: splitValues(corsForm.allowedHeaders),
        exposeHeaders: splitValues(corsForm.exposeHeaders),
        maxAgeSeconds: Number(corsForm.maxAgeSeconds),
      })
      setStorage((current) => ({ ...current, cors: result.cors }))
      setCorsForm(corsFormFromStorage(result.cors))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingCors(false)
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

      <section className="settings-section cors-settings">
        <div><h2>Browser access</h2><p>Bucket-level CORS used by direct browser uploads and object delivery.</p></div>
        <form className="cors-form" onSubmit={saveCors}>
          <div className="cors-required-origin">
            <span><ShieldCheck size={18} /></span>
            <div><small>Default origin</small><code>{storage.cors.defaultOrigin}</code></div>
            <strong><Lock size={12} /> Required</strong>
          </div>

          <label htmlFor="cors-origins">Additional origins</label>
          <textarea
            id="cors-origins"
            rows={4}
            value={corsForm.allowedOrigins}
            onChange={(event) => setCorsForm((current) => ({ ...current, allowedOrigins: event.target.value }))}
            placeholder={'https://app.example.com\nhttps://*.example.com'}
            disabled={savingCors}
          />

          <fieldset>
            <legend>Allowed methods</legend>
            <div className="cors-methods">
              {corsMethods.map((method) => (
                <label key={method}>
                  <input
                    type="checkbox"
                    checked={corsForm.allowedMethods.includes(method)}
                    onChange={() => toggleCorsMethod(method)}
                    disabled={savingCors}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="cors-field-grid">
            <label>
              <span>Allowed headers</span>
              <input
                value={corsForm.allowedHeaders}
                onChange={(event) => setCorsForm((current) => ({ ...current, allowedHeaders: event.target.value }))}
                placeholder="*"
                disabled={savingCors}
              />
            </label>
            <label>
              <span>Exposed headers</span>
              <input
                value={corsForm.exposeHeaders}
                onChange={(event) => setCorsForm((current) => ({ ...current, exposeHeaders: event.target.value }))}
                placeholder="ETag"
                disabled={savingCors}
              />
            </label>
            <label>
              <span>Preflight cache (seconds)</span>
              <input
                type="number"
                min="0"
                max="86400"
                step="1"
                value={corsForm.maxAgeSeconds}
                onChange={(event) => setCorsForm((current) => ({ ...current, maxAgeSeconds: event.target.value }))}
                disabled={savingCors}
              />
            </label>
          </div>

          <div className="cors-actions">
            <span className={`status-dot ${storage.cors.status}`}>{storage.cors.status}</span>
            <button className="button button-small button-dark" type="submit" disabled={savingCors || corsForm.allowedMethods.length === 0}>
              {savingCors ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}
              Save CORS
            </button>
          </div>
        </form>
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
