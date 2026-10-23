import { Calendar, MapPin, Ghost, ExternalLink } from 'lucide-react'
import { playClickSound } from '../utils/sound'

export default function EventFacts({ onOpenDateModal, onOpenCostumeModal }) {
  return (
    <section className="event-facts-section">
      <div className="facts-intro-box">
        <h2 className="section-title facts-title">¿Te lo vas a perder?</h2>
      </div>

      <div className="facts-grid" aria-label="Información del evento">
        {/* Date card */}
        <button
          type="button"
          className="fact-tile-btn"
          onClick={() => {
            playClickSound()
            onOpenDateModal()
          }}
        >
          <div className="fact-tile-icon-box">
            <Calendar size={20} />
          </div>
          <div className="fact-tile-copy">
            <span className="fact-tile-label">FECHA OFICIAL</span>
            <strong className="fact-tile-val">30 de Octubre</strong>
            <span className="fact-tile-hint">Ver detalles ✦</span>
          </div>
        </button>

        {/* Location card */}
        <a
          href="https://maps.app.goo.gl/TpSrCA6XpSprXCk36?g_st=iw"
          target="_blank"
          rel="noreferrer"
          className="fact-tile-btn fact-link-btn"
          onClick={playClickSound}
        >
          <div className="fact-tile-icon-box pin-glow">
            <MapPin size={20} />
          </div>
          <div className="fact-tile-copy">
            <span className="fact-tile-label">UBICACIÓN</span>
            <strong className="fact-tile-val">San Pedro</strong>
            <span className="fact-tile-hint">Abrir en Maps <ExternalLink size={11} className="inline-icon" /></span>
          </div>
        </a>

        {/* Costume card */}
        <button
          type="button"
          className="fact-tile-btn costume-fact-tile"
          onClick={() => {
            playClickSound()
            onOpenCostumeModal()
          }}
        >
          <div className="fact-tile-icon-box costume-glow">
            <Ghost size={20} />
          </div>
          <div className="fact-tile-copy">
            <span className="fact-tile-label">CONCURSO DE DISFRACES</span>
            <strong className="fact-tile-val">¡Inscríbete!</strong>
            <span className="fact-tile-hint">Registro individual y grupal ✦</span>
          </div>
        </button>

      </div>
    </section>
  )
}
