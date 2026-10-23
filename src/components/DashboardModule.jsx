import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { ClipboardList, UsersRound, UserRound } from 'lucide-react'
import { db } from '../firebase'

function formatDate(timestamp) {
  if (!timestamp?.toDate) return 'Registro reciente'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp.toDate())
}

function RegistrationList({ registrations, type }) {
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
              <div className="registration-item-meta">
                <span>{isPersonal ? registration.phone : registration.representativePhone}</span>
                <time>{formatDate(registration.createdAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function DashboardModule() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          <h1>Inscripciones</h1>
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
          <RegistrationList registrations={personalRegistrations} type="personal" />
          <RegistrationList registrations={groupRegistrations} type="group" />
        </div>
      )}
    </section>
  )
}
