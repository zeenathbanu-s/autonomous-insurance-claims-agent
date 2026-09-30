import React, { useRef, useState } from 'react'
import { processClaim } from '../services/api'

const PROC_STEPS = [
  { id: 'parse',    label: 'Parsing document' },
  { id: 'extract',  label: 'Extracting text content' },
  { id: 'fields',   label: 'Identifying FNOL fields' },
  { id: 'validate', label: 'Validating mandatory fields' },
  { id: 'route',    label: 'Applying routing rules' },
]

const SAMPLE_DOCS = [
  { file: 'claim_fast_track.txt',    label: 'Fast-track sample',      badge: 'badge-green' },
  { file: 'claim_manual_review.txt', label: 'Manual review sample',   badge: 'badge-amber' },
  { file: 'claim_investigation.txt', label: 'Investigation sample',   badge: 'badge-red' },
  { file: 'claim_injury.txt',        label: 'Injury / Specialist',    badge: 'badge-purple' },
  { file: 'claim_complex.txt',       label: 'Complex multi-rule',     badge: 'badge-slate' },
]

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

export default function ProcessPage({ onResult }) {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState(-1)
  const [error, setError]       = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const isValid = f => /\.(pdf|txt)$/i.test(f.name)

  const selectFile = f => {
    setError('')
    if (!isValid(f)) { setError(`"${f.name}" is not supported. Upload a PDF or TXT file.`); return }
    setFile(f)
  }

  const handleProcess = async () => {
    if (!file || loading) return
    setLoading(true); setError(''); setStep(0)

    // Animate through steps visually
    const stepDelay = ms => new Promise(r => setTimeout(r, ms))

    try {
      // Animate steps while request is in flight
      const animateSteps = async () => {
        for (let i = 0; i < PROC_STEPS.length; i++) {
          setStep(i)
          await stepDelay(380)
        }
      }

      const [result] = await Promise.all([
        processClaim(file),
        animateSteps(),
      ])

      setStep(PROC_STEPS.length) // all done
      await stepDelay(300)
      onResult(result, file.name)
    } catch (err) {
      setStep(-1)
      if (err?.message === 'Network Error') {
        setError('Cannot reach the API. Ensure the backend is running on http://localhost:8000')
      } else {
        const detail = err?.response?.data?.detail
        setError(typeof detail === 'string' ? detail : err?.message || 'Unexpected error.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">

      <div style={{ maxWidth: 680 }}>

        {/* ── Upload card ── */}
        <div className="card mb-16">
          <div className="card-header">
            <div className="card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <div className="card-title">FNOL Document Intake</div>
              <div className="card-subtitle">Upload a First Notice of Loss file to begin claim analysis</div>
            </div>
          </div>
          <div className="card-body">
            {/* Drop zone */}
            <div
              className={`upload-zone${dragOver ? ' drag-over' : ''}`}
              role="button" tabIndex={0}
              aria-label="Upload FNOL document"
              onClick={() => inputRef.current.click()}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) selectFile(f) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onKeyDown={e => e.key === 'Enter' && inputRef.current.click()}
            >
              <div className="upload-zone-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <h3>Drag &amp; drop your FNOL document</h3>
              <p>or click to browse — supports PDF and TXT files</p>
              <div className="fmt-row">
                <span className="fmt-pill">PDF</span>
                <span className="fmt-pill">TXT</span>
              </div>
            </div>
            <input ref={inputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) selectFile(e.target.files[0]); e.target.value = '' }}
            />

            {/* Selected file */}
            {file && (
              <div className="file-selected">
                <span className="file-selected-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </span>
                <span className="file-selected-name">{file.name}</span>
                <span className="file-selected-meta">{formatBytes(file.size)}</span>
                <button className="file-remove" onClick={e => { e.stopPropagation(); setFile(null); setError('') }} aria-label="Remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="banner err">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              className="btn btn-primary btn-full btn-lg mt-16"
              onClick={handleProcess}
              disabled={!file || loading}
              style={{ marginTop: 16 }}
            >
              {loading
                ? <><div style={{ width:18,height:18,border:'2px solid rgba(255,255,255,.35)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite',flexShrink:0 }}/> Analysing…</>
                : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> ▶ Analyze Claim</>
              }
            </button>
          </div>
        </div>

        {/* ── Processing steps animation ── */}
        {loading && (
          <div className="card mb-16">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'var(--blue-50)' }}>
                <div style={{ width:16,height:16,border:'2px solid var(--blue-200)',borderTopColor:'var(--blue-600)',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>
              </div>
              <div className="card-title">Processing FNOL Document…</div>
            </div>
            <div className="card-body-sm">
              <div className="processing-steps">
                {PROC_STEPS.map((s, i) => (
                  <div key={s.id} className={`proc-step${step === i ? ' active' : step > i ? ' done' : ''}`}>
                    <div className="proc-step-icon">
                      {step > i
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        : step === i
                        ? <div className="step-spinner"/>
                        : <div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid var(--slate-200)' }}/>
                      }
                    </div>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Sample docs ── */}
        {!loading && (
          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <div className="card-title">🧪 Sample FNOL Documents</div>
                <div className="card-subtitle">Use these test files to verify each routing outcome</div>
              </div>
            </div>
            <div className="card-body-sm">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SAMPLE_DOCS.map(doc => (
                  <div key={doc.file} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: 'var(--slate-50)',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--slate-200)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '.8125rem', color: 'var(--slate-700)' }}>{doc.file}</span>
                    <span className={`badge ${doc.badge}`}>{doc.label}</span>
                  </div>
                ))}
              </div>
              <div className="banner info mt-12">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Sample files are in the <code style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', background: 'rgba(0,0,0,.06)', padding: '1px 5px', borderRadius: 3 }}>sample_documents/</code> folder in the project root.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
