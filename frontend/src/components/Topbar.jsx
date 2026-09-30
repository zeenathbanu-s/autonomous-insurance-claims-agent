import React from 'react'

const PAGE_META = {
  dashboard: { crumb: 'Overview',        title: 'Dashboard' },
  process:   { crumb: 'FNOL Processing', title: 'Process New Claim' },
  result:    { crumb: 'Analysis Report', title: 'Claim Result' },
  rules:     { crumb: 'Business Logic',  title: 'Routing Rules' },
  about:     { crumb: 'Project Info',    title: 'About' },
}

export default function Topbar({ page, onNavigate, hasResult, darkMode }) {
  const meta = PAGE_META[page] || PAGE_META.dashboard

  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        <span
          style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 600, fontSize: '.8125rem' }}
          onClick={() => onNavigate('dashboard')}
        >
          InsureClaim AI
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{ fontSize: '.8125rem', color: 'var(--text-3)' }}>{meta.crumb}</span>
      </div>

      {/* Mode indicator */}
      <span style={{
        fontSize: '.6875rem', fontWeight: 600, padding: '3px 8px', borderRadius: 20,
        background: darkMode ? 'rgba(167,139,250,.15)' : 'rgba(37,99,235,.08)',
        color: darkMode ? 'var(--purple)' : 'var(--blue)',
        border: `1px solid ${darkMode ? 'rgba(167,139,250,.25)' : 'rgba(37,99,235,.15)'}`,
        marginLeft: 8,
      }}>
        {darkMode ? '🌙 Dark' : '☀️ Light'}
      </span>

      <div className="topbar-right">
        {page === 'result' && (
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('process')}>
            ↻ Process Another
          </button>
        )}
        {page !== 'process' && page !== 'result' && (
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('process')}>
            + Upload FNOL
          </button>
        )}
        {hasResult && page !== 'result' && (
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('result')}>
            View Last Result
          </button>
        )}
      </div>
    </div>
  )
}
