'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Archive, CheckCircle2, Clock3, Navigation, Search, TrainFront, TriangleAlert } from 'lucide-react'

const historyData = [
  { id: 'HIS-26071', type: 'Maintenance Block', reference: 'BLK-26084', asset: 'TRK-DLI-042', section: 'Delhi Junction → Narela', date: '31 Aug 2026', window: '22:00 → 02:30', duration: '4h 30m', trains: 4, outcome: 'Completed', state: 'healthy' },
  { id: 'HIS-26072', type: 'Maintenance Task', reference: 'MNT-26118', asset: 'SIG-GZB-118', section: 'Ghaziabad Junction', date: '30 Aug 2026', window: '23:30 → 01:30', duration: '2h', trains: 2, outcome: 'Completed', state: 'healthy' },
  { id: 'HIS-26073', type: 'Engineering Block', reference: 'BLK-26079', asset: 'OHE-PNP-031', section: 'Panipat Junction', date: '29 Aug 2026', window: '00:30 → 04:00', duration: '3h 30m', trains: 5, outcome: 'Completed', state: 'healthy' },
  { id: 'HIS-26074', type: 'Maintenance Block', reference: 'BLK-26076', asset: 'PNT-FBD-088', section: 'Faridabad Yard', date: '28 Aug 2026', window: '21:00 → 23:00', duration: '2h', trains: 3, outcome: 'Delayed', state: 'warning' },
  { id: 'HIS-26075', type: 'Maintenance Task', reference: 'MNT-26102', asset: 'TRK-RHT-056', section: 'Rohtak Junction', date: '27 Aug 2026', window: '02:00 → 05:00', duration: '3h', trains: 2, outcome: 'Completed', state: 'healthy' },
  { id: 'HIS-26076', type: 'Engineering Block', reference: 'BLK-26071', asset: 'BRG-MTH-017', section: 'Mathura', date: '26 Aug 2026', window: '01:00 → 03:00', duration: '2h', trains: 1, outcome: 'Completed', state: 'healthy' },
]

const activityLog = [
  ['03 Sep 2026 · 08:42', 'Maintenance block BLK-26098 created', 'Planning Control', 'healthy'],
  ['03 Sep 2026 · 07:58', 'Simulation SIM-26041 completed', 'Operations Planning', 'healthy'],
  ['02 Sep 2026 · 23:16', 'Conflict CNF-26045 resolved', 'Control Centre', 'healthy'],
  ['02 Sep 2026 · 21:40', 'Asset TRK-GZB-093 maintenance completed', 'Engineering', 'healthy'],
  ['02 Sep 2026 · 18:25', 'Weekly plan PLN-26071 updated', 'Planning Control', 'warning'],
]

const metrics = [
  ['Completed Activities', '142', 'Current planning horizon'],
  ['Maintenance Hours', '418h', 'Completed engineering work'],
  ['Affected Trains', '536', 'Historical operations'],
  ['Delayed Activities', '6', 'Require review'],
]

function StateTag({ children, state }) {
  const colors = { critical: 'var(--red)', high: 'var(--orange)', warning: 'var(--yellow)', healthy: 'var(--green)', info: 'var(--cyan)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color: colors[state], borderColor: colors[state] ? `color-mix(in srgb, ${colors[state]} 45%, transparent)` : undefined }}>{children}</span>
}

export default function HistoryPage() {
  const [selectedRecord, setSelectedRecord] = useState(historyData[0])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHistory = historyData.filter((item) => {
    const value = searchTerm.toLowerCase()
    return item.id.toLowerCase().includes(value) || item.reference.toLowerCase().includes(value) || item.asset.toLowerCase().includes(value) || item.section.toLowerCase().includes(value) || item.type.toLowerCase().includes(value)
  })

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> HISTORY</div>
          <h1>Operational History</h1>
          <p>Review completed maintenance activities, engineering blocks, operational outcomes, and historical planning actions.</p>
        </div>
        <Link href="/analytics" className="primary-btn"><Archive /> VIEW ANALYTICS</Link>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span></div><div className="metric-bottom"><strong>{value}</strong><small>{detail}</small></div></div>)}
      </div>

      <section className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker">HISTORICAL REGISTER</div><h2>Completed Operational Activities</h2><p>6 recent historical records · Delhi Division</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--line)', padding: '7px 10px', width: '230px', background: 'var(--panel)' }}>
            <Search size={14} color="var(--muted)" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search history..." style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: 'var(--foreground)', fontFamily: 'inherit', fontSize: '12px' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div className="table-head" style={{ minWidth: '920px', display: 'grid', gridTemplateColumns: '1fr 1.15fr 1.05fr 1.5fr 1fr .6fr .9fr', gap: '12px' }}><span>REFERENCE</span><span>TYPE</span><span>ASSET</span><span>SECTION</span><span>DATE</span><span>TRAINS</span><span>OUTCOME</span></div>

          <div style={{ minWidth: '920px' }}>
            {filteredHistory.map((item) => {
              const isSelected = item.id === selectedRecord.id
              return <button key={item.id} onClick={() => setSelectedRecord(item)} aria-pressed={isSelected} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.15fr 1.05fr 1.5fr 1fr .6fr .9fr', gap: '12px', alignItems: 'center', padding: '13px 16px', border: 0, borderBottom: '1px solid var(--line)', borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent', background: isSelected ? '#E7F4F1' : 'var(--panel)', textAlign: 'left', minHeight: '62px', color: 'var(--foreground)', fontFamily: 'inherit', cursor: 'pointer' }}>
                <span><strong style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{item.reference}</strong>{isSelected && <small style={{ color: 'var(--teal)', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>SELECTED</small>}</span>
                <span style={{ fontSize: '12px' }}>{item.type}</span>
                <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{item.asset}</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.section}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.date}</span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{item.trains}</span>
                <StateTag state={item.state}>{item.outcome}</StateTag>
              </button>
            })}
          </div>
        </div>

        {!filteredHistory.length && <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No historical records match the current search.</div>}
      </section>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker">SELECTED RECORD</div><h2>Selected Historical Activity</h2></div>
            <StateTag state={selectedRecord.state}>{selectedRecord.outcome}</StateTag>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 5px', fontSize: '17px', fontWeight: 600 }}>{selectedRecord.reference}</h3>
            <p style={{ marginBottom: '17px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selectedRecord.asset}</p>

            {[
              ['ACTIVITY TYPE', selectedRecord.type],
              ['SECTION', selectedRecord.section],
              ['DATE', selectedRecord.date],
              ['TIME WINDOW', selectedRecord.window],
              ['DURATION', selectedRecord.duration],
              ['AFFECTED TRAINS', selectedRecord.trains],
            ].map(([label, value]) => <div key={label} className="table-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', padding: '10px 0' }}><span>{label}</span><strong style={{ fontSize: '12px', textAlign: 'right', whiteSpace: 'nowrap', maxWidth: '60%' }}>{value}</strong></div>)}

            <div style={{ marginTop: '16px', color: 'var(--teal)', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '.12em' }}><span className="pulse-dot" style={{ marginRight: '7px' }} /> RECORD SELECTED</div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact"><div><div className="section-kicker">ACTIVITY LOG</div><h2>Recent System Actions</h2></div></div>

          <div style={{ padding: '2px 18px 18px' }}>
            {activityLog.map(([time, event, user, state], index) => <div key={event} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: '10px', alignItems: 'start', padding: '11px 0', borderBottom: index === activityLog.length - 1 ? 'none' : '1px solid var(--line)' }}>
              {state === 'healthy' ? <CheckCircle2 size={15} color="var(--green)" /> : <TriangleAlert size={15} color="var(--yellow)" />}
              <div><strong style={{ fontSize: '12px' }}>{event}</strong><div style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '11px' }}>{time} · {user}</div></div>
            </div>)}
          </div>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-head compact"><div><div className="section-kicker">HISTORY SUMMARY</div><h2>Operational Record Status</h2></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '10px' }}>
          {[
            [CheckCircle2, 'Completed', '136'],
            [Clock3, 'Delayed', '6'],
            [TrainFront, 'Affected Trains', '536'],
            [Navigation, 'Network Sections', '48'],
          ].map(([Icon, label, value]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong>{value}</strong></div></div>)}
        </div>
      </section>
    </main>
  )
}