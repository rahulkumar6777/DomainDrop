import { AlertCircle, Check, Copy, KeyRound, LoaderCircle } from 'lucide-react'
import AppModal from '../../components/app/AppModal.jsx'
import { apiKeyScopes } from './apiKeyScopes.js'

function CreateApiKeyDialog({ form, rawKey, error, saving, copied, onChange, onToggleScope, onCopy, onSubmit, onClose }) {
  return (
    <AppModal
      title={rawKey ? 'Save your API key' : 'Create API key'}
      copy={rawKey ? 'This full value will not be shown again.' : 'Choose only the access your application needs.'}
      onClose={onClose}
      wide
    >
      {rawKey ? (
        <div className="key-reveal">
          <div>
            <code>{rawKey}</code>
            <button className="icon-button" type="button" onClick={onCopy} aria-label="Copy API key" title="Copy API key">
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </button>
          </div>
          <p>Store this in a server-side environment variable. Never ship it in browser JavaScript.</p>
          <div className="modal-actions"><button className="button button-small button-dark" type="button" onClick={onClose}>I saved the key</button></div>
        </div>
      ) : (
        <form className="app-form" onSubmit={onSubmit}>
          {error && <div className="inline-error" role="alert"><AlertCircle size={16} />{error}</div>}
          <label htmlFor="key-name">Key name</label>
          <input id="key-name" name="name" value={form.name} onChange={onChange} minLength={2} maxLength={40} placeholder="Production server" required autoFocus />
          <label>Scopes</label>
          <div className="scope-list">
            {apiKeyScopes.map(([scope, description]) => (
              <label key={scope}>
                <input type="checkbox" checked={form.scopes.includes(scope)} onChange={() => onToggleScope(scope)} />
                <span><strong>{scope}</strong><small>{description}</small></span>
              </label>
            ))}
          </div>
          <label htmlFor="key-expiry">Expires at <span>(optional)</span></label>
          <input id="key-expiry" name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={onChange} />
          <div className="modal-actions">
            <button className="button button-small button-outline" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-small button-dark" type="submit" disabled={saving || form.scopes.length === 0}>
              {saving ? <LoaderCircle className="spin" size={16} /> : <KeyRound size={16} />}Create key
            </button>
          </div>
        </form>
      )}
    </AppModal>
  )
}

export default CreateApiKeyDialog
