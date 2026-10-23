import { Sparkles, Users, Wine, MessageSquare, Eye } from 'lucide-react'
import { playClickSound } from '../utils/sound'

const packages = [
  {
    id: 'pennywise',
    number: '01',
    name: 'Mesa Pennywise',
    category: 'Singani',
    price: 250,
    liquor: 'La Casa Real (Singani)',
    image: '/mesa-pennywise.jpeg',
    items: [
      'Botella La Casa Real',
      '10 Manillas oficiales',
      'Refresco Sprite',
      'Jarra, hielo y vasos',
      '1 Free Pass para el organizador',
    ],
  },
  {
    id: 'infierno',
    number: '02',
    name: 'Mesa del Infierno',
    category: 'Ron',
    price: 260,
    liquor: 'Ron Flor de Caña / Havana',
    image: '/mesa-infierno.jpeg',
    items: [
      'Botella de Ron premium',
      '10 Manillas oficiales',
      'Refresco Sprite',
      'Jarra, hielo y vasos',
      '1 Free Pass para el organizador',
    ],
  },
  {
    id: 'fantasma',
    number: '03',
    name: 'Mesa Fantasma',
    category: 'Jäger',
    price: 300,
    liquor: 'Jägermeister + 2 Red Bull',
    image: '/mesa-fantasma.jpeg',
    items: [
      'Botella de Jägermeister',
      '2 Latas de Red Bull',
      '10 Manillas oficiales',
      'Hielo, vasos y jarra',
      '1 Free Pass para el organizador',
    ],
  },
  {
    id: 'maldita',
    number: '04',
    name: 'Mesa Maldita',
    category: 'Whisky',
    price: 280,
    liquor: 'Whisky Rebel',
    image: '/mesa-maldita.jpeg',
    items: [
      'Botella de Whisky Rebel',
      'Refresco mezclador',
      'Jarra, vasos y hielo',
      '10 Manillas oficiales',
      '1 Free Pass para el organizador',
    ],
  },
  {
    id: 'conjuro',
    number: '05',
    name: 'Mesa de Conjuro',
    category: 'Ron',
    price: 280,
    liquor: 'Botella de Ron Especial',
    image: '/mesa-conjuro.jpeg',
    items: [
      'Botella de Ron especial',
      'Refresco mezclador',
      'Jarra, vasos y hielo',
      '10 Manillas oficiales',
      '1 Free Pass para el organizador',
    ],
  },
]

export default function TablesSection({ onOpenBooking, onOpenLightbox }) {
  return (
    <section id="tables-section" className="tables-section-v2">
      <div className="section-head-bar">
        <div>
          <span className="section-kicker">✦ ESPACIOS EXCLUSIVOS PARA GRUPOS</span>
          <h2 className="section-title">Mesas VIP & Paquetes</h2>
          <p className="section-subtitle">
            Una noche · Dos experiencias · Un solo lugar. Todas las mesas incluyen 10 manillas + 1 Free Pass.
          </p>
        </div>
      </div>

      <div className="packages-v2-grid">
        {packages.map((pkg) => (
          <article key={pkg.id} className="package-card-v2">
            {/* Visual Thumbnail */}
            <div
              className="package-poster-box"
              onClick={() => {
                playClickSound()
                onOpenLightbox({
                  src: pkg.image,
                  title: `${pkg.name} · Afiche Oficial`,
                  alt: `Afiche oficial para ${pkg.name}`,
                  caption: `${pkg.name}: ${pkg.price} Bs. Incluye ${pkg.liquor}, 10 manillas y 1 Free Pass.`,
                })
              }}
              role="button"
              tabIndex={0}
              aria-label={`Ver afiche oficial de ${pkg.name}`}
            >
              <img src={pkg.image} alt={pkg.name} className="package-thumb-img" loading="lazy" />
              <div className="poster-zoom-hint">
                <Eye size={16} />
                <span>VER AFICHE</span>
              </div>
            </div>

            {/* Package details */}
            <div className="package-body-content">
              <div className="package-meta-line">
                <span className="package-num-tag">{pkg.number} / {pkg.category.toUpperCase()}</span>
                <span className="package-capacity-badge">
                  <Users size={12} />
                  <span>10 Personas</span>
                </span>
              </div>

              <h3 className="package-title">{pkg.name}</h3>

              <div className="package-liquor-highlight">
                <Wine size={14} className="text-crimson" />
                <span>{pkg.liquor}</span>
              </div>

              <ul className="package-items-list">
                {pkg.items.map((item, idx) => (
                  <li key={idx}>
                    <span className="list-bullet">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="package-card-footer">
                <div className="package-price-box">
                  <span className="price-small-label">PRECIO TOTAL</span>
                  <strong className="package-price-val">
                    {pkg.price} <small>Bs</small>
                  </strong>
                </div>

                <button
                  type="button"
                  className="package-reserve-btn"
                  onClick={() => {
                    playClickSound()
                    onOpenBooking(pkg.id)
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Reservar</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="tables-info-banner">
        <Sparkles size={18} className="text-crimson" />
        <p>
          <strong>¿Deseas personalizar tu mesa o bebidas extras?</strong> Utiliza el botón de reserva o consulta directamente por WhatsApp. Te asignamos la mejor ubicación en San Pedro según el orden de confirmación.
        </p>
      </div>
    </section>
  )
}
