import { ChevronRight, FolderKanban } from 'lucide-react'
import { formatBytes, formatDate } from '../../lib/formatters.js'

function SpaceBrowser({ spaces, onOpen }) {
  return (
    <div className="storage-browser space-browser">
      <div className="space-browser-head" aria-hidden="true">
        <span>Space</span>
        <span>Objects</span>
        <span>Usage</span>
        <span>Updated</span>
        <span />
      </div>
      {spaces.map((space) => (
        <div className="space-browser-entry" key={space.id}>
          <button className="browser-name-button" type="button" onClick={() => onOpen(space.id, '')}>
            <span className="browser-folder-kind"><FolderKanban size={18} /></span>
            <span className="browser-name-copy">
              <span className="browser-title-line">
                <strong>{space.name}</strong>
                {space.isDefault && <span className="default-badge">Default</span>}
              </span>
              <small>{space.id}</small>
            </span>
          </button>
          <span>{space.fileCount} {space.fileCount === 1 ? 'object' : 'objects'}</span>
          <span>{formatBytes(space.size)}</span>
          <span>{formatDate(space.updatedAt, 'Empty')}</span>
          <button className="browser-open-button" type="button" onClick={() => onOpen(space.id, '')} aria-label={`Open ${space.name}`} title="Open space">
            <ChevronRight size={17} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default SpaceBrowser
