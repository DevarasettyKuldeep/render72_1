import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getSavedEventIds } from '../utils'

export default function Navbar() {
  const [savedCount, setSavedCount] = useState(getSavedEventIds().length)

  useEffect(() => {
    const handleSavedChange = () => setSavedCount(getSavedEventIds().length)
    window.addEventListener('gather:saved_changed', handleSavedChange)
    return () => window.removeEventListener('gather:saved_changed', handleSavedChange)
  }, [])

  return (
    <header className="nav-header">
      <nav className="nav" aria-label="Main navigation">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-dot" aria-hidden="true" />
          <span className="nav-brand-text">gather</span>
        </Link>

        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Events
          </NavLink>
          <Link
            to="/events?filter=saved"
            className="nav-link nav-saved-link"
            title="View your saved events"
          >
            <span>Saved</span>
            {savedCount > 0 && <span className="nav-saved-badge">{savedCount}</span>}
          </Link>
        </div>

        <Link to="/events" className="nav-cta" id="nav-explore-btn">
          <span>Explore</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M7 17L17 7M7 7h10v10"/>
          </svg>
        </Link>
      </nav>
    </header>
  )
}
