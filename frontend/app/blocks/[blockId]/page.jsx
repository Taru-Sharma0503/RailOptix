'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Construction, GitBranch, TriangleAlert } from 'lucide-react'
import { blocksApi, requireAuth } from '../../../lib/api'

const STATUS_COLOR = { pending: 'var(--cyan)', approved: 'var(--yellow)', active: 'var(--red)', completed: 'var(--green)', rejected: 'var(--red)', conflict: 'var(--red)' }

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h ? `${h}h ` : ''}${m ? `${m}m` : h ? '' : '0m'}`.trim()
}

export default function BlockDetailPage({ params }) {
  const { blockId } = use(params)
  const router = useRouter()
  const [block, setBlock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    blocksApi.get(blockId)
      .then((data) => { if (!cancelled) setBlock(data.block) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load this block.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [blockId, router])

  if (loading) return <main className="dashboard"><div style={{ padding: '24px', fontSize: '12px', color: 'var(--muted)' }}>Loading…</div></main>
  if (error || !block) return (
    <main className="dashboard">
      <Link href="/blocks" className="text-btn" style={{ padding: 0, marginBottom: '18px' }}><ArrowLeft size={15} /> BACK TO BLOCKS</Link>
      <section className="panel" style={{ padding: '24px' }}>
        <div className="section-kicker" style={{ color: 'var(--red)' }}><TriangleAlert /> NOT FOUND</div>
        <h2 style={{ margin: '10px 0' }}>Could not load block {blockId}</h2>
        <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>
      </section>
    </main>
  )

  const statusColor = STATUS_COLOR[block.status] || 'var(--muted)'

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> BLOCKS <span>/</span> {block.id}</div>
          <h1>{block.corridorName || block.corridorId}</h1>
          <p>{block.reason || 'Maintenance Block'}</p>
        </div>
        <Link href="/blocks" className="secondary-btn"><ArrowLeft size={15} /> BACK TO BLOCKS</Link>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        <div className="metric"><div className="metric-top"><span>Status</span><Construction /></div><div className="metric-bottom"><strong style={{ color: statusColor }}>{(block.status || '—').toUpperCase()}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Duration</span><GitBranch /></div><div className="metric-bottom"><strong>{formatDuration(block.durationMinutes)}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Window</span><GitBranch /></div><div className="metric-bottom"><strong>{block.start} – {block.end}</strong></div></div>
        <div className="metric"><div className="metric-top"><span>Linked Tasks</span><GitBranch /></div><div className="metric-bottom"><strong>{(block.maintenanceTaskIds || []).length}</strong></div></div>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><Construction /> BLOCK DETAILS</div><h2>Block Information</h2></div></div>
          <div style={{ padding: '4px 18px 18px' }}>
            {[
              ['BLOCK ID', block.id],
              ['CORRIDOR', block.corridorName || block.corridorId],
              ['DATE', block.date],
              ['START TIME', block.start],
              ['END TIME', block.end],
              ['DURATION', formatDuration(block.durationMinutes)],
              ['REASON', block.reason || '—'],
              ['STATUS', (block.status || '—').toUpperCase()],
              ['ASSIGNED DEPARTMENT', block.departmentName || block.departmentId || '—'],
            ].map(([label, value]) => (
              <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span>{label}</span><span style={{ textAlign: 'right', fontSize: '12px', color: label === 'STATUS' ? statusColor : undefined }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact"><div><div className="section-kicker"><GitBranch /> LINKED MAINTENANCE TASKS</div><h2>Tasks in This Block</h2></div></div>
          <div style={{ padding: '4px 18px 18px' }}>
            {(block.maintenanceTaskIds || []).length === 0 && <p style={{ fontSize: '12px', color: 'var(--muted)' }}>No maintenance tasks are linked to this block.</p>}
            {(block.maintenanceTaskIds || []).map((taskId) => (
              <Link key={taskId} href={`/maintenance/${taskId}`} className="text-btn" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {taskId} <span>→</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}