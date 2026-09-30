import React from 'react'

const WORKFLOW_STEPS = [
  { emoji: '📤', label: 'Upload', sub: 'PDF / TXT', color: 'blue' },
  { emoji: '🔍', label: 'Extract', sub: 'Text parsing', color: 'cyan' },
  { emoji: '📋', label: 'Fields', sub: '16 mandatory', color: 'orange' },
  { emoji: '✅', label: 'Validate', sub: 'Missing check', color: 'purple' },
  { emoji: '🎯', label: 'Route', sub: 'Business rules', color: 'green' },
]

const ROUTE_OVERVIEW = [
  { color: 'var(--fast-c)',    bg: 'var(--fast-bg)',    bd: 'var(--fast-bd)',    icon: '⚡', label: 'Fast-track',        desc: 'Damage < ₹25,000 & all fields present' },
  { color: 'var(--manual-c)', bg: 'var(--manual-bg)', bd: 'var(--manual-bd)', icon: '📋', label: 'Manual Review',      desc: 'One or more mandatory fields missing' },
  { color: 'var(--invest-c)', bg: 'var(--invest-bg)', bd: 'var(--invest-bd)', icon: '🚩', label: 'Investigation Flag',  desc: 'Fraud / staged / inconsistent keywords' },
  { color: 'var(--spec-c)',   bg: 'var(--spec-bg)',   bd: 'var(--spec-bd)',   icon: '🏥', label: 'Specialist Queue',   desc: 'Claim type is injury' },
]

const FEATURES = [
  { icon: '📄', accent: 'var(--blue)',   bg: 'var(--blue-l)',   label: 'PDF & TXT',       desc: 'PyMuPDF extracts text from real PDF documents' },
  { icon: '🔢', accent: 'var(--cyan)',   bg: 'var(--cyan-l)',   label: '16 FNOL Fields',  desc: 'All mandatory fields extracted and validated' },
  { icon: '🎯', accent: 'var(--orange)', bg: 'var(--orange-l)', label: 'Deterministic',   desc: '4 business rules in documented priority order' },
  { icon: '🤖', accent: 'var(--purple)', bg: 'var(--purple-l)', label: 'LLM Optional',    desc: 'OpenAI GPT assists field extraction when configured' },
  { icon: '🔄', accent: 'var(--green)',  bg: 'var(--green-l)',  label: 'Rule Fallback',   desc: 'Regex extractor works without any API key' },
  { icon: '🚫', accent: 'var(--red)',    bg: 'var(--red-l)',    label: 'No Database',     desc: 'Fully stateless — no MySQL required' },
]

export default function DashboardPage({ onNavigate }) {
  return (
    <div className="page-content">

      {/* ── Hero ── */}
      <div className="dash-hero">
        <div className="dash-hero-tag">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Autonomous Claims Processing System
        </div>
        <div className="dash-hero-title">Insurance Claims Processing Agent</div>
        <div className="dash-hero-subtitle">Autonomous FNOL Analysis &amp; Intelligent Routing</div>
        <div className="dash-hero-sub">
          Upload a First Notice of Loss (FNOL) document — PDF or TXT. The system automatically
          extracts 16 structured fields, validates completeness, and routes the claim using
          deterministic Python business rules. No database. No fake data.
        </div>
        <div className="dash-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('process')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            + Upload FNOL &amp; Analyze Claim
          </button>
          <button
            className="btn btn-lg"
            style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.75)', border: '1.5px solid rgba(255,255,255,.15)' }}
            onClick={() => onNavigate('rules')}
          >
            ⚙ View Routing Rules
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {[
          { icon: '📑', accentBg: 'var(--blue-l)',   accent: 'var(--blue)',   label: 'Supported Formats', value: '2',  sub: 'PDF & TXT files' },
          { icon: '🔢', accentBg: 'var(--cyan-l)',   accent: 'var(--cyan)',   label: 'Mandatory Fields',  value: '16', sub: 'Extracted per claim' },
          { icon: '🎯', accentBg: 'var(--purple-l)', accent: 'var(--purple)', label: 'Routing Outcomes',  value: '4',  sub: 'Deterministic rules' },
          { icon: '🧪', accentBg: 'var(--green-l)',  accent: 'var(--green)',  label: 'Tests Passing',     value: '65', sub: 'Unit + integration' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.accentBg }}>
              <span style={{ fontSize: '1.375rem' }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Processing workflow ── */}
      <div className="card mb-16" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--cyan-l)', color: 'var(--cyan)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="card-title">FNOL Processing Pipeline</div>
            <div className="card-subtitle">Five-stage end-to-end claim analysis workflow</div>
          </div>
        </div>
        <div className="workflow-steps-visual">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={i} className="wfv-step">
              <div className={`wfv-circle ${step.color}`}>{step.emoji}</div>
              <div className="wfv-label">{step.label}</div>
              <div className="wfv-sub">{step.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Route overview ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--orange-l)', color: 'var(--orange)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Possible Routing Outcomes</div>
            <div className="card-subtitle">All routes determined by deterministic Python business rules — not AI</div>
          </div>
          <div className="card-header-right">
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('rules')}>
              Full Rules →
            </button>
          </div>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ROUTE_OVERVIEW.map(r => (
            <div
              key={r.label}
              style={{ padding: '14px 16px', background: r.bg, border: `1.5px solid ${r.bd}`, borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform .15s' }}
              onClick={() => onNavigate('rules')}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <span style={{ fontSize: '1.625rem' }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: r.color, fontSize: '.9375rem' }}>{r.label}</div>
                <div style={{ fontSize: '.8125rem', color: 'var(--text-2)', marginTop: 2 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features grid ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--purple-l)', color: 'var(--purple)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="card-title">Key System Features</div>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--sh)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{ width: 34, height: 34, background: f.bg, borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--text-1)', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
