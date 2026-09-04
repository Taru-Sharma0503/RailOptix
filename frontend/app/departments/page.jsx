'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, CheckCircle2, Clock3, Navigation, TrainFront, TriangleAlert } from 'lucide-react'

const departments = [
  { id: 'DEP-TRK', name: 'Track Engineering', code: 'TRK', manager: 'Track Maintenance Cell', assets: 184, activeTasks: 16, blocks: 12, hours: '86h', availability: '94.8%', status: 'Operational', state: 'healthy' },
  { id: 'DEP-SIG', name: 'Signal & Telecom', code: 'SIG', manager: 'S&T Maintenance Cell', assets: 126, activeTasks: 11, blocks: 8, hours: '64h', availability: '96.1%', status: 'Operational', state: 'healthy' },
  { id: 'DEP-OHE', name: 'Electrical / OHE', code: 'OHE', manager: 'Electrical Engineering Cell', assets: 98, activeTasks: 9, blocks: 7, hours: '52h', availability: '92.7%', status: 'Review Required', state: 'warning' },
  { id: 'DEP-MEC', name: 'Mechanical', code: 'MEC', manager: 'Mechanical Maintenance Cell', assets: 76, activeTasks: 7, blocks: 5, hours: '41h', availability: '95.4%', status: 'Operational', state: 'healthy' },
  { id: 'DEP-CIV', name: 'Civil Engineering', code: 'CIV', manager: 'Civil Works Cell', assets: 64, activeTasks: 6, blocks: 4, hours: '38h', availability: '93.6%', status: 'Operational', state: 'healthy' },
  { id: 'DEP-OPS', name: 'Operations Planning', code: 'OPS', manager: 'Operations Control Cell', assets: 42, activeTasks: 8, blocks: 16, hours: '45h', availability: '91.9%', status: 'Monitoring', state: 'warning' },
]

const metrics = [
  ['Departments', '6', 'Operational units'],
  ['Managed Assets', '590', 'Across departments'],
  ['Active Tasks', '57', 'Current workload'],
  ['Maintenance Hours', '326h', 'Current planning horizon'],
]

function StateTag({ children, state }) {
  const colors = { critical: 'var(--red)', high: 'var(--orange)', warning: 'var(--yellow)', healthy: 'var(--green)', info: 'var(--cyan)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color: colors[state], borderColor: colors[state] ? `color-mix(in srgb, ${colors[state]} 45%, transparent)` : undefined }}>{children}</span>
}

export default function DepartmentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0])

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">ORGANIZATION <span>/</span> DEPARTMENTS</div>
          <h1>Departments</h1>
          <p>Monitor engineering departments, maintenance workload, asset responsibility, and operational readiness across the network.</p>
        </div>
        <Link href="/planning/weekly" className="primary-btn"><Navigation /> VIEW WEEKLY PLAN</Link>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span></div><div className="metric-bottom"><strong>{value}</strong><small>{detail}</small></div></div>)}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker">DEPARTMENT REGISTER</div><h2>Engineering Departments</h2><p>6 operational departments · Delhi Division</p></div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="table-head" style={{ minWidth: '700px', display: 'grid', gridTemplateColumns: '1.6fr .65fr .65fr .65fr 1fr', gap: '12px' }}>
              <span>DEPARTMENT</span><span>ASSETS</span><span>TASKS</span><span>BLOCKS</span><span>STATUS</span>
            </div>

            <div style={{ minWidth: '700px' }}>
              {departments.map((department) => {
                const isSelected = department.id === selectedDepartment.id
                return <button key={department.id} onClick={() => setSelectedDepartment(department)} aria-pressed={isSelected} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.6fr .65fr .65fr .65fr 1fr', gap: '12px', alignItems: 'center', padding: '13px 16px', border: 0, borderBottom: '1px solid var(--line)', borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent', background: isSelected ? '#E7F4F1' : 'var(--panel)', textAlign: 'left', minHeight: '62px', color: 'var(--foreground)', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <span><strong style={{ display: 'block', fontSize: '13px' }}>{department.name}</strong><small style={{ color: 'var(--muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{department.code} · {department.manager}</small></span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{department.assets}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{department.activeTasks}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{department.blocks}</span>
                  <StateTag state={department.state}>{department.status}</StateTag>
                </button>
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker">SELECTED DEPARTMENT</div><h2>Selected Department</h2></div>
            <StateTag state={selectedDepartment.state}>{selectedDepartment.status}</StateTag>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 5px', fontSize: '17px', fontWeight: 600 }}>{selectedDepartment.name}</h3>
            <p style={{ marginBottom: '17px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selectedDepartment.code} · {selectedDepartment.manager}</p>

            {[
              ['MANAGED ASSETS', selectedDepartment.assets],
              ['ACTIVE TASKS', selectedDepartment.activeTasks],
              ['ENGINEERING BLOCKS', selectedDepartment.blocks],
              ['MAINTENANCE HOURS', selectedDepartment.hours],
              ['AVAILABILITY', selectedDepartment.availability],
            ].map(([label, value]) => <div key={label} className="table-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', padding: '10px 0' }}><span>{label}</span><strong style={{ fontSize: '12px', textAlign: 'right', whiteSpace: 'nowrap', color: label === 'AVAILABILITY' ? 'var(--teal)' : undefined }}>{value}</strong></div>)}

            <div style={{ marginTop: '16px', color: 'var(--teal)', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '.12em' }}><span className="pulse-dot" style={{ marginRight: '7px' }} /> DEPARTMENT SELECTED</div>
          </div>
        </aside>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact"><div><div className="section-kicker">DEPARTMENT PERFORMANCE</div><h2>Operational Overview</h2></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '10px' }}>
            {[
              [CheckCircle2, 'Operational Departments', '4'],
              [Activity, 'Active Workload', '57 Tasks'],
              [Clock3, 'Engineering Hours', '326h'],
              [TriangleAlert, 'Departments to Review', '2'],
            ].map(([Icon, label, value]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong>{value}</strong></div></div>)}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head compact"><div><div className="section-kicker">OPERATIONAL OWNERSHIP</div><h2>Department Responsibilities</h2></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '10px' }}>
            {[
              [TrainFront, 'Train Operations', 'Operations Planning'],
              [Navigation, 'Track Infrastructure', 'Track Engineering'],
              [Activity, 'Signal & Electrical', 'S&T / OHE'],
            ].map(([Icon, label, value]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong style={{ fontSize: '13px' }}>{value}</strong></div></div>)}
          </div>
        </section>
      </div>

      <section className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head compact"><div><div className="section-kicker">CROSS-DEPARTMENT LOAD</div><h2>Current Engineering Capacity</h2></div></div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-head" style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '1.6fr 1fr .7fr .8fr 1fr', gap: '12px' }}><span>DEPARTMENT</span><span>WORKLOAD</span><span>BLOCKS</span><span>HOURS</span><span>AVAILABILITY</span></div>
          <div style={{ minWidth: '760px' }}>
            {departments.map((department) => <div key={department.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr .7fr .8fr 1fr', gap: '12px', alignItems: 'center', padding: '13px 16px', minHeight: '62px', borderBottom: '1px solid var(--line)' }}>
              <strong style={{ fontSize: '13px' }}>{department.name}</strong><span style={{ fontSize: '12px' }}>{department.activeTasks} active tasks</span><span style={{ fontSize: '12px' }}>{department.blocks}</span><span style={{ fontSize: '12px' }}>{department.hours}</span><strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: department.state === 'healthy' ? 'var(--green)' : 'var(--yellow)' }}>{department.availability}</strong>
            </div>)}
          </div>
        </div>
      </section>
    </main>
  )
}