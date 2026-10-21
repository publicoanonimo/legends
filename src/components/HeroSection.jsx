import { Eye } from 'lucide-react'
import Countdown from './Countdown'
import { playClickSound } from '../utils/sound'

export default function HeroSection({ onOpenLightbox }) {
  return (
    <section className="event-hero-v2">
      <div className="hero-diagonal-ribbon">
        <span>THE LEGENDS ✦ HALLOWEEN ✦ PARANORMAL FEST ✦ SAN PEDRO ✦ 30 DE OCTUBRE</span>
      </div>

      <div className="hero-grid">
        {/* Left: Copy & CTAs */}
        <div className="hero-copy-column">
          <div className="hero-badge-pill">
            <span className="pulsing-red-dot" />
            <span>THE LEGENDS PRESENTA · EDICIÓN HALLOWEEN</span>
          </div>

          <h1 className="hero-main-title">
            PARANORMAL
            <span className="title-accent-glow"> FEST</span>
          </h1>

          <p className="hero-lead-text">
            Una noche de misterio, música y terror inmersivo en <strong>San Pedro</strong>.
            Ven con tu mejor disfraz y vive una experiencia épica con fiesta y casa del terror incluidas.
          </p>

          {/* Revamped Pro Countdown timer */}
          <div className="hero-countdown-wrapper">
            <Countdown />
          </div>

        </div>

        {/* Right: Interactive Poster Card with 3D Tilt */}
        <div className="hero-poster-column">
          <div
            className="hero-poster-interactive"
            onClick={() => {
              playClickSound()
              onOpenLightbox({
                src: '/paranormal-fest.jpeg',
                title: 'Paranormal Fest · Afiche Oficial',
                alt: 'Afiche oficial de Paranormal Fest en San Pedro 30 de Octubre',
                caption: 'The Legends presenta Paranormal Fest: 30 de Octubre en San Pedro. Fiesta + Casa del Terror.',
              })
            }}
            role="button"
            tabIndex={0}
            aria-label="Ver afiche oficial completo de Paranormal Fest"
          >
            <div className="poster-inner-frame">
              <img
                src="/paranormal-fest.jpeg"
                fetchPriority="high"
                alt="Afiche oficial Paranormal Fest"
                className="poster-artwork"
              />
              <div className="poster-hover-overlay">
                <Eye size={24} />
                <span>Clic para ver afiche completo</span>
              </div>
            </div>

            <div className="poster-floating-tag">
              <span className="tag-kicker">OFICIAL</span>
              <strong>30 OCT</strong>
            </div>

            <div className="poster-terror-badge">
              <span>UNA NOCHE<br />DE TERROR</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
