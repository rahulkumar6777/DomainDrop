import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CloudUpload, Plus, RefreshCw, Search } from 'lucide-react'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { EmptyState, ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { spacesApi } from '../spaces/spaces.api.js'
import FileTable from './FileTable.jsx'
import UploadFileDialog from './UploadFileDialog.jsx'
import { filesApi } from './files.api.js'
import { uploadFile } from './uploadFile.js'

function FilesPage() {
  const { apiRequest } = useAuth()
  const uploadController = useRef(null)
  const [spaces, setSpaces] = useState([])
  const [files, setFiles] = useState([])
  const [filter, setFilter] = useState('')
  const [spaceFilter, setSpaceFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadSpace, setUploadSpace] = useState('')
  const [uploadPath, setUploadPath] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [spaceResult, fileResult] = await Promise.all([
        spacesApi.list(apiRequest),
        filesApi.list(apiRequest, { limit: 100 }),
      ])
      setSpaces(spaceResult.spaces)
      setFiles(fileResult.files)
      setUploadSpace((current) => current || spaceResult.spaces.find((space) => space.isDefault)?.id || spaceResult.spaces[0]?.id || '')
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

  const spaceNames = useMemo(() => new Map(spaces.map((space) => [space.id, space.name])), [spaces])
  const visibleFiles = files.filter((file) => {
    const matchesSpace = !spaceFilter || file.spaceId === spaceFilter
    const search = filter.trim().toLowerCase()
    return matchesSpace && (!search || file.path.toLowerCase().includes(search))
  })

  const resetUpload = () => {
    setUploadOpen(false)
    setSelectedFile(null)
    setUploadPath('')
    setUploadError('')
    setUploadProgress(0)
  }

  const closeUpload = () => {
    uploadController.current?.abort()
    uploadController.current = null
    resetUpload()
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!selectedFile) return setUploadError('Choose a file to upload')

    const controller = new AbortController()
    uploadController.current = controller
    setUploading(true)
    setUploadError('')
    try {
      await uploadFile({
        apiRequest,
        file: selectedFile,
        spaceId: uploadSpace,
        path: uploadPath,
        onProgress: setUploadProgress,
        signal: controller.signal,
      })
      await load()
      resetUpload()
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setUploadError(requestError.message)
    } finally {
      uploadController.current = null
      setUploading(false)
    }
  }

  const handleDownload = async (file) => {
    setBusyId(file.id)
    try {
      const result = await filesApi.createDownload(apiRequest, file.id)
      const link = document.createElement('a')
      link.href = result.download.url
      link.target = '_blank'
      link.rel = 'noreferrer'
      link.click()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId('')
    }
  }

  const deleteFile = async () => {
    const file = pendingDelete
    setBusyId(file.id)
    try {
      await filesApi.delete(apiRequest, file.id)
      setFiles((current) => current.filter((item) => item.id !== file.id))
      setPendingDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="app-page">
      <AppPageHeader
        eyebrow="Objects"
        title="Files"
        copy="Upload directly to your bucket and keep paths organized inside spaces."
        action={<button className="button button-small button-dark" type="button" onClick={() => setUploadOpen(true)}><Plus size={16} /> Upload</button>}
      />

      <div className="file-toolbar">
        <label className="search-control"><Search size={17} /><input type="search" placeholder="Search paths" value={filter} onChange={(event) => setFilter(event.target.value)} /></label>
        <select value={spaceFilter} onChange={(event) => setSpaceFilter(event.target.value)} aria-label="Filter by space">
          <option value="">All spaces</option>
          {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
        </select>
        <span className="toolbar-count">{visibleFiles.length} {visibleFiles.length === 1 ? 'file' : 'files'}</span>
        <button className="icon-button" type="button" onClick={load} aria-label="Refresh files" title="Refresh files"><RefreshCw size={17} /></button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState label="Loading files" /> : visibleFiles.length ? (
        <FileTable files={visibleFiles} spaceNames={spaceNames} busyId={busyId} onDownload={handleDownload} onDelete={setPendingDelete} />
      ) : (
        <EmptyState icon={CloudUpload} title="No matching files" copy="Upload a file or change the current filters." action={<button className="button button-small button-dark" type="button" onClick={() => setUploadOpen(true)}>Upload file</button>} />
      )}

      {uploadOpen && (
        <UploadFileDialog
          spaces={spaces}
          selectedFile={selectedFile}
          spaceId={uploadSpace}
          path={uploadPath}
          progress={uploadProgress}
          error={uploadError}
          uploading={uploading}
          onFileChange={(event) => {
            const file = event.target.files?.[0] || null
            setSelectedFile(file)
            setUploadPath(file?.name || '')
            setUploadError('')
          }}
          onSpaceChange={(event) => setUploadSpace(event.target.value)}
          onPathChange={(event) => setUploadPath(event.target.value)}
          onSubmit={handleUpload}
          onClose={closeUpload}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete file?"
          copy={`${pendingDelete.path} will be removed from the bucket and cannot be recovered.`}
          confirmLabel="Delete file"
          onConfirm={deleteFile}
          onClose={() => setPendingDelete(null)}
          busy={busyId === pendingDelete.id}
        />
      )}
    </div>
  )
}

export default FilesPage
