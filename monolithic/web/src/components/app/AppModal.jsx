import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

function AppModal({ title, copy, onClose, children, wide = false }) {
  const modalRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!modalRef.current?.contains(document.activeElement)) modalRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key !== 'Tab' || !modalRef.current) return

      const focusable = [...modalRef.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      )]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [])

  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={modalRef}
        className={wide ? 'app-modal wide' : 'app-modal'}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="app-modal-head">
          <div>
            <h2>{title}</h2>
            {copy && <p>{copy}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog" title="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function ConfirmDialog({ title, copy, confirmLabel, onConfirm, onClose, busy = false, tone = 'danger' }) {
  return (
    <AppModal title={title} copy={copy} onClose={() => !busy && onClose()}>
      <div className="confirm-dialog-body">
        <span className={`confirm-dialog-icon ${tone}`}><AlertTriangle size={20} /></span>
        <p>This action takes effect immediately.</p>
        <div className="modal-actions">
          <button className="button button-small button-outline" type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`button button-small ${tone === 'danger' ? 'button-danger' : 'button-dark'}`} type="button" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </AppModal>
  )
}

export default AppModal
