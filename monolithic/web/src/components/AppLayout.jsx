import { useState } from 'react'
import {
  Boxes,
  FileText,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import '../features/dashboard/dashboard.css'

const appNavigation = [
  { label: 'Workspace', items: [{ label: 'Overview', to: '/app', icon: LayoutDashboard, end: true }] },
  {
    label: 'Storage',
    items: [
      { label: 'Files', to: '/app/storage/files', icon: FileText },
      { label: 'Spaces', to: '/app/storage/spaces', icon: FolderKanban },
    ],
  },
  { label: 'Developer', items: [{ label: 'API keys', to: '/app/developer/api-keys', icon: KeyRound }] },
  { label: 'Configuration', items: [{ label: 'Bucket settings', to: '/app/settings/bucket', icon: Settings }] },
]

const routeTitles = {
  '/app': 'Overview',
  '/app/storage/files': 'Files',
  '/app/storage/spaces': 'Spaces',
  '/app/developer/api-keys': 'API keys',
  '/app/settings/bucket': 'Bucket settings',
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'app-sidebar open' : 'app-sidebar'}>
        <div className="app-sidebar-brand">
          <Link to="/app" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><Boxes size={19} /></span>
            <span>DomainDrop</span>
          </Link>
          <button className="icon-button app-sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>

        <nav className="app-nav" aria-label="Dashboard navigation">
          {appNavigation.map((group) => (
            <div className="app-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <Link to="/developer">Developer docs</Link>
          <button type="button" onClick={handleLogout} disabled={loggingOut}>
            <LogOut size={17} />
            {loggingOut ? 'Signing out' : 'Sign out'}
          </button>
        </div>
      </aside>

      {menuOpen && <button className="app-sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <div className="app-main">
        <header className="app-topbar">
          <button className="icon-button app-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div>
            <span>Workspace</span>
            <strong>{routeTitles[location.pathname] || 'DomainDrop'}</strong>
          </div>
          <Link className="app-docs-link" to="/developer">Docs</Link>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
