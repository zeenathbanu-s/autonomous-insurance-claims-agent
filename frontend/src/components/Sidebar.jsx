import React, { useEffect, useState } from 'react'
import { checkHealth } from '../services/api'

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    id: 'process', label: 'Process Claim', badge: 'NEW',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  },
  {
    id: 'rules', label: 'Routing Rules',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    id: 'about', label: 'About',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  },
]

export default function Sidebar({ activePage, onNavigate, darkMode, onToggleDark }) {
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    checkHealth().then(() => setApiOnline(true)).catch(() => setApiOnline(false))
  }, [])

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="sidebar-brand-name">InsureClaim AI</div>
        <div className="sidebar-brand-subtitle">Insurance Claims Processing Agent</div>
        <div className="sidebar-brand-tag">Autonomous FNOL Analysis &amp; Intelligent Routing</div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${activePage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {/* Dark mode toggle */}
        <button className="theme-toggle" onClick={onToggleDark} aria-label="Toggle dark mode">
          <span className="theme-toggle-icon">
            {darkMode
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </span>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* API status */}
        <div className="api-status-pill">
          <div className={`api-dot ${apiOnline ? 'online' : 'offline'}`} />
          <div className="api-status-text">
            <strong>{apiOnline ? 'API Connected' : 'API Offline'}</strong>
            localhost:8000
          </div>
        </div>
      </div>
    </aside>
  )
}
