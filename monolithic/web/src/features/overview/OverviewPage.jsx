import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CloudUpload, FileText, FolderKanban, Globe2, HardDrive, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { EmptyState, ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { formatBytes } from '../../lib/formatters.js'
import FileKindIcon from '../files/FileKindIcon.jsx'
import { filesApi } from '../files/files.api.js'
import { spacesApi } from '../spaces/spaces.api.js'
import { storageApi } from '../storage/storage.api.js'

function OverviewPage() {
  const { apiRequest } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [storage, spaces, files] = await Promise.all([
        storageApi.get(apiRequest),
        spacesApi.list(apiRequest),
        filesApi.list(apiRequest, { limit: 6 }),
      ])
      setData({ storage: storage.storage, spaces: spaces.spaces, files: files.files })
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [apiRequest])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  if (error && !data) return <ErrorState message={error} onRetry={load} />
  if (!data) return <LoadingState />

  const { storage, spaces, files } = data
  const usagePercent = storage.quota.maxBytes
    ? Math.min(100, (storage.usage.bytes / storage.quota.maxBytes) * 100)
    : 0
  const publicBucket = storage.policy.appliedVisibility === 'public-read'

  return (
    <div className="app-page">
      <AppPageHeader
        eyebrow="Your storage"
        title="Everything in one bucket."
        copy="Spaces organize paths; the bucket policy controls delivery for every file."
        action={<Link className="button button-small button-dark" to="/app/storage/files"><CloudUpload size={16} /> Upload file</Link>}
      />

      <section className="overview-stats" aria-label="Storage summary">
        <div><HardDrive size={19} /><span>Storage used</span><strong>{formatBytes(storage.usage.bytes)}</strong><small>of {formatBytes(storage.quota.maxBytes)}</small></div>
        <div><FileText size={19} /><span>Objects</span><strong>{storage.usage.objects}</strong><small>of {storage.quota.maxObjects.toLocaleString()}</small></div>
        <div><FolderKanban size={19} /><span>Spaces</span><strong>{spaces.length}</strong><small>including default</small></div>
        <div>{publicBucket ? <Globe2 size={19} /> : <Lock size={19} />}<span>Delivery</span><strong>{publicBucket ? 'Public' : 'Private'}</strong><small>bucket-wide policy</small></div>
      </section>

      <section className="usage-panel">
        <div className="panel-heading">
          <div><h2>Storage usage</h2><p>{formatBytes(storage.usage.bytes)} used across {storage.usage.objects} objects</p></div>
          <span>{usagePercent.toFixed(1)}%</span>
        </div>
        <div className="usage-track"><span style={{ width: `${usagePercent}%` }} /></div>
      </section>

      <section className="dashboard-section">
        <div className="panel-heading">
          <div><h2>Recent files</h2><p>Latest activity across all spaces</p></div>
          <Link to="/app/storage/files">View all <ArrowRight size={15} /></Link>
        </div>
        {files.length ? (
          <div className="compact-file-list">
            {files.map((file) => (
              <div key={file.id}>
                <span className="file-kind"><FileKindIcon mimeType={file.mimeType} /></span>
                <div><strong>{file.originalName}</strong><small>{file.path}</small></div>
                <span>{formatBytes(file.size)}</span>
                <span className={`status-dot ${file.status}`}>{file.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={CloudUpload} title="No files yet" copy="Upload your first object into the default space." action={<Link className="button button-small button-dark" to="/app/storage/files">Open files</Link>} />
        )}
      </section>
    </div>
  )
}

export default OverviewPage
