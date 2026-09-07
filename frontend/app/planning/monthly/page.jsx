'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, ClipboardList, GitBranch, TriangleAlert } from 'lucide-react'
import { planningApi, requireAuth } from '../../../lib/api'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function MonthlyPlanningPage() {
  const router = useRouter()
  const [month, setMonth] = useState(currentMonth())
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    setLoading(true)
    planningApi.monthly(month)
      .then((data) => { if (!cancelled) setSchedule(data.schedule || []) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load the monthly plan.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [month, router])

  const totalTasks = schedule.reduce((sum, d) => sum + (d.tasks?.length || 0), 0)
  const totalBlocks = schedule.reduce((sum, d) => sum + (d.blocks?.length || 0), 0)
  const busiestDay = schedule.reduce((max, d) => ((d.blocks?.length || 0) > (max?.blocks?.length || 0) ? d : max), null)

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> PLANNING <span>/</span> MONTHLY</div>
          <h1>Monthly Maintenance Plan</h1>
          <p>Blocks and maintenance tasks scheduled for the selected month.</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="secondary-btn" style={{ border: '1px solid var(--line)', background: 'var(--panel)' }} />
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        <div className="metric"><div className="metric-top"><span>Month</span><CalendarDays /></div><div className="metric-bottom"><strong>{month}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Days With Activity</span><CalendarDays /></div><div className="metric-bottom"><strong>{schedule.length}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Tasks Scheduled</span><ClipboardList /></div><div className="metric-bottom"><strong>{totalTasks}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Blocks Scheduled</span><GitBranch /></div><div className="metric-bottom"><strong>{totalBlocks}</strong></div></div>
      </div>

      <section className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><CalendarDays /> MONTHLY SCHEDULE</div><h2>Scheduled Days</h2>{busiestDay && <p>Busiest day: {new Date(busiestDay.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ({busiestDay.blocks.length} blocks)</p>}</div>
        </div>

        {!loading && schedule.length === 0 && (
          <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>
            <TriangleAlert size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            No blocks or maintenance activity scheduled for this month.
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <div className="table-head" style={{ minWidth: '640px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '12px' }}>
            <span>DATE</span><span>TASKS</span><span>BLOCKS</span><span>CORRIDORS</span>
          </div>
          <div style={{ minWidth: '640px' }}>
            {schedule.map((day) => (
              <Link key={day.date} href={`/planning/weekly`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '12px', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)', textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' })}</span>
                <span style={{ fontSize: '12px' }}>{day.tasks.length}</span>
                <span style={{ fontSize: '12px' }}>{day.blocks.length}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{[...new Set(day.blocks.map((b) => b.corridorId))].join(', ') || '—'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}