'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, CircleCheck, Clock3, Navigation, TrainFront, TriangleAlert } from 'lucide-react'
import { trainsApi, requireAuth } from '../../lib/api'

function priorityFromNumber(p) {
  if (p >= 9) return { priority: 'Critical', priorityState: 'critical' }
  if (p >= 7) return { priority: 'High', priorityState: 'high' }
  if (p >= 4) return { priority: 'Medium', priorityState: 'warning' }
  return { priority: 'Low', priorityState: 'healthy' }
}

function toViewModel(t) {
  const { priority, priorityState } = priorityFromNumber(t.priority ?? 5)
  return {
    id: t.id,
    train: t.name || t.id,
    number: t.number,
    service: t.type || '—',
    route: t.corridorId || '—',
    corridorId: t.corridorId,
    status: t.departure ? 'Scheduled' : 'No schedule',
    statusState: t.departure ? 'info' : 'neutral',
    priority,
    priorityState,
    scheduledArrival: t.arrival || '—',
    scheduledDeparture: t.departure || '—',
  }
}

function buildMetrics(trains) {
  const active = trains.length
  const scheduled = trains.filter((t) => t.statusState === 'info').length
  const critical = trains.filter((t) => t.priorityState === 'critical').length
  const high = trains.filter((t) => t.priorityState === 'high').length
  return [
    ['Trains', String(active), 'Across Delhi Division', TrainFront, 'info'],
    ['Scheduled Today', String(scheduled), 'Have a departure time', CircleCheck, 'up'],
    ['High Priority', String(high), 'Review path allocation', Clock3, 'warn'],
    ['Critical Priority', String(critical), 'Priority intervention', TriangleAlert, 'critical'],
  ]
}

function StateTag({ children, state }) {
  const colors = { healthy: 'var(--green)', info: 'var(--cyan)', warning: 'var(--yellow)', critical: 'var(--red)', high: 'var(--orange)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color: colors[state] || 'var(--muted)', borderColor: colors[state] ? 'currentColor' : undefined }}>{children}</span>
}

export default function TrainsPage() {
  const router = useRouter()
  const [trains, setTrains] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const selected = trains.find((train) => train.id === selectedId) || trains[0]

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    trainsApi.list()
      .then((data) => {
        if (cancelled) return
        const mapped = (data.trains || []).map(toViewModel)
        setTrains(mapped)
        if (mapped.length) setSelectedId(mapped[0].id)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load trains.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  const metrics = buildMetrics(trains)

  return (
    <main className="dashboard">
      <div className="page-intro"><div><div className="breadcrumb">OPERATIONS <span>/</span> TRAINS</div><h1>Train Operations</h1><p>Monitor train services, timetables, and priority across the network.</p></div></div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>Couldn't reach the backend: {error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail, Icon, state]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div></div>)}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head compact"><div><div className="section-kicker"><TrainFront /> ACTIVE SERVICES</div><h2>Train Movement Register</h2><p>{loading ? 'Loading…' : `${trains.length} services shown`} · Delhi Division</p></div></div>
          <div style={{ overflowX: 'auto' }}>
            <div className="table-head" style={{ minWidth: '780px', display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1.1fr .9fr .9fr .8fr', gap: '12px' }}><span>TRAIN</span><span>SERVICE</span><span>CORRIDOR</span><span>DEPARTURE</span><span>ARRIVAL</span><span>PRIORITY</span></div>
            <div style={{ minWidth: '780px' }}>
              {!loading && trains.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No trains found.</div>}
              {trains.map((train) => {
                const isSelected = train.id === selectedId
                return <button key={train.id} onClick={() => setSelectedId(train.id)} aria-pressed={isSelected} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1.1fr .9fr .9fr .8fr', gap: '12px', alignItems: 'center', padding: '13px 16px', border: 0, borderBottom: '1px solid var(--line)', borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent', background: isSelected ? '#E7F4F1' : 'var(--panel)', textAlign: 'left', minHeight: '62px' }}>
                  <span><strong style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>{train.number || train.id}</strong><small style={{ color: 'var(--muted)', fontSize: '11px' }}>{train.train}</small></span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.service}</span><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.route}</span><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.scheduledDeparture}</span><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.scheduledArrival}</span><StateTag state={train.priorityState}>{train.priority}</StateTag>
                </button>
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><Navigation /> SELECTED TRAIN</div><h2>Selected Train</h2></div>{selected && <StateTag state={selected.statusState}>{selected.status}</StateTag>}</div>
          {!selected ? (
            <div style={{ padding: '20px 18px', fontSize: '12px', color: 'var(--muted)' }}>{loading ? 'Loading…' : 'Select a train to view details.'}</div>
          ) : (
          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 5px', fontSize: '17px', fontWeight: 600 }}>{selected.train}</h3><p style={{ marginBottom: '17px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selected.number || selected.id}</p>
            {[
              ['SERVICE TYPE', selected.service], ['CORRIDOR', selected.corridorId || '—'], ['DEPARTURE', selected.scheduledDeparture], ['ARRIVAL', selected.scheduledArrival], ['PRIORITY', selected.priority],
            ].map(([label, value]) => <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '9px 0' }}><span>{label}</span><span style={{ textAlign: 'right', fontSize: '12px' }}>{value}</span></div>)}
            <Link href={`/trains/${selected.id}`} className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}}><TrainFront/> VIEW TRAIN DETAILS</Link>
          </div>
          )}
        </aside>
      </div>
    </main>
  )
}