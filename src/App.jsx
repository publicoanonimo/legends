import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  Home, LayoutDashboard, Banknote, Package, Menu, X, Ticket, Calendar,
  ChevronRight, UserRound, LogOut
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
import LoginModal from './components/LoginModal'
import DashboardModule from './components/DashboardModule'
import { auth } from './firebase'

// Sound utility
import { playClickSound } from './utils/sound'

const modules = [
  { id: 'inicio', label: 'Inicio', icon: Home, desc: 'Evento & Preventa' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Métricas & Aforo' },
  { id: 'caja', label: 'Caja POS', icon: Banknote, desc: 'Cobro de Puerta' },
  { id: 'inventario', label: 'Inventario', icon: Package, desc: 'Stock & Barra' },
]

export default function App() {
  const [active, setActive] = useState('inicio')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  // Default to open on desktop (>=1024px) and closed on mobile (<1024px)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Modals state
  const [bookingPackage, setBookingPackage] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [costumeModalOpen, setCostumeModalOpen] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Keep the administrator sidebar in sync with the viewport.
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(isAdmin && window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isAdmin])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(Boolean(user))
      if (!user) setSidebarOpen(false)
    })

    return unsubscribe
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

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    setIsAdmin(true)
    setActive('dashboard')
    setSidebarOpen(window.innerWidth >= 1024)
    setLoginOpen(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    setIsAdmin(false)
    setActive('inicio')
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeModule = modules.find((m) => m.id === active) || modules[0]

  return (
    <div className="app-shell">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Mobile Drawer Backdrop */}
      {isAdmin && sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern Sidebar */}
      {isAdmin && <aside className={`sidebar-v2 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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

      </aside>}

      {/* Main Content Area */}
      <div className={`main-area-v2 ${sidebarOpen ? 'has-sidebar' : 'collapsed-sidebar'} ${!isAdmin ? 'visitor-mode' : ''}`}>
        {/* Topbar Header */}
        <header className="topbar-v2">
          {!isAdmin ? (
            <>
              <span className="visitor-brand">THE LEGENDS</span>
              <div className="visitor-header-actions">
              <button
                className="organizer-login-btn"
                onClick={() => setLoginOpen(true)}
                aria-label="Iniciar sesión de organizador"
                title="Iniciar sesión"
              >
                <UserRound size={17} />
              </button>
              </div>
            </>
          ) : (
            <>
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
            <button className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          </div>
            </>
          )}
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

          {active === 'dashboard' && <DashboardModule />}


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
      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
      )}
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
          onToast={showToast}
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
