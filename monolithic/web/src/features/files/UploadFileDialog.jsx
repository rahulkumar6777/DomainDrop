import { useRef } from 'react'
import { AlertCircle, CloudUpload, LoaderCircle } from 'lucide-react'
import AppModal from '../../components/app/AppModal.jsx'
import { formatBytes } from '../../lib/formatters.js'

function UploadFileDialog({
  spaces,
  selectedFile,
  spaceId,
  path,
  progress,
  error,
  uploading,
  onFileChange,
  onSpaceChange,
  onPathChange,
  onSubmit,
  onClose,
}) {
  const inputRef = useRef(null)

  return (
    <AppModal title="Upload a file" copy="Bytes go directly from this browser to your MinIO bucket." onClose={onClose}>
      <form className="app-form" onSubmit={onSubmit}>
        {error && <div className="inline-error" role="alert"><AlertCircle size={16} />{error}</div>}
        <label>File</label>
        <button className="file-picker" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <CloudUpload size={22} />
          <span>{selectedFile ? selectedFile.name : 'Choose a file'}</span>
          <small>{selectedFile ? formatBytes(selectedFile.size) : 'Small and multipart uploads are supported'}</small>
        </button>
        <input ref={inputRef} className="visually-hidden" type="file" onChange={onFileChange} />

        <label htmlFor="upload-space">Space</label>
        <select id="upload-space" value={spaceId} onChange={onSpaceChange} required disabled={uploading}>
          {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}{space.isDefault ? ' (default)' : ''}</option>)}
        </select>

        <label htmlFor="upload-path">Object path</label>
        <input id="upload-path" value={path} onChange={onPathChange} placeholder="images/avatar.png" required disabled={uploading} />

        {uploading && (
          <div className="upload-progress" aria-live="polite">
            <div><span>Uploading to MinIO</span><strong>{progress}%</strong></div>
            <div><span style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        <div className="modal-actions">
          <button className="button button-small button-outline" type="button" onClick={onClose}>
            {uploading ? 'Cancel upload' : 'Cancel'}
          </button>
          <button className="button button-small button-dark" type="submit" disabled={uploading || !spaces.length}>
            {uploading ? <><LoaderCircle className="spin" size={16} /> Uploading</> : <><CloudUpload size={16} /> Start upload</>}
          </button>
        </div>
      </form>
    </AppModal>
  )
}

export default UploadFileDialog
