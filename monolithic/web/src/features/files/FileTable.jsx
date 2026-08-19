import { Download, File, FileImage, FileText, LoaderCircle, Trash2 } from 'lucide-react'
import { formatBytes, formatDate } from '../../lib/formatters.js'

function FileKindIcon({ mimeType }) {
  const Icon = mimeType?.startsWith('image/')
    ? FileImage
    : mimeType?.includes('text') || mimeType?.includes('pdf')
      ? FileText
      : File
  return <Icon size={17} />
}

function FileTable({ files, spaceNames, busyId, onDownload, onDelete }) {
  return (
    <div className="data-table file-data-table">
      <div className="data-table-head">
        <span>Name and path</span><span>Space</span><span>Size</span>
        <span>Uploaded</span><span>Status</span><span />
      </div>
      {files.map((file) => (
        <div className="data-row" key={file.id}>
          <div className="file-name-cell">
            <span className="file-kind"><FileKindIcon mimeType={file.mimeType} /></span>
            <div><strong>{file.originalName}</strong><small>{file.path}</small></div>
          </div>
          <span>{spaceNames.get(file.spaceId) || 'Unknown'}</span>
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.uploadedAt || file.createdAt)}</span>
          <span><span className={`status-dot ${file.status}`}>{file.status}</span></span>
          <div className="row-actions">
            {file.status === 'ready' && (
              <button className="icon-button" type="button" onClick={() => onDownload(file)} disabled={busyId === file.id} aria-label={`Open ${file.originalName}`} title="Open file">
                <Download size={16} />
              </button>
            )}
            <button className="icon-button danger" type="button" onClick={() => onDelete(file)} disabled={busyId === file.id} aria-label={`Delete ${file.originalName}`} title="Delete file">
              {busyId === file.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export { FileKindIcon }
export default FileTable
