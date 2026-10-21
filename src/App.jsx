import { useEffect, useState } from 'react'

const modules = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'caja', label: 'Caja', icon: 'cash' },
  { id: 'inventario', label: 'Inventario', icon: 'box' },
]

function Icon({ name, size = 19 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></>,
    cash: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 5V3h10v2m-8 9h.01M15 14h.01"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8m-9 5v9"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function App() {
  const [active, setActive] = useState('inicio')
  const [eventOverlay, setEventOverlay] = useState('')
  const activeModule = modules.find((module) => module.id === active)

  useEffect(() => {
    if (!eventOverlay) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setEventOverlay('')
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [eventOverlay])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setActive('inicio')} aria-label="Ir a Inicio">
          <span className="brand-mark">L</span>
          <span className="brand-copy"><strong>THE LEGENDS</strong><small>ESPACIO OFICIAL</small></span>
        </button>

        <div className="nav-label">MENÚ PRINCIPAL</div>
        <nav className="main-nav" aria-label="Navegación principal">
          {modules.map((module) => (
            <button key={module.id} className={`nav-item ${active === module.id ? 'selected' : ''}`} onClick={() => setActive(module.id)}>
              <Icon name={module.icon}/><span>{module.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="note-star">✦</span><strong>Bienvenido a Legends</strong><p>Tu espacio para todo lo que viene.</p></div>
          <div className="sidebar-footer"><span className="status-dot"/> Proyecto en crecimiento</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>THE LEGENDS</span><span className="crumb-separator">/</span><strong>{activeModule.label}</strong></div>
          <div className="topbar-mark">L</div>
        </header>

        {active === 'inicio' ? (
          <div className="home-content">
            <section className="event-hero">
              <div className="event-copy">
                <span className="hero-eyebrow"><i/> THE LEGENDS PRESENTA</span>
                <h1>PARANORMAL<br/><em>FEST</em></h1>
                <p>Una noche de terror te espera.<br/>Ven disfrazado y vive la experiencia.</p>
                <span className="event-date"><b>30</b> OCTUBRE</span>
                <span className="event-ribbon">FIESTA · CASA DE TERROR INCLUIDO</span>
              </div>
              <figure className="poster-frame"><img src="/paranormal-fest.jpeg" alt="Afiche de Paranormal Fest de The Legends: 30 de octubre en San Pedro"/><figcaption>PARANORMAL FEST · 30 DE OCTUBRE</figcaption></figure>
              <span className="event-stamp">UNA<br/>NOCHE<br/>DE TERROR</span>
            </section>

            <section className="event-details">
              <div className="event-intro"><span className="section-kicker">PREPARA TU DISFRAZ</span><h2>¿Te atreves a entrar?</h2><p>Este 30 de octubre, THE LEGENDS te invita a una noche escalofriante. Reúne a tus amigos, ven disfrazado y prepárate para vivir una fiesta que no olvidarás.</p></div>
              <div className="event-facts"><button className="fact-card fact-button" onClick={() => setEventOverlay('date')}><span className="fact-icon">30</span><span className="fact-labels"><small>FECHA</small><strong>30 de octubre</strong></span><span className="fact-hint">Ver ✦</span></button><a className="fact-card fact-button" href="https://maps.app.goo.gl/TpSrCA6XpSprXCk36?g_st=iw" target="_blank" rel="noreferrer"><span className="fact-icon pin">⌖</span><span className="fact-labels"><small>LUGAR</small><strong>San Pedro</strong></span><span className="fact-hint">Mapa ↗</span></a><button className="fact-card fact-button dress-fact" onClick={() => setEventOverlay('costume')}><span className="fact-icon">✦</span><span className="fact-labels"><small>VESTIMENTA</small><strong>¡Ven disfrazado!</strong></span><span className="fact-hint">Descubre ✦</span></button></div>
            </section>

            <section className="ticket-section">
              <div className="content-heading"><div><span className="section-kicker">ASEGURA TU ENTRADA</span><h2>Preventa</h2></div><span className="price-burst">10 <small>Bs</small></span></div>
              <div className="presale-card"><a className="presale-poster" href="/paranormal-preventa.jpeg" target="_blank" rel="noreferrer"><img src="/paranormal-preventa.jpeg" alt="Afiche de preventa Paranormal Fest: entrada a 10 bolivianos, 30 de octubre, San Pedro"/><span>VER AFICHE ↗</span></a><div className="presale-info"><span className="presale-tag">CUPO DE PREVENTA</span><h3>Vive la noche.<br/><em>Entra al paranormal.</em></h3><p>Consigue tu entrada en preventa por solo <strong>10 Bs</strong>. El afiche incluye un código QR para consultas y reservas por WhatsApp.</p><div className="presale-facts"><span><b>FECHA</b>30 de octubre</span><span><b>LUGAR</b>San Pedro</span></div></div></div>
            </section>

            <section className="tables-section">
              <div className="content-heading"><div><span className="section-kicker">RESERVAS E INFORMACIÓN</span><h2>Mesas para tu grupo</h2></div><span className="tables-note">UNA NOCHE · DOS EXPERIENCIAS · UN SOLO LUGAR</span></div>
              <div className="packages-grid">
                <article className="package-card"><a className="package-image" href="/mesas-pennywise-infierno.jpeg" target="_blank" rel="noreferrer"><img src="/mesas-pennywise-infierno.jpeg" alt="Afiche del paquete Mesa Pennywise"/><span>VER AFICHE ↗</span></a><div className="package-content"><span className="package-number">01 / PENNYWISE</span><h3>Mesa Pennywise</h3><ul><li>La Casa Real</li><li>10 manillas</li><li>Sprite</li><li>Jarra, hielo y vasos</li><li>1 Free Pass</li></ul><div className="package-price">250 <small>Bs</small></div></div></article>
                <article className="package-card"><a className="package-image" href="/mesas-pennywise-infierno.jpeg" target="_blank" rel="noreferrer"><img src="/mesas-pennywise-infierno.jpeg" alt="Afiche del paquete Mesa del Infierno"/><span>VER AFICHE ↗</span></a><div className="package-content"><span className="package-number">02 / INFIERNO</span><h3>Mesa del Infierno</h3><ul><li>Ron</li><li>10 manillas</li><li>Sprite</li><li>Jarra, hielo y vasos</li><li>1 Free Pass</li></ul><div className="package-price">260 <small>Bs</small></div></div></article>
                <article className="package-card"><a className="package-image" href="/mesas-fantasma-maldita-conjuro.jpeg" target="_blank" rel="noreferrer"><img src="/mesas-fantasma-maldita-conjuro.jpeg" alt="Afiche del paquete Mesa Fantasma"/><span>VER AFICHE ↗</span></a><div className="package-content"><span className="package-number">03 / FANTASMA</span><h3>Mesa Fantasma</h3><ul><li>Jäger</li><li>2 Red Bull</li><li>10 manillas</li><li>Hielo, vasos y jarra</li><li>1 Free Pass</li></ul><div className="package-price">300 <small>Bs</small></div></div></article>
                <article className="package-card"><a className="package-image" href="/mesas-fantasma-maldita-conjuro.jpeg" target="_blank" rel="noreferrer"><img src="/mesas-fantasma-maldita-conjuro.jpeg" alt="Afiche del paquete Mesa Maldita"/><span>VER AFICHE ↗</span></a><div className="package-content"><span className="package-number">04 / MALDITA</span><h3>Mesa Maldita</h3><ul><li>Rebel</li><li>Refresco</li><li>Jarra, vasos y hielo</li><li>10 manillas</li><li>1 Free Pass</li></ul><div className="package-price">280 <small>Bs</small></div></div></article>
                <article className="package-card"><a className="package-image" href="/mesas-fantasma-maldita-conjuro.jpeg" target="_blank" rel="noreferrer"><img src="/mesas-fantasma-maldita-conjuro.jpeg" alt="Afiche del paquete Mesa de Conjuro"/><span>VER AFICHE ↗</span></a><div className="package-content"><span className="package-number">05 / CONJURO</span><h3>Mesa de Conjuro</h3><ul><li>Ron</li><li>Refresco</li><li>Jarra, vasos y hielo</li><li>10 manillas</li><li>1 Free Pass</li></ul><div className="package-price">280 <small>Bs</small></div></div></article>
              </div>
              <p className="booking-note"><span>✦</span> Para reservas e información, utiliza el código QR de WhatsApp que aparece en los afiches del evento.</p>
            </section>

            <footer className="home-footer"><span>© 2026 THE LEGENDS</span><span>EL COMIENZO DE ALGO GRANDE <b>✦</b></span></footer>
          </div>
        ) : <div className="empty-module" aria-label={`${activeModule.label} vacío`} />}
      </main>
      {eventOverlay && <div className={`event-overlay ${eventOverlay === 'date' ? 'date-overlay' : 'costume-overlay'}`} role="presentation" onClick={() => setEventOverlay('')}>
        <section className="overlay-scene" role="dialog" aria-modal="true" aria-labelledby="event-overlay-title" onClick={(event) => event.stopPropagation()}>
          <button className="overlay-close" aria-label="Cerrar animación" onClick={() => setEventOverlay('')}>×</button>
          {eventOverlay === 'date' ? <div className="date-scene"><span className="scene-kicker">THE LEGENDS PRESENTA</span><div className="calendar-animation" aria-hidden="true"><span>OCT</span><strong>30</strong><i/><i/><i/><i/></div><p className="scene-overline">UNA NOCHE PARA RECORDAR</p><h2 id="event-overlay-title">30 DE <em>OCTUBRE</em></h2><p className="scene-caption">PARANORMAL FEST · SAN PEDRO</p><div className="scene-sparks" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i></div></div> : <div className="costume-scene"><span className="scene-kicker">EL TERROR TAMBIÉN SE VISTE</span><div className="costume-stage" aria-hidden="true"><div className="stage-light light-red"/><div className="stage-light light-violet"/><div className="stage-floor"/><span className="stage-bat bat-left">🦇</span><span className="stage-bat bat-right">🦇</span><span className="stage-ghost ghost-left">👻</span><span className="stage-ghost ghost-right">🎃</span><div className="costume-mannequin"><span className="featured-pumpkin">🎃</span></div><div className="stage-pedestal"/><div className="stage-embers"><i/><i/><i/><i/><i/><i/></div></div><p className="scene-overline">PREPARA TU MEJOR LOOK</p><h2 id="event-overlay-title">¡VEN <em>DISFRAZADO!</em></h2><p className="scene-caption">ATRÉVETE A SER PARTE DE LA NOCHE</p><div className="costume-light"/></div>}
          <button className="overlay-action" onClick={() => setEventOverlay('')}>¡ENTENDIDO! <span>✦</span></button>
        </section>
      </div>}
    </div>
  )
}
