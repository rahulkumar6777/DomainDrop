import { useEffect, useMemo, useState } from 'react'
import { Braces, ChevronLeft, ChevronRight, Menu, Search, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { docsNavigation, flatDocsNavigation } from '../docsNavigation.js'
import '../developer.css'

function DocsLayout() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const timer = window.setTimeout(() => setMenuOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  const filteredNavigation = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return docsNavigation
    return docsNavigation
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(search)),
      }))
      .filter((group) => group.items.length)
  }, [query])

  const currentIndex = flatDocsNavigation.findIndex((item) => (
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ))
  const previous = currentIndex > 0 ? flatDocsNavigation[currentIndex - 1] : null
  const next = currentIndex >= 0 ? flatDocsNavigation[currentIndex + 1] : null

  return (
    <div className="docs-app">
      <div className="docs-mobile-bar">
        <button type="button" onClick={() => setMenuOpen(true)}><Menu size={17} /> Browse docs</button>
        <span>API v1</span>
      </div>

      <aside className={menuOpen ? 'docs-sidebar open' : 'docs-sidebar'}>
        <div className="docs-sidebar-head">
          <Link to="/developer"><Braces size={18} /><span>Developer docs</span></Link>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close documentation navigation"><X size={18} /></button>
        </div>
        <label className="docs-search"><Search size={15} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a page" /></label>
        <nav aria-label="Developer documentation">
          {filteredNavigation.map((group) => (
            <div className="docs-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
              ))}
            </div>
          ))}
          {!filteredNavigation.length && <span className="docs-search-empty">No matching pages</span>}
        </nav>
      </aside>

      {menuOpen && <button className="docs-sidebar-scrim" type="button" aria-label="Close documentation navigation" onClick={() => setMenuOpen(false)} />}

      <main className="docs-main">
        <Outlet />
        <nav className="docs-pager" aria-label="Documentation pagination">
          {previous ? <Link to={previous.to}><ChevronLeft size={16} /><span><small>Previous</small>{previous.label}</span></Link> : <span />}
          {next && <Link to={next.to}><span><small>Next</small>{next.label}</span><ChevronRight size={16} /></Link>}
        </nav>
      </main>
    </div>
  )
}

export default DocsLayout
