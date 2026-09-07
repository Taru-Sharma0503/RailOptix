'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'
import { optimizeApi, requireAuth } from '../../../../lib/api'

export default function ScheduleResultPage({ params }) {
  const { runId } = use(params)
  const router = useRouter()

  const [status, setStatus] = useState('queued')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Submitting optimization request…')
  const [result, setResult] = useState(null)
  const [explanation, setExplanation] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false

    optimizeApi
      .poll(runId, {
        onProgress: (s) => {
          if (cancelled) return
          setStatus(s.status)
          setProgress(s.progress ?? 0)
          setMessage(s.message || '')
        },
      })
      .then((res) => {
        if (cancelled) return
        setResult(res)
        setStatus('completed')
        setProgress(100)
        return optimizeApi.explanation(runId)
      })
      .then((exp) => {
        if (cancelled || !exp) return
        setExplanation(exp.explanation?.topFeatures || exp.topFeatures || exp.whyOptimal || [])
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('failed')
        setError(err.message || 'Optimization run failed.')
      })

    return () => { cancelled = true }
  }, [runId, router])

  const metrics = result?.metrics || {}

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> SCHEDULER <span>/</span> RESULTS</div>
          <h1>Optimization Run {runId}</h1>
          <p>Live status and results from the OR-Tools CP-SAT optimizer.</p>
        </div>
        <Link href="/scheduler" className="secondary-btn"><ArrowLeft size={15}/> BACK TO SCHEDULER</Link>
      </div>

      {status !== 'completed' && status !== 'failed' && (
        <section className="panel" style={{ padding: '24px' }}>
          <div className="section-kicker"><Clock3/> {status.toUpperCase()}</div>
          <h2 style={{ margin: '10px 0' }}>{message || 'Running optimization…'}</h2>
          <div style={{ height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden', marginTop: '14px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--teal)', transition: 'width .3s ease' }} />
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>{progress}% complete</div>
        </section>
      )}

      {status === 'failed' && (
        <section className="panel" style={{ padding: '24px' }}>
          <div className="section-kicker" style={{ color: 'var(--red)' }}><TriangleAlert/> FAILED</div>
          <h2 style={{ margin: '10px 0' }}>Optimization run failed</h2>
          <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>
        </section>
      )}

      {status === 'completed' && result && (
        <>
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
            {[
              ['Asset Availability', `${metrics.assetAvailability ?? '—'}%`, CheckCircle2, 'up'],
              ['Expected Train Delay', `${metrics.expectedTrainDelay ?? '—'} min`, Clock3, 'warn'],
              ['Conflicts', String(metrics.conflicts ?? result.conflictsResolved ?? 0), TriangleAlert, 'critical'],
              ['Block Utilization', `${metrics.blockUtilization ?? '—'}%`, CalendarClock, 'info'],
            ].map(([label, value, Icon, state]) => (
              <div className="metric" key={label}>
                <div className="metric-top"><span>{label}</span><Icon /></div>
                <div className="metric-bottom"><strong>{value}</strong></div>
              </div>
            ))}
          </div>

          <section className="panel" style={{ overflow: 'hidden' }}>
            <div className="panel-head compact">
              <div><div className="section-kicker"><CalendarClock /> OPTIMIZED SCHEDULE</div><h2>Generated Maintenance Schedule</h2><p>{(result.schedule || []).length} task(s) scheduled</p></div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div className="table-head" style={{ minWidth: '700px', display: 'grid', gridTemplateColumns: '1.2fr 1fr .8fr .8fr .8fr .8fr', gap: '12px' }}>
                <span>TASK</span><span>BLOCK</span><span>START</span><span>END</span><span>DURATION</span><span>SCORE</span>
              </div>
              <div style={{ minWidth: '700px' }}>
                {(result.schedule || []).length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No tasks could be placed into the available blocks.</div>}
                {(result.schedule || []).map((s, i) => (
                  <div key={`${s.maintenanceTaskId}-${i}`} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr .8fr .8fr .8fr .8fr', gap: '12px', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>{s.maintenanceTaskId}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.blockId}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{s.start}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{s.end}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.estimatedDuration ? `${s.estimatedDuration} min` : '—'}</span>
                    <span style={{ fontSize: '12px', color: s.unplaced ? 'var(--red)' : 'var(--green)' }}>{s.unplaced ? 'Unplaced' : Math.round(s.score ?? 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {explanation.length > 0 && (
            <section className="panel" style={{ marginTop: '18px' }}>
              <div className="panel-head compact">
                <div><div className="section-kicker"><TrainFront /> WHY THIS SCHEDULE</div><h2>Explanation</h2></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1px', background: 'var(--line)', borderTop: '1px solid var(--line)' }}>
                {explanation.map((f, i) => (
                  <div key={f.factor || i} style={{ padding: '18px', background: 'var(--panel)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: f.impact === 'positive' ? 'var(--green)' : f.impact === 'negative' ? 'var(--red)' : 'var(--teal)', letterSpacing: '.05em', marginBottom: '7px' }}>{(f.factor || f.feature || 'FACTOR').toUpperCase()}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px', lineHeight: 1.5 }}>Impact score: {f.score ?? f.value ?? '—'}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
            <Link href="/scheduler" className="text-btn"><CalendarClock size={15} /> RETURN TO SCHEDULER <span>→</span></Link>
          </div>
        </>
      )}
    </main>
  )
}