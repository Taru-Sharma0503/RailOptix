'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, CalendarClock, Clock3, Play, TrainFront } from 'lucide-react'
import { maintenanceApi, networkApi, simulationApi, requireAuth } from '../../lib/api'

export default function SimulationPage() {
  const router = useRouter()
  const [corridors, setCorridors] = useState([])
  const [tasks, setTasks] = useState([])
  const [corridorId, setCorridorId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [start, setStart] = useState('22:00')
  const [end, setEnd] = useState('02:00')
  const [selectedTaskIds, setSelectedTaskIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return

    let cancelled = false
    Promise.all([networkApi.corridors(), maintenanceApi.list()])
      .then(([corridorData, taskData]) => {
        if (cancelled) return
        const cList = corridorData.corridors || []
        const tList = (taskData.tasks || []).filter((t) => t.status !== 'completed')
        setCorridors(cList)
        setTasks(tList)
        if (cList.length) setCorridorId(cList[0].id)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load scenario data.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [router])

  function toggleTask(id) {
    setSelectedTaskIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  async function runSimulation() {
    setError('')
    if (!corridorId) {
      setError('Select a corridor.')
      return
    }
    setCreating(true)
    try {
      const { scenarioId } = await simulationApi.create({
        corridorId,
        block: { start, end },
        maintenanceTaskIds: selectedTaskIds,
        trainScheduleDate: date,
      })
      await simulationApi.run(scenarioId)
      router.push(`/simulation/${scenarioId}`)
    } catch (err) {
      setError(err.message || 'Could not create simulation scenario.')
      setCreating(false)
    }
  }

  const metrics = [
    ['Corridors', String(corridors.length), 'Available in network', Activity, 'info'],
    ['Open Tasks', String(tasks.length), 'Selectable for this scenario', Clock3, 'warn'],
    ['Selected Tasks', String(selectedTaskIds.length), 'Included in the plan', CalendarClock, 'up'],
  ]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> SIMULATION</div>
          <h1>What-If Simulation</h1>
          <p>Build a proposed maintenance block and simulate its impact on train operations before scheduling it for real.</p>
        </div>
        <button className="primary-btn" onClick={runSimulation} disabled={creating || loading}><Play size={15}/>{creating ? 'RUNNING…' : 'RUN SIMULATION'}</button>
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
        <section className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><CalendarClock/> PROPOSED BLOCK</div><h2>Define Maintenance Window</h2></div>
          </div>
          <div style={{ padding: '16px 18px', display: 'grid', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
              CORRIDOR
              <select value={corridorId} onChange={(e) => setCorridorId(e.target.value)} style={{ height: '40px', border: '1px solid var(--line)', background: 'var(--panel)', padding: '0 10px', fontSize: '13px' }}>
                {corridors.map((c) => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
              </select>
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
              DATE
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ height: '40px', border: '1px solid var(--line)', background: 'var(--panel)', padding: '0 10px', fontSize: '13px' }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
                START TIME
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={{ height: '40px', border: '1px solid var(--line)', background: 'var(--panel)', padding: '0 10px', fontSize: '13px' }} />
              </label>
              <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
                END TIME
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={{ height: '40px', border: '1px solid var(--line)', background: 'var(--panel)', padding: '0 10px', fontSize: '13px' }} />
              </label>
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><TrainFront/> MAINTENANCE TASKS</div><h2>Include in Scenario</h2></div>
          </div>
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {!loading && tasks.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No open maintenance tasks.</div>}
            {tasks.map((t) => (
              <label key={t.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'12px', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid var(--line)', cursor:'pointer' }}>
                <input type="checkbox" checked={selectedTaskIds.includes(t.id)} onChange={() => toggleTask(t.id)} />
                <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{t.id}</strong><small style={{ color:'var(--muted)', fontSize:'11px' }}>{t.description} · {t.assetId}</small></span>
              </label>
            ))}
          </div>
        </aside>
      </div>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><CalendarClock/> SIMULATION WORKFLOW</div><h2>Scenario Evaluation Flow</h2><p>RailOptix evaluates a proposed plan before it is considered for operational execution.</p></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['01','DEFINE PLAN','Choose a corridor, block window, and tasks.'],
            ['02','SIMULATE','Evaluate the proposed operational window.'],
            ['03','COMPARE','Measure delay, conflicts, and train impact.'],
            ['04','DECIDE','Adopt the plan, or try an alternative window.'],
          ].map(([number,title,description]) => (
            <div key={number} style={{ padding:'18px', background:'var(--panel)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--cyan)', marginBottom:'10px' }}>{number}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--teal)', letterSpacing:'.05em', marginBottom:'7px' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'12px', lineHeight:1.5 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}