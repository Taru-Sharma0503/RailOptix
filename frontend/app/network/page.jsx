'use client'

import { useState } from 'react'
import { Activity, CircleDot, GitBranch, RefreshCw, ShieldCheck, TrainFront, TriangleAlert } from 'lucide-react'

const sections = {
  newDelhi: { name: 'New Delhi Central', status: 'Operational', availability: '99.2%', assets: '186 active assets', tasks: '3 scheduled tasks', block: 'No active block', delay: '3.1 min', state: 'healthy' },
  gurugram: { name: 'Gurugram Section', status: 'Operational', availability: '98.6%', assets: '94 active assets', tasks: '2 scheduled tasks', block: 'Block at 18:30', delay: '5.4 min', state: 'warning' },
  panipat: { name: 'Panipat Section', status: 'Attention required', availability: '94.1%', assets: '71 active assets', tasks: '6 scheduled tasks', block: 'Engineering block active', delay: '12.8 min', state: 'critical' },
  ghaziabad: { name: 'Ghaziabad Section', status: 'Operational', availability: '97.8%', assets: '118 active assets', tasks: '4 scheduled tasks', block: 'No active block', delay: '6.2 min', state: 'healthy' },
  meerut: { name: 'Meerut Section', status: 'Operational', availability: '98.1%', assets: '83 active assets', tasks: '1 scheduled task', block: 'Block planned 22:15', delay: '4.7 min', state: 'warning' },
}

const metrics = [
  ['Network Availability', '97.8%', 'Across 248.6 route km', Activity, 'up'],
  ['Active Sections', '42', 'All monitored', GitBranch, 'info'],
  ['Assets at Risk', '27', '6 need attention', TriangleAlert, 'critical'],
  ['Active Blocks', '18', '4 in progress', ShieldCheck, 'warn'],
]

const refreshSnapshots = [
  ['97.8%', '42', '27', '18'],
  ['98.0%', '42', '25', '17'],
  ['97.9%', '43', '26', '18'],
]

function Node({ id, x, y, label, selected, onSelect }) {
  return (
    <g className={`station network-node ${selected ? 'selected' : ''}`} transform={`translate(${x} ${y})`} onClick={() => onSelect(id)} role="button" tabIndex="0" aria-label={`Select ${label}`} onKeyDown={(event) => event.key === 'Enter' && onSelect(id)}>
      {selected && <circle r="16" fill="none" stroke="var(--teal)" strokeWidth="2" opacity=".45" />}
      <circle r={selected ? '12' : '9'} style={selected ? { stroke: 'var(--teal)', strokeWidth: 3, fill: '#E7F4F1' } : undefined} />
      <circle r="4" />
      <text y="-19" x={label === 'NEW DELHI' ? '-29' : '-22'}>{label}</text>
    </g>
  )
}

export default function NetworkPage() {
  const [selected, setSelected] = useState('newDelhi')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [refreshed, setRefreshed] = useState(false)
  const section = sections[selected]
  const snapshot = refreshSnapshots[refreshIndex]

  function refreshStatus() {
    if (refreshing) return

    setRefreshing(true)
    window.setTimeout(() => {
      setRefreshIndex((current) => (current + 1) % refreshSnapshots.length)
      setRefreshing(false)
      setRefreshed(true)
    }, 250)
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> NETWORK</div>
          <h1>Railway Network</h1>
          <p>Live infrastructure and asset status across the operational network.</p>
        </div>
        <button className="secondary-btn hover:!bg-[#E7F4F1] hover:!text-[#172126]" onClick={refreshStatus} disabled={refreshing} aria-live="polite"><RefreshCw /> {refreshing ? 'REFRESHING...' : 'REFRESH STATUS'}</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {metrics.map(([label, value, detail, Icon, type], index) => (
          <div className="metric" key={label}>
            <div className="metric-top"><span>{label}</span><Icon /></div>
            <div className="metric-bottom"><strong>{snapshot[index] || value}</strong><small className={type}>{detail}</small></div>
          </div>
        ))}
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: 'minmax(0, 1.65fr) minmax(290px, .75fr)' }}>
        <section className="panel twin">
          <div className="panel-head">
            <div>
              <div className="section-kicker"><GitBranch /> LIVE NETWORK VIEW</div>
              <h2>Railway Digital Twin</h2>
              <p>Infrastructure schematic · Delhi Division {refreshed && <span style={{ color: 'var(--teal)', marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '.1em' }}>UPDATED JUST NOW</span>}</p>
            </div>
            <span className="status"><span className="pulse-dot" /> LIVE</span>
          </div>
          <div className="twin-map" style={{ height: '440px' }}>
            <div className="map-grid" />
            <svg viewBox="0 0 820 440" role="img" aria-label="Interactive schematic railway network for Delhi Division" preserveAspectRatio="xMidYMid meet">
              <path className="route-secondary" d="M70 338 C150 290 210 230 310 250 S425 340 510 270 S640 150 750 125" />
              <path className="route" d="M70 338 C150 290 210 230 310 250 S425 340 510 270 S640 150 750 125" />
              <path className="route" d="M70 338 C155 365 250 360 310 250 S390 115 490 100 S640 110 750 125" />
              <path className="route-secondary" d="M310 250 C375 205 405 145 490 100" />
              <path className="route-secondary" d="M510 270 C565 330 660 342 755 310" />
              <path className="route" d="M510 270 C565 330 660 342 755 310" />

              <g className="asset healthy" transform="translate(178 284)"><circle r="6" /><path d="M0-11v22M-11 0h22" /></g>
              <g className="asset risk" transform="translate(393 302)"><circle r="7" /><path d="M-4-4l8 8m0-8l-8 8" /></g>
              <g className="asset warn" transform="translate(617 198)"><circle r="6" /><path d="M0-11v22M-11 0h22" /></g>
              <g className="signal" transform="translate(444 130)"><rect width="9" height="18" rx="2" /><circle cx="4.5" cy="4" r="2" /><circle cx="4.5" cy="13" r="2" /></g>
              <g className="signal" transform="translate(662 326)"><rect width="9" height="18" rx="2" /><circle cx="4.5" cy="4" r="2" /><circle cx="4.5" cy="13" r="2" /></g>
              <g className="block" transform="translate(535 259)"><rect x="-10" y="-10" width="20" height="20" rx="2" /><path d="M-5-5l10 10m0-10l-10 10" /></g>
              <g className="block" transform="translate(274 258)"><rect x="-10" y="-10" width="20" height="20" rx="2" /><path d="M-5-5l10 10m0-10l-10 10" /></g>
              <g className="train" transform="translate(218 270)"><circle r="10" /><path d="M-5 0h10M0-5v10" /></g>
              <g className="train train-two" transform="translate(588 215)"><circle r="10" /><path d="M-5 0h10M0-5v10" /></g>

              <Node id="gurugram" x="70" y="338" label="GURUGRAM" selected={selected === 'gurugram'} onSelect={setSelected} />
              <Node id="newDelhi" x="310" y="250" label="NEW DELHI" selected={selected === 'newDelhi'} onSelect={setSelected} />
              <Node id="panipat" x="490" y="100" label="PANIPAT" selected={selected === 'panipat'} onSelect={setSelected} />
              <Node id="ghaziabad" x="510" y="270" label="GHAZIABAD" selected={selected === 'ghaziabad'} onSelect={setSelected} />
              <Node id="meerut" x="750" y="125" label="MEERUT" selected={selected === 'meerut'} onSelect={setSelected} />
            </svg>
            <div className="map-readout"><span><i className="green-dot" /> 1,221 HEALTHY</span><span><i className="yellow-dot" /> 18 BLOCKS</span><span><i className="red-dot" /> 27 AT RISK</span></div>
            <div className="legend" style={{ padding: '6px 8px' }}><span><i className="legend-line" /> ROUTE</span><span><i className="legend-train" /> TRAIN</span><span><i className="legend-ohe" /> HEALTHY</span><span><i className="legend-signal" /> WARNING</span><span><i className="red-dot" /> CRITICAL</span><span><i className="legend-block" /> BLOCK</span></div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker"><CircleDot /> SELECTED SECTION</div>
              <h2>Selected Section</h2>
            </div>
            <span className={`block-state ${section.state === 'warning' ? 'soon' : ''}`} style={{ color: section.state === 'critical' ? 'var(--red)' : undefined }}>{section.status}</span>
          </div>
          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 18px', fontSize: '17px', fontWeight: 600 }}>{section.name}</h3>
            <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>OPERATIONAL STATUS</span><span style={{ textAlign: 'right', fontSize: '12px' }}>{section.status}</span></div>
            <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>AVAILABILITY</span><span style={{ textAlign: 'right', fontSize: '12px', color: 'var(--teal)' }}>{section.availability}</span></div>
            <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>ACTIVE ASSETS</span><span style={{ textAlign: 'right', fontSize: '12px' }}>{section.assets}</span></div>
            <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>MAINTENANCE</span><span style={{ textAlign: 'right', fontSize: '12px' }}>{section.tasks}</span></div>
            <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>BLOCK STATUS</span><span style={{ textAlign: 'right', fontSize: '12px' }}>{section.block}</span></div>
            <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--line)' }}><span>DELAY RISK</span><span style={{ textAlign: 'right', fontSize: '12px', color: section.state === 'critical' ? 'var(--red)' : 'var(--yellow)' }}>{section.delay}</span></div>
            <div style={{ marginTop: '16px', color: 'var(--teal)', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '.12em' }}><span className="pulse-dot" style={{ marginRight: '7px' }} /> SELECTED ON SCHEMATIC</div>
          </div>
        </aside>
      </div>
    </main>
  )
}
