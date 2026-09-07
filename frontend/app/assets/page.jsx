'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CircleCheck,
  Database,
  Plus,
  Wrench,
} from 'lucide-react'
import { assetsApi, requireAuth } from '../../lib/api'

const CONDITION_LABEL = { healthy: 'Healthy', warning: 'At Risk', critical: 'Critical' }
const CRITICALITY_LABEL = (c) => (c >= 9 ? 'Critical' : c >= 7 ? 'High' : c >= 4 ? 'Medium' : 'Low')

function toViewModel(a) {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    location: a.corridorId || '—',
    health: `${Math.round((1 - (a.failureRisk ?? 0)) * 100)}%`,
    healthState: a.condition || 'healthy',
    failureRisk: a.failureRisk,
    status: CONDITION_LABEL[a.condition] || a.condition,
    priority: CRITICALITY_LABEL(a.criticality ?? 1),
  }
}

function buildKpis(assets) {
  const total = assets.length
  const healthy = assets.filter((a) => a.healthState === 'healthy').length
  const warning = assets.filter((a) => a.healthState === 'warning').length
  const critical = assets.filter((a) => a.healthState === 'critical').length
  return [
    ['Total Assets', String(total), 'Across Delhi Division', Database, 'info'],
    ['Healthy', String(healthy), total ? `${((healthy / total) * 100).toFixed(1)}% of monitored` : '', CircleCheck, 'up'],
    ['At Risk', String(warning), 'Review required', AlertTriangle, 'warn'],
    ['Critical', String(critical), 'Immediate attention', Activity, 'critical'],
  ]
}

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
  const router = useRouter()
  const [assets, setAssets] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    assetsApi.list()
      .then((data) => {
        if (cancelled) return
        const mapped = (data.assets || []).map(toViewModel)
        setAssets(mapped)
        if (mapped.length) setSelectedId(mapped[0].id)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load assets.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  const kpis = buildKpis(assets)
  const selected = assets.find((asset) => asset.id === selectedId) || assets[0]

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

      {error && <div style={{margin:'0 0 16px',padding:'12px 14px',border:'1px solid rgba(217,74,74,.35)',color:'var(--red)',fontSize:'12px'}}>Couldn't reach the backend: {error}</div>}
      {loading && <div style={{padding:'16px',fontSize:'12px',color:'var(--muted)'}}>Loading assets…</div>}

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

          {!loading && assets.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>
              No assets found.
            </div>
          )}

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
              <h2>{selected ? selected.id : '—'}</h2>
            </div>

            {selected && (
              <StatusPill state={selected.healthState}>
                {selected.status}
              </StatusPill>
            )}
          </div>

          {!selected ? (
            <div style={{ padding: '20px 18px', fontSize: '12px', color: 'var(--muted)' }}>
              {loading ? 'Loading…' : 'Select an asset to view details.'}
            </div>
          ) : (
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
              ['CORRIDOR', selected.location],
              ['HEALTH', selected.health],
              ['FAILURE RISK', `${Math.round((selected.failureRisk ?? 0) * 100)}%`],
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
          )}
        </section>
      </div>
    </main>
  )
}