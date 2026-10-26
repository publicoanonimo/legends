import { useEffect, useState } from 'react'
import {
  collection, deleteDoc, doc, onSnapshot, orderBy, query,
} from 'firebase/firestore'
import {
  ClipboardList, UsersRound, UserRound, Trash2, X, ShieldAlert, KeyRound,
} from 'lucide-react'
import { db } from '../firebase'

const SUPERADMIN_PASSWORD = 'admin001'

function formatDate(timestamp) {
  if (!timestamp?.toDate) return 'Registro reciente'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp.toDate())
}

function RegistrationList({ registrations, type, onRequestDelete }) {
  const isPersonal = type === 'personal'
  const Icon = isPersonal ? UserRound : UsersRound
  const emptyMessage = isPersonal
    ? 'Aún no hay registros personales.'
    : 'Aún no hay registros grupales.'

  return (
    <section className="registration-list-card">
      <div className="registration-list-header">
        <div className="registration-list-title">
          <span className="registration-list-icon"><Icon size={18} /></span>
          <div>
            <h2>{isPersonal ? 'Registro personal' : 'Registro grupal'}</h2>
            <p>{registrations.length} {registrations.length === 1 ? 'inscripción' : 'inscripciones'}</p>
          </div>
        </div>
      </div>

      {registrations.length === 0 ? (
        <p className="registration-empty">{emptyMessage}</p>
      ) : (
        <ul className="registration-list">
          {registrations.map((registration) => (
            <li key={registration.id} className="registration-item">
              <div className="registration-item-main">
                <strong>{isPersonal ? registration.name : registration.groupName}</strong>
                <span>{isPersonal ? registration.costume : registration.groupCostume}</span>
              </div>
              <div className="registration-item-actions">
                <div className="registration-item-meta">
                  <span>{isPersonal ? registration.phone : registration.representativePhone}</span>
                  <time>{formatDate(registration.createdAt)}</time>
                </div>
                <button
                  type="button"
                  className="registration-delete-btn"
                  onClick={() => onRequestDelete(registration, type)}
                  aria-label={`Eliminar ${isPersonal ? registration.name : registration.groupName}`}
                >
                  <Trash2 size={14} />
                  <span>Eliminar</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DeleteRegistrationModal({ registration, type, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const isPersonal = type === 'personal'
  const displayName = isPersonal ? registration.name : registration.groupName

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = async (event) => {
    event.preventDefault()

    if (password !== SUPERADMIN_PASSWORD) {
      setError('Contraseña de superadministrador incorrecta.')
      return
    }

    setDeleting(true)
    setError('')

    try {
      await deleteDoc(doc(db, 'costumeRegistrations', registration.id))
      onClose()
    } catch (deleteError) {
      console.error('No se pudo eliminar el registro:', deleteError)
      setError('No se pudo eliminar el registro. Revisa las reglas de Firestore.')
      setDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="booking-modal-card delete-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-registration-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ ACCESO DE SUPERADMINISTRADOR</span>
            <h2 id="delete-registration-title" className="modal-title">Eliminar inscripción</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-modal-warning">
            <ShieldAlert size={18} />
            <p>
              ¿Seguro que quieres eliminar <strong>{displayName}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="superadmin-password">
              Contraseña de superadministrador
            </label>
            <input
              id="superadmin-password"
              className="modal-input"
              type="password"
              autoComplete="off"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) setError('')
              }}
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}
        </div>

        <div className="modal-footer">
          <button
            className="submit-booking-btn delete-confirm-btn"
            type="submit"
            disabled={deleting}
          >
            <KeyRound size={16} />
            <span>{deleting ? 'Eliminando…' : 'Confirmar eliminación'}</span>
            <Trash2 size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default function DashboardModule() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    const registrationsQuery = query(
      collection(db, 'costumeRegistrations'),
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      registrationsQuery,
      (snapshot) => {
        setRegistrations(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error('No se pudieron cargar los registros:', snapshotError)
        setLoading(false)
        setError('No se pudieron cargar los registros. Revisa las reglas de Firestore.')
      },
    )

    return unsubscribe
  }, [])

  const personalRegistrations = registrations.filter((registration) => registration.type === 'personal')
  const groupRegistrations = registrations.filter((registration) => registration.type === 'group')

  return (
    <section className="dashboard-module">
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-eyebrow">CONCURSO DE DISFRACES</span>
          <h1>Inscritos</h1>
          <p>Los registros se actualizan automáticamente desde Firebase.</p>
        </div>
        <span className="dashboard-total"><ClipboardList size={18} /> {registrations.length} total</span>
      </div>

      {loading ? (
        <p className="registration-loading">Cargando inscripciones…</p>
      ) : error ? (
        <p className="registration-error">{error}</p>
      ) : (
        <div className="registration-columns">
          <RegistrationList
            registrations={personalRegistrations}
            type="personal"
            onRequestDelete={(registration, type) => setPendingDelete({ registration, type })}
          />
          <RegistrationList
            registrations={groupRegistrations}
            type="group"
            onRequestDelete={(registration, type) => setPendingDelete({ registration, type })}
          />
        </div>
      )}

      {pendingDelete && (
        <DeleteRegistrationModal
          registration={pendingDelete.registration}
          type={pendingDelete.type}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </section>
  )
}
