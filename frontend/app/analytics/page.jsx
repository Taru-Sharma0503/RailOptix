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
            <div><div className="section-kicker"><TrendingDown /> TRAIN DELAY TREND</div><h2>Simulated Delay by Date</h2></div>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {delays.length === 0 && <p style={{ fontSize: '12px', color: 'var(--muted)' }}>No simulation delay data yet — run a what-if simulation to populate this chart.</p>}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px' }}>
              {delays.slice(0, 20).reverse().map((d, i) => (
                <div key={i} title={`${d.date}: ${d.delayMinutes} min`} style={{ flex: 1, height: `${Math.max(4, (d.delayMinutes / maxDelay) * 100)}%`, background: 'var(--teal)', borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
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