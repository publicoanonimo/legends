import { lazy, Suspense, useState, useEffect } from 'react'
import {
  Home, LayoutDashboard, ClipboardList, Banknote, Package, Menu, X, Ticket, Calendar,
  ChevronRight, UserRound, LogOut, Download, UsersRound
} from 'lucide-react'

// Components
import HeroSection from './components/HeroSection'
import EventFacts from './components/EventFacts'
import PresaleSection from './components/PresaleSection'
import TablesSection from './components/TablesSection'
import SocialSection from './components/SocialSection'
import StaffSection from './components/StaffSection'
import FooterSection from './components/FooterSection'
import Toast from './components/Toast'

const BookingModal = lazy(() => import('./components/BookingModal'))
const LightboxModal = lazy(() => import('./components/LightboxModal'))
const CostumeModal = lazy(() => import('./components/CostumeModal'))
const DateModal = lazy(() => import('./components/DateModal'))
const LoginModal = lazy(() => import('./components/LoginModal'))
const DashboardModule = lazy(() => import('./components/DashboardModule'))
const ResumenModule = lazy(() => import('./components/ResumenModule'))
const InventarioModule = lazy(() => import('./components/InventarioModule'))
const CajaModule = lazy(() => import('./components/CajaModule'))
const UsuariosModule = lazy(() => import('./components/UsuariosModule'))

// Sound utility
import { playClickSound } from './utils/sound'
import { modulesForRole, persistUsers, readUsers } from './utils/usersStore'

const modules = [
  { id: 'inicio', label: 'Inicio', icon: Home, desc: 'Evento & Preventa' },
  { id: 'resumen', label: 'Dashboard', icon: LayoutDashboard, desc: 'Resumen de precios' },
  { id: 'dashboard', label: 'Inscritos', icon: ClipboardList, desc: 'Registro personal y grupal' },
  { id: 'caja', label: 'Caja POS', icon: Banknote, desc: 'Cobro de Puerta' },
  { id: 'inventario', label: 'Inventario', icon: Package, desc: 'Stock & Barra' },
  { id: 'usuarios', label: 'Usuarios y roles', icon: UsersRound, desc: 'Cuentas del panel' },
]

export default function App() {
  const [users, setUsers] = useState(() => readUsers())
  const [sessionUsername, setSessionUsername] = useState(() => {
    const saved = window.localStorage.getItem('legends_admin_session')
    return saved === 'true' ? 'admin' : saved
  })
  const currentUser = users.find((user) => user.username === sessionUsername)
  const isAdmin = Boolean(currentUser)
  const [active, setActive] = useState(() => {
    const saved = window.localStorage.getItem('legends_admin_session')
    const username = saved === 'true' ? 'admin' : saved
    const account = readUsers().find((user) => user.username === username)
    return account ? (account.role === 'inscripciones' ? 'dashboard' : 'resumen') : 'inicio'
  })
  const [loginOpen, setLoginOpen] = useState(false)
  // Default to open on desktop (>=1024px) and closed on mobile (<1024px)
  const [sidebarOpen, setSidebarOpen] = useState(() => Boolean(window.localStorage.getItem('legends_admin_session')) && window.innerWidth >= 1024)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)

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
    if (!currentUser) return
    const allowed = modulesForRole(currentUser.role)
    if (!allowed.includes(active)) setActive(allowed[0] || 'inicio')
  }, [currentUser, active])

  useEffect(() => {
    const captureInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleInstalled = () => setInstallPrompt(null)
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
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

  const handleLogin = (username, password) => {
    const user = users.find((item) => item.username === username.trim().toLowerCase() && item.password === password)
    if (!user) return false
    window.localStorage.setItem('legends_admin_session', user.username)
    setSessionUsername(user.username)
    setActive(user.role === 'inscripciones' ? 'dashboard' : 'resumen')
    setSidebarOpen(window.innerWidth >= 1024)
    setLoginOpen(false)
    return true
  }

  const handleLogout = () => {
    window.localStorage.removeItem('legends_admin_session')
    setSessionUsername(null)
    setActive('inicio')
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveUsers = (nextUsers) => {
    persistUsers(nextUsers)
    setUsers(nextUsers)
    if (!nextUsers.some((user) => user.username === sessionUsername)) handleLogout()
  }

  const handleInstallApp = async () => {
    if (!installPrompt) { setInstallHelpOpen(true); return }
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  const activeModule = modules.find((m) => m.id === active) || modules[0]
  const visibleModules = currentUser ? modules.filter((item) => modulesForRole(currentUser.role).includes(item.id)) : []

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
            {visibleModules.map((item) => {
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
              <button className="install-app-btn" onClick={handleInstallApp} aria-label="Añadir aplicación a pantalla principal">
                <Download size={16} /><span>Instalar</span>
              </button>
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
            <button className="install-app-btn" onClick={handleInstallApp} aria-label="Añadir aplicación a pantalla principal">
              <Download size={16} /><span>Instalar app</span>
            </button>
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

          {active === 'resumen' && (
            <Suspense fallback={<p className="registration-loading">Cargando resumen…</p>}>
              <ResumenModule />
            </Suspense>
          )}

          {active === 'dashboard' && (
            <Suspense fallback={<p className="registration-loading">Cargando panel…</p>}>
              <DashboardModule />
            </Suspense>
          )}

          {active === 'caja' && (
            <Suspense fallback={<p className="registration-loading">Cargando caja…</p>}><CajaModule onToast={showToast} /></Suspense>
          )}

          {active === 'inventario' && (
            <Suspense fallback={<p className="registration-loading">Cargando inventario…</p>}>
              <InventarioModule onToast={showToast} />
            </Suspense>
          )}

          {active === 'usuarios' && currentUser?.role === 'admin' && (
            <Suspense fallback={<p className="registration-loading">Cargando usuarios…</p>}>
              <UsuariosModule users={users} currentUser={currentUser} onSaveUsers={handleSaveUsers} />
            </Suspense>
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
      <Suspense fallback={(
        <div className="modal-backdrop" role="status" aria-live="polite">
          <div className="booking-modal-card">Cargando…</div>
        </div>
      )}>
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
      </Suspense>
      {installHelpOpen && <div className="modal-backdrop" role="presentation" onClick={() => setInstallHelpOpen(false)}><div className="booking-modal-card install-help-card" role="dialog" aria-modal="true" aria-labelledby="install-help-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">ACCESO RÁPIDO</span><h2 id="install-help-title" className="modal-title">Añadir a pantalla principal</h2></div><button type="button" className="modal-close-btn" onClick={() => setInstallHelpOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body"><p>En iPhone o iPad, toca <strong>Compartir</strong> en Safari y elige <strong>Añadir a pantalla de inicio</strong>.</p><p>En Android, abre el menú del navegador y selecciona <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla principal</strong>.</p></div></div></div>}
    </div>
  )
}
