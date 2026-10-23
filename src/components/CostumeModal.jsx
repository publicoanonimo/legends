import { useEffect, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { X, PartyPopper, UserRound, UsersRound } from 'lucide-react'
import { db } from '../firebase'
import { playEerieSound } from '../utils/sound'

export default function CostumeModal({ onClose, onToast }) {
  const [registrationType, setRegistrationType] = useState('personal')
  const [form, setForm] = useState({ name: '', costume: '', phone: '', groupName: '', groupCostume: '', representativePhone: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    playEerieSound()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, submitting])

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    const isPersonal = registrationType === 'personal'
    const registration = isPersonal
      ? {
          type: 'personal',
          name: form.name.trim(),
          costume: form.costume.trim(),
          phone: form.phone.trim(),
        }
      : {
          type: 'group',
          groupName: form.groupName.trim(),
          groupCostume: form.groupCostume.trim(),
          representativePhone: form.representativePhone.trim(),
        }

    try {
      await addDoc(collection(db, 'costumeRegistrations'), {
        ...registration,
        createdAt: serverTimestamp(),
      })
      onToast?.({
        type: 'success',
        title: '¡Registro exitoso!',
        message: 'Tu inscripción al concurso de disfraces quedó registrada.',
      })
      onClose()
    } catch (error) {
      console.error('No se pudo guardar el registro del concurso:', error)
      onToast?.({
        type: 'error',
        title: 'No se pudo registrar',
        message: 'Revisa tu conexión e inténtalo de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="costume-modal-title" onClick={onClose}>
      <div className="costume-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ THE LEGENDS · CONCURSO</span>
            <h3 className="modal-title" id="costume-modal-title">Registro de disfraces</h3>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Cerrar modal" disabled={submitting}>
            <X size={20} />
          </button>
        </div>

        <p className="costume-desc">Elige el tipo de inscripción y completa tus datos para participar.</p>

        <div className="costume-registration-types" role="group" aria-label="Tipo de registro">
          <button
            type="button"
            className={`costume-type-option ${registrationType === 'personal' ? 'selected' : ''}`}
            onClick={() => setRegistrationType('personal')}
            aria-pressed={registrationType === 'personal'}
          >
            <UserRound size={19} /> Registro personal
          </button>
          <button
            type="button"
            className={`costume-type-option ${registrationType === 'group' ? 'selected' : ''}`}
            onClick={() => setRegistrationType('group')}
            aria-pressed={registrationType === 'group'}
          >
            <UsersRound size={19} /> Registro grupal
          </button>
        </div>

        <form className="costume-registration-form" onSubmit={handleSubmit}>
          {registrationType === 'personal' ? (
            <>
              <label className="costume-field">
                <span>Nombre</span>
                <input name="name" value={form.name} onChange={updateField} autoComplete="name" required maxLength={100} placeholder="Tu nombre completo" />
              </label>
              <label className="costume-field">
                <span>Disfraz</span>
                <input name="costume" value={form.costume} onChange={updateField} required maxLength={100} placeholder="¿De qué irás disfrazado?" />
              </label>
              <label className="costume-field">
                <span>Número de teléfono</span>
                <input name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" required maxLength={25} placeholder="Ej. 70123456" />
              </label>
            </>
          ) : (
            <>
              <label className="costume-field">
                <span>Nombre del grupo</span>
                <input name="groupName" value={form.groupName} onChange={updateField} required maxLength={100} placeholder="Nombre de su grupo" />
              </label>
              <label className="costume-field">
                <span>Disfraz grupal</span>
                <input name="groupCostume" value={form.groupCostume} onChange={updateField} required maxLength={100} placeholder="Tema o disfraz del grupo" />
              </label>
              <label className="costume-field">
                <span>Teléfono del representante</span>
                <input name="representativePhone" type="tel" value={form.representativePhone} onChange={updateField} autoComplete="tel" required maxLength={25} placeholder="Ej. 70123456" />
              </label>
            </>
          )}
          <button className="submit-booking-btn costume-register-btn" type="submit" disabled={submitting}>
            <PartyPopper size={18} />
            <span>{submitting ? 'Registrando…' : 'Registrar'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
