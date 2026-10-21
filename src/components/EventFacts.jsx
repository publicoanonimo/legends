import { Calendar, MapPin, Sparkles, Ghost, ExternalLink } from 'lucide-react'
import { playClickSound } from '../utils/sound'

export default function EventFacts({ onOpenDateModal, onOpenCostumeModal }) {
  return (
    <section className="event-facts-section">
      <div className="facts-intro-box">
        <span className="section-kicker">✦ PREPARA TU GRUPO</span>
        <h2 className="section-title">¿Te atreves a entrar al Paranormal?</h2>
        <p className="section-desc">
          Este 30 de octubre, THE LEGENDS transforma San Pedro en el epicentro del terror.
          Reúne a tus amigos, viste tu caracterización más impactante y sé parte de la noche más esperada del año.
        </p>
      </div>

      <div className="facts-grid">
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
            <span className="fact-tile-label">CÓDIGO DE VESTIMENTA</span>
            <strong className="fact-tile-val">¡Ven Disfrazado!</strong>
            <span className="fact-tile-hint">Concurso & Premios ✦</span>
          </div>
        </button>

        {/* Terror house inclusive perk */}
        <div className="fact-tile-perk">
          <div className="perk-icon-wrap">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>Casa del Terror Incluida</strong>
            <p>Con tu entrada o mesa accedes a la experiencia de terror inmersivo sin costo extra.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
