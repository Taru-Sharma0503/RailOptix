'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock3, Navigation, TrainFront, TriangleAlert } from 'lucide-react'
import { conflictsApi, requireAuth } from '../../lib/api'

function severityState(sev) {
  const s = (sev || '').toLowerCase()
  if (s === 'critical') return 'critical'
  if (s === 'high') return 'high'
  if (s === 'medium') return 'warning'
  return 'healthy'
}

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className="block-state" style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function ConflictsPage() {
  const router = useRouter()
  const [conflicts, setConflicts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [negotiating, setNegotiating] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    conflictsApi.list()
      .then((data) => {
        if (cancelled) return
        const list = data.conflicts || []
        setConflicts(list)
        if (list.length) setSelectedId(list[0].id)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load conflicts.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setDetail(null)
    setRecommendation(null)
    conflictsApi.get(selectedId)
      .then((data) => { if (!cancelled) setDetail(data.conflict) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedId])

  const selected = conflicts.find((c) => c.id === selectedId) || conflicts[0]

  async function handleNegotiate() {
    if (!selectedId) return
    setNegotiating(true)
    setError('')
    try {
      const data = await conflictsApi.negotiate(selectedId)
      setRecommendation(data.recommendation)
    } catch (err) {
      setError(err.message || 'Could not generate a negotiation recommendation.')
    } finally {
      setNegotiating(false)
    }
  }

  async function handleResolve() {
    if (!selectedId || !recommendation) return
    setResolving(true)
    setError('')
    try {
      await conflictsApi.resolve({
        conflictId: selectedId,
        resolutionType: recommendation.type,
        start: recommendation.start,
        end: recommendation.end,
      })
      setConflicts((list) => list.filter((c) => c.id !== selectedId))
      setSelectedId(null)
      setRecommendation(null)
    } catch (err) {
      setError(err.message || 'Could not resolve this conflict.')
    } finally {
      setResolving(false)
    }
  }

  const critical = conflicts.filter((c) => severityState(c.severity) === 'critical').length

  const metrics = [
    ['Open Conflicts', String(conflicts.length), 'Require resolution', TriangleAlert, 'critical'],
    ['Critical', String(critical), 'Immediate attention', AlertTriangle, 'critical'],
    ['Departments Involved', String(new Set(conflicts.flatMap((c) => c.departments || [])).size), 'Across active conflicts', TrainFront, 'warn'],
    ['Selected', selectedId || '—', 'Currently reviewing', CheckCircle2, 'up'],
  ]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div><div className="breadcrumb">OPERATIONS <span>/</span> CONFLICTS</div><h1>Operational Conflicts</h1><p>Detect and resolve conflicts between maintenance blocks and train operations.</p></div>
        <Link href="/scheduler" className="primary-btn">OPEN SCHEDULER</Link>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label,value,detail,Icon,state]) => (
          <div className="metric" key={label}>
            <div className="metric-top"><span>{label}</span><Icon/></div>
            <div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow:'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker"><TriangleAlert/> CONFLICT REGISTER</div><h2>Operational Conflicts</h2><p>{loading ? 'Loading…' : `${conflicts.length} open conflicts`}</p></div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <div className="table-head" style={{ minWidth:'760px', display:'grid', gridTemplateColumns:'0.9fr 0.8fr 0.9fr 0.9fr 1.4fr 0.7fr', gap:'12px' }}>
              <span>CONFLICT ID</span><span>CORRIDOR</span><span>START</span><span>END</span><span>DEPARTMENTS</span><span>SEVERITY</span>
            </div>

            <div style={{ minWidth:'760px' }}>
              {!loading && conflicts.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No open conflicts. All clear.</div>}
              {conflicts.map(conflict => {
                const isSelected = conflict.id === selectedId
                return (
                  <button key={conflict.id} onClick={() => setSelectedId(conflict.id)} aria-pressed={isSelected} style={{ width:'100%', display:'grid', gridTemplateColumns:'0.9fr 0.8fr 0.9fr 0.9fr 1.4fr 0.7fr', gap:'12px', alignItems:'center', padding:'13px 16px', border:0, borderBottom:'1px solid var(--line)', borderLeft:isSelected ? '3px solid var(--teal)' : '3px solid transparent', background:isSelected ? '#E7F4F1' : 'var(--panel)', textAlign:'left', minHeight:'62px', cursor:'pointer' }}>
                    <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{conflict.id}</strong></span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{conflict.corridorId}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{conflict.start || '—'}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{conflict.end || '—'}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{(conflict.departments || []).join(', ') || '—'}</span>
                    <StateTag state={severityState(conflict.severity)}>{conflict.severity}</StateTag>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> SELECTED CONFLICT</div><h2>Conflict Details</h2></div>
            {selected && <StateTag state={severityState(selected.severity)}>{selected.severity}</StateTag>}
          </div>

          {!selected ? (
            <div style={{ padding: '20px 18px', fontSize: '12px', color: 'var(--muted)' }}>{loading ? 'Loading…' : 'Select a conflict to view details.'}</div>
          ) : (
          <div style={{ padding:'2px 18px 18px' }}>
            <h3 style={{ margin:'12px 0 5px', fontSize:'17px', fontWeight:600 }}>{selected.corridorId}</h3>
            <p style={{ marginBottom:'17px', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>{selected.id}</p>

            {[
              ['CORRIDOR', selected.corridorId],
              ['START', selected.start || '—'],
              ['END', selected.end || '—'],
              ['DEPARTMENTS', (selected.departments || []).join(', ') || '—'],
              ['OVERLAP (MIN)', detail?.overlap ?? '—'],
            ].map(([label,value]) => (
              <div key={label} className="table-head" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'9px 0', borderBottom:'1px solid var(--line)' }}>
                <span>{label}</span><span style={{ textAlign:'right', fontSize:'12px' }}>{value}</span>
              </div>
            ))}

            {detail?.requests?.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--muted)', letterSpacing:'.06em', marginBottom:'6px' }}>COMPETING REQUESTS</div>
                {detail.requests.map((r, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'6px 0', borderBottom:'1px solid var(--line)' }}>
                    <span>{r.department}</span><span style={{ color:'var(--muted)' }}>{r.duration} min</span>
                  </div>
                ))}
              </div>
            )}

            {!recommendation ? (
              <button className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}} onClick={handleNegotiate} disabled={negotiating}>
                <Clock3 size={14}/> {negotiating ? 'NEGOTIATING…' : 'RUN AI NEGOTIATION'}
              </button>
            ) : (
              <>
                <div style={{ marginTop:'16px', padding:'14px', background:'var(--elevated)', border:'1px solid var(--line)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', color:'var(--orange)', fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, letterSpacing:'.06em' }}><Clock3 size={13}/> RECOMMENDED RESOLUTION</div>
                  <p style={{ margin:0, color:'var(--muted)', fontSize:'12px', lineHeight:1.55 }}>{recommendation.message || `${recommendation.type === 'combined_block' ? `Combine into one block: ${recommendation.start}–${recommendation.end}.` : recommendation.type}`}</p>
                </div>
                <button className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'12px'}} onClick={handleResolve} disabled={resolving}>
                  <CheckCircle2 size={14}/> {resolving ? 'RESOLVING…' : 'APPLY RESOLUTION'}
                </button>
              </>
            )}
          </div>
          )}
        </aside>
      </div>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><TrainFront/> OPERATIONAL IMPACT</div><h2>Conflict Resolution Context</h2><p>RailOptix identifies operational overlap before maintenance blocks are finalized.</p></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['TRAIN MOVEMENT','Check scheduled services crossing the maintenance window.'],
            ['BLOCK WINDOW','Compare requested maintenance duration with available paths.'],
            ['PRIORITY','Protect high-priority and time-sensitive train services.'],
            ['RESOLUTION','Recommend the lowest-impact schedule adjustment.'],
          ].map(([title,description]) => (
            <div key={title} style={{ padding:'18px', background:'var(--panel)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--teal)', letterSpacing:'.05em', marginBottom:'7px' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'12px', lineHeight:1.5 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}