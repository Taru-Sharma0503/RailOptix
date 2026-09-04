'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Database,
  Wrench,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from 'lucide-react'

const assetData = {
  'TRK-102': {
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
    risk: '92%',
    due: 'Due in 2 days',
    impact: 'High',
    issue: 'Track degradation detected',
  },

  'SIG-044': {
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
    risk: '24%',
    due: 'Due in 14 days',
    impact: 'Low',
    issue: 'No significant issue detected',
  },

  'PTM-018': {
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
    risk: '96%',
    due: 'Due today',
    impact: 'High',
    issue: 'Point machine degradation detected',
  },

  'OHE-221': {
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
    risk: '71%',
    due: 'Due in 6 days',
    impact: 'Medium',
    issue: 'OHE inspection recommended',
  },

  'LC-014': {
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
    risk: '18%',
    due: 'Due in 18 days',
    impact: 'Low',
    issue: 'No significant issue detected',
  },

  'BRG-007': {
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
    risk: '68%',
    due: 'Due in 8 days',
    impact: 'High',
    issue: 'Bridge inspection recommended',
  },

  'TRK-187': {
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
    risk: '21%',
    due: 'Due in 22 days',
    impact: 'Low',
    issue: 'No significant issue detected',
  },

  'SIG-091': {
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
    risk: '88%',
    due: 'Due tomorrow',
    impact: 'High',
    issue: 'Signal degradation detected',
  },

  'OHE-106': {
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
    risk: '27%',
    due: 'Due in 15 days',
    impact: 'Low',
    issue: 'No significant issue detected',
  },

  'PTM-031': {
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
    risk: '63%',
    due: 'Due in 5 days',
    impact: 'Medium',
    issue: 'Point machine inspection recommended',
  },
}

function StatusPill({ state, children }) {
  return (
    <span
      className="block-state"
      style={{
        color:
          state === 'critical'
            ? 'var(--red)'
            : state === 'healthy'
              ? 'var(--green)'
              : 'var(--yellow)',
        borderColor:
          state === 'critical'
            ? 'rgba(217,74,74,.45)'
            : state === 'healthy'
              ? 'rgba(50,148,97,.45)'
              : 'rgba(196,159,55,.45)',
      }}
    >
      {children}
    </span>
  )
}

export default function AssetPage() {
  const params = useParams()

  const assetId = Array.isArray(params?.assetId)
    ? params.assetId[0]
    : params?.assetId

  const id = decodeURIComponent(String(assetId || ''))
    .trim()
    .toUpperCase()

  const asset = assetData[id]

  if (!asset) {
    return (
      <main className="dashboard">
        <div className="page-intro">
          <div>
            <div className="breadcrumb">
              OPERATIONS <span>/</span> ASSETS
            </div>
            <h1>Asset Not Found</h1>
            <p>The requested asset could not be found.</p>
          </div>

          <Link href="/assets" className="secondary-btn">
            <ArrowLeft /> BACK TO ASSETS
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> ASSETS <span>/</span> {asset.id}
          </div>

          <h1>Asset Details</h1>
          <p>Detailed health, maintenance, and operational information.</p>
        </div>

        <Link href="/assets" className="secondary-btn">
          <ArrowLeft /> BACK TO ASSETS
        </Link>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <div className="metric-top">
            <span>ASSET HEALTH</span>
            <Activity />
          </div>

          <div className="metric-bottom">
            <strong className={asset.healthState}>{asset.health}</strong>
            <small className={asset.healthState}>{asset.status}</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>AI RISK SCORE</span>
            <AlertTriangle />
          </div>

          <div className="metric-bottom">
            <strong className={asset.healthState}>{asset.risk}</strong>
            <small className={asset.healthState}>
              {asset.priority} PRIORITY
            </small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>NEXT MAINTENANCE</span>
            <CalendarDays />
          </div>

          <div className="metric-bottom">
            <strong style={{ fontSize: '18px' }}>
              {asset.maintenance}
            </strong>
            <small>{asset.due}</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>OPERATIONAL IMPACT</span>
            <ShieldCheck />
          </div>

          <div className="metric-bottom">
            <strong style={{ fontSize: '18px' }}>
              {asset.impact}
            </strong>
            <small>ASSESSED IMPACT</small>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Database /> ASSET INFORMATION
              </div>
              <h2>{asset.name}</h2>
            </div>

            <StatusPill state={asset.healthState}>
              {asset.status}
            </StatusPill>
          </div>

          <div style={{ padding: '4px 18px 18px' }}>
            {[
              ['ASSET ID', asset.id],
              ['TYPE', asset.type],
              ['LOCATION', asset.location],
              ['HEALTH', asset.health],
              ['LAST INSPECTION', asset.inspection],
              ['NEXT MAINTENANCE', asset.maintenance],
              ['CURRENT STATUS', asset.status],
              ['MAINTENANCE PRIORITY', asset.priority],
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
                    color:
                      label === 'HEALTH'
                        ? 'var(--yellow)'
                        : undefined,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Wrench /> AI PRIORITY ASSESSMENT
              </div>
              <h2>Maintenance Recommendation</h2>
            </div>
          </div>

          <div style={{ padding: '4px 18px 20px' }}>
            <div
              style={{
                padding: '15px',
                border: '1px solid var(--line)',
                background: 'var(--elevated)',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '.08em',
                  color: 'var(--muted)',
                  marginBottom: '7px',
                }}
              >
                IDENTIFIED ISSUE
              </div>

              <strong style={{ fontSize: '16px' }}>
                {asset.issue}
              </strong>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  border: '1px solid var(--line)',
                  padding: '12px',
                }}
              >
                <small
                  style={{
                    display: 'block',
                    color: 'var(--muted)',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '6px',
                  }}
                >
                  RISK
                </small>

                <strong className={asset.healthState}>
                  {asset.risk}
                </strong>
              </div>

              <div
                style={{
                  border: '1px solid var(--line)',
                  padding: '12px',
                }}
              >
                <small
                  style={{
                    display: 'block',
                    color: 'var(--muted)',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '6px',
                  }}
                >
                  IMPACT
                </small>

                <strong>{asset.impact}</strong>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--muted)',
                fontSize: '11px',
                marginBottom: '18px',
              }}
            >
              <MapPin size={14} /> {asset.location}
            </div>

            <Link
              href="/maintenance/new"
              className="primary-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
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