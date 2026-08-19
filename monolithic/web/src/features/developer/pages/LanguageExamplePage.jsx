import { Navigate, useParams } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock.jsx'
import DocsPageHeader from '../components/DocsPageHeader.jsx'
import LanguageNav from '../components/LanguageNav.jsx'
import { languageExamples } from '../languageExamples.js'

function LanguageExamplePage() {
  const { language } = useParams()
  const example = languageExamples[language]
  if (!example) return <Navigate to="/developer/examples/node" replace />

  return (
    <article className="docs-page">
      <DocsPageHeader
        eyebrow="REST example"
        title={`${example.label} upload`}
        copy="Create a signed plan, upload directly to MinIO, capture the ETag, and complete the file record."
      />
      <LanguageNav />
      <div className="docs-callout compact">
        <div><strong>Runtime</strong><span>{example.requirement}</span></div>
      </div>
      <CodeBlock code={example.code} language={example.language} title={`${example.label} - single upload`} />
      <section className="docs-section-block">
        <p className="docs-kicker">Large files</p>
        <h2>Extend the same flow with multipart parts.</h2>
        <p>
          When <code>upload.type</code> is <code>multipart</code>, request signed URLs from
          <code> /files/:fileId/parts</code> in batches of 50, upload each byte range, then send
          every part number and ETag to the completion endpoint. The Node package handles this automatically.
        </p>
      </section>
    </article>
  )
}

export default LanguageExamplePage
