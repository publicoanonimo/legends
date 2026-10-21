import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      onClose()
    }, toast.duration || 3500)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="toast-icon success" size={18} />,
    error: <AlertCircle className="toast-icon error" size={18} />,
    info: <Info className="toast-icon info" size={18} />,
  }

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast-card ${toast.type || 'info'}`}>
        <div className="toast-leading">
          {icons[toast.type] || icons.info}
          <div className="toast-content">
            {toast.title && <strong className="toast-title">{toast.title}</strong>}
            <p className="toast-msg">{toast.message}</p>
          </div>
        </div>
        <button
          className="toast-close"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
