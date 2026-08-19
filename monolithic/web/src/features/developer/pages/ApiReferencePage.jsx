import { Navigate } from 'react-router-dom'
import DocsPageHeader from '../components/DocsPageHeader.jsx'
import EndpointReference from '../components/EndpointReference.jsx'
import { apiReference } from '../apiReference.js'

function ApiReferencePage({ group }) {
  const reference = apiReference[group]
  if (!reference) return <Navigate to="/developer/api/files" replace />

  return (
    <article className="docs-page">
      <DocsPageHeader eyebrow={reference.eyebrow} title={reference.title} copy={reference.copy} />
      <div className="reference-intro">
        <span>Base URL</span>
        <code>https://api.domaindrop.dev</code>
      </div>
      <section className="endpoint-reference-list">
        {reference.endpoints.map((endpoint, index) => (
          <EndpointReference key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} defaultOpen={index === 0} />
        ))}
      </section>
    </article>
  )
}

export default ApiReferencePage
