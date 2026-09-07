'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock3,
  Gauge,
  Navigation,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'
import { simulationApi, requireAuth } from '../../../lib/api'

const RISK_COLOR = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--red)' }

export default function SimulationResultPage({ params }) {
  const { scenarioId } = use(params)
  const router = useRouter()

  const [status, setStatus] = useState('queued')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Setting up scenario…')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false

    simulationApi
      .poll(scenarioId, {
        onProgress: (s) => {
          if (cancelled) return
          setStatus(s?.scenario?.status || 'running')
        },
      })
      .then((res) => {
        if (cancelled) return
        setData(res)
        setStatus('completed')
        setProgress(100)
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('failed')
        setError(err.message || 'Simulation failed.')
      })

    // Since the backend doesn't emit incremental progress over the polling
    // endpoint (only via Socket.IO), animate a lightweight progress bar
    // while we wait for completion.
    const tick = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 : p))
    }, 400)

    return () => { cancelled = true; clearInterval(tick) }
  }, [scenarioId, router])

  const results = data?.results
  const risk = results?.risk

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> SIMULATION <span>/</span> RESULTS</div>
          <h1>Simulation {scenarioId}</h1>
          <p>Impact analysis for the proposed maintenance window.</p>
        </div>
        <Link href="/simulation" className="secondary-btn"><ArrowLeft size={15}/> BACK TO SIMULATION</Link>
      </div>

      {status !== 'completed' && status !== 'failed' && (
        <section className="panel" style={{ padding: '24px' }}>
          <div className="section-kicker"><Clock3/> {status.toUpperCase()}</div>
          <h2 style={{ margin: '10px 0' }}>{message || 'Running simulation…'}</h2>
          <div style={{ height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden', marginTop: '14px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--teal)', transition: 'width .3s ease' }} />
          </div>
        </section>
      )}

      {status === 'failed' && (
        <section className="panel" style={{ padding: '24px' }}>
          <div className="section-kicker" style={{ color: 'var(--red)' }}><TriangleAlert/> FAILED</div>
          <h2 style={{ margin: '10px 0' }}>Simulation failed</h2>
          <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>
        </section>
      )}

      {status === 'completed' && results && (
        <>
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
            {[
              ['Affected Trains', String(results.affectedTrains ?? 0), TrainFront, 'warn'],
              ['Expected Delay', `${results.expectedDelayMinutes ?? 0} min`, Clock3, 'warn'],
              ['Affected Assets', String(results.affectedAssets ?? 0), Gauge, 'info'],
              ['Conflicts', String(results.conflicts ?? 0), TriangleAlert, 'critical'],
            ].map(([label, value, Icon, state]) => (
              <div className="metric" key={label}>
                <div className="metric-top"><span>{label}</span><Icon /></div>
                <div className="metric-bottom"><strong>{value}</strong></div>
              </div>
            ))}
          </div>

          <div className="main-grid">
            <section className="panel">
              <div className="panel-head compact">
                <div><div className="section-kicker"><Gauge /> NETWORK IMPACT</div><h2>Simulation Metrics</h2></div>
              </div>
              <div style={{ padding: '4px 18px 18px' }}>
                {[
                  ['INFRASTRUCTURE AVAILABILITY', `${results.infrastructureAvailability ?? '—'}%`],
                  ['BLOCK UTILIZATION', `${results.blockUtilization ?? '—'}%`],
                  ['OVERALL RISK', (risk || '—').toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    <span>{label}</span>
                    <span style={{ textAlign: 'right', fontSize: '12px', color: label === 'OVERALL RISK' ? RISK_COLOR[risk] : undefined }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <aside className="panel">
              <div className="panel-head compact">
                <div><div className="section-kicker"><Navigation /> RECOMMENDATION</div><h2>Suggested Alternative</h2></div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                {data.recommendation ? (
                  <div style={{ padding: '14px', background: 'var(--elevated)', border: '1px solid var(--line)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--orange)', fontWeight: 700, letterSpacing: '.06em', marginBottom: '8px' }}>ALTERNATIVE BLOCK</div>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: '12px', lineHeight: 1.55 }}>Try {data.recommendation.start} – {data.recommendation.end} instead, which avoids the current conflicts.</p>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>No lower-impact alternative window was found — this appears to be a good time slot.</p>
                )}

                {(data.alternativeBlocks || []).length > 1 && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '.06em', marginBottom: '6px' }}>OTHER OPTIONS</div>
                    {data.alternativeBlocks.slice(1).map((alt, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                        <span>{alt.start} – {alt.end}</span><span style={{ color: 'var(--muted)' }}>{alt.risk} risk</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
            <Link href="/simulation" className="text-btn">TRY ANOTHER SCENARIO <span>→</span></Link>
          </div>
        </>
      )}
    </main>
  )
}