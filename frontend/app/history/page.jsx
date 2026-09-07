'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock3, TriangleAlert, Wrench } from 'lucide-react'
import { historyApi, requireAuth } from '../../lib/api'

const EVENT_COLOR = { failure: 'var(--red)', inspection: 'var(--cyan)', repair: 'var(--orange)', replacement: 'var(--yellow)', preventive: 'var(--green)' }

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    historyApi.list()
      .then((data) => { if (!cancelled) setHistory(data.history || []) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load history.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [router])

  const failures = history.filter((h) => h.event === 'failure').length
  const totalDowntime = history.reduce((sum, h) => sum + (h.downtimeMinutes || 0), 0)

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> HISTORY</div>
          <h1>Maintenance & Failure History</h1>
          <p>Combined record of past maintenance activity and asset failures.</p>
        </div>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        <div className="metric"><div className="metric-top"><span>Events</span><Clock3 /></div><div className="metric-bottom"><strong>{history.length}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Failures</span><TriangleAlert /></div><div className="metric-bottom"><strong>{failures}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Total Downtime</span><Wrench /></div><div className="metric-bottom"><strong>{totalDowntime} min</strong></div></div>
      </div>

      <section className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><Clock3 /> EVENT LOG</div><h2>History (Most Recent First)</h2><p>{loading ? 'Loading…' : `${history.length} events shown`}</p></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-head" style={{ minWidth: '640px', display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '12px' }}>
            <span>DATE</span><span>EVENT TYPE</span><span>DESCRIPTION</span><span>DOWNTIME</span>
          </div>
          <div style={{ minWidth: '640px' }}>
            {!loading && history.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No history events found.</div>}
            {history.slice(0, 100).map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '12px', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span style={{ fontSize: '12px', color: EVENT_COLOR[h.event] || 'var(--muted)', textTransform: 'capitalize' }}>{h.event}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{h.description}</span>
                <span style={{ fontSize: '12px' }}>{h.downtimeMinutes} min</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}