import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CloudUpload, FolderOpen, Plus, RefreshCw, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ConfirmDialog } from '../../components/app/AppModal.jsx'
import { EmptyState, ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { spacesApi } from '../spaces/spaces.api.js'
import FileBrowserBreadcrumbs from './FileBrowserBreadcrumbs.jsx'
import FileBrowserTable from './FileBrowserTable.jsx'
import SpaceBrowser from './SpaceBrowser.jsx'
import UploadFileDialog from './UploadFileDialog.jsx'
import {
  buildDirectoryEntries,
  buildSpaceEntries,
  getParentDirectory,
  joinDirectoryPath,
  normalizeDirectoryPath,
} from './fileBrowser.js'
import { filesApi } from './files.api.js'
import { uploadFile } from './uploadFile.js'

function FilesPage() {
  const { apiRequest } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const uploadController = useRef(null)
  const [spaces, setSpaces] = useState([])
  const [files, setFiles] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadSpace, setUploadSpace] = useState('')
  const [uploadBasePath, setUploadBasePath] = useState('')
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
      const nextSpaces = spaceResult.spaces || []
      setSpaces(nextSpaces)
      setFiles(fileResult.files || [])
      setUploadSpace((current) => (
        nextSpaces.some((space) => space.id === current)
          ? current
          : nextSpaces.find((space) => space.isDefault)?.id || nextSpaces[0]?.id || ''
      ))
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

  const selectedSpaceId = searchParams.get('space') || ''
  const currentPath = normalizeDirectoryPath(searchParams.get('path') || '')
  const activeSpace = spaces.find((space) => space.id === selectedSpaceId) || null

  useEffect(() => {
    if (!loading && selectedSpaceId && !activeSpace) {
      setSearchParams({}, { replace: true })
    }
  }, [activeSpace, loading, selectedSpaceId, setSearchParams])

  const spaceEntries = useMemo(() => buildSpaceEntries(spaces, files), [spaces, files])
  const directoryEntries = useMemo(
    () => buildDirectoryEntries(files, activeSpace?.id, currentPath),
    [activeSpace?.id, currentPath, files],
  )
  const search = filter.trim().toLowerCase()
  const visibleSpaces = spaceEntries.filter((space) => (
    !search
    || String(space.name).toLowerCase().includes(search)
    || String(space.id).toLowerCase().includes(search)
  ))
  const visibleFolders = directoryEntries.folders.filter((folder) => (
    !search || folder.name.toLowerCase().includes(search)
  ))
  const visibleFiles = directoryEntries.files.filter((file) => (
    !search
    || String(file.originalName).toLowerCase().includes(search)
    || String(file.mimeType || '').toLowerCase().includes(search)
  ))

  const navigateToLocation = useCallback((spaceId, path = '') => {
    const nextParams = new URLSearchParams()
    const nextPath = normalizeDirectoryPath(path)
    if (spaceId) nextParams.set('space', spaceId)
    if (spaceId && nextPath) nextParams.set('path', nextPath)
    setSearchParams(nextParams)
    setFilter('')
  }, [setSearchParams])

  const navigateBack = () => {
    if (!activeSpace) return
    if (currentPath) {
      navigateToLocation(activeSpace.id, getParentDirectory(currentPath))
      return
    }
    navigateToLocation('', '')
  }

  const openUpload = () => {
    const targetSpace = activeSpace?.id
      || spaces.find((space) => space.isDefault)?.id
      || spaces[0]?.id
      || ''
    const targetPath = activeSpace ? currentPath : ''

    setSelectedFile(null)
    setUploadSpace(targetSpace)
    setUploadBasePath(targetPath)
    setUploadPath(targetPath ? `${targetPath}/` : '')
    setUploadError('')
    setUploadProgress(0)
    setUploadOpen(true)
  }

  const resetUpload = () => {
    setUploadOpen(false)
    setSelectedFile(null)
    setUploadBasePath('')
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
        copy="Browse your bucket by space and move through nested object paths like folders."
        action={<button className="button button-small button-dark" type="button" onClick={openUpload} disabled={!spaces.length}><Plus size={16} /> Upload</button>}
      />

      <FileBrowserBreadcrumbs space={activeSpace} path={currentPath} onNavigate={navigateToLocation} />

      <div className="file-toolbar">
        {activeSpace && (
          <button
            className="icon-button"
            type="button"
            onClick={navigateBack}
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft size={17} />
          </button>
        )}
        <label className="search-control">
          <Search size={17} />
          <input
            type="search"
            placeholder={activeSpace ? 'Search this folder' : 'Search spaces'}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
        <span className="toolbar-count">
          {activeSpace
            ? `${visibleFolders.length + visibleFiles.length} ${(visibleFolders.length + visibleFiles.length) === 1 ? 'item' : 'items'}`
            : `${visibleSpaces.length} ${visibleSpaces.length === 1 ? 'space' : 'spaces'}`}
        </span>
        <button className="icon-button" type="button" onClick={load} aria-label="Refresh files" title="Refresh files"><RefreshCw size={17} /></button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState label="Loading files" /> : activeSpace ? (
        visibleFolders.length || visibleFiles.length ? (
          <FileBrowserTable
            folders={visibleFolders}
            files={visibleFiles}
            busyId={busyId}
            onOpenFolder={(path) => navigateToLocation(activeSpace.id, path)}
            onDownload={handleDownload}
            onDelete={setPendingDelete}
          />
        ) : (
          <EmptyState
            icon={search ? Search : FolderOpen}
            title={search ? 'No matching items' : currentPath ? 'This folder is empty' : 'This space is empty'}
            copy={search ? 'Try another name in the current folder.' : 'Upload a file here to add the first object.'}
            action={!search && <button className="button button-small button-dark" type="button" onClick={openUpload}>Upload file</button>}
          />
        )
      ) : visibleSpaces.length ? (
        <SpaceBrowser spaces={visibleSpaces} onOpen={navigateToLocation} />
      ) : (
        <EmptyState
          icon={search ? Search : CloudUpload}
          title={search ? 'No matching spaces' : 'No spaces available'}
          copy={search ? 'Try another space name or ID.' : 'Create a space before uploading files.'}
        />
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
            setUploadPath(file
              ? joinDirectoryPath(uploadBasePath, file.name)
              : uploadBasePath ? `${uploadBasePath}/` : '')
            setUploadError('')
          }}
          onSpaceChange={(event) => {
            const nextSpace = event.target.value
            const nextBasePath = nextSpace === activeSpace?.id ? currentPath : ''
            setUploadSpace(nextSpace)
            setUploadBasePath(nextBasePath)
            setUploadPath(selectedFile
              ? joinDirectoryPath(nextBasePath, selectedFile.name)
              : nextBasePath ? `${nextBasePath}/` : '')
          }}
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
