import { useState, useEffect } from 'react'
import {
  Home, Menu, X, Ticket, Calendar, ChevronRight
} from 'lucide-react'

// Components
import HeroSection from './components/HeroSection'
import EventFacts from './components/EventFacts'
import PresaleSection from './components/PresaleSection'
import TablesSection from './components/TablesSection'
import SocialSection from './components/SocialSection'
import StaffSection from './components/StaffSection'
import FooterSection from './components/FooterSection'
import BookingModal from './components/BookingModal'
import LightboxModal from './components/LightboxModal'
import CostumeModal from './components/CostumeModal'
import DateModal from './components/DateModal'
import Toast from './components/Toast'

// Sound utility
import { playClickSound } from './utils/sound'

const modules = [
  { id: 'inicio', label: 'Inicio', icon: Home, desc: 'Evento & Preventa' },
]

export default function App() {
  const [active, setActive] = useState('inicio')
  // Default to open on desktop (>=1024px) and closed on mobile (<1024px)
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false))

  // Modals state
  const [bookingPackage, setBookingPackage] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [costumeModalOpen, setCostumeModalOpen] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Listen for window resize to handle sidebar gracefully between mobile and desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const showToast = (toastData) => {
    setToast(toastData)
  }

  const handleNavClick = (moduleId) => {
    playClickSound()
    setActive(moduleId)
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeModule = modules.find((m) => m.id === active) || modules[0]

  return (
    <div className="app-shell">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern Sidebar */}
      <aside className={`sidebar-v2 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-top">
          <button
            className="brand-v2"
            onClick={() => handleNavClick('inicio')}
            aria-label="Ir al inicio de The Legends"
          >
            <span className="brand-mark-v2">L</span>
            <div className="brand-meta">
              <strong className="brand-title">THE LEGENDS</strong>
              <small className="brand-badge">PARANORMAL FEST</small>
            </div>
          </button>

          {/* Mobile close button */}
          <button
            className="sidebar-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav-container">
          <span className="sidebar-section-label">MENÚ PRINCIPAL</span>
          <nav className="sidebar-nav" aria-label="Navegación principal">
            {modules.map((item) => {
              const IconComp = item.icon
              const isSelected = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-button ${isSelected ? 'nav-selected' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <div className="nav-icon-wrap">
                    <IconComp size={18} />
                  </div>
                  <div className="nav-label-box">
                    <span className="nav-name">{item.label}</span>
                    <span className="nav-sub">{item.desc}</span>
                  </div>
                  {isSelected && <span className="nav-active-pip" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Event Widget */}
        <div className="sidebar-bottom-panel">
          <div className="sidebar-event-card">
            <div className="sidebar-card-kicker">
              <span className="pulsing-red-dot" />
              <span>30 DE OCTUBRE</span>
            </div>
            <strong>San Pedro, Bolivia</strong>
            <p>Fiesta & Casa del Terror inmersiva. Preventa habilitada.</p>
            <button
              className="sidebar-booking-btn"
              onClick={() => {
                playClickSound()
                setBookingPackage('preventa')
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
            >
              <Ticket size={14} />
              <span>Reservar Preventa (10 Bs)</span>
            </button>
          </div>

          <div className="sidebar-status-footer">
            <span className="status-live-dot" />
            <span>Sistema Operativo · 2026</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`main-area-v2 ${sidebarOpen ? 'has-sidebar' : 'collapsed-sidebar'}`}>
        {/* Topbar Header */}
        <header className="topbar-v2">
          <div className="topbar-left">
            <button
              className="topbar-menu-toggle"
              onClick={() => {
                playClickSound()
                setSidebarOpen(!sidebarOpen)
              }}
              aria-label={sidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
              aria-expanded={sidebarOpen}
            >
              <Menu size={19} />
            </button>

            <div className="topbar-breadcrumbs">
              <span className="crumb-brand">THE LEGENDS</span>
              <ChevronRight size={14} className="crumb-arrow" />
              <strong className="crumb-current">{activeModule.label}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="event-date-pill" onClick={() => setDateModalOpen(true)}>
              <Calendar size={13} className="text-crimson" />
              <span>30 OCT · SAN PEDRO</span>
            </div>

          </div>
        </header>

        {/* Content View Router */}
        <main className="content-container">
          {active === 'inicio' && (
            <div className="landing-view">
              <HeroSection
                onOpenLightbox={setLightboxImage}
              />

              <EventFacts
                onOpenDateModal={() => setDateModalOpen(true)}
                onOpenCostumeModal={() => setCostumeModalOpen(true)}
              />

              <PresaleSection
                onOpenBooking={(pkgId) => setBookingPackage(pkgId || 'preventa')}
                onOpenLightbox={setLightboxImage}
              />

              <TablesSection
                onOpenBooking={(pkgId) => setBookingPackage(pkgId || 'pennywise')}
                onOpenLightbox={setLightboxImage}
              />

              <SocialSection />
              <StaffSection />
              <FooterSection />
            </div>
          )}

        </main>
      </div>

      {/* Floating Mobile Bottom Bar for Instant Conversion */}
      {active === 'inicio' && (
        <div className="mobile-floating-bar" aria-label="Barra rápida de reserva">
          <div className="mobile-bar-info">
            <span className="mobile-bar-badge">PREVENTA</span>
            <strong className="mobile-bar-price">10 <small>Bs</small></strong>
          </div>
          <button
            className="mobile-bar-action"
            onClick={() => {
              playClickSound()
              setBookingPackage('preventa')
            }}
          >
            <Ticket size={16} />
            <span>Reservar Entrada</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {bookingPackage && (
        <BookingModal
          initialPackageId={bookingPackage}
          onClose={() => setBookingPackage(null)}
          onToast={showToast}
        />
      )}

      {lightboxImage && (
        <LightboxModal
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {costumeModalOpen && (
        <CostumeModal
          onClose={() => setCostumeModalOpen(false)}
        />
      )}

      {dateModalOpen && (
        <DateModal
          onClose={() => setDateModalOpen(false)}
        />
      )}
    </div>
  )
}
