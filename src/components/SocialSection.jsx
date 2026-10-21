import { useState } from 'react'
import { ExternalLink, Volume2, VolumeX, MessageCircle, Music2 } from 'lucide-react'
import { playClickSound, playEerieSound } from '../utils/sound'

function FacebookIcon({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export default function SocialSection() {
  const [ambientActive, setAmbientActive] = useState(false)

  const toggleSound = () => {
    playClickSound()
    if (!ambientActive) {
      playEerieSound()
      setAmbientActive(true)
    } else {
      setAmbientActive(false)
    }
  }

  return (
    <section className="social-section-v2" aria-labelledby="social-heading">
      <div className="section-head-bar">
        <div>
          <span className="section-kicker">✦ COMUNIDAD OFICIAL</span>
          <h2 id="social-heading" className="section-title">Únete a The Legends</h2>
          <p className="section-subtitle">
            Entérate de las dinámicas, pistas de la Casa del Terror y sorteos de entradas en nuestras redes.
          </p>
        </div>

        <button
          className={`ambient-toggle-btn ${ambientActive ? 'active' : ''}`}
          onClick={toggleSound}
          title={ambientActive ? 'Desactivar efecto sonoro' : 'Activar atmósfera paranormal'}
          aria-label={ambientActive ? 'Desactivar efecto sonoro' : 'Activar atmósfera paranormal'}
        >
          {ambientActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{ambientActive ? 'Sonido Activo' : 'Efecto Paranormal'}</span>
        </button>
      </div>

      <div className="social-cards-grid">
        {/* Facebook Card */}
        <a
          href="https://www.facebook.com/share/p/18cDSfeYrE/"
          target="_blank"
          rel="noreferrer"
          className="social-hub-card facebook-hub-card"
          onClick={playClickSound}
        >
          <div className="hub-icon-wrap facebook-icon-wrap">
            <FacebookIcon size={24} />
          </div>
          <div className="hub-info">
            <span className="hub-brand-name">Facebook Oficial</span>
            <strong className="hub-handle">The Legends · Publicación Oficial</strong>
            <p className="hub-desc">Comparte el evento oficial de Paranormal Fest, fotos y dinámicas.</p>
          </div>
          <div className="hub-arrow-box">
            <ExternalLink size={18} />
          </div>
        </a>

        {/* TikTok Card */}
        <a
          href="https://www.tiktok.com/@the_legends.bo?_r=1&_t=ZS-9Ak0Lt8Iffp"
          target="_blank"
          rel="noreferrer"
          className="social-hub-card tiktok-hub-card"
          onClick={playClickSound}
        >
          <div className="hub-icon-wrap tiktok-icon-wrap">
            <Music2 size={24} />
          </div>
          <div className="hub-info">
            <span className="hub-brand-name">TikTok Oficial</span>
            <strong className="hub-handle">@the_legends.bo</strong>
            <p className="hub-desc">Videos promocionales, trends y avances de la temática.</p>
          </div>
          <div className="hub-arrow-box">
            <ExternalLink size={18} />
          </div>
        </a>

        {/* WhatsApp Group Card */}
        <a
          href="https://chat.whatsapp.com/JeMa1gw04jv0Wjaw8roizw"
          target="_blank"
          rel="noreferrer"
          className="social-hub-card whatsapp-hub-card"
          onClick={playClickSound}
        >
          <div className="hub-icon-wrap whatsapp-icon-wrap">
            <MessageCircle size={24} />
          </div>
          <div className="hub-info">
            <span className="hub-brand-name">Comunidad de WhatsApp</span>
            <strong className="hub-handle">Grupo Oficial · The Legends</strong>
            <p className="hub-desc">Consultas rápidas, venta de manillas y anuncios en vivo.</p>
          </div>
          <div className="hub-arrow-box">
            <ExternalLink size={18} />
          </div>
        </a>
      </div>

      <footer className="legends-footer">
        <div className="footer-left">
          <span className="footer-mark">L</span>
          <div>
            <strong>THE LEGENDS · PARANORMAL FEST</strong>
            <small>© 2026 Todos los derechos reservados · San Pedro, Bolivia</small>
          </div>
        </div>

        <div className="footer-right">
          <span className="footer-sparkle">✦</span>
          <span>EL COMIENZO DE ALGO GRANDE</span>
        </div>
      </footer>
    </section>
  )
}
