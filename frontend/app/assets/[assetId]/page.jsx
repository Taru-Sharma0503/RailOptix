'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
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
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  const assetId = Array.isArray(params?.assetId)
    ? params.assetId[0]
    : params?.assetId

  const id = decodeURIComponent(String(assetId || ''))
    .trim()
    .toUpperCase()

  useEffect(() => {
    async function loadAsset() {
      try {
        const [assetData, riskData, maintenanceData] =
          await Promise.all([
            apiFetch(`/api/assets/${id}`),
            apiFetch(`/api/assets/${id}/risk`),
             apiFetch(`/api/maintenance?assetId=${id}`),
          ])

        const backendAsset = assetData?.asset || assetData
        const backendRisk = riskData?.risk || riskData
        const maintenanceTasks = maintenanceData?.tasks || []

        if (backendAsset?.id) {
          const health = Math.round(
            (1 - (backendAsset.failureRisk ?? 0)) * 100
          )

          const healthState =
            backendAsset.condition === 'critical'
              ? 'critical'
              : backendAsset.condition === 'warning'
                ? 'warning'
                : 'healthy'

          const priority =
            backendAsset.criticality >= 9
              ? 'Critical'
              : backendAsset.criticality >= 7
                ? 'High'
                : backendAsset.criticality >= 4
                  ? 'Medium'
                  : 'Low'

          setAsset({
            ...backendAsset,

            type: backendAsset.type
              ? backendAsset.type.charAt(0).toUpperCase() +
                backendAsset.type.slice(1)
              : '—',

            location:
              backendAsset.location &&
              typeof backendAsset.location === 'object'
                ? `${backendAsset.location.latitude}, ${backendAsset.location.longitude}`
                : backendAsset.location || '—',

            health: `${health}%`,
            healthState,

            inspection:
  backendAsset.maintenanceHistory?.length > 0
    ? new Date(
        backendAsset.maintenanceHistory[0].performedAt
      ).toLocaleDateString('en-IN')
    : '—',

maintenance:
  maintenanceTasks.length > 0
    ? new Date(
        maintenanceTasks
          .filter((task) => task.status !== 'completed')
          .sort(
            (a, b) =>
              new Date(a.deadline) -
              new Date(b.deadline)
          )[0]?.deadline
      ).toLocaleDateString('en-IN')
    : '—',

            status:
              backendAsset.condition === 'critical'
                ? 'Critical'
                : backendAsset.condition === 'warning'
                  ? 'At Risk'
                  : 'Healthy',

            priority,

            risk: `${Math.round(
  (backendRisk?.failureRisk ??
    backendRisk?.risk ??
    backendAsset.failureRisk ??
    0) * 100
)}%`,

            due:
  maintenanceTasks.length > 0
    ? maintenanceTasks
        .filter((task) => task.status !== 'completed')
        .sort(
          (a, b) =>
            new Date(a.deadline) -
            new Date(b.deadline)
        )[0]?.description || 'Scheduled'
    : '—',

            impact:
              backendAsset.condition === 'critical'
                ? 'High'
                : backendAsset.condition === 'warning'
                  ? 'Medium'
                  : 'Low',

            issue:
              backendAsset.condition === 'critical'
                ? 'Asset degradation detected'
                : backendAsset.condition === 'warning'
                  ? 'Asset inspection recommended'
                  : 'No significant issue detected',
          })
        }
      } catch (err) {
        console.error('Failed to load asset:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadAsset()
    }
  }, [id])

  if (loading) {
    return (
      <main className="dashboard">
        <div className="page-intro">
          <div>
            <div className="breadcrumb">
              OPERATIONS <span>/</span> ASSETS
            </div>
            <h1>Loading Asset...</h1>
          </div>
        </div>
      </main>
    )
  }

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