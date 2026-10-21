import { useEffect } from 'react'
import { X, Calendar, Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react'
import { playClickSound } from '../utils/sound'

export default function DateModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const schedule = [
    { time: '21:00', title: 'Apertura de Puertas & Registro', desc: 'Validación de manillas de preventa y asignación de mesas VIP.' },
    { time: '22:00', title: 'Apertura de la Casa del Terror', desc: 'Recorrido inmersivo con actores, efectos y sustos en vivo.' },
    { time: '23:30', title: 'Concurso de Disfraces', desc: 'Premiación al mejor disfraz individual y grupal con sorpresas en barra.' },
    { time: '00:30', title: 'Hora Paranormal & Set Estelar', desc: 'DJ Set The Legends con la mejor música hasta el amanecer.' },
  ]

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="date-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ CRONOGRAMA OFICIAL</span>
            <h3 className="modal-title">30 de Octubre · La Noche</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="date-badge-highlight">
          <div className="date-big-block">
            <span className="date-month-txt">OCTUBRE</span>
            <strong className="date-day-num">30</strong>
            <span className="date-weekday-txt">JUEVES</span>
          </div>
          <div className="date-meta-info">
            <div className="date-info-item">
              <Clock size={16} className="text-crimson" />
              <span>Desde las 21:00 hasta el cierre</span>
            </div>
            <div className="date-info-item">
              <MapPin size={16} className="text-crimson" />
              <span>San Pedro, Bolivia</span>
            </div>
            <div className="date-info-item">
              <Sparkles size={16} className="text-crimson" />
              <span>Cupos limitados por aforo de seguridad</span>
            </div>
          </div>
        </div>

        <div className="timeline-container">
          <h4 className="timeline-title">Itinerario de la Noche</h4>
          <div className="timeline-items">
            {schedule.map((item, idx) => (
              <div key={idx} className="timeline-row">
                <div className="timeline-time-col">
                  <code>{item.time}</code>
                </div>
                <div className="timeline-bullet-col">
                  <span className="timeline-dot" />
                  {idx < schedule.length - 1 && <span className="timeline-line" />}
                </div>
                <div className="timeline-body-col">
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="submit-booking-btn"
            onClick={onClose}
          >
            <CheckCircle2 size={18} />
            <span>¡Listo para la noche!</span>
          </button>
        </div>
      </div>
    </div>
  )
}
