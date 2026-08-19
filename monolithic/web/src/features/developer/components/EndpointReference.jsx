import CodeBlock from './CodeBlock.jsx'

function EndpointReference({ endpoint, defaultOpen = false }) {
  return (
    <details className="endpoint-reference" open={defaultOpen}>
      <summary>
        <span className={`docs-method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
        <code>{endpoint.path}</code>
        <strong>{endpoint.summary}</strong>
        <span>{endpoint.scope || endpoint.auth}</span>
      </summary>
      <div className="endpoint-reference-body">
        <p>{endpoint.description}</p>
        <div className="endpoint-meta">
          <span>Authentication</span>
          <strong>{endpoint.scope ? `API key scope: ${endpoint.scope}` : endpoint.auth}</strong>
        </div>
        <div className="endpoint-examples">
          {endpoint.request && <CodeBlock code={endpoint.request} language="json" title="Request body" />}
          <CodeBlock code={endpoint.response} language="json" title="Response" />
        </div>
      </div>
    </details>
  )
}

export default EndpointReference
