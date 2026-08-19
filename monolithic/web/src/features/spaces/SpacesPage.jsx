import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { formatDate } from '../../lib/formatters.js'
import SpaceDialog from './SpaceDialog.jsx'
import { spacesApi } from './spaces.api.js'

const emptyForm = { name: '', description: '' }

function SpacesPage() {
  const { apiRequest } = useAuth()
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await spacesApi.list(apiRequest)
      setSpaces(result.spaces)
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

  const openCreate = () => {
    setEditing({ mode: 'create' })
    setForm(emptyForm)
    setError('')
  }

  const openEdit = (space) => {
    setEditing({ mode: 'edit', space })
    setForm({ name: space.name, description: space.description || '' })
    setError('')
  }

  const saveSpace = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing.mode === 'create') await spacesApi.create(apiRequest, form)
      else await spacesApi.update(apiRequest, editing.space.id, form)
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteSpace = async () => {
    setSaving(true)
    try {
      await spacesApi.delete(apiRequest, pendingDelete.id)
      setSpaces((current) => current.filter((space) => space.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const copySpaceId = async (spaceId) => {
    await navigator.clipboard.writeText(spaceId)
    setCopiedId(spaceId)
    window.setTimeout(() => {
      setCopiedId((current) => current === spaceId ? '' : current)
    }, 1500)
  }

  return (
    <div className="app-page">
      <AppPageHeader
        eyebrow="Organization"
        title="Spaces"
        copy="Logical separators inside your bucket. Copy a Space ID for REST API or SDK uploads."
        action={<button className="button button-small button-dark" type="button" onClick={openCreate}><Plus size={16} /> New space</button>}
      />
      {error && !editing && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState label="Loading spaces" /> : (
        <div className="space-list">
          {spaces.map((space) => (
            <article key={space.id}>
              <span className="space-icon"><FolderKanban size={19} /></span>
              <div>
                <div className="space-title-row"><h2>{space.name}</h2>{space.isDefault && <span className="default-badge">Default</span>}</div>
                <p>{space.description || 'No description'}</p>
                <div className="space-meta">
                  <span className="space-id">
                    <span>Space ID</span>
                    <code>{space.id}</code>
                    <button
                      type="button"
                      onClick={() => copySpaceId(space.id)}
                      aria-label={copiedId === space.id ? `Space ID copied for ${space.name}` : `Copy Space ID for ${space.name}`}
                      title={copiedId === space.id ? 'Copied' : 'Copy Space ID'}
                    >
                      {copiedId === space.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </span>
                  <small>Created {formatDate(space.createdAt)}</small>
                </div>
              </div>
              {!space.isDefault && (
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => openEdit(space)} aria-label={`Edit ${space.name}`} title="Edit space"><Pencil size={16} /></button>
                  <button className="icon-button danger" type="button" onClick={() => setPendingDelete(space)} aria-label={`Delete ${space.name}`} title="Delete space"><Trash2 size={16} /></button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {editing && (
        <SpaceDialog
          mode={editing.mode}
          form={form}
          error={error}
          saving={saving}
          onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))}
          onSubmit={saveSpace}
          onClose={() => setEditing(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete space?"
          copy={`${pendingDelete.name} must be empty before it can be deleted.`}
          confirmLabel="Delete space"
          onConfirm={deleteSpace}
          onClose={() => setPendingDelete(null)}
          busy={saving}
        />
      )}
    </div>
  )
}

export default SpacesPage
