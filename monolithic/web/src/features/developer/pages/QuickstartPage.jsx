import { CheckCircle2, Terminal } from 'lucide-react'
import CodeBlock from '../components/CodeBlock.jsx'
import DocsPageHeader from '../components/DocsPageHeader.jsx'

const packageExample = [
  "import { DomainDrop } from '@domaindrop/node'",
  '',
  'const drop = new DomainDrop({',
  '  apiKey: process.env.DOMAIN_DROP_API_KEY,',
  '})',
  '',
  'const space = await drop.spaces.getDefault()',
  'const uploaded = await drop.files.upload({',
  '  spaceId: space.id,',
  "  path: 'images/launch.jpg',",
  "  file: './launch.jpg',",
  '  onProgress: ({ percent }) => console.log(percent),',
  '})',
  '',
  'const delivery = await drop.files.getUrl(uploaded.id)',
  'console.log(delivery.url)',
].join('\n')

function QuickstartPage() {
  return (
    <article className="docs-page">
      <DocsPageHeader eyebrow="Start" title="Quickstart" copy="Create a scoped key, select a space, and upload directly to your bucket in a few minutes." />

      <section className="docs-steps">
        <div><span>1</span><div><h2>Create an API key</h2><p>Open Dashboard &gt; API keys. For uploads, select <code>files:write</code>, <code>files:read</code>, and <code>spaces:read</code>.</p></div></div>
        <div><span>2</span><div><h2>Install the Node package</h2><div className="docs-command"><Terminal size={16} /><code>npm install @domaindrop/node</code></div></div></div>
        <div><span>3</span><div><h2>Upload and request delivery</h2><p>The SDK reads the file, creates a signed plan, uploads one or many parts, captures ETags, and completes metadata.</p></div></div>
      </section>

      <CodeBlock code={packageExample} language="javascript" title="upload.mjs" />

      <div className="docs-callout success">
        <CheckCircle2 size={19} />
        <div><strong>File bytes never pass through the DomainDrop API</strong><span>The API signs and verifies the operation; your application uploads directly to MinIO.</span></div>
      </div>
    </article>
  )
}

export default QuickstartPage
