'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch } from 'lucide-react'
import Link from 'next/link'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, Construction, Navigation } from 'lucide-react'
import { blocksApi, requireAuth } from '../../lib/api'

function statusToState(status) {
  const map = { pending: 'info', approved: 'warning', active: 'critical', completed: 'healthy', rejected: 'critical', conflict: 'critical' }
  return map[status] || 'neutral'
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h ? `${h}h ` : ''}${m ? `${m}m` : h ? '' : '0m'}`.trim()
}

function toViewModel(b) {
  return {
    id: b.id,
    section: b.corridorName || b.corridorId,
    location: b.corridorName || b.corridorId,
    type: b.reason || 'Maintenance Block',
    start: b.start,
    end: b.end,
    duration: formatDuration(b.durationMinutes),
    status: (b.status || 'pending').replace(/^./, (c) => c.toUpperCase()),
    statusState: statusToState(b.status),
    linkedTasks: (b.maintenanceTaskIds || []).length,
    department: b.departmentName || b.departmentId || '—',
    date: b.date,
  }
}

function buildMetrics(blocks) {
  const active = blocks.filter((b) => b.statusState === 'critical' && b.status === 'Active').length
  const scheduled = blocks.filter((b) => b.status === 'Pending' || b.status === 'Approved').length
  const completed = blocks.filter((b) => b.status === 'Completed').length
  const conflicts = blocks.filter((b) => b.status === 'Conflict' || b.status === 'Rejected').length
  return [
    ['Active Blocks', String(active), 'Currently affecting operations', Construction, 'info'],
    ['Scheduled', String(scheduled), 'Upcoming maintenance blocks', CalendarClock, 'warn'],
    ['Completed', String(completed), 'Completed', CheckCircle2, 'up'],
    ['Conflicts', String(conflicts), 'Require resolution', AlertTriangle, 'critical'],
  ]
}

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function BlocksPage() {
  const router = useRouter()
  const [blocks, setBlocks] = useState([])
  const [selectedId,setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const selected = blocks.find(block => block.id === selectedId) || blocks[0]

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    blocksApi.list()
      .then((data) => {
        if (cancelled) return
        const mapped = (data.blocks || []).map(toViewModel)
        setBlocks(mapped)
        if (mapped.length) setSelectedId(mapped[0].id)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load blocks.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  const metrics = buildMetrics(blocks)

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> BLOCKS</div>
          <h1>Block Management</h1>
          <p>Monitor maintenance blocks, track availability, schedules, and operational impact across the railway network.</p>
        </div>
        <Link href="/maintenance/new" className="primary-btn">CREATE BLOCK</Link>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>Couldn't reach the backend: {error}</div>}

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
            <div><div className="section-kicker"><Construction/> BLOCK REGISTER</div><h2>Active & Scheduled Blocks</h2><p>{loading ? 'Loading…' : `${blocks.length} blocks shown`} · Delhi Division</p></div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <div className="table-head" style={{ minWidth:'930px', display:'grid', gridTemplateColumns:'0.9fr 1.1fr 1.25fr .7fr .7fr .8fr .8fr', gap:'12px' }}>
              <span>BLOCK ID</span><span>CORRIDOR</span><span>TYPE / REASON</span><span>START</span><span>END</span><span>STATUS</span><span>DATE</span>
            </div>

            <div style={{ minWidth:'930px' }}>
              {!loading && blocks.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No blocks found.</div>}
              {blocks.map(block => {
                const isSelected = block.id === selectedId
                return (
                  <button key={block.id} onClick={() => setSelectedId(block.id)} aria-pressed={isSelected} style={{ width:'100%', display:'grid', gridTemplateColumns:'0.9fr 1.1fr 1.25fr .7fr .7fr .8fr .8fr', gap:'12px', alignItems:'center', padding:'13px 16px', border:0, borderBottom:'1px solid var(--line)', borderLeft:isSelected ? '3px solid var(--teal)' : '3px solid transparent', background:isSelected ? '#E7F4F1' : 'var(--panel)', textAlign:'left', minHeight:'62px', cursor:'pointer' }}>
                    <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{block.id}</strong><small style={{ color:'var(--muted)', fontSize:'11px' }}>{block.linkedTasks} linked task(s)</small></span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{block.section}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{block.type}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{block.start}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{block.end}</span>
                    <StateTag state={block.statusState}>{block.status}</StateTag>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{block.date}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> SELECTED BLOCK</div><h2>Selected Block</h2></div>
            {selected && <StateTag state={selected.statusState}>{selected.status}</StateTag>}
          </div>

          {!selected ? (
            <div style={{ padding: '20px 18px', fontSize: '12px', color: 'var(--muted)' }}>{loading ? 'Loading…' : 'Select a block to view details.'}</div>
          ) : (
          <div style={{ padding:'2px 18px 18px' }}>
            <h3 style={{ margin:'12px 0 5px', fontSize:'17px', fontWeight:600 }}>{selected.section}</h3>
            <p style={{ marginBottom:'17px', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>{selected.id}</p>

            <div style={{ padding:'14px 4px 18px', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'8px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:'9px' }}><span>START</span><span>MAINTENANCE</span><span>END</span></div>
              <div style={{ height:'2px', background:'var(--line)', margin:'10px 5px', position:'relative' }}>
                <i style={{ position:'absolute', left:'0%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--cyan)', border:'2px solid #E7F4F1' }}/>
                <i style={{ position:'absolute', left:'50%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:selected.statusState === 'critical' ? 'var(--red)' : 'var(--yellow)', border:'2px solid #E7F4F1' }}/>
                <i style={{ position:'absolute', right:'0%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--green)', border:'2px solid #E7F4F1' }}/>
              </div>
              <div style={{ color:'var(--teal)', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.08em' }}>BLOCK START → MAINTENANCE WINDOW → BLOCK END</div>
            </div>

            {[
              ['CORRIDOR',selected.section],
              ['DATE',selected.date],
              ['TYPE / REASON',selected.type],
              ['START TIME',selected.start],
              ['END TIME',selected.end],
              ['DURATION',selected.duration],
              ['STATUS',selected.status],
              ['LINKED MAINTENANCE TASKS',selected.linkedTasks],
              ['ASSIGNED DEPARTMENT',selected.department],
            ].map(([label,value]) => (
              <div key={label} className="table-head" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'9px 0', borderBottom:'1px solid var(--line)' }}>
                <span>{label}</span>
                <span style={{ textAlign:'right', fontSize:'12px', color:label === 'STATUS' ? { Active:'var(--red)', Approved:'var(--yellow)', Completed:'var(--green)', Pending:'var(--cyan)', Conflict:'var(--red)', Rejected:'var(--red)' }[value] : undefined }}>{value}</span>
              </div>
            ))}

            <Link href={`/blocks/${selected.id}`} className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}}><GitBranch/> VIEW BLOCK DETAILS</Link>
          </div>
          )}
        </aside>
      </div>
    </main>
  )
}