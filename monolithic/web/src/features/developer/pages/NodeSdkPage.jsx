import { PackageCheck, Terminal } from 'lucide-react'
import CodeBlock from '../components/CodeBlock.jsx'
import DocsPageHeader from '../components/DocsPageHeader.jsx'

const initialize = [
  "import { DomainDrop } from '@domaindrop/node'",
  '',
  'const drop = new DomainDrop({',
  '  apiKey: process.env.DOMAIN_DROP_API_KEY,',
  "  baseUrl: 'https://api.domaindrop.dev/api/v1', // optional",
  '})',
].join('\n')

const upload = [
  'const space = await drop.spaces.getDefault()',
  '',
  'const file = await drop.files.upload({',
  '  spaceId: space.id,',
  "  path: 'backups/database.dump',",
  "  file: './database.dump', // path, Buffer, Uint8Array, or Blob",
  "  mimeType: 'application/octet-stream',",
  '  concurrency: 4,',
  '  onProgress: ({ uploadedBytes, totalBytes, percent }) => {',
  '    console.log({ uploadedBytes, totalBytes, percent })',
  '  },',
  '})',
].join('\n')

const sdkMethods = [
  ['spaces.list()', 'List all spaces'],
  ['spaces.get(spaceId)', 'Get one space'],
  ['spaces.getDefault()', 'Resolve the default space'],
  ['spaces.create(input)', 'Create a custom space'],
  ['spaces.update(spaceId, input)', 'Rename or describe a custom space'],
  ['spaces.delete(spaceId)', 'Delete an empty custom space'],
  ['files.list(query)', 'List file metadata'],
  ['files.get(fileId)', 'Get one file record'],
  ['files.upload(input)', 'Run single or multipart upload'],
  ['files.getUrl(fileId, options)', 'Get signed or public delivery URL'],
  ['files.delete(fileId)', 'Delete metadata and object'],
  ['storage.get()', 'Read bucket, policy, usage, and quota'],
  ['storage.setVisibility(value)', 'Apply private or public-read bucket policy'],
]

function NodeSdkPage() {
  return (
    <article className="docs-page">
      <DocsPageHeader eyebrow="SDK" title="Node.js package" copy="A dependency-free DomainDrop client for Node.js 20 and newer, with direct single and multipart uploads." />

      <div className="package-heading">
        <span><PackageCheck size={23} /></span>
        <div><strong>@domaindrop/node</strong><small>ES modules | Node.js 20+</small></div>
        <div className="docs-command"><Terminal size={16} /><code>npm install @domaindrop/node</code></div>
      </div>

      <section className="docs-section-block first">
        <p className="docs-kicker">Initialize</p>
        <h2>Keep the key on your server.</h2>
        <CodeBlock code={initialize} language="javascript" title="client.mjs" />
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Upload</p>
        <h2>One method for small and large files.</h2>
        <p>The package reads paths lazily, requests signed part URLs in batches, uploads with bounded concurrency, and completes with ordered ETags.</p>
        <CodeBlock code={upload} language="javascript" title="upload.mjs" />
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Client surface</p>
        <h2>Available methods</h2>
        <div className="sdk-method-list">
          {sdkMethods.map(([method, description]) => <div key={method}><code>{method}</code><span>{description}</span></div>)}
        </div>
      </section>
    </article>
  )
}

export default NodeSdkPage
