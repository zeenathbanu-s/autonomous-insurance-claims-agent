import React from 'react'

const TECH_STACK = [
  { icon: '⚛️', name: 'React 18',     sub: 'Frontend UI',      accentBg: '#e8f4ff', accent: '#0077cc' },
  { icon: '⚡', name: 'Vite 5',       sub: 'Build tool',        accentBg: '#f0eeff', accent: '#646cff' },
  { icon: '🐍', name: 'FastAPI',      sub: 'Python REST API',   accentBg: '#e6f7f5', accent: '#009688' },
  { icon: '📦', name: 'Pydantic',     sub: 'Data validation',   accentBg: '#fde8f0', accent: '#e92063' },
  { icon: '📄', name: 'PyMuPDF',      sub: 'PDF extraction',    accentBg: '#fff1ea', accent: '#ff6b35' },
  { icon: '🌐', name: 'Axios',        sub: 'HTTP client',       accentBg: '#eeeaff', accent: '#5a29e4' },
  { icon: '🤖', name: 'OpenAI (opt)', sub: 'LLM extraction',    accentBg: '#e6f7f1', accent: '#10a37f' },
  { icon: '🧪', name: 'pytest',       sub: 'Backend testing',   accentBg: '#e5f5fd', accent: '#0a9edc' },
]

const WORKFLOW = [
  {
    icon: '📤', color: 'var(--blue)',   bg: 'var(--blue-l)',
    title: 'Document Upload',
    desc: 'User uploads a PDF or TXT First Notice of Loss document via the React frontend. Drag-and-drop and file picker both supported.',
  },
  {
    icon: '✅', color: 'var(--green)',  bg: 'var(--green-l)',
    title: 'File Validation',
    desc: 'FastAPI validates the file type (PDF/TXT only), checks it is not empty, and returns a clear error for unsupported formats.',
  },
  {
    icon: '🔍', color: 'var(--cyan)',   bg: 'var(--cyan-l)',
    title: 'Text Extraction',
    desc: 'TXT files are decoded directly. PDF files are parsed with PyMuPDF (fitz) to extract all text content from every page.',
  },
  {
    icon: '🤖', color: 'var(--purple)', bg: 'var(--purple-l)',
    title: 'Field Extraction',
    desc: 'If an LLM API key is configured, OpenAI GPT extracts structured fields from raw text. Otherwise, the deterministic regex-based extractor identifies all 16 mandatory FNOL fields.',
  },
  {
    icon: '📋', color: 'var(--orange)', bg: 'var(--orange-l)',
    title: 'Field Validation',
    desc: 'The validator checks all 16 mandatory fields. Missing fields are collected and returned in the missingFields list of the JSON response.',
  },
  {
    icon: '🎯', color: 'var(--red)',    bg: 'var(--red-l)',
    title: 'Deterministic Routing',
    desc: 'The routing engine applies four fixed business rules in priority order. The LLM never decides the route — only the Python engine does.',
  },
  {
    icon: '📡', color: 'var(--cyan)',   bg: 'var(--cyan-l)',
    title: 'JSON Response',
    desc: 'FastAPI returns the exact assessment structure: { extractedFields, missingFields, recommendedRoute, reasoning }.',
  },
  {
    icon: '📊', color: 'var(--blue)',   bg: 'var(--blue-l)',
    title: 'Visual Dashboard',
    desc: 'React renders the result as a multi-section dashboard with tabbed field cards, validation summary, decision path, and syntax-highlighted JSON with Copy + Download.',
  },
]

const FEATURES = [
  { icon: '📄', bg: 'var(--blue-l)',   c: 'var(--blue)',   title: 'PDF & TXT Support',      desc: 'PyMuPDF extracts text from real PDF documents' },
  { icon: '🔢', bg: 'var(--cyan-l)',   c: 'var(--cyan)',   title: '16 FNOL Fields',          desc: 'All mandatory fields extracted and validated' },
  { icon: '🎯', bg: 'var(--orange-l)', c: 'var(--orange)', title: 'Deterministic Routing',   desc: '4 rules in documented priority order' },
  { icon: '🤖', bg: 'var(--purple-l)', c: 'var(--purple)', title: 'Optional LLM',            desc: 'OpenAI GPT for extraction when configured' },
  { icon: '🔄', bg: 'var(--green-l)',  c: 'var(--green)',  title: 'Rule-based Fallback',     desc: 'Regex extractor needs no API key' },
  { icon: '📊', bg: 'var(--blue-l)',   c: 'var(--blue)',   title: 'Visual Dashboard',        desc: 'Tabbed field cards, charts, JSON panel' },
  { icon: '🧪', bg: 'var(--cyan-l)',   c: 'var(--cyan)',   title: '65 Tests',                desc: 'Unit + integration + live API tests' },
  { icon: '🚫', bg: 'var(--red-l)',    c: 'var(--red)',    title: 'No Database',             desc: 'Fully stateless — no MySQL required' },
]

const ENDPOINTS = [
  { method: 'POST', path: '/api/claims/process', desc: 'Upload and process an FNOL document', badge: 'badge-green' },
  { method: 'GET',  path: '/api/health',         desc: 'Health check — returns status + LLM config', badge: 'badge-blue' },
  { method: 'GET',  path: '/docs',               desc: 'Interactive Swagger UI documentation', badge: 'badge-slate' },
]

export default function AboutPage({ onNavigate }) {
  return (
    <div className="page-content">

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f2040 60%, #091628 100%)',
        borderRadius: 'var(--r-2xl)', padding: '32px 36px', marginBottom: 24,
        border: '1px solid rgba(77,140,255,.12)',
        boxShadow: '0 8px 32px rgba(0,0,20,.35)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,.12) 0%, transparent 70%)',
        }} />
        <div style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#60a5fa', marginBottom: 10 }}>
          ℹ About this project
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: 5, letterSpacing: '-.02em' }}>
          Insurance Claims Processing Agent
        </div>
        <div style={{ fontSize: '.9375rem', color: 'rgba(255,255,255,.5)', marginBottom: 16, fontStyle: 'italic' }}>
          Autonomous FNOL Analysis &amp; Intelligent Routing
        </div>
        <div style={{ fontSize: '.9375rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.7, maxWidth: 620 }}>
          A placement assessment submission demonstrating an autonomous FNOL claims processing system
          with Python backend intelligence, deterministic routing rules, optional LLM-assisted field extraction,
          and a professional React dashboard frontend. No database required.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <span className="badge badge-blue">React + FastAPI</span>
          <span className="badge badge-green">No database</span>
          <span className="badge badge-purple">LLM optional</span>
          <span className="badge badge-cyan">Dark / Light mode</span>
          <span className="badge badge-amber">65 tests passing</span>
        </div>
      </div>

      {/* ── Key features ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--purple-l)', color: 'var(--purple)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="card-title">Key Features</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                display: 'flex', gap: 12, padding: '12px 14px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ width: 36, height: 36, background: f.bg, borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--text-1)', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)', lineHeight: 1.45 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tech stack ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--cyan-l)', color: 'var(--cyan)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div className="card-title">Technology Stack</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {TECH_STACK.map(t => (
              <div key={t.name} style={{
                padding: '14px 16px', textAlign: 'center',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--text-1)' }}>{t.name}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 2 }}>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Processing workflow ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--orange-l)', color: 'var(--orange)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Processing Workflow</div>
            <div className="card-subtitle">End-to-end FNOL claim analysis pipeline — 8 stages</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {WORKFLOW.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, padding: '14px 0',
                borderBottom: i < WORKFLOW.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 'var(--r-lg)',
                  background: step.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem', flexShrink: 0, marginTop: 1,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>
                    <span style={{ color: step.color, marginRight: 6, fontSize: '.75rem', fontWeight: 800 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '.8375rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── API endpoints ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div className="card-title">API Endpoints</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ENDPOINTS.map(ep => (
              <div key={ep.path} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
              }}>
                <span className={`badge ${ep.badge}`} style={{ fontFamily: 'var(--mono)', fontWeight: 800, minWidth: 44, justifyContent: 'center' }}>{ep.method}</span>
                <code style={{ fontFamily: 'var(--mono)', fontSize: '.875rem', color: 'var(--blue)', flex: 1 }}>{ep.path}</code>
                <span style={{ fontSize: '.8125rem', color: 'var(--text-3)' }}>{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTAs ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => onNavigate('process')}>
          + Try It — Upload FNOL
        </button>
        <button className="btn btn-outline" onClick={() => onNavigate('rules')}>
          ⚙ View Routing Rules
        </button>
        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>
          ← Dashboard
        </button>
      </div>

    </div>
  )
}
