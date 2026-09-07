'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarClock, ClipboardList, Clock3, TriangleAlert } from 'lucide-react'
import { maintenanceApi, requireAuth } from '../../../lib/api'

function priorityFromScore(score) {
  if (score > 70) return { priority: 'Critical', color: 'var(--red)' }
  if (score > 50) return { priority: 'High', color: 'var(--orange)' }
  if (score > 30) return { priority: 'Medium', color: 'var(--yellow)' }
  return { priority: 'Low', color: 'var(--green)' }
}

export default function MaintenanceTaskPage({ params }) {
  const { taskId } = use(params)
  const router = useRouter()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    maintenanceApi.get(taskId)
      .then((data) => { if (!cancelled) setTask(data.task) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load this task.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [taskId, router])

  if (loading) return <main className="dashboard"><div style={{ padding: '24px', fontSize: '12px', color: 'var(--muted)' }}>Loading…</div></main>
  if (error || !task) return (
    <main className="dashboard">
      <Link href="/maintenance" className="text-btn" style={{ padding: 0, marginBottom: '18px' }}><ArrowLeft size={15} /> BACK TO MAINTENANCE</Link>
      <section className="panel" style={{ padding: '24px' }}>
        <div className="section-kicker" style={{ color: 'var(--red)' }}><TriangleAlert /> NOT FOUND</div>
        <h2 style={{ margin: '10px 0' }}>Could not load task {taskId}</h2>
        <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>
      </section>
    </main>
  )

  const { priority, color } = priorityFromScore(task.priorityScore ?? 0)

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> MAINTENANCE <span>/</span> {task.id}</div>
          <h1>{task.description}</h1>
          <p>{task.assetName ? `${task.assetName} · ` : ''}{task.assetId}</p>
        </div>
        <Link href="/maintenance" className="secondary-btn"><ArrowLeft size={15} /> BACK TO MAINTENANCE</Link>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        <div className="metric"><div className="metric-top"><span>Priority Score</span><TriangleAlert /></div><div className="metric-bottom"><strong style={{ color }}>{task.priorityScore ?? 0}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Failure Risk</span><ClipboardList /></div><div className="metric-bottom"><strong>{Math.round((task.failureRisk ?? 0) * 100)}%</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Estimated Duration</span><Clock3 /></div><div className="metric-bottom"><strong>{task.estimatedDuration ?? '—'} min</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Deadline</span><CalendarClock /></div><div className="metric-bottom"><strong>{task.deadline || 'None set'}</strong></div></div>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><ClipboardList /> TASK DETAILS</div><h2>Task Information</h2></div></div>
          <div style={{ padding: '4px 18px 18px' }}>
            {[
              ['TASK ID', task.id],
              ['ASSET', `${task.assetId}${task.assetName ? ' · ' + task.assetName : ''}`],
              ['CORRIDOR', task.corridorId || '—'],
              ['DESCRIPTION', task.description],
              ['SEVERITY', `${task.severity ?? '—'}/10`],
              ['SAFETY RISK', `${task.safetyRisk ?? '—'}/10`],
              ['PRIORITY', priority],
              ['STATUS', (task.status || '—').replace('_', ' ')],
              ['ASSIGNED DEPARTMENT', task.departmentName || task.departmentId || '—'],
              ['ASSET CRITICALITY', task.assetCriticality ?? '—'],
              ['ASSET CONDITION', task.assetCondition || '—'],
            ].map(([label, value]) => (
              <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span>{label}</span><span style={{ textAlign: 'right', fontSize: '12px', color: label === 'PRIORITY' ? color : undefined }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><CalendarClock /> ACTIONS</div><h2>Scheduling</h2></div></div>
          <div style={{ padding: '16px 18px', display: 'grid', gap: '10px' }}>
            <Link href="/scheduler" className="primary-btn" style={{ width: '100%', justifyContent: 'center' }}><CalendarClock size={14} /> INCLUDE IN SCHEDULER RUN</Link>
            <Link href="/simulation" className="secondary-btn" style={{ width: '100%', justifyContent: 'center' }}>RUN WHAT-IF SIMULATION</Link>
            <Link href={`/assets/${task.assetId}`} className="text-btn" style={{ justifyContent: 'center' }}>VIEW ASSET <span>→</span></Link>
          </div>
        </aside>
      </div>
    </main>
  )
}