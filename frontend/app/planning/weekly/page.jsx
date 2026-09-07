'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, ClipboardList, GitBranch, TriangleAlert } from 'lucide-react'
import { planningApi, requireAuth } from '../../../lib/api'

function mondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export default function WeeklyPlanningPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState(mondayOf(new Date()))
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    setLoading(true)
    planningApi.weekly(startDate)
      .then((data) => { if (!cancelled) setSchedule(data.schedule || []) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load the weekly plan.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [startDate, router])

  const totalTasks = schedule.reduce((sum, d) => sum + (d.tasks?.length || 0), 0)
  const totalBlocks = schedule.reduce((sum, d) => sum + (d.blocks?.length || 0), 0)

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> PLANNING <span>/</span> WEEKLY</div>
          <h1>Weekly Maintenance Plan</h1>
          <p>Blocks and maintenance tasks scheduled for the selected week.</p>
        </div>
        <input type="date" value={startDate} onChange={(e) => setStartDate(mondayOf(e.target.value))} className="secondary-btn" style={{ border: '1px solid var(--line)', background: 'var(--panel)' }} />
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        <div className="metric"><div className="metric-top"><span>Week Starting</span><CalendarDays /></div><div className="metric-bottom"><strong>{startDate}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Days With Activity</span><CalendarDays /></div><div className="metric-bottom"><strong>{schedule.length}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Tasks Scheduled</span><ClipboardList /></div><div className="metric-bottom"><strong>{totalTasks}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Blocks Scheduled</span><GitBranch /></div><div className="metric-bottom"><strong>{totalBlocks}</strong></div></div>
      </div>

      <section className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><CalendarDays /> WEEKLY SCHEDULE</div><h2>Day-by-Day Plan</h2></div>
        </div>

        {!loading && schedule.length === 0 && (
          <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>
            <TriangleAlert size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            No blocks or maintenance activity scheduled for this week.
          </div>
        )}

        {schedule.map((day) => (
          <div key={day.date} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}</strong>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{day.tasks.length} task(s) · {day.blocks.length} block(s)</span>
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              {day.blocks.map((b) => (
                <Link key={b.id} href={`/blocks/${b.id}`} className="text-btn" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--elevated)', border: '1px solid var(--line)', fontSize: '12px' }}>
                  <span>{b.id} · {b.corridorId} · {b.start}–{b.end} · {b.reason || 'Maintenance'}</span>
                  <span style={{ color: 'var(--muted)' }}>{(b.status || '').toUpperCase()}</span>
                </Link>
              ))}
              {day.blocks.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>No blocks scheduled this day.</span>}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}