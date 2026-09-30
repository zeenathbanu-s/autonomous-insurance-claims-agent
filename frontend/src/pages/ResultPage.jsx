import React, { useState } from 'react'

/* ── Field section config (tabs) ───────────────────────────────────────── */
const FIELD_SECTIONS = [
  {
    id: 'policy', label: 'Policy', emoji: '📋', tabClass: 'tab-policy',
    accent: 'var(--sec-policy)', accentBg: 'var(--blue-l)',
    fields: [
      { key: 'policyNumber',     label: 'Policy Number' },
      { key: 'policyholderName', label: 'Policyholder Name' },
      { key: 'effectiveDates',   label: 'Effective Dates' },
    ],
  },
  {
    id: 'incident', label: 'Incident', emoji: '⚠️', tabClass: 'tab-incident',
    accent: 'var(--sec-incident)', accentBg: 'var(--orange-l)',
    fields: [
      { key: 'incidentDate', label: 'Date of Incident' },
      { key: 'incidentTime', label: 'Time of Incident' },
      { key: 'location',     label: 'Location' },
      { key: 'description',  label: 'Description' },
    ],
  },
  {
    id: 'parties', label: 'Parties', emoji: '👥', tabClass: 'tab-parties',
    accent: 'var(--sec-parties)', accentBg: 'var(--cyan-l)',
    fields: [
      { key: 'claimant',       label: 'Claimant' },
      { key: 'thirdParties',   label: 'Third Parties' },
      { key: 'contactDetails', label: 'Contact Details' },
    ],
  },
  {
    id: 'asset', label: 'Asset', emoji: '🏎️', tabClass: 'tab-asset',
    accent: 'var(--sec-asset)', accentBg: 'var(--purple-l)',
    fields: [
      { key: 'assetType',       label: 'Asset Type' },
      { key: 'assetId',         label: 'Asset ID' },
      { key: 'estimatedDamage', label: 'Estimated Damage', money: true },
    ],
  },
  {
    id: 'other', label: 'Other', emoji: '📎', tabClass: 'tab-other',
    accent: 'var(--sec-other)', accentBg: 'var(--green-l)',
    fields: [
      { key: 'claimType',       label: 'Claim Type' },
      { key: 'attachments',     label: 'Attachments' },
      { key: 'initialEstimate', label: 'Initial Estimate', money: true },
    ],
  },
]

const ALL_FIELDS = FIELD_SECTIONS.flatMap(s => s.fields)
const TOTAL_FIELDS = ALL_FIELDS.length // 16

/* ── Route config ──────────────────────────────────────────────────────── */
const ROUTE_CFG = {
  'Fast-track': {
    css: 'fast-track', icon: '⚡',
    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    desc: 'Claim qualifies for expedited processing — all fields present and damage below ₹25,000 threshold.',
  },
  'Manual review': {
    css: 'manual-review', icon: '📋',
    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    desc: 'Mandatory fields are missing — human review required before processing can continue.',
  },
  'Investigation Flag': {
    css: 'investigation', icon: '🚩',
    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    desc: 'Claim description contains fraud indicators — routed for investigation immediately.',
  },
  'Specialist Queue': {
    css: 'specialist', icon: '🏥',
    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    desc: 'Injury claim — requires specialist handling due to medical and legal considerations.',
  },
}

const DECISION_STEPS = [
  'Uploaded', 'Text Extracted', 'Fields Parsed', 'Validated', 'Routed',
]

/* ── JSON syntax highlighter ───────────────────────────────────────────── */
function JsonHighlight({ data }) {
  const raw = JSON.stringify(data, null, 2)
  const html = raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"\\]+(?:\\.[^"\\]*)*)"\s*:/g, '<span class="jk">"$1"</span>:')
    .replace(/:\s*"([^"\\]*)"/g, ': <span class="js">"$1"</span>')
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="jn">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="jb">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="jnull">$1</span>')
    .replace(/([[\]{}])/g, '<span class="jbr">$1</span>')
  return <div className="json-block" dangerouslySetInnerHTML={{ __html: `<pre>${html}</pre>` }} />
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmtVal(val, money) {
  if (val === null || val === undefined || val === '') return null
  if (money && typeof val === 'number')
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return String(val)
}

function getLabelFor(key) {
  return ALL_FIELDS.find(f => f.key === key)?.label || key
}

/* ══════════════════════════════════════════════════════════════════════════
   ResultPage
═══════════════════════════════════════════════════════════════════════════ */
export default function ResultPage({ result, filename, onProcessAnother }) {
  const [activeTab, setActiveTab] = useState('policy')
  const [copied, setCopied]       = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const { extractedFields, missingFields, recommendedRoute, reasoning } = result
  const missingSet     = new Set(missingFields)
  const extractedCount = TOTAL_FIELDS - missingFields.length
  const completePct    = Math.round((extractedCount / TOTAL_FIELDS) * 100)
  const cfg            = ROUTE_CFG[recommendedRoute] ?? ROUTE_CFG['Manual review']

  // Exact 4-key assessment JSON — nothing added, nothing renamed
  const assessmentJson = { extractedFields, missingFields, recommendedRoute, reasoning }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(assessmentJson, null, 2))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200) })
      .catch(() => {})
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(assessmentJson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `claim-result-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  const activeSection = FIELD_SECTIONS.find(s => s.id === activeTab)

  return (
    <div className="page-content">

      {/* 1 ── Hero status bar */}
      <div className="result-hero" style={{ marginBottom: 22 }}>
        <div className="result-hero-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <div className="result-hero-file">{filename}</div>
          <div className="result-hero-label">FNOL Analysis Complete — {extractedCount}/{TOTAL_FIELDS} fields extracted</div>
        </div>
        <div className="result-hero-badge">✓ Analysis Complete</div>
      </div>

      {/* 2 ── Summary stat cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-l)' }}>📑</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{extractedCount}<span style={{ fontSize: '1rem', color: 'var(--text-4)', fontWeight: 500 }}>/{TOTAL_FIELDS}</span></div>
          <div className="stat-label">Fields Extracted</div>
          <div className="stat-sub">{completePct}% complete</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: missingFields.length ? 'var(--amber-l)' : 'var(--green-l)' }}>
            <span style={{ fontSize: '1.375rem' }}>{missingFields.length ? '⚠️' : '✅'}</span>
          </div>
          <div className="stat-value" style={{ color: missingFields.length ? 'var(--amber)' : 'var(--green)' }}>
            {missingFields.length}
          </div>
          <div className="stat-label">Missing Fields</div>
          <div className="stat-sub">{missingFields.length === 0 ? 'Document complete' : 'Need attention'}</div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-icon" style={{ background: 'var(--purple-l)' }}>
            <span style={{ fontSize: '1.375rem' }}>{cfg.icon}</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1rem', letterSpacing: '-.01em' }}>{recommendedRoute}</div>
          <div className="stat-label">Recommended Route</div>
          <div className="stat-sub">{cfg.desc.slice(0, 58)}…</div>
        </div>
      </div>

      {/* 3 ── Route decision */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-4)' }}>Step 1 — Routing Decision</span>
      </div>
      <div className={`route-card ${cfg.css}`} style={{ marginBottom: 22 }}>
        <div className="route-card-top">
          <div className="route-badge-icon">{cfg.svg}</div>
          <div>
            <div className="route-eyebrow">Recommended Route</div>
            <div className="route-name">{recommendedRoute}</div>
            <div className="route-desc">{cfg.desc}</div>
          </div>
        </div>
        <div className="route-card-reason">
          <div className="route-reason-eyebrow">Routing Rationale</div>
          <div className="route-reason-text">{reasoning}</div>
        </div>
      </div>

      {/* 4 ── Decision workflow path */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--cyan-l)', color: 'var(--cyan)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="card-title">Processing Decision Path</div>
          <div className="card-header-right">
            <span className="badge badge-green">✓ All steps complete</span>
          </div>
        </div>
        <div className="workflow-path">
          {DECISION_STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="wf-step done">
                <div className="wf-step-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="wf-step-label">{s}</div>
              </div>
              {i < DECISION_STEPS.length - 1 && <div className="wf-arrow">›</div>}
            </React.Fragment>
          ))}
          <div className="wf-arrow" style={{ fontWeight: 800 }}>⟹</div>
          <div className="wf-step active">
            <div className="wf-step-circle" style={{ fontSize: '1.1rem' }}>{cfg.icon}</div>
            <div className="wf-step-label" style={{ fontWeight: 700 }}>{recommendedRoute}</div>
          </div>
        </div>
      </div>

      {/* 5 ── Extracted fields (tabbed) */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-4)' }}>Step 2 — Extracted Information</span>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Extracted FNOL Fields</div>
            <div className="card-subtitle">16 mandatory fields — click a section tab to filter</div>
          </div>
          <div className="card-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: completePct === 100 ? 'var(--green)' : 'var(--amber)' }}>
              {extractedCount}/{TOTAL_FIELDS}
            </span>
            <div style={{ width: 80 }}>
              <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${completePct}%`, background: completePct === 100 ? 'var(--green)' : 'var(--amber)', transition: 'width .6s' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Section tabs */}
          <div className="field-tabs">
            {FIELD_SECTIONS.map(sec => {
              const secMissing = sec.fields.filter(f => missingSet.has(f.key)).length
              return (
                <button
                  key={sec.id}
                  className={`field-tab ${sec.tabClass}${activeTab === sec.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(sec.id)}
                >
                  <span className="field-tab-icon">{sec.emoji}</span>
                  {sec.label}
                  <span className="field-tab-count">
                    {sec.fields.length - secMissing}/{sec.fields.length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Field chips */}
          {activeSection && (
            <div className="field-chips-grid">
              {activeSection.fields.map(({ key, label, money }) => {
                const val = fmtVal(extractedFields[key], money)
                const isMissing = missingSet.has(key)
                return (
                  <div key={key} className={`field-chip ${isMissing ? 'missing' : 'extracted'}`}>
                    <div className="field-chip-label">
                      <span>{label}</span>
                      {isMissing
                        ? <span className="f-badge-mis">⚠ Missing</span>
                        : <span className="f-badge-ok">✓ Extracted</span>
                      }
                    </div>
                    <div className={`field-chip-value${!val ? ' empty' : ''}`}>
                      {val || 'Not available'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6 ── Validation summary */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-4)' }}>Step 3 — Field Validation</span>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div className="card-icon" style={missingFields.length ? { background: 'var(--amber-l)', color: 'var(--amber)' } : { background: 'var(--green-l)', color: 'var(--green)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div className="card-title">Mandatory Field Validation</div>
        </div>
        <div className="card-body-sm">
          <div className="quality-bar-wrap" style={{ marginBottom: 16 }}>
            <div className="quality-bar-labels">
              <span>Document Completeness</span>
              <span style={{ fontWeight: 700, color: completePct === 100 ? 'var(--green)' : 'var(--amber)' }}>{completePct}%</span>
            </div>
            <div className="quality-bar-track">
              <div className={`quality-bar-fill ${completePct === 100 ? 'full' : 'partial'}`} style={{ width: `${completePct}%` }} />
            </div>
          </div>
          {missingFields.length === 0 ? (
            <div className="miss-box ok">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div>
                <div className="miss-box-title">✓ No mandatory fields are missing</div>
                <div className="miss-box-sub">All 16 required FNOL fields were successfully extracted from this document.</div>
              </div>
            </div>
          ) : (
            <div className="miss-box bad">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <div className="miss-box-title">⚠ {missingFields.length} mandatory field{missingFields.length > 1 ? 's' : ''} missing</div>
                <div className="miss-box-sub">These fields could not be extracted from the document:</div>
                <div className="miss-tags">
                  {missingFields.map(f => <span key={f} className="miss-tag">{getLabelFor(f)}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7 ── Routing reasoning */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-4)' }}>Step 4 — Business Rule Decision</span>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Why was this claim routed here?</div>
            <div className="card-subtitle">Deterministic Python routing engine — LLM never decides the route</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '4px solid var(--blue)', borderRadius: 'var(--r-lg)', padding: '16px 20px' }}>
            <p style={{ fontSize: '.9375rem', color: 'var(--text-2)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{reasoning}"
            </p>
          </div>
          <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text-4)', lineHeight: 1.6 }}>
            Priority order:&nbsp;
            <strong style={{ color: 'var(--invest-c)' }}>Investigation Flag</strong> →&nbsp;
            <strong style={{ color: 'var(--manual-c)' }}>Manual review</strong> →&nbsp;
            <strong style={{ color: 'var(--spec-c)' }}>Specialist Queue</strong> →&nbsp;
            <strong style={{ color: 'var(--fast-c)' }}>Fast-track</strong>
          </div>
        </div>
      </div>

      {/* 8 ── JSON output */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-4)' }}>Step 5 — Structured API Response</span>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div>
            <div className="card-title">Structured JSON Output</div>
            <div className="card-subtitle">
              Exact response from{' '}
              <code style={{ fontFamily: 'var(--mono)', fontSize: '.75rem', background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 3 }}>
                POST /api/claims/process
              </code>{' '}
              — four keys only, unchanged
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="json-actions">
            <span className="json-label">extractedFields · missingFields · recommendedRoute · reasoning</span>
            <div className="json-btns">
              <button
                className={`btn ${copied ? 'btn-success' : 'btn-dark'} btn-sm`}
                onClick={handleCopy}
              >
                {copied
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 📋 Copy JSON</>
                }
              </button>
              <button
                className={`btn ${downloaded ? 'btn-success' : 'btn-cyan'} btn-sm`}
                onClick={handleDownload}
              >
                {downloaded
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Downloaded!</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ⬇ Download JSON</>
                }
              </button>
            </div>
          </div>
          <JsonHighlight data={assessmentJson} />
        </div>
      </div>

      {/* 9 ── Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
        <button className="btn btn-primary" onClick={onProcessAnother}>
          ↻ Process Another Claim
        </button>
        <button className="btn btn-dark btn-sm" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy JSON'}
        </button>
        <button className="btn btn-cyan btn-sm" onClick={handleDownload}>
          {downloaded ? '✓ Downloaded!' : '⬇ Download JSON'}
        </button>
      </div>

    </div>
  )
}
