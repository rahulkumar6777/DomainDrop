import { CheckCircle2, FileUp, RefreshCw, Split } from 'lucide-react'
import CodeBlock from '../components/CodeBlock.jsx'
import DocsPageHeader from '../components/DocsPageHeader.jsx'

const createTicket = JSON.stringify({
  spaceId: '66c4...713',
  path: 'videos/launch.mp4',
  size: 125829120,
  mimeType: 'video/mp4',
}, null, 2)

const completeParts = JSON.stringify({
  parts: [
    { partNumber: 1, etag: '"part-one-etag"' },
    { partNumber: 2, etag: '"part-two-etag"' },
  ],
}, null, 2)

function UploadGuidePage() {
  return (
    <article className="docs-page">
      <DocsPageHeader eyebrow="Guide" title="Upload files" copy="DomainDrop reserves quota and signs the operation; clients send bytes directly to MinIO." />

      <section className="upload-flow">
        <div><span>1</span><FileUp size={19} /><h2>Create plan</h2><p>Send space ID, relative path, exact byte size, and MIME type.</p></div>
        <div><span>2</span><Split size={19} /><h2>PUT bytes</h2><p>Use the signed single URL or request signed multipart batches.</p></div>
        <div><span>3</span><CheckCircle2 size={19} /><h2>Complete</h2><p>Return every part number and ETag so the API can verify the object.</p></div>
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Step 1</p>
        <h2>Create the upload ticket.</h2>
        <p><code>POST /api/v1/files/upload-url</code> rejects duplicate paths before signing and reserves the declared file size against quota.</p>
        <CodeBlock code={createTicket} language="json" title="Request body" />
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Small files</p>
        <h2>One signed PUT, one ETag.</h2>
        <p>Files up to 64 MiB receive one signed URL. Send the exact <code>Content-Type</code> from <code>upload.headers</code>, then read the <code>ETag</code> response header.</p>
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Large files</p>
        <h2>Multipart uploads are resumable by part.</h2>
        <p>Files larger than 64 MiB use 16 MiB parts by default. Request at most 50 signed part URLs per API call, upload parts concurrently, and retain each returned ETag.</p>
        <div className="docs-callout"><RefreshCw size={19} /><div><strong>Retry only the failed part</strong><span>Request a fresh URL for that part number if its signed URL expires.</span></div></div>
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Step 3</p>
        <h2>Complete every part in order.</h2>
        <p>Completion is idempotent. Send all parts exactly once by number; the backend sorts, verifies size, commits quota, and marks metadata ready.</p>
        <CodeBlock code={completeParts} language="json" title="Completion body" />
      </section>

      <div className="docs-callout warning">
        <Split size={19} />
        <div><strong>Expose ETag in MinIO CORS</strong><span>Browser uploads cannot complete unless MinIO allows the frontend origin and exposes the ETag response header.</span></div>
      </div>
    </article>
  )
}

export default UploadGuidePage
