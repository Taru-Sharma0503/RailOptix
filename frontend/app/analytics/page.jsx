'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, CalendarClock, Gauge, ShieldCheck, TrendingDown, Wrench } from 'lucide-react'
import { analyticsApi, requireAuth } from '../../lib/api'

export default function AnalyticsPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState(null)
  const [delays, setDelays] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    Promise.all([analyticsApi.kpis(), analyticsApi.delays(), analyticsApi.availability()])
      .then(([k, d, a]) => {
        if (cancelled) return
        setKpis(k.kpis)
        setDelays(d.data || [])
        setAvailability(a.data || [])
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load analytics.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [router])

  const metrics = kpis ? [
    ['Infrastructure Availability', `${kpis.infrastructureAvailability}%`, Gauge, 'up'],
    ['Maintenance Completion Rate', `${kpis.maintenanceCompletionRate}%`, ShieldCheck, 'up'],
    ['Average Train Delay', `${kpis.averageTrainDelay} min`, TrendingDown, 'warn'],
    ['Block Utilization', `${kpis.blockUtilization}%`, CalendarClock, 'info'],
    ['Conflicts Avoided', String(kpis.conflictsAvoided), Activity, 'up'],
    ['Maintenance Downtime', `${kpis.maintenanceDowntime} min`, Wrench, 'warn'],
  ] : []

  const maxDelay = Math.max(1, ...delays.map((d) => d.delayMinutes || 0))

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> ANALYTICS</div>
          <h1>Operational Analytics</h1>
          <p>Network-wide KPIs derived from real maintenance, block, and simulation data.</p>
        </div>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}
      {loading && <div style={{ padding: '16px', fontSize: '12px', color: 'var(--muted)' }}>Loading analytics…</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {metrics.map(([label, value, Icon, state]) => (
          <div className="metric" key={label}>
            <div className="metric-top"><span>{label}</span><Icon /></div>
            <div className="metric-bottom"><strong>{value}</strong></div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel">
  <div className="panel-head compact">
    <div>
      <div className="section-kicker">
        <TrendingDown /> TRAIN DELAY TREND
      </div>
      <h2>Simulated Delay by Date</h2>
    </div>
  </div>

  <div style={{ padding: '18px' }}>
    {delays.length === 0 ? (
      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
        No simulation delay data yet — run a what-if simulation to populate this chart.
      </p>
    ) : (
      <>
        <div
          style={{
            position: 'relative',
            height: '190px',
            marginTop: '8px',
            paddingLeft: '42px',
            paddingBottom: '28px',
          }}
        >
          {/* Top guide line */}
          <div
            style={{
              position: 'absolute',
              left: '42px',
              right: '0',
              top: '10px',
              borderTop: '1px dashed var(--border)',
            }}
          />

          {/* Middle guide line */}
          <div
            style={{
              position: 'absolute',
              left: '42px',
              right: '0',
              top: '50%',
              borderTop: '1px dashed var(--border)',
            }}
          />

          {/* Bottom axis */}
          <div
            style={{
              position: 'absolute',
              left: '42px',
              right: '0',
              bottom: '28px',
              borderTop: '1px solid var(--border)',
            }}
          />

          {/* Y-axis labels */}
          <span
            style={{
              position: 'absolute',
              left: '0',
              top: '2px',
              fontSize: '10px',
              color: 'var(--muted)',
            }}
          >
            {maxDelay}m
          </span>

          <span
            style={{
              position: 'absolute',
              left: '0',
              top: 'calc(50% - 6px)',
              fontSize: '10px',
              color: 'var(--muted)',
            }}
          >
            {Math.round(maxDelay / 2)}m
          </span>

          <span
            style={{
              position: 'absolute',
              left: '0',
              bottom: '22px',
              fontSize: '10px',
              color: 'var(--muted)',
            }}
          >
            0m
          </span>

          {/* Chart points */}
          <div
            style={{
              position: 'absolute',
              left: '42px',
              right: '0',
              top: '10px',
              bottom: '28px',
              display: 'flex',
              alignItems: 'stretch',
              gap: '8px',
            }}
          >
            {delays.slice(0, 20).reverse().map((d, i) => {
              const delay = Number(d.delayMinutes) || 0

              const percentage =
                maxDelay > 0
                  ? (delay / maxDelay) * 100
                  : 0

              return (
                <div
                  key={i}
                  title={`${d.date}: ${delay} min`}
                  style={{
                    flex: 1,
                    minWidth: '10px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  {/* Vertical guide from point */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      height: `${Math.max(percentage, 3)}%`,
                      width: '1px',
                      background: 'var(--teal)',
                      opacity: delay === 0 ? 0.25 : 0.5,
                    }}
                  />

                  {/* Data point */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `calc(${Math.max(percentage, 3)}% - 5px)`,
                      width: delay === 0 ? '8px' : '11px',
                      height: delay === 0 ? '8px' : '11px',
                      borderRadius: '50%',
                      background: 'var(--teal)',
                      border: '2px solid var(--panel)',
                      boxShadow: '0 0 0 1px var(--teal)',
                      zIndex: 2,
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* Date labels */}
          <div
            style={{
              position: 'absolute',
              left: '42px',
              right: '0',
              bottom: '0',
              display: 'flex',
              gap: '8px',
            }}
          >
            {delays.slice(0, 20).reverse().map((d, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: '10px',
                  textAlign: 'center',
                  fontSize: '9px',
                  color: 'var(--muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {String(d.date).slice(5)}
              </div>
            ))}
          </div>
        </div>

        {/* Chart summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            fontSize: '11px',
          }}
        >
          <span style={{ color: 'var(--muted)' }}>
            Simulations:{' '}
            <strong style={{ color: 'var(--text)' }}>
              {delays.length}
            </strong>
          </span>

          <span style={{ color: 'var(--muted)' }}>
            Peak delay:{' '}
            <strong style={{ color: 'var(--text)' }}>
              {maxDelay} min
            </strong>
          </span>
        </div>
      </>
    )}
  </div>
</section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Gauge /> AVAILABILITY TREND</div><h2>Daily Infrastructure Availability</h2></div>
          </div>
          <div style={{ padding: '4px 18px 18px', maxHeight: '260px', overflowY: 'auto' }}>
            {availability.length === 0 && <p style={{ fontSize: '12px', color: 'var(--muted)' }}>No maintenance event history yet.</p>}
            {availability.slice(0, 15).map((a) => (
              <div key={a.date} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span>{a.date}</span><span style={{ textAlign: 'right', fontSize: '12px' }}>{a.availability}%</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}