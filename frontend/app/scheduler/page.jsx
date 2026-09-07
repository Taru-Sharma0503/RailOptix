'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, CheckCircle2, Clock3, Navigation, Play, TrainFront, TriangleAlert } from 'lucide-react'
import { maintenanceApi, blocksApi, optimizeApi, requireAuth } from '../../lib/api'

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className="block-state" style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function SchedulerPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState([])
  const [blocks, setBlocks] = useState([])
  const [selectedTaskIds, setSelectedTaskIds] = useState([])
  const [selectedBlockIds, setSelectedBlockIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    Promise.all([maintenanceApi.list(), blocksApi.list()])
      .then(([taskData, blockData]) => {
        if (cancelled) return
        const openTasks = (taskData.tasks || []).filter((t) => t.status !== 'completed')
        const openBlocks = (blockData.blocks || []).filter((b) => b.status === 'pending' || b.status === 'approved')
        setTasks(openTasks)
        setBlocks(openBlocks)
        setSelectedTaskIds(openTasks.map((t) => t.id))
        setSelectedBlockIds(openBlocks.map((b) => b.id))
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load scheduler data.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  function toggleTask(id) {
    setSelectedTaskIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  function toggleBlock(id) {
    setSelectedBlockIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  async function runScheduler() {
    setError('')
    if (!selectedTaskIds.length || !selectedBlockIds.length) {
      setError('Select at least one maintenance task and one block to run the optimizer.')
      return
    }

    setRunning(true)
    try {
      const corridorId = blocks.find((b) => selectedBlockIds.includes(b.id))?.corridorId || 'COR-001'
      const { runId } = await optimizeApi.start({
        corridorId,
        planningDate: new Date().toISOString().split('T')[0],
        maintenanceTaskIds: selectedTaskIds,
        blockIds: selectedBlockIds,
      })
      router.push(`/scheduler/results/${runId}`)
    } catch (err) {
      setError(err.message || 'Could not start optimization run.')
      setRunning(false)
    }
  }

  const criticalCount = tasks.filter((t) => (t.priorityScore ?? 0) > 70).length

  const metrics = [
    ['Open Tasks', String(tasks.length), 'Eligible for scheduling', Clock3, 'warn'],
    ['Available Blocks', String(blocks.length), 'Pending or approved', CalendarClock, 'info'],
    ['Critical Priority', String(criticalCount), 'Score above 70', TriangleAlert, 'critical'],
    ['Selected', `${selectedTaskIds.length} / ${selectedBlockIds.length}`, 'Tasks / blocks chosen', CheckCircle2, 'up'],
  ]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div><div className="breadcrumb">OPERATIONS <span>/</span> SCHEDULER</div><h1>Maintenance Scheduler</h1><p>Select maintenance tasks and block windows, then run the OR-Tools CP-SAT optimizer to generate a schedule.</p></div>
        <button className="primary-btn" onClick={runScheduler} disabled={running || loading}><Play size={15}/>{running ? 'STARTING…' : 'RUN SCHEDULER'}</button>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label,value,detail,Icon,state]) => (
          <div className="metric" key={label}>
            <div className="metric-top"><span>{label}</span><Icon/></div>
            <div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow:'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker"><CalendarClock/> MAINTENANCE TASKS</div><h2>Select Tasks to Schedule</h2><p>{loading ? 'Loading…' : `${tasks.length} open tasks`}</p></div>
          </div>
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {!loading && tasks.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No open maintenance tasks.</div>}
            {tasks.map((t) => (
              <label key={t.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'12px', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--line)', cursor:'pointer' }}>
                <input type="checkbox" checked={selectedTaskIds.includes(t.id)} onChange={() => toggleTask(t.id)} />
                <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{t.id}</strong><small style={{ color:'var(--muted)', fontSize:'11px' }}>{t.description} · {t.assetId}</small></span>
                <StateTag state={(t.priorityScore ?? 0) > 70 ? 'critical' : (t.priorityScore ?? 0) > 50 ? 'high' : 'warning'}>{t.priorityScore ?? 0}</StateTag>
              </label>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> AVAILABLE BLOCKS</div><h2>Select Block Windows</h2></div>
          </div>
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {!loading && blocks.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No pending or approved blocks.</div>}
            {blocks.map((b) => (
              <label key={b.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'12px', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--line)', cursor:'pointer' }}>
                <input type="checkbox" checked={selectedBlockIds.includes(b.id)} onChange={() => toggleBlock(b.id)} />
                <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{b.id}</strong><small style={{ color:'var(--muted)', fontSize:'11px' }}>{b.corridorName || b.corridorId} · {b.start}–{b.end}</small></span>
              </label>
            ))}
          </div>
        </aside>
      </div>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><TrainFront/> SCHEDULING LOGIC</div><h2>How the Optimizer Works</h2><p>The AI engine's OR-Tools CP-SAT solver evaluates maintenance windows against train movement, asset criticality, and safety constraints.</p></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['MAINTENANCE WINDOW','Available block duration'],
            ['TRAIN MOVEMENT','Affected services and paths'],
            ['ASSET AVAILABILITY','Current infrastructure state'],
            ['OPERATIONAL IMPACT','Delay and disruption risk'],
          ].map(([title,description]) => (
            <div key={title} style={{ padding:'18px', background:'var(--panel)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--teal)', letterSpacing:'.05em', marginBottom:'7px' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'12px', lineHeight:1.5 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}