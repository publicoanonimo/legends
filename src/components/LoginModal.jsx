import { useState } from 'react'
import { KeyRound, LogIn, X } from 'lucide-react'

export default function LoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!onLogin(username.trim(), password)) {
      setError('Usuario o contraseña incorrectos.')
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
            <label className="field-label" htmlFor="organizer-username">Usuario</label>
            <input
              id="organizer-username"
              className="modal-input"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
          <button className="submit-booking-btn" type="submit">
            <LogIn size={17} />
            <span>Entrar al panel</span>
            <KeyRound size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
