import { useState } from 'react'
import {
  ArrowRight,
  Boxes,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  FileCode2,
  FileImage,
  Folder,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  Lock,
  Network,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Users,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/domaindrop-hero.jpg'

const codeSamples = {
  node: [
    "import { DomainDrop } from '@domaindrop/node'",
    '',
    'const storage = new DomainDrop({',
    '  apiKey: process.env.DOMAIN_DROP_API_KEY,',
    '})',
    '',
    'const file = await storage.files.upload({',
    "  folderId: 'fld_default_01',",
    "  file: './august.pdf',",
    '})',
    '',
    '// Signed for private buckets, direct for public-read buckets',
    'console.log(file.url)',
  ].join('\n'),
  curl: [
    'curl --request POST https://api.domaindrop.dev/v1/files',
    "  --header 'Authorization: Bearer $DOMAIN_DROP_API_KEY'",
    "  --form 'folderId=fld_default_01'",
    "  --form 'file=@./august.pdf'",
  ].join(' \\\n'),
  python: [
    'import os',
    'import requests',
    '',
    "response = requests.post(",
    "    'https://api.domaindrop.dev/v1/files',",
    "    headers={'Authorization': f\"Bearer {os.environ['DOMAIN_DROP_API_KEY']}\"},",
    "    data={'folderId': 'fld_default_01'},",
    "    files={'file': open('./august.pdf', 'rb')},",
    ')',
    '',
    "print(response.json()['url'])",
  ].join('\n'),
}

const quickStartCode = [
  "import { DomainDrop } from '@domaindrop/node'",
  '',
  'const drop = new DomainDrop({',
  '  apiKey: process.env.DOMAIN_DROP_API_KEY,',
  '})',
  '',
  'const folder = await drop.folders.getDefault()',
  '',
  'const image = await drop.files.upload({',
  '  folderId: folder.id,',
  "  file: './launch.jpg',",
  '})',
  '',
  'console.log(image.url)',
].join('\n')

function SectionHeading({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={'section-heading ' + (align === 'center' ? 'section-heading-center' : '')}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  )
}

function FileExplorer() {
  const files = [
    { icon: FileImage, name: 'hero-final.webp', detail: '1.8 MB', updated: '2 min ago', color: 'coral' },
    { icon: FileCode2, name: 'catalog.json', detail: '42 KB', updated: '1 hour ago', color: 'green' },
    { icon: FileImage, name: 'receipt-1042.png', detail: '680 KB', updated: 'Yesterday', color: 'cyan' },
    { icon: FileCode2, name: 'customer-export.csv', detail: '96 KB', updated: 'Yesterday', color: 'yellow' },
  ]

  return (
    <div className="file-explorer" aria-label="Example DomainDrop file browser">
      <div className="tool-header">
        <div className="window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="tool-title">my-store-assets</span>
        <span className="private-label">
          <Lock size={13} aria-hidden="true" />
          Private bucket
        </span>
      </div>
      <div className="breadcrumb">
        <HardDrive size={16} aria-hidden="true" />
        <span>root</span>
        <ChevronRight size={14} aria-hidden="true" />
        <Folder size={16} aria-hidden="true" />
        <strong>default</strong>
      </div>
      <div className="file-table">
        <div className="file-table-head">
          <span>Name</span>
          <span>Size</span>
          <span>Updated</span>
        </div>
        {files.map(({ icon: Icon, name, detail, updated, color }) => (
          <div className="file-row" key={name}>
            <span className="file-name">
              <span className={'file-icon file-icon-' + color}>
                <Icon size={17} aria-hidden="true" />
              </span>
              {name}
            </span>
            <span>{detail}</span>
            <span className="row-meta">{updated}</span>
          </div>
        ))}
      </div>
      <div className="storage-meter">
        <div>
          <span>Storage used</span>
          <strong>284 MB / 1 GB</strong>
        </div>
        <div className="meter-track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  )
}

function PolicyDemo() {
  const [policy, setPolicy] = useState('private')
  const isPrivate = policy === 'private'

  return (
    <div className="policy-tool">
      <div className="segmented-control" aria-label="Bucket policy">
        <button
          className={isPrivate ? 'active' : ''}
          type="button"
          aria-pressed={isPrivate}
          onClick={() => setPolicy('private')}
        >
          <Lock size={16} aria-hidden="true" />
          Private
        </button>
        <button
          className={!isPrivate ? 'active' : ''}
          type="button"
          aria-pressed={!isPrivate}
          onClick={() => setPolicy('public')}
        >
          <Globe2 size={16} aria-hidden="true" />
          Public read
        </button>
      </div>
      <div className="policy-output" aria-live="polite">
        <div className={'policy-icon ' + (isPrivate ? 'private' : 'public')}>
          {isPrivate ? <KeyRound size={25} /> : <Globe2 size={25} />}
        </div>
        <div>
          <p className="policy-name">
            {isPrivate ? 'Signed delivery' : 'Direct delivery'}
          </p>
          <p>
            {isPrivate
              ? 'Every object stays private and is delivered through an expiring signed URL.'
              : 'Every object in this bucket is readable from its stable public URL.'}
          </p>
        </div>
      </div>
      <div className="url-preview">
        <code>
          {isPrivate
            ? 'cdn.domaindrop.dev/invoices/august.pdf?signature=••••&expires=900'
            : 'cdn.domaindrop.dev/product-shots/launch.jpg'}
        </code>
        <span className={'url-state ' + (isPrivate ? 'private' : 'public')}>
          {isPrivate ? '15 min' : 'Live'}
        </span>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <>
      <section
        className="home-hero"
        style={{ backgroundImage: 'url(' + heroImage + ')' }}
      >
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Storage infrastructure for builders</p>
            <h1>Object storage, minus the ops.</h1>
            <p className="hero-description">
              Give every user a dedicated bucket, a ready-to-use default folder,
              and one clear access policy for everything inside.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" to="/signup">
                Create a free bucket
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="button button-light" to="/developer">
                Read the docs
                <Code2 size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-proof" aria-label="Product highlights">
              <span>
                <CheckCircle2 size={16} />
                1 GB free
              </span>
              <span>
                <CheckCircle2 size={16} />
                Private by default
              </span>
              <span>
                <CheckCircle2 size={16} />
                S3-backed
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-band">
        <div className="shell signal-grid">
          <div>
            <strong>One</strong>
            <span>isolated bucket per user</span>
          </div>
          <div>
            <strong>2 ways</strong>
            <span>REST API or Node SDK</span>
          </div>
          <div>
            <strong>15 min</strong>
            <span>default signed link expiry</span>
          </div>
          <div>
            <strong>Zero</strong>
            <span>storage servers to manage</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell feature-layout">
          <div className="feature-copy">
            <SectionHeading
              eyebrow="A clean storage model"
              title="A bucket for every account. A default folder from day one."
              copy="Create more folders whenever you need them. Every upload targets a folder ID while DomainDrop handles bucket isolation, object keys, quotas, and delivery."
            />
            <div className="feature-points">
              <div>
                <span className="feature-point-icon cyan">
                  <Users size={19} />
                </span>
                <p>
                  <strong>Isolated by user</strong>
                  Every account gets a unique bucket name and policy boundary.
                </p>
              </div>
              <div>
                <span className="feature-point-icon yellow">
                  <Folder size={19} />
                </span>
                <p>
                  <strong>Folders that make sense</strong>
                  Start with the default folder and organize every upload by folder ID.
                </p>
              </div>
              <div>
                <span className="feature-point-icon coral">
                  <Gauge size={19} />
                </span>
                <p>
                  <strong>Quota aware</strong>
                  Track bytes, object count, and maximum file size per plan.
                </p>
              </div>
            </div>
          </div>
          <FileExplorer />
        </div>
      </section>

      <section className="section policy-section">
        <div className="shell policy-layout">
          <PolicyDemo />
          <div className="policy-copy">
            <SectionHeading
              eyebrow="Access on your terms"
              title="One policy for the entire bucket."
              copy="Keep every file behind short-lived signed URLs, or switch the bucket to public read and expose every current and future object."
            />
            <ul className="check-list">
              <li>
                <Check size={17} />
                Private is the default bucket policy
              </li>
              <li>
                <Check size={17} />
                Every private object uses an expiring signed URL
              </li>
              <li>
                <Check size={17} />
                Public read applies to the complete bucket
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section workflow-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Built for the path to production"
            title="From account to upload in three moves."
            copy="The product surface stays small so your integration can stay clear."
            align="center"
          />
          <div className="workflow-grid">
            <article>
              <span className="step-number">01</span>
              <KeyRound size={24} aria-hidden="true" />
              <h3>Create an API key</h3>
              <p>Generate a key for your server and keep it scoped to your project.</p>
            </article>
            <article>
              <span className="step-number">02</span>
              <Folder size={24} aria-hidden="true" />
              <h3>Choose a folder</h3>
              <p>Use the ready default folder or create one, then keep its folder ID.</p>
            </article>
            <article>
              <span className="step-number">03</span>
              <Zap size={24} aria-hidden="true" />
              <h3>Upload and deliver</h3>
              <p>Upload with the folder ID and receive the URL allowed by the bucket policy.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section developer-band">
        <div className="shell developer-band-grid">
          <div>
            <p className="eyebrow eyebrow-light">Developer first</p>
            <h2>Your first upload should fit in one screen.</h2>
            <p>
              A small SDK, predictable REST resources, and errors you can actually
              act on.
            </p>
            <Link className="button button-white" to="/developer">
              Explore the API
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <pre className="hero-code" aria-label="Node SDK upload example">
            <code>{quickStartCode}</code>
          </pre>
        </div>
      </section>

      <section className="section final-cta">
        <div className="shell final-cta-inner">
          <div>
            <p className="eyebrow">Start with room to build</p>
            <h2>Your users bring the files. DomainDrop brings the storage.</h2>
          </div>
          <Link className="button button-dark" to="/signup">
            Create your account
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}

const planFeatures = {
  free: [
    '1 GB total storage',
    '200 objects',
    '200 MB max file size',
    'Bucket-level private or public-read policy',
    'REST API access',
  ],
  starter: [
    '5 GB total storage',
    '1,000 objects',
    '1 GB max file size',
    'Bucket-level private or public-read policy',
    'REST API and Node SDK',
  ],
}

function PlanCard({ name, label, price, description, features, featured = false }) {
  return (
    <article className={'plan-card ' + (featured ? 'featured' : '')}>
      <div className="plan-topline">
        <span className="plan-name">{name}</span>
        {label && <span className="plan-label">{label}</span>}
      </div>
      <div className="plan-price">{price}</div>
      <p>{description}</p>
      <Link
        className={'button ' + (featured ? 'button-dark' : 'button-outline')}
        to="/signup"
      >
        {featured ? 'Join early access' : 'Start free'}
        <ArrowRight size={17} />
      </Link>
      <ul>
        {features.map((feature) => (
          <li key={feature}>
            <Check size={17} />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  )
}

function PricingPage() {
  return (
    <>
      <section className="page-intro pricing-intro">
        <div className="shell">
          <p className="eyebrow">Simple plans</p>
          <h1>Start free. Grow when your files do.</h1>
          <p>
            No storage math at signup. Each plan has clear limits for bytes,
            objects, and individual file size.
          </p>
        </div>
      </section>

      <section className="section pricing-section">
        <div className="shell pricing-grid">
          <PlanCard
            name="Free"
            label="Available now"
            price="₹0"
            description="For prototypes, portfolios, and small internal tools."
            features={planFeatures.free}
          />
          <PlanCard
            name="Starter"
            label="Early access"
            price="Coming soon"
            description="For products moving their first serious volume of files."
            features={planFeatures.starter}
            featured
          />
        </div>
      </section>

      <section className="section comparison-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Plan comparison"
            title="The limits you need, without the fine print."
            copy="Current quotas mirror the plans configured in the DomainDrop API."
          />
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Free</th>
                  <th>Starter</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total storage</td>
                  <td>1 GB</td>
                  <td>5 GB</td>
                </tr>
                <tr>
                  <td>Object limit</td>
                  <td>200</td>
                  <td>1,000</td>
                </tr>
                <tr>
                  <td>Maximum file size</td>
                  <td>200 MB</td>
                  <td>1 GB</td>
                </tr>
                <tr>
                  <td>Signed URLs</td>
                  <td><CheckCircle2 size={18} aria-label="Included" /></td>
                  <td><CheckCircle2 size={18} aria-label="Included" /></td>
                </tr>
                <tr>
                  <td>Public delivery</td>
                  <td><CheckCircle2 size={18} aria-label="Included" /></td>
                  <td><CheckCircle2 size={18} aria-label="Included" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="shell faq-layout">
          <SectionHeading
            eyebrow="Questions"
            title="A few useful answers."
            copy="Straightforward storage deserves straightforward terms."
          />
          <div className="faq-list">
            <details>
              <summary>Can I use public and private files together?</summary>
              <p>
                Not inside the same bucket. Its policy applies to every file, so
                switching to public read exposes all current and future objects.
              </p>
            </details>
            <details>
              <summary>What happens when I reach a plan limit?</summary>
              <p>
                New uploads are paused until you remove objects or move to a larger
                plan. Existing files stay available.
              </p>
            </details>
            <details>
              <summary>Is Starter available today?</summary>
              <p>
                Starter is in early access. New accounts begin on Free while paid
                billing and upgrade controls are finalized.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  )
}

function CodeWorkbench() {
  const [language, setLanguage] = useState('node')
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeSamples[language])
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="code-workbench">
      <div className="code-toolbar">
        <div className="code-tabs" role="tablist" aria-label="Code language">
          {[
            ['node', 'Node.js'],
            ['curl', 'cURL'],
            ['python', 'Python'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={language === value ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={language === value}
              onClick={() => setLanguage(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="code-copy"
          type="button"
          onClick={copyCode}
          aria-label="Copy code"
          title="Copy code"
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <pre>
        <code>{codeSamples[language]}</code>
      </pre>
    </div>
  )
}

function DeveloperPage() {
  return (
    <>
      <section className="page-intro developer-intro">
        <div className="shell developer-intro-grid">
          <div>
            <p className="eyebrow">Developer platform</p>
            <h1>Storage APIs that stay out of your way.</h1>
            <p>
              Upload with an API key and folder ID, inherit the bucket policy, and
              receive the right delivery URL through one consistent interface.
            </p>
            <div className="api-preview-label">
              <Clock3 size={16} />
              Storage API design preview
            </div>
          </div>
          <CodeWorkbench />
        </div>
      </section>

      <section className="section docs-section">
        <div className="shell docs-layout">
          <aside className="docs-nav" aria-label="On this page">
            <p>On this page</p>
            <a href="#quickstart">Quickstart</a>
            <a href="#authentication">Authentication</a>
            <a href="#delivery">File delivery</a>
            <a href="#responses">Responses</a>
          </aside>
          <div className="docs-content">
            <section id="quickstart" className="docs-block">
              <span className="docs-icon cyan"><PackageCheck size={20} /></span>
              <p className="eyebrow">Quickstart</p>
              <h2>One client. One upload call.</h2>
              <p>
                Keep your API key on the server, select the default or a custom
                folder, and send its ID with the file. Access comes from the bucket.
              </p>
              <div className="install-line">
                <Terminal size={18} />
                <code>npm install @domaindrop/node</code>
              </div>
            </section>

            <section id="authentication" className="docs-block">
              <span className="docs-icon yellow"><KeyRound size={20} /></span>
              <p className="eyebrow">Authentication</p>
              <h2>Bearer keys for server-to-server calls.</h2>
              <p>
                Send your key in the Authorization header. Browser account sessions
                use a short-lived access token and a rotating HttpOnly refresh
                cookie.
              </p>
              <div className="endpoint-list">
                <div>
                  <span className="method post">POST</span>
                  <code>/api/v1/auth/login</code>
                  <span>Start account session</span>
                </div>
                <div>
                  <span className="method get">GET</span>
                  <code>/api/v1/auth/refresh-token</code>
                  <span>Rotate session token</span>
                </div>
                <div>
                  <span className="method post">POST</span>
                  <code>/api/v1/auth/logout</code>
                  <span>Revoke current session</span>
                </div>
              </div>
            </section>

            <section id="delivery" className="docs-block">
              <span className="docs-icon coral"><Network size={20} /></span>
              <p className="eyebrow">File delivery</p>
              <h2>Use the URL that matches the policy.</h2>
              <div className="delivery-grid">
                <article>
                  <Lock size={21} />
                  <h3>Private bucket</h3>
                  <p>Every object is delivered through a time-limited signed URL.</p>
                  <code>bucketPolicy: 'private'</code>
                </article>
                <article>
                  <Globe2 size={21} />
                  <h3>Public-read bucket</h3>
                  <p>Every object is available from its stable direct URL.</p>
                  <code>bucketPolicy: 'public-read'</code>
                </article>
              </div>
            </section>

            <section id="responses" className="docs-block">
              <span className="docs-icon green"><Braces size={20} /></span>
              <p className="eyebrow">Responses</p>
              <h2>Predictable shapes and actionable errors.</h2>
              <p>
                Successful calls return the folder ID, object key, content
                metadata, and the delivery URL allowed by the current bucket
                policy. Errors include a status and a human-readable message.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}

const principles = [
  {
    icon: ShieldCheck,
    title: 'Private by default',
    copy: 'New storage begins closed. Public access is always an explicit decision.',
  },
  {
    icon: Boxes,
    title: 'Isolation you can explain',
    copy: 'Each user receives a dedicated bucket and a clear ownership boundary.',
  },
  {
    icon: RefreshCw,
    title: 'Simple, reversible controls',
    copy: 'Policies can change without moving files or rewriting application paths.',
  },
]

function AboutPage() {
  return (
    <>
      <section className="page-intro about-intro">
        <div className="shell about-lead">
          <p className="eyebrow">About DomainDrop</p>
          <h1>Files belong in products, not in infrastructure tickets.</h1>
          <p>
            DomainDrop is being built for teams that want clear storage primitives
            without taking on another operations project.
          </p>
        </div>
      </section>

      <section className="section story-section">
        <div className="shell story-grid">
          <div className="story-statement">
            <span className="large-quote">“</span>
            <p>
              The best storage layer is the one your users understand and your
              developers barely have to think about.
            </p>
          </div>
          <div className="story-copy">
            <p className="eyebrow">The thesis</p>
            <h2>Object storage can have a human interface.</h2>
            <p>
              Buckets are durable and scalable, but most users think in folders,
              files, links, and permissions. DomainDrop bridges those two models:
              familiar on the surface, robust underneath.
            </p>
            <p>
              The project currently combines an Express API, MongoDB metadata,
              Redis-backed sessions, and MinIO object storage.
            </p>
          </div>
        </div>
      </section>

      <section className="section principles-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Product principles"
            title="Small decisions that add up to trust."
            align="center"
          />
          <div className="principles-grid">
            {principles.map(({ icon: Icon, title, copy }) => (
              <article key={title}>
                <span><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-cta">
        <div className="shell about-cta-inner">
          <div>
            <p className="eyebrow">Build with us</p>
            <h2>Start with the Free plan and shape what comes next.</h2>
          </div>
          <Link className="button button-dark" to="/signup">
            Create an account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}

function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="shell not-found-inner">
        <span className="not-found-code">404</span>
        <h1>This path is empty.</h1>
        <p>The file may have moved, but the home page is right where we left it.</p>
        <Link className="button button-dark" to="/">
          Back home
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}

export { AboutPage, DeveloperPage, HomePage, NotFoundPage, PricingPage }
