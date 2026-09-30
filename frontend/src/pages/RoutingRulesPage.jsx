import React from 'react'

const RULES = [
  {
    cls: 'invest',
    priority: 1,
    icon: '🚩',
    accentColor: 'var(--invest-c)',
    accentBg: 'var(--invest-bg)',
    accentBd: 'var(--invest-bd)',
    trigger: 'Fraud Indicators',
    condition: 'Description contains "fraud", "inconsistent", or "staged"',
    conditionSub: 'Case-insensitive keyword matching on incident description',
    outcome: 'Investigation Flag',
    desc: 'Claims with suspicious language in the incident description are flagged immediately for fraud investigation — this is the highest-priority rule.',
  },
  {
    cls: 'manual',
    priority: 2,
    icon: '📋',
    accentColor: 'var(--manual-c)',
    accentBg: 'var(--manual-bg)',
    accentBd: 'var(--manual-bd)',
    trigger: 'Incomplete Document',
    condition: 'Any mandatory field is missing',
    conditionSub: 'One or more of the 16 required fields could not be extracted',
    outcome: 'Manual review',
    desc: 'When required FNOL fields cannot be extracted, a human reviewer must obtain the missing information before the claim can continue.',
  },
  {
    cls: 'spec',
    priority: 3,
    icon: '🏥',
    accentColor: 'var(--spec-c)',
    accentBg: 'var(--spec-bg)',
    accentBd: 'var(--spec-bd)',
    trigger: 'Injury Claim',
    condition: 'Claim type = "injury"',
    conditionSub: 'Case-insensitive match on the claimType field',
    outcome: 'Specialist Queue',
    desc: 'Personal injury claims require specialist handling due to potential medical assessments, legal liability, and complex settlement processes.',
  },
  {
    cls: 'fast',
    priority: 4,
    icon: '⚡',
    accentColor: 'var(--fast-c)',
    accentBg: 'var(--fast-bg)',
    accentBd: 'var(--fast-bd)',
    trigger: 'Damage Threshold',
    condition: 'Estimated damage < ₹25,000',
    conditionSub: 'AND all 16 mandatory fields are present',
    outcome: 'Fast-track',
    desc: 'Low-value claims with complete documentation are eligible for streamlined processing without manual intervention.',
  },
]

const MANDATORY_FIELDS = [
  { label: 'Policy Number',      section: 'Policy',   color: 'var(--sec-policy)' },
  { label: 'Policyholder Name',  section: 'Policy',   color: 'var(--sec-policy)' },
  { label: 'Effective Dates',    section: 'Policy',   color: 'var(--sec-policy)' },
  { label: 'Incident Date',      section: 'Incident', color: 'var(--sec-incident)' },
  { label: 'Incident Time',      section: 'Incident', color: 'var(--sec-incident)' },
  { label: 'Location',           section: 'Incident', color: 'var(--sec-incident)' },
  { label: 'Description',        section: 'Incident', color: 'var(--sec-incident)' },
  { label: 'Claimant',           section: 'Parties',  color: 'var(--sec-parties)' },
  { label: 'Third Parties',      section: 'Parties',  color: 'var(--sec-parties)' },
  { label: 'Contact Details',    section: 'Parties',  color: 'var(--sec-parties)' },
  { label: 'Asset Type',         section: 'Asset',    color: 'var(--sec-asset)' },
  { label: 'Asset ID',           section: 'Asset',    color: 'var(--sec-asset)' },
  { label: 'Estimated Damage',   section: 'Asset',    color: 'var(--sec-asset)' },
  { label: 'Claim Type',         section: 'Other',    color: 'var(--sec-other)' },
  { label: 'Attachments',        section: 'Other',    color: 'var(--sec-other)' },
  { label: 'Initial Estimate',   section: 'Other',    color: 'var(--sec-other)' },
]

export default function RoutingRulesPage({ onNavigate }) {
  return (
    <div className="page-content">

      {/* ── Header banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f2040 60%, #091628 100%)',
        borderRadius: 'var(--r-2xl)', padding: '28px 32px', marginBottom: 24,
        border: '1px solid rgba(77,140,255,.12)',
        boxShadow: '0 8px 32px rgba(0,0,20,.35)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,140,255,.1) 0%, transparent 70%)',
        }} />
        <div style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#60a5fa', marginBottom: 10 }}>
          ⚙ Business Logic Reference
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-.02em' }}>
          Deterministic Routing Rules
        </div>
        <div style={{ fontSize: '.9375rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.65, maxWidth: 560 }}>
          All routing decisions are made by a Python rules engine — never by AI or LLM.
          If an LLM is configured, it only assists with extracting structured fields from raw text.
        </div>
      </div>

      {/* ── Priority chain ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--orange-l)', color: 'var(--orange)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Rule Priority Order</div>
            <div className="card-subtitle">When multiple rules match simultaneously, the highest priority wins</div>
          </div>
        </div>
        <div className="card-body-sm">
          <div className="priority-chain">
            <div className="priority-item p1">🚩 1 — Investigation Flag</div>
            <div className="priority-sep">›</div>
            <div className="priority-item p2">📋 2 — Manual review</div>
            <div className="priority-sep">›</div>
            <div className="priority-item p3">🏥 3 — Specialist Queue</div>
            <div className="priority-sep">›</div>
            <div className="priority-item p4">⚡ 4 — Fast-track</div>
          </div>
        </div>
      </div>

      {/* ── Rule cards — 2-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {RULES.map(rule => (
          <div key={rule.cls} className={`rule-card ${rule.cls}`}>
            {/* Card header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r-lg)',
                background: rule.accentBg, border: `1.5px solid ${rule.accentBd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', flexShrink: 0,
              }}>
                {rule.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="rule-trigger">Priority {rule.priority}</div>
                <div className="rule-condition">{rule.trigger}</div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: rule.accentBg, border: `2px solid ${rule.accentBd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.75rem', fontWeight: 900, color: rule.accentColor, flexShrink: 0,
              }}>
                {rule.priority}
              </div>
            </div>

            {/* IF block */}
            <div style={{
              padding: '10px 14px', background: 'var(--surface-2)',
              border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8,
            }}>
              <div style={{ fontSize: '.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-4)', marginBottom: 4 }}>
                IF
              </div>
              <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>{rule.condition}</div>
              {rule.conditionSub && (
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 3 }}>{rule.conditionSub}</div>
              )}
            </div>

            {/* THEN block */}
            <div style={{
              padding: '10px 14px', background: rule.accentBg,
              border: `1.5px solid ${rule.accentBd}`, borderRadius: 'var(--r)', marginBottom: 12,
            }}>
              <div style={{ fontSize: '.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-4)', marginBottom: 4 }}>
                THEN route to
              </div>
              <div className={`rule-outcome`} style={{ color: rule.accentColor, fontSize: '1rem' }}>
                {rule.icon} {rule.outcome}
              </div>
            </div>

            <div style={{ fontSize: '.8125rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{rule.desc}</div>
          </div>
        ))}
      </div>

      {/* ── 16 Mandatory fields ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--green-l)', color: 'var(--green)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <div className="card-title">16 Mandatory FNOL Fields</div>
            <div className="card-subtitle">All fields must be present for a claim to qualify for Fast-track processing</div>
          </div>
          <div className="card-header-right">
            <span className="badge badge-blue">16 total</span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
            {MANDATORY_FIELDS.map((f, i) => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${f.color}`,
                borderRadius: 'var(--r)', fontSize: '.8125rem',
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: f.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.5625rem', fontWeight: 800, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Assessment JSON format reminder ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Required JSON Response Format</div>
            <div className="card-subtitle">The API always returns exactly these four keys</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ background: '#050b14', borderRadius: 'var(--r-lg)', padding: '16px 20px', border: '1px solid #0d1a2e' }}>
            <pre style={{ fontFamily: 'var(--mono)', fontSize: '.8125rem', lineHeight: 1.7, color: '#cdd9e8' }}>{`{
  `}<span style={{ color: '#79c0ff' }}>"extractedFields"</span>{`: { ... },
  `}<span style={{ color: '#79c0ff' }}>"missingFields"</span>{`: `}<span style={{ color: '#7ce3a0' }}>[ ]</span>{`,
  `}<span style={{ color: '#79c0ff' }}>"recommendedRoute"</span>{`: `}<span style={{ color: '#7ce3a0' }}>"Fast-track"</span>{`,
  `}<span style={{ color: '#79c0ff' }}>"reasoning"</span>{`: `}<span style={{ color: '#7ce3a0' }}>"..."</span>{`
}`}</pre>
          </div>
        </div>
      </div>

      {/* ── CTAs ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
        <button className="btn btn-primary" onClick={() => onNavigate('process')}>
          + Upload FNOL to Test Rules
        </button>
        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

    </div>
  )
}
