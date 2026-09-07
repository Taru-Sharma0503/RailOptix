'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ClipboardList, Clock3, Download, Plus, TriangleAlert, Wrench } from 'lucide-react'
import { maintenanceApi, requireAuth } from '../../lib/api'

function priorityFromScore(score) {
  if (score > 70) return { priority: 'Critical', priorityState: 'critical' }
  if (score > 50) return { priority: 'High', priorityState: 'high' }
  if (score > 30) return { priority: 'Medium', priorityState: 'warning' }
  return { priority: 'Low', priorityState: 'healthy' }
}

function statusToState(status) {
  const map = { pending: 'warning', scheduled: 'warning', in_progress: 'info', completed: 'healthy', overdue: 'critical', delayed: 'critical' }
  return map[status] || 'neutral'
}

function toViewModel(t) {
  const { priority, priorityState } = priorityFromScore(t.priorityScore ?? 0)
  return {
    id: t.id,
    asset: `${t.assetId}${t.assetName ? ' · ' + t.assetName : ''}`,
    location: t.corridorId || '—',
    priority,
    priorityState,
    type: t.description,
    scheduled: t.deadline || t.recommendedDeadline || '—',
    duration: t.estimatedDuration ? `${t.estimatedDuration} min` : '—',
    status: (t.status || 'pending').replace('_', ' ').replace(/^./, (c) => c.toUpperCase()),
    statusState: statusToState(t.status),
    impact: t.safetyRisk ? `Safety risk ${t.safetyRisk}/10` : '—',
    department: t.departmentName || t.departmentId || '—',
    priorityScore: t.priorityScore,
    failureRisk: t.failureRisk,
  }
}

function buildMetrics(tasks) {
  const open = tasks.filter((t) => t.status !== 'Completed').length
  const critical = tasks.filter((t) => t.priorityState === 'critical').length
  const inProgress = tasks.filter((t) => t.status === 'In progress').length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  return [
    ['Open Tasks', String(open), 'Across all departments', ClipboardList, 'info'],
    ['Critical', String(critical), 'Immediate review', TriangleAlert, 'critical'],
    ['In Progress', String(inProgress), 'Work underway', Wrench, 'warn'],
    ['Completed', String(completed), 'Done', CheckCircle2, 'up'],
  ]
}

function StateTag({ children, state }) {
  const colors = { critical: 'var(--red)', high: 'var(--orange)', warning: 'var(--yellow)', healthy: 'var(--green)', info: 'var(--cyan)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color: colors[state], borderColor: colors[state] ? `color-mix(in srgb, ${colors[state]} 45%, transparent)` : undefined }}>{children}</span>
}

export default function MaintenancePage() {
  const router = useRouter()
  const [tasks, setTasks] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const selected = tasks.find((task) => task.id === selectedId) || tasks[0]

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    maintenanceApi.list()
      .then((data) => {
        if (cancelled) return
        const mapped = (data.tasks || []).map(toViewModel)
        setTasks(mapped)
        if (mapped.length) setSelectedId(mapped[0].id)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load maintenance tasks.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  const metrics = buildMetrics(tasks)

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> MAINTENANCE</div>
          <h1>Maintenance Management</h1>
          <p>Monitor maintenance work, priorities, schedules, and operational impact.</p>
        </div>
        <div className="intro-actions">
          <Link href="/maintenance/import" className="secondary-btn hover:!bg-[#E7F4F1] hover:!text-[#172126]"><Download /> IMPORT TASKS</Link>
          <Link href="/maintenance/new" className="primary-btn"><Plus /> NEW MAINTENANCE TASK</Link>
        </div>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>Couldn't reach the backend: {error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail, Icon, state]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div></div>)}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker"><ClipboardList /> MAINTENANCE REGISTER</div><h2>Maintenance Tasks</h2><p>{loading ? 'Loading…' : `${tasks.length} tasks shown`} · Delhi Division</p></div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div className="table-head" style={{ minWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.35fr .75fr 1.45fr 1.35fr .7fr .95fr', gap: '12px' }}><span>TASK ID</span><span>ASSET</span><span>LOCATION</span><span>PRIORITY</span><span>TYPE</span><span>SCHEDULED</span><span>DURATION</span><span>STATUS</span></div>
            <div style={{ minWidth: '900px' }}>
              {!loading && tasks.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No maintenance tasks found.</div>}
              {tasks.map((task) => {
                const isSelected = task.id === selectedId
                return <button key={task.id} onClick={() => setSelectedId(task.id)} aria-pressed={isSelected} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.35fr .75fr 1.45fr 1.35fr .7fr .95fr', gap: '12px', alignItems: 'center', padding: '13px 16px', border: 0, borderBottom: '1px solid var(--line)', borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent', background: isSelected ? '#E7F4F1' : 'var(--panel)', textAlign: 'left', minHeight: '62px' }}>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>{task.id}</strong>
                  <span><strong style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>{task.asset}</strong>{isSelected && <small style={{ color: 'var(--teal)', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>SELECTED</small>}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{task.location}</span>
                  <StateTag state={task.priorityState}>{task.priority}</StateTag>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{task.type}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{task.scheduled}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{task.duration}</span>
                  <StateTag state={task.statusState}>{task.status}</StateTag>
                </button>
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><Clock3 /> SELECTED MAINTENANCE TASK</div><h2>Selected Maintenance Task</h2></div>{selected && <StateTag state={selected.statusState}>{selected.status}</StateTag>}</div>
          {!selected ? (
            <div style={{ padding: '20px 18px', fontSize: '12px', color: 'var(--muted)' }}>{loading ? 'Loading…' : 'Select a task to view details.'}</div>
          ) : (
          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 5px', fontSize: '17px', fontWeight: 600 }}>{selected.asset}</h3>
            <p style={{ marginBottom: '17px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selected.id}</p>
            {[
              ['LOCATION', selected.location], ['MAINTENANCE TYPE', selected.type], ['PRIORITY', selected.priority], ['PRIORITY SCORE', `${selected.priorityScore ?? 0}/100`], ['FAILURE RISK', `${Math.round((selected.failureRisk ?? 0) * 100)}%`], ['SCHEDULED DATE', selected.scheduled], ['ESTIMATED DURATION', selected.duration], ['STATUS', selected.status], ['OPERATIONAL IMPACT', selected.impact], ['ASSIGNED DEPARTMENT', selected.department],
            ].map(([label, value]) => <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>{label}</span><span style={{ textAlign: 'right', fontSize: '12px', color: label === 'PRIORITY' ? ({ Critical: 'var(--red)', High: 'var(--orange)', Medium: 'var(--yellow)', Low: 'var(--green)' }[value]) : undefined }}>{value}</span></div>)}
            <Link href={`/maintenance/${selected.id}`} className="primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}><ClipboardList size={14}/> VIEW FULL DETAILS</Link>
            <div style={{ marginTop: '16px', color: 'var(--teal)', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '.12em' }}><span className="pulse-dot" style={{ marginRight: '7px' }} /> TASK SELECTED</div>
          </div>
          )}
        </aside>
      </div>
    </main>
  )
}