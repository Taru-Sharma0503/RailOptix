'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { departmentsApi, requireAuth } from '../../lib/api'

export default function DepartmentsPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    departmentsApi.list()
      .then((data) => { if (!cancelled) setDepartments(data.departments || []) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load departments.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [router])

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> DEPARTMENTS</div>
          <h1>Departments</h1>
          <p>Operational departments coordinating maintenance and blocks.</p>
        </div>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}

      <section className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><ShieldCheck /> DEPARTMENT REGISTER</div><h2>All Departments</h2><p>{loading ? 'Loading…' : `${departments.length} departments`}</p></div>
        </div>
        <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <span>NAME</span><span>CODE</span><span>ID</span>
        </div>
        {!loading && departments.length === 0 && <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)' }}>No departments found.</div>}
        {departments.map((d) => (
          <Link key={d.id} href={`/departments/${d.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--line)', textDecoration: 'none', color: 'inherit' }}>
            <strong style={{ fontSize: '13px' }}>{d.name}</strong>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>{d.code}</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{d.id}</span>
          </Link>
        ))}
      </section>
    </main>
  )
}