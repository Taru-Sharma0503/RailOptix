'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CircleCheck, Clock3, Navigation, TrainFront, TriangleAlert } from 'lucide-react'

const trains = [
  { id: 'NDLS-12034', train: 'Delhi Shatabdi', service: 'Intercity Express', route: 'New Delhi → Chandigarh', origin: 'New Delhi', destination: 'Chandigarh', current: 'Panipat Junction', next: 'Karnal', status: 'On Time', statusState: 'healthy', delay: '0 min', priority: 'High', priorityState: 'high', scheduledArrival: '17:45', estimatedArrival: '17:45', impact: 'No operational impact' },
  { id: 'NDLS-12482', train: 'Intercity Link', service: 'Passenger Express', route: 'New Delhi → Meerut City', origin: 'New Delhi', destination: 'Meerut City', current: 'Ghaziabad Junction', next: 'Modinagar', status: 'Approaching', statusState: 'info', delay: '3 min', priority: 'Medium', priorityState: 'warning', scheduledArrival: '15:20', estimatedArrival: '15:23', impact: 'Minor platform adjustment' },
  { id: 'NZM-12952', train: 'Capital Express', service: 'Superfast Express', route: 'Hazrat Nizamuddin → Mumbai Central', origin: 'Hazrat Nizamuddin', destination: 'Mumbai Central', current: 'Faridabad', next: 'Mathura Junction', status: 'Delayed', statusState: 'warning', delay: '18 min', priority: 'High', priorityState: 'high', scheduledArrival: '06:30', estimatedArrival: '06:48', impact: 'Pathing adjustment required' },
  { id: 'DLI-64002', train: 'Delhi MEMU', service: 'Suburban Service', route: 'Delhi Junction → Panipat', origin: 'Delhi Junction', destination: 'Panipat', current: 'Narela', next: 'Sonepat', status: 'On Time', statusState: 'healthy', delay: '0 min', priority: 'Medium', priorityState: 'warning', scheduledArrival: '16:10', estimatedArrival: '16:10', impact: 'No operational impact' },
  { id: 'NDLS-12056', train: 'Jan Shatabdi', service: 'Intercity Express', route: 'New Delhi → Dehradun', origin: 'New Delhi', destination: 'Dehradun', current: 'Ghaziabad Junction', next: 'Meerut City', status: 'At Risk', statusState: 'critical', delay: '24 min', priority: 'Critical', priorityState: 'critical', scheduledArrival: '20:15', estimatedArrival: '20:39', impact: 'Connection risk at Meerut' },
  { id: 'DLI-54011', train: 'Delhi Passenger', service: 'Passenger Service', route: 'Delhi Junction → Rewari', origin: 'Delhi Junction', destination: 'Rewari', current: 'Gurugram', next: 'Pataudi Road', status: 'Stopped', statusState: 'neutral', delay: '11 min', priority: 'Low', priorityState: 'healthy', scheduledArrival: '18:05', estimatedArrival: '18:16', impact: 'Awaiting line clearance' },
  { id: 'NDLS-12310', train: 'Rajendra Express', service: 'Superfast Express', route: 'New Delhi → Patna Junction', origin: 'New Delhi', destination: 'Patna Junction', current: 'New Delhi Yard', next: 'Ghaziabad Junction', status: 'Approaching', statusState: 'info', delay: '2 min', priority: 'High', priorityState: 'high', scheduledArrival: '07:10', estimatedArrival: '07:12', impact: 'No operational impact' },
  { id: 'NZM-12138', train: 'Punjab Mail', service: 'Mail Express', route: 'Hazrat Nizamuddin → Firozpur', origin: 'Hazrat Nizamuddin', destination: 'Firozpur', current: 'Delhi Cantt', next: 'Gurugram', status: 'On Time', statusState: 'healthy', delay: '0 min', priority: 'Medium', priorityState: 'warning', scheduledArrival: '19:40', estimatedArrival: '19:40', impact: 'No operational impact' },
  { id: 'NDLS-14086', train: 'Haryana Express', service: 'Express Service', route: 'New Delhi → Hisar', origin: 'New Delhi', destination: 'Hisar', current: 'Rohtak Junction', next: 'Bhiwani', status: 'Delayed', statusState: 'warning', delay: '9 min', priority: 'Low', priorityState: 'healthy', scheduledArrival: '21:25', estimatedArrival: '21:34', impact: 'Minor crossing adjustment' },
  { id: 'DLI-64468', train: 'Delhi EMU', service: 'Suburban Service', route: 'Delhi Junction → Ghaziabad', origin: 'Delhi Junction', destination: 'Ghaziabad', current: 'Shahdara', next: 'Ghaziabad Junction', status: 'On Time', statusState: 'healthy', delay: '0 min', priority: 'Low', priorityState: 'healthy', scheduledArrival: '14:55', estimatedArrival: '14:55', impact: 'No operational impact' },
  { id: 'NDLS-12414', train: 'Rajdhani Express', service: 'Premium Express', route: 'New Delhi → Ranchi', origin: 'New Delhi', destination: 'Ranchi', current: 'Panipat Junction', next: 'Karnal', status: 'At Risk', statusState: 'critical', delay: '16 min', priority: 'Critical', priorityState: 'critical', scheduledArrival: '09:30', estimatedArrival: '09:46', impact: 'Priority path allocation needed' },
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
  const [selectedId, setSelectedId] = useState(trains[0].id)
  const selected = trains.find((train) => train.id === selectedId) || trains[0]

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
