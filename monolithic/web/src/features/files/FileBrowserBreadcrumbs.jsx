import { ChevronRight, Database } from 'lucide-react'
import { getPathSegments } from './fileBrowser.js'

function FileBrowserBreadcrumbs({ space, path, onNavigate }) {
  const segments = getPathSegments(path)

  return (
    <nav className="file-browser-breadcrumbs" aria-label="File location">
      <button
        type="button"
        className={!space ? 'current' : ''}
        onClick={() => onNavigate('', '')}
        aria-current={!space ? 'page' : undefined}
      >
        <Database size={15} />
        <span>Spaces</span>
      </button>
      {space && (
        <>
          <ChevronRight size={14} aria-hidden="true" />
          <button
            type="button"
            className={!segments.length ? 'current' : ''}
            onClick={() => onNavigate(space.id, '')}
            aria-current={!segments.length ? 'page' : undefined}
          >
            {space.name}
          </button>
        </>
      )}
      {segments.map((segment, index) => {
        const isCurrent = index === segments.length - 1
        return (
          <span className="file-browser-crumb" key={segment.path}>
            <ChevronRight size={14} aria-hidden="true" />
            <button
              type="button"
              className={isCurrent ? 'current' : ''}
              onClick={() => onNavigate(space.id, segment.path)}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {segment.name}
            </button>
          </span>
        )
      })}
    </nav>
  )
}

export default FileBrowserBreadcrumbs
