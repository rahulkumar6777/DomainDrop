import { ArrowRight, Boxes, Code2, FileUp, KeyRound, PackageCheck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import DocsPageHeader from '../components/DocsPageHeader.jsx'

const entryPoints = [
  { icon: PackageCheck, title: 'Node.js SDK', copy: 'Upload files and manage spaces with a small server-side client.', to: '/developer/sdk/node', meta: '@domaindrop/node' },
  { icon: Code2, title: 'REST API', copy: 'Use the same API from Node.js, Java, Go, Python, Rust, or cURL.', to: '/developer/api/files', meta: 'API v1' },
  { icon: FileUp, title: 'Upload guide', copy: 'Understand signed PUT URLs, ETags, and multipart completion.', to: '/developer/guides/upload-files', meta: 'Direct to MinIO' },
]

function DocsOverviewPage() {
  return (
    <article className="docs-page">
      <DocsPageHeader
        eyebrow="DomainDrop developer platform"
        title="Build file storage without proxying file bytes."
        copy="Every user owns one MinIO bucket. Spaces organize object paths, while a single bucket policy controls delivery for every file."
      />

      <div className="docs-callout">
        <ShieldCheck size={19} />
        <div><strong>Private by default</strong><span>New buckets require signed delivery URLs until the owner explicitly enables public read.</span></div>
      </div>

      <section className="docs-entry-grid" aria-label="Documentation entry points">
        {entryPoints.map(({ icon: Icon, title, copy, to, meta }) => (
          <Link key={to} to={to}>
            <span><Icon size={20} /></span>
            <small>{meta}</small>
            <h2>{title}</h2>
            <p>{copy}</p>
            <strong>Read guide <ArrowRight size={15} /></strong>
          </Link>
        ))}
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Architecture</p>
        <h2>One bucket, many spaces, normal object paths.</h2>
        <div className="architecture-flow">
          <div><Boxes size={19} /><span>User bucket</span><code>dd-user-...</code></div>
          <ArrowRight size={18} />
          <div><KeyRound size={19} /><span>Space prefix</span><code>spc_8f2.../</code></div>
          <ArrowRight size={18} />
          <div><FileUp size={19} /><span>Your path</span><code>images/hero.webp</code></div>
        </div>
        <p>
          A path such as <code>reports/2026/august.pdf</code> does not create database folder rows.
          It remains a relative object path inside a selected space.
        </p>
      </section>
    </article>
  )
}

export default DocsOverviewPage
