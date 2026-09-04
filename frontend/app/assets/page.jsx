'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CircleCheck,
  Database,
  Plus,
  Wrench,
} from 'lucide-react'

const assets = [
  {
    id: 'TRK-102',
    name: 'Main Line Track Section',
    type: 'Track Section',
    location: 'New Delhi – Ghaziabad',
    health: '72%',
    healthState: 'warning',
    inspection: '28 Aug 2026',
    maintenance: '04 Sep 2026',
    status: 'At Risk',
    priority: 'High',
  },
  {
    id: 'SIG-044',
    name: 'Automatic Block Signal',
    type: 'Signal',
    location: 'New Delhi Yard',
    health: '91%',
    healthState: 'healthy',
    inspection: '30 Aug 2026',
    maintenance: '18 Sep 2026',
    status: 'Healthy',
    priority: 'Low',
  },
  {
    id: 'PTM-018',
    name: 'Point Machine No. 18',
    type: 'Point Machine',
    location: 'Ghaziabad Junction',
    health: '58%',
    healthState: 'critical',
    inspection: '26 Aug 2026',
    maintenance: '02 Sep 2026',
    status: 'Critical',
    priority: 'Critical',
  },
  {
    id: 'OHE-221',
    name: 'Overhead Contact System',
    type: 'Overhead Equipment',
    location: 'Panipat – Karnal',
    health: '76%',
    healthState: 'warning',
    inspection: '27 Aug 2026',
    maintenance: '08 Sep 2026',
    status: 'At Risk',
    priority: 'Medium',
  },
  {
    id: 'LC-014',
    name: 'Manned Level Crossing',
    type: 'Level Crossing',
    location: 'Sonepat Outer',
    health: '96%',
    healthState: 'healthy',
    inspection: '29 Aug 2026',
    maintenance: '22 Sep 2026',
    status: 'Healthy',
    priority: 'Low',
  },
  {
    id: 'BRG-007',
    name: 'Yamuna River Bridge',
    type: 'Bridge',
    location: 'Delhi – Shahdara',
    health: '84%',
    healthState: 'warning',
    inspection: '25 Aug 2026',
    maintenance: '12 Sep 2026',
    status: 'At Risk',
    priority: 'High',
  },
  {
    id: 'TRK-187',
    name: 'Loop Line Track Section',
    type: 'Track Section',
    location: 'Meerut City',
    health: '93%',
    healthState: 'healthy',
    inspection: '31 Aug 2026',
    maintenance: '26 Sep 2026',
    status: 'Healthy',
    priority: 'Low',
  },
  {
    id: 'SIG-091',
    name: 'Electronic Interlocking Signal',
    type: 'Signal',
    location: 'Panipat Junction',
    health: '65%',
    healthState: 'critical',
    inspection: '24 Aug 2026',
    maintenance: '03 Sep 2026',
    status: 'Critical',
    priority: 'Critical',
  },
  {
    id: 'OHE-106',
    name: 'Traction Mast Assembly',
    type: 'Overhead Equipment',
    location: 'Gurugram – Rewari',
    health: '88%',
    healthState: 'healthy',
    inspection: '30 Aug 2026',
    maintenance: '19 Sep 2026',
    status: 'Healthy',
    priority: 'Low',
  },
  {
    id: 'PTM-031',
    name: 'Point Machine No. 31',
    type: 'Point Machine',
    location: 'New Delhi Yard',
    health: '79%',
    healthState: 'warning',
    inspection: '28 Aug 2026',
    maintenance: '09 Sep 2026',
    status: 'At Risk',
    priority: 'Medium',
  },
]

const kpis = [
  ['Total Assets', '1,284', 'Across Delhi Division', Database, 'info'],
  ['Healthy', '1,137', '88.6% of monitored', CircleCheck, 'up'],
  ['At Risk', '96', 'Review required', AlertTriangle, 'warn'],
  ['Critical', '51', 'Immediate attention', Activity, 'critical'],
]

function StatusPill({ children, state }) {
  return (
    <span
      className={`block-state ${state === 'warning' ? 'soon' : ''}`}
      style={{
        color:
          state === 'critical'
            ? 'var(--red)'
            : state === 'healthy'
              ? 'var(--green)'
              : undefined,
        borderColor:
          state === 'critical'
            ? 'rgba(217,74,74,.45)'
            : state === 'healthy'
              ? 'rgba(50,148,97,.45)'
              : undefined,
      }}
    >
      {children}
    </span>
  )
}

export default function AssetsPage() {
  const [selectedId, setSelectedId] = useState(assets[0].id)

  const selected =
    assets.find((asset) => asset.id === selectedId) || assets[0]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> ASSETS
          </div>

          <h1>Asset Management</h1>

          <p>
            Monitor railway infrastructure assets, health, and maintenance status.
          </p>
        </div>

        <Link href="/maintenance/new" className="primary-btn">
          <Plus /> ADD MAINTENANCE TASK
        </Link>
      </div>

      <div className="metric-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {kpis.map(([label, value, sub, Icon, type]) => (
          <div className="metric" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <Icon />
            </div>

            <div className="metric-bottom">
              <strong>{value}</strong>
              <small className={type}>{sub}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Database /> ASSET REGISTER
              </div>
              <h2>Monitored Assets</h2>
            </div>
          </div>

          <div className="table-head">
            <span>ASSET</span>
            <span>HEALTH</span>
            <span>STATUS</span>
            <span>PRIORITY</span>
          </div>

          {assets.map((asset) => (
            <button
              key={asset.id}
              className="priority-row"
              onClick={() => setSelectedId(asset.id)}
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid var(--line)',
                background:
                  selectedId === asset.id
                    ? 'var(--elevated)'
                    : 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div className="asset-title">
                <b>{asset.id}</b>

                <div>
                  <strong>{asset.name}</strong>
                  <small>
                    {asset.type} · {asset.location}
                  </small>
                </div>
              </div>

              <div className="risk-cell">
                <strong className={asset.healthState}>
                  {asset.health}
                </strong>

                <div className="risk-bar">
                  <i
                    className={asset.healthState}
                    style={{ width: asset.health }}
                  />
                </div>
              </div>

              <StatusPill state={asset.healthState}>
                {asset.status}
              </StatusPill>

              <span className={`impact ${asset.healthState}`}>
                {asset.priority}
              </span>
            </button>
          ))}
        </section>

        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Activity /> SELECTED ASSET
              </div>
              <h2>{selected.id}</h2>
            </div>

            <StatusPill state={selected.healthState}>
              {selected.status}
            </StatusPill>
          </div>

          <div style={{ padding: '4px 18px 20px' }}>
            <h2 style={{ marginBottom: '5px' }}>{selected.name}</h2>

            <div
              style={{
                color: 'var(--muted)',
                fontSize: '11px',
                marginBottom: '18px',
              }}
            >
              {selected.type}
            </div>

            {[
              ['LOCATION', selected.location],
              ['HEALTH', selected.health],
              ['LAST INSPECTION', selected.inspection],
              ['NEXT MAINTENANCE', selected.maintenance],
              ['STATUS', selected.status],
              ['PRIORITY', selected.priority],
            ].map(([label, value]) => (
              <div
                key={label}
                className="table-head"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{label}</span>

                <span
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            <Link
              href={`/assets/${selected.id}`}
              className="primary-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '18px',
              }}
            >
              <Database /> VIEW ASSET DETAILS
            </Link>

            <Link
              href="/maintenance/new"
              className="secondary-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '10px',
              }}
            >
              <Wrench /> CREATE MAINTENANCE TASK
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}