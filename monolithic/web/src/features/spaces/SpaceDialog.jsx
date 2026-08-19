import { AlertCircle, Check, LoaderCircle } from 'lucide-react'
import AppModal from '../../components/app/AppModal.jsx'

function SpaceDialog({ mode, form, error, saving, onChange, onSubmit, onClose }) {
  const creating = mode === 'create'
  return (
    <AppModal
      title={creating ? 'Create space' : 'Edit space'}
      copy="Use a space to separate a product, environment, or customer path."
      onClose={() => !saving && onClose()}
    >
      <form className="app-form" onSubmit={onSubmit}>
        {error && <div className="inline-error" role="alert"><AlertCircle size={16} />{error}</div>}
        <label htmlFor="space-name">Name</label>
        <input id="space-name" name="name" value={form.name} onChange={onChange} maxLength={120} required disabled={saving} autoFocus />
        <label htmlFor="space-description">Description</label>
        <textarea id="space-description" name="description" value={form.description} onChange={onChange} maxLength={500} rows={3} disabled={saving} />
        <div className="modal-actions">
          <button className="button button-small button-outline" type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="button button-small button-dark" type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}
            {creating ? 'Create space' : 'Save changes'}
          </button>
        </div>
      </form>
    </AppModal>
  )
}

export default SpaceDialog
