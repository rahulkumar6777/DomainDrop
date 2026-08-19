import { Globe2, Link2, Lock } from 'lucide-react'
import CodeBlock from '../components/CodeBlock.jsx'
import DocsPageHeader from '../components/DocsPageHeader.jsx'

const privateResponse = JSON.stringify({
  success: true,
  download: { url: 'https://minio.internal/...signed...', type: 'signed', expiresAt: '2026-08-20T10:35:00.000Z' },
}, null, 2)

const publicResponse = JSON.stringify({
  success: true,
  download: { url: 'https://cdn.example.com/dd-user-.../spc_.../image.webp', type: 'public', expiresAt: null },
}, null, 2)

function DeliveryGuidePage() {
  return (
    <article className="docs-page">
      <DocsPageHeader eyebrow="Guide" title="File delivery" copy="The bucket has one visibility policy. Spaces and paths do not override it." />

      <section className="delivery-doc-grid">
        <div><Lock size={21} /><h2>Private</h2><p>Request a short-lived signed URL when an authorized user needs the file.</p><code>private</code></div>
        <div><Globe2 size={21} /><h2>Public read</h2><p>Use the stable CDN URL. Every object in the user bucket is readable.</p><code>public-read</code></div>
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">One endpoint</p>
        <h2>Let the API choose the URL type.</h2>
        <p>Call <code>POST /api/v1/files/:fileId/signed-url</code>. The response follows the currently applied bucket policy, so clients do not need separate private and public logic.</p>
      </section>

      <div className="response-comparison">
        <CodeBlock code={privateResponse} language="json" title="Private response" />
        <CodeBlock code={publicResponse} language="json" title="Public response" />
      </div>

      <div className="docs-callout warning">
        <Link2 size={19} />
        <div><strong>Public means the whole bucket</strong><span>Changing to public-read exposes existing and future objects across the default and every custom space.</span></div>
      </div>
    </article>
  )
}

export default DeliveryGuidePage
