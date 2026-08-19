import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ code, language = 'text', title }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="docs-code-block">
      <div className="docs-code-toolbar">
        <span>{title || language}</span>
        <button type="button" onClick={copy} aria-label="Copy code" title="Copy code">
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

export default CodeBlock
