import { useState, useEffect } from 'react'
import { Sparkles, Calendar, MapPin, Ticket, Flame, Eye } from 'lucide-react'
import Countdown from './Countdown'
import { playClickSound } from '../utils/sound'

export default function HeroSection({ onOpenBooking, onOpenLightbox, onOpenCostume, onOpenDateModal }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14
    setTilt({ x, y })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <section className="event-hero-v2">
      {/* Dynamic GPU lighting: sweeps L -> R fast, fluid, zero CPU lag */}
      <div className="hero-glow-scene" aria-hidden="true">
        <div className="hero-light-sweep sweep-crimson" />
        <div className="hero-light-sweep sweep-violet" />
        <div className="hero-light-sweep sweep-beam" />
        <div className="hero-light-pulse" />
      </div>

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
            <Countdown onOpenDateModal={onOpenDateModal} />
          </div>

          {/* Action buttons */}
          <div className="hero-action-row">
            <button
              className="hero-primary-cta"
              onClick={() => {
                playClickSound()
                onOpenBooking('preventa')
              }}
            >
              <Ticket size={18} />
              <span>Asegurar Preventa (10 Bs)</span>
              <Sparkles size={16} className="cta-sparkle" />
            </button>

            <button
              className="hero-secondary-cta"
              onClick={() => {
                playClickSound()
                const el = document.getElementById('tables-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Flame size={17} />
              <span>Ver Mesas VIP</span>
            </button>
          </div>

          {/* Hero key notes */}
          <div className="hero-perks-row">
            <div className="hero-perk">
              <Calendar size={15} className="text-crimson" />
              <span>Jueves 30 de Octubre</span>
            </div>
            <div className="hero-perk-sep">·</div>
            <div className="hero-perk">
              <MapPin size={15} className="text-crimson" />
              <span>San Pedro, Bolivia</span>
            </div>
            <div className="hero-perk-sep">·</div>
            <div className="hero-perk highlight-perk">
              <span>Casa de Terror Incluida</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Poster Card with 3D Tilt */}
        <div className="hero-poster-column">
          <div
            className="hero-poster-interactive"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            }}
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
