import { useState } from 'react'
import { KeyRound, LogIn, X } from 'lucide-react'

export default function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await onLogin(email.trim(), password)
    } catch (loginError) {
      console.error('No se pudo iniciar sesión:', loginError)
      setError('Correo o contraseña incorrectos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="booking-modal-card login-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="organizer-login-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ ACCESO DE ORGANIZADOR</span>
            <h2 id="organizer-login-title" className="modal-title">Iniciar sesión</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field-group">
            <label className="field-label" htmlFor="organizer-email">Correo electrónico</label>
            <input
              id="organizer-email"
              className="modal-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="organizer-password">Contraseña</label>
            <input
              id="organizer-password"
              className="modal-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="submit-booking-btn" type="submit" disabled={submitting}>
            <LogIn size={17} />
            <span>{submitting ? 'Ingresando…' : 'Entrar al panel'}</span>
            <KeyRound size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
