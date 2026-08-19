import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Developers', to: '/developer' },
  { label: 'About', to: '/about' },
]

function Brand({ onClick }) {
  return (
    <Link className="brand" to="/" aria-label="DomainDrop home" onClick={onClick}>
      <span className="brand-mark" aria-hidden="true">
        <Boxes size={19} strokeWidth={2.2} />
      </span>
      <span>DomainDrop</span>
    </Link>
  )
}

function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, isReady, logout } = useAuth()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      navigate('/')
    }
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand onClick={() => setIsMenuOpen(false)} />

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={item.to === '/'}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <div className="auth-action-slot">
            {!isReady ? (
              <span
                className="header-session-placeholder"
                role="status"
                aria-label="Checking session"
              />
            ) : isAuthenticated ? (
              <>
                <span className="session-status">
                  <CheckCircle2 size={15} aria-hidden="true" />
                  Session active
                </span>
                <Link className="button button-small button-dark" to="/app">
                  Dashboard
                </Link>
                <button
                  className="icon-button"
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link className="text-link header-login" to="/login">
                  Log in
                </Link>
                <Link className="button button-small button-dark" to="/signup">
                  Start free
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
          <button
            className="icon-button menu-button"
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <div className="shell mobile-nav-inner">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                }
                end={item.to === '/'}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {isReady && !isAuthenticated && (
              <Link
                className="mobile-nav-link"
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
            )}
            {isReady && isAuthenticated && (
              <Link className="mobile-nav-link" to="/app" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Simple object storage for products that need to move quickly.</p>
        </div>
        <div className="footer-column">
          <p className="footer-label">Product</p>
          <Link to="/pricing">Pricing</Link>
          <Link to="/developer">Developer docs</Link>
          <Link to="/signup">Create account</Link>
        </div>
        <div className="footer-column">
          <p className="footer-label">Company</p>
          <Link to="/about">About</Link>
          <a href="mailto:hello@domaindrop.dev">Contact</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>Â© {new Date().getFullYear()} DomainDrop</span>
        <span>Private by default.</span>
      </div>
    </footer>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function SiteLayout() {
  return (
    <div className="site-frame">
      <ScrollToTop />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
