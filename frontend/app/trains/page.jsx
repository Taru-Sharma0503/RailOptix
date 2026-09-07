'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'
import { AlertTriangle, CircleCheck, Clock3, Navigation, TrainFront, TriangleAlert } from 'lucide-react'
const mockTrains = [
  {
    id: 'TR-003', train: 'Rajdhani Express', service: 'Superfast',
    route: 'COR-001', origin: 'New Delhi', destination: 'ST-003',
    current: 'ST-002', next: 'ST-003', status: 'On Time',
    statusState: 'healthy', delay: '0 min', priority: 'High',
    priorityState: 'high', scheduledArrival: '10:00',
    estimatedArrival: '10:00', impact: 'No operational impact',
  },
  {
    id: 'TR-001', train: 'Shatabdi Express', service: 'Superfast',
    route: 'COR-001', origin: 'New Delhi', destination: 'ST-003',
    current: 'ST-001', next: 'ST-002', status: 'On Time',
    statusState: 'healthy', delay: '0 min', priority: 'High',
    priorityState: 'high', scheduledArrival: '08:15',
    estimatedArrival: '08:15', impact: 'No operational impact',
  },
]

const metrics = [
  ['Active Trains', '42', 'Across Delhi Division', TrainFront, 'info'],
  ['On Time', '34', '81% of active services', CircleCheck, 'up'],
  ['Delayed', '6', 'Review required', Clock3, 'warn'],
  ['At Risk', '2', 'Priority intervention', TriangleAlert, 'critical'],
]

function StateTag({ children, state }) {
  const colors = { healthy: 'var(--green)', info: 'var(--cyan)', warning: 'var(--yellow)', critical: 'var(--red)', high: 'var(--orange)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color: colors[state] || 'var(--muted)', borderColor: colors[state] ? 'currentColor' : undefined }}>{children}</span>
}

export default function TrainsPage() {
  const [trains, setTrains] = useState(mockTrains)
const [selectedId, setSelectedId] = useState(mockTrains[0]?.id || null)

useEffect(() => {
  async function loadTrains() {
    try {
      const data = await apiFetch('/api/trains')

      const realTrains = Array.isArray(data?.trains)
        ? data.trains
        : Array.isArray(data)
          ? data
          : null

      if (!realTrains) {
        console.warn('Unexpected trains API response:', data)
        return
      }

      const safeTrains = realTrains.map((t) => ({
        ...t,

        train: t.name || '—',

        service:
          t.type === 'superfast' ? 'Superfast' :
          t.type === 'express' ? 'Express' :
          t.type === 'passenger' ? 'Passenger' :
          t.type === 'freight' ? 'Freight' : '—',

        route: t.corridorId || '—',

        statusState:
          t.status === 'On Time' ? 'healthy' :
          t.status === 'Approaching' ? 'info' :
          t.status === 'Delayed' ? 'warning' :
          t.status === 'At Risk' ? 'critical' : 'neutral',

        priority:
          t.priority >= 9 ? 'High' :
          t.priority >= 7 ? 'Medium' : 'Low',

        priorityState:
          t.priority >= 9 ? 'high' :
          t.priority >= 7 ? 'warning' : 'healthy',

        scheduledArrival: t.scheduledArrival || t.arrival || '—',
        estimatedArrival: t.estimatedArrival || t.arrival || '—',
        impact: t.operationalImpact || '—',
      }))

      if (safeTrains.length) {
        setTrains(safeTrains)
        setSelectedId(safeTrains[0].id)
      }
    } catch (err) {
      console.error('Train API failed — using mock data:', err)
      setTrains(mockTrains)
      setSelectedId(mockTrains[0]?.id || null)
    }
  }

  loadTrains()
}, [])

const selected = trains.find((train) => train.id === selectedId) || {
  id: '—',
  train: '—',
  service: '—',
  route: '—',
  origin: '—',
  destination: '—',
  current: '—',
  next: '—',
  status: '—',
  statusState: 'neutral',
  delay: '—',
  priority: '—',
  priorityState: 'neutral',
  scheduledArrival: '—',
  estimatedArrival: '—',
  impact: '—',
}
  return (
    <main className="dashboard">
      <div className="page-intro"><div><div className="breadcrumb">OPERATIONS <span>/</span> TRAINS</div><h1>Train Operations</h1><p>Monitor active train services, movement status, and operational impact across the network.</p></div></div>
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail, Icon, state]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div></div>)}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head compact"><div><div className="section-kicker"><TrainFront /> ACTIVE SERVICES</div><h2>Train Movement Register</h2><p>11 active services shown · Delhi Division</p></div></div>
          <div style={{ overflowX: 'auto' }}>
            <div className="table-head" style={{ minWidth: '900px', display: 'grid', gridTemplateColumns: '1.05fr 1.2fr 1.55fr 1.25fr 1.15fr .85fr .65fr .75fr', gap: '12px' }}><span>TRAIN</span><span>SERVICE</span><span>ROUTE</span><span>CURRENT LOCATION</span><span>NEXT STATION</span><span>STATUS</span><span>DELAY</span><span>PRIORITY</span></div>
            <div style={{ minWidth: '900px' }}>
              {trains.map((train) => {
                const isSelected = train.id === selectedId
                return <button key={train.id} onClick={() => setSelectedId(train.id)} aria-pressed={isSelected} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.05fr 1.2fr 1.55fr 1.25fr 1.15fr .85fr .65fr .75fr', gap: '12px', alignItems: 'center', padding: '13px 16px', border: 0, borderBottom: '1px solid var(--line)', borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent', background: isSelected ? '#E7F4F1' : 'var(--panel)', textAlign: 'left', minHeight: '62px' }}>
                  <span><strong style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>{train.id}</strong><small style={{ color: 'var(--muted)', fontSize: '11px' }}>{train.train}</small></span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.service}</span><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.route}</span><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.current}</span><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{train.next}</span><StateTag state={train.statusState}>{train.status}</StateTag><span className={train.statusState === 'critical' ? 'critical' : train.delay === '0 min' ? 'up' : 'warn'} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{train.delay}</span><StateTag state={train.priorityState}>{train.priority}</StateTag>
                </button>
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><Navigation /> SELECTED TRAIN</div><h2>Selected Train</h2></div><StateTag state={selected.statusState}>{selected.status}</StateTag></div>
          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 5px', fontSize: '17px', fontWeight: 600 }}>{selected.train}</h3><p style={{ marginBottom: '17px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selected.id}</p>
            <div style={{ padding: '14px 4px 18px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '9px' }}><span>{selected.origin}</span><span>{selected.current}</span><span>{selected.next}</span><span>{selected.destination}</span></div>
              <div style={{ height: '2px', background: 'var(--line)', margin: '10px 5px', position: 'relative' }}><i style={{ position: 'absolute', left: '32%', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--teal)', border: '2px solid #E7F4F1' }} /><i style={{ position: 'absolute', left: '64%', top: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }} /></div>
              <div style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '.08em' }}>ORIGIN → CURRENT → NEXT → DESTINATION</div>
            </div>
            {[
              ['SERVICE', selected.service], ['ORIGIN', selected.origin], ['DESTINATION', selected.destination], ['CURRENT LOCATION', selected.current], ['NEXT STATION', selected.next], ['STATUS', selected.status], ['DELAY', selected.delay], ['PRIORITY', selected.priority], ['SCHEDULED ARRIVAL', selected.scheduledArrival], ['ESTIMATED ARRIVAL', selected.estimatedArrival], ['OPERATIONAL IMPACT', selected.impact],
            ].map(([label, value]) => <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '9px 0', borderBottom: label === 'OPERATIONAL IMPACT' ? '1px solid var(--line)' : undefined }}><span>{label}</span><span style={{ textAlign: 'right', fontSize: '12px', color: label === 'STATUS' ? ({ 'On Time': 'var(--green)', Approaching: 'var(--cyan)', Delayed: 'var(--yellow)', 'At Risk': 'var(--red)', Stopped: 'var(--muted)' }[value]) : undefined }}>{value}</span></div>)}
            <Link href={`/trains/${selected.id}`} className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}}><TrainFront/> VIEW TRAIN DETAILS</Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
