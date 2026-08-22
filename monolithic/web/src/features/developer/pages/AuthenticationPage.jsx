import { KeyRound, LockKeyhole, ShieldAlert } from 'lucide-react'
import CodeBlock from '../components/CodeBlock.jsx'
import DocsPageHeader from '../components/DocsPageHeader.jsx'

const headerExample = [
  'x-api-key: dd_live_<prefix>_<secret>',
  'content-type: application/json',
].join('\n')

const scopes = [
  ['files:read', 'List metadata, get one file, request delivery URLs'],
  ['files:write', 'Create upload plans, complete uploads, delete files'],
  ['spaces:read', 'List and inspect spaces'],
  ['spaces:write', 'Create, update, and delete custom spaces'],
  ['storage:read', 'Read bucket, usage, policy, and quota'],
  ['policy:write', 'Switch the entire bucket between private and public-read'],
  ['cors:write', 'Set additional browser origins and CORS rules for the bucket'],
]

function AuthenticationPage() {
  return (
    <article className="docs-page">
      <DocsPageHeader eyebrow="Start" title="Authentication" copy="Use API keys for server integrations and JWT sessions for the DomainDrop web application." />

      <section className="docs-section-block first">
        <p className="docs-kicker">Server applications</p>
        <h2>Send an API key header.</h2>
        <p>API keys belong in server environment variables. Never embed a DomainDrop key in a browser bundle, mobile binary, repository, or public log.</p>
        <CodeBlock code={headerExample} language="http" title="Request headers" />
      </section>

      <section className="docs-section-block">
        <p className="docs-kicker">Least privilege</p>
        <h2>Choose scopes per integration.</h2>
        <div className="scope-reference">
          {scopes.map(([scope, description]) => <div key={scope}><code>{scope}</code><span>{description}</span></div>)}
        </div>
      </section>

      <section className="auth-model-grid">
        <div><KeyRound size={20} /><h3>API key</h3><p>For your backend, package, CLI, worker, or another trusted server.</p></div>
        <div><LockKeyhole size={20} /><h3>Bearer access token</h3><p>For authenticated dashboard calls. The web app refreshes it through an HttpOnly cookie.</p></div>
      </section>

      <div className="docs-callout warning">
        <ShieldAlert size={19} />
        <div><strong>API-key management requires a web session</strong><span>A key cannot list, create, or revoke account keys, even if it has every storage scope.</span></div>
      </div>
    </article>
  )
}

export default AuthenticationPage
