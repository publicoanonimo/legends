import { Ticket, CheckCircle2, Sparkles, MessageSquare, Eye } from 'lucide-react'
import { playClickSound } from '../utils/sound'

export default function PresaleSection({ onOpenBooking, onOpenLightbox }) {
  return (
    <section className="presale-section-v2">
      <div className="section-head-bar">
        <div>
          <span className="section-kicker">✦ CUPOS LIMITADOS</span>
          <h2 className="section-title">Preventa Oficial</h2>
        </div>
      </div>

      <div className="presale-feature-card">
        {/* Left: Poster preview with lightbox trigger */}
        <div
          className="presale-art-frame"
          onClick={() => {
            playClickSound()
            onOpenLightbox({
              src: '/paranormal-preventa.jpeg',
              title: 'Afiche Oficial de Preventa · 10 Bs',
              alt: 'Afiche de Preventa Paranormal Fest: 10 Bs, 30 de Octubre en San Pedro',
              caption: 'Entrada oficial en preventa por solo 10 Bs. Incluye código QR para reservas por WhatsApp.',
            })
          }}
          role="button"
          tabIndex={0}
          aria-label="Ver afiche de preventa con zoom"
        >
          <img
            loading="lazy"
            src="/paranormal-preventa.jpeg"
            alt="Afiche preventa Paranormal Fest 10 Bs"
            className="presale-art-img"
          />
          <div className="art-hover-badge">
            <Eye size={18} />
            <span>AMPLIAR AFICHE CON QR</span>
          </div>
        </div>

        {/* Right: Info, perks, and CTA */}
        <div className="presale-content-side">
          <div className="presale-badge-row">
            <span className="stock-pill">Fase 1 · Preventa</span>
            <span className="date-tag">30 DE OCTUBRE · SAN PEDRO</span>
          </div>

          <h3 className="presale-headline">
            Vive la noche.<br />
            <em>Entra al paranormal.</em>
          </h3>

          <p className="presale-description">
            Asegura tu manilla de preventa antes de que se agoten los cupos. Por solo <strong>10 Bs</strong> tienes acceso completo a la fiesta temática de The Legends y a la Casa del Terror inmersiva.
          </p>

          <div className="presale-perks-list">
            <div className="presale-perk-item">
              <CheckCircle2 size={16} className="text-crimson" />
              <span>Acceso garantizado a la fiesta de Halloween</span>
            </div>
            <div className="presale-perk-item">
              <CheckCircle2 size={16} className="text-crimson" />
              <span>Pase a la Casa del Terror incluido</span>
            </div>
            <div className="presale-perk-item">
              <CheckCircle2 size={16} className="text-crimson" />
              <span>Ambiente exclusivo en San Pedro</span>
            </div>
            <div className="presale-perk-item">
              <CheckCircle2 size={16} className="text-crimson" />
              <span>Reserva directa por QR de WhatsApp</span>
            </div>
          </div>

          <div className="presale-cta-actions">
            <button
              className="presale-buy-btn"
              onClick={() => {
                playClickSound()
                onOpenBooking('preventa')
              }}
            >
              <MessageSquare size={18} />
              <span>Reservar Preventa por WhatsApp (10 Bs)</span>
            </button>

          </div>
        </div>
      </div>
    </section>
  )
}
