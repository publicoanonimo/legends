import { useEffect } from 'react'
import { X, Sparkles, Award, Skull, Ghost, PartyPopper } from 'lucide-react'
import { playEerieSound } from '../utils/sound'

export default function CostumeModal({ onClose }) {
  useEffect(() => {
    playEerieSound()
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

  const ideas = [
    { icon: <Skull size={18} />, title: 'Terror Clásico', desc: 'Pennywise, Jason, Freddy Krueger, Monja o Exorcista.' },
    { icon: <Ghost size={18} />, title: 'Espectros & Zombies', desc: 'Fantasmas barrocos, novias cadavéricas y zombies.' },
    { icon: <Sparkles size={18} />, title: 'En Pareja o Grupo', desc: 'Stranger Things, Los Locos Addams o The Purge.' },
  ]

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="costume-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ THE LEGENDS · DRESS CODE</span>
            <h3 className="modal-title">¡Ven Disfrazado!</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="costume-hero-visual">
          <div className="pumpkin-display" aria-hidden="true">
            <span className="pumpkin-emoji">🎃</span>
            <div className="pumpkin-halo" />
            <span className="floating-bat bat-1">🦇</span>
            <span className="floating-bat bat-2">🦇</span>
            <span className="floating-ghost">👻</span>
          </div>
          <div className="costume-contest-badge">
            <Award size={16} />
            <span>CONCURSO DE MEJOR DISFRAZ</span>
          </div>
        </div>

        <div className="costume-info-body">
          <p className="costume-desc">
            En <strong>Paranormal Fest</strong> no somos espectadores: somos parte de la noche. Ven con tu mejor caracterización y participa por premios sorpresa para tu grupo y cortesías en barra.
          </p>

          <div className="costume-ideas-grid">
            {ideas.map((item, idx) => (
              <div key={idx} className="costume-idea-card">
                <div className="idea-icon-wrap">{item.icon}</div>
                <div>
                  <h4 className="idea-title">{item.title}</h4>
                  <p className="idea-desc">{item.desc}</p>
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
            <PartyPopper size={18} />
            <span>¡Entendido! Prepararé mi disfraz ✦</span>
          </button>
        </div>
      </div>
    </div>
  )
}
