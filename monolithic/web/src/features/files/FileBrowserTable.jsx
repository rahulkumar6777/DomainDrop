import { ChevronRight, Download, Folder, LoaderCircle, Trash2 } from 'lucide-react'
import { formatBytes, formatDate } from '../../lib/formatters.js'
import FileKindIcon from './FileKindIcon.jsx'

function FileBrowserTable({ folders, files, busyId, onOpenFolder, onDownload, onDelete }) {
  return (
    <div className="storage-browser directory-browser">
      <div className="directory-browser-head" aria-hidden="true">
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
        <span>Updated</span>
        <span>Status</span>
        <span />
      </div>

      {folders.map((folder) => (
        <div className="directory-browser-entry folder-browser-entry" key={folder.path}>
          <button className="browser-name-button" type="button" onClick={() => onOpenFolder(folder.path)}>
            <span className="browser-folder-kind"><Folder size={18} /></span>
            <span className="browser-name-copy">
              <strong>{folder.name}</strong>
              <small>{folder.fileCount} {folder.fileCount === 1 ? 'object' : 'objects'}</small>
            </span>
          </button>
          <span>Folder</span>
          <span>{formatBytes(folder.size)}</span>
          <span>{formatDate(folder.updatedAt, '--')}</span>
          <span>--</span>
          <button className="browser-open-button" type="button" onClick={() => onOpenFolder(folder.path)} aria-label={`Open ${folder.name}`} title="Open folder">
            <ChevronRight size={17} />
          </button>
        </div>
      ))}

      {files.map((file) => (
        <div className="directory-browser-entry" key={file.id}>
          <div className="browser-file-name">
            <span className="file-kind"><FileKindIcon mimeType={file.mimeType} /></span>
            <span className="browser-name-copy">
              <strong>{file.originalName}</strong>
              <small>{file.mimeType}</small>
            </span>
          </div>
          <span>File</span>
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

export default FileBrowserTable
