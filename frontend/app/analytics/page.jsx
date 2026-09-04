'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Navigation,
  TrainFront,
  TrendingUp,
} from 'lucide-react'

const analyticsData = [
  { id: 'ANL-26071', metric: 'Asset Availability', current: '94.2%', target: '95.0%', change: '+2.4%', trend: 'Improving', state: 'healthy' },
  { id: 'ANL-26072', metric: 'Maintenance Completion', current: '91.8%', target: '90.0%', change: '+3.1%', trend: 'Improving', state: 'healthy' },
  { id: 'ANL-26073', metric: 'Train Impact', current: '8.6 min', target: '< 10 min', change: '-1.8 min', trend: 'Improving', state: 'healthy' },
  { id: 'ANL-26074', metric: 'Planning Conflicts', current: '7', target: '< 5', change: '-3', trend: 'Improving', state: 'warning' },
  { id: 'ANL-26075', metric: 'Block Utilisation', current: '87.4%', target: '85.0%', change: '+4.7%', trend: 'Above Target', state: 'healthy' },
  { id: 'ANL-26076', metric: 'Schedule Adherence', current: '89.3%', target: '92.0%', change: '+1.6%', trend: 'Needs Review', state: 'warning' },
]

const monthlyTrend = [
  ['APR', '91.4%', '86.8%', '11.2 min'],
  ['MAY', '92.1%', '88.2%', '10.4 min'],
  ['JUN', '92.8%', '89.1%', '9.8 min'],
  ['JUL', '93.3%', '90.2%', '9.1 min'],
  ['AUG', '94.2%', '91.8%', '8.6 min'],
  ['SEP', '94.7%', '92.4%', '8.1 min'],
]

function StateTag({ children, state }) {
  const colors = { critical: 'var(--red)', high: 'var(--orange)', warning: 'var(--yellow)', healthy: 'var(--green)', info: 'var(--cyan)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color: colors[state], borderColor: colors[state] ? `color-mix(in srgb, ${colors[state]} 45%, transparent)` : undefined }}>{children}</span>
}

export default function AnalyticsPage() {
  const [selectedMetric, setSelectedMetric] = useState(analyticsData[0])

  const metrics = [
    ['Asset Availability', '94.2%', 'Network average', Activity, 'healthy'],
    ['Maintenance Completion', '91.8%', 'Tasks completed', CheckCircle2, 'healthy'],
    ['Average Train Delay', '8.6 min', 'Maintenance related', TrainFront, 'info'],
    ['Planning Efficiency', '87.4%', 'Block utilisation', TrendingUp, 'healthy'],
  ]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">ANALYTICS <span>/</span> PERFORMANCE</div>
          <h1>Operational Analytics</h1>
          <p>Monitor asset availability, maintenance performance, train impact, and planning efficiency across the railway operating network.</p>
        </div>
        <Link href="/planning/monthly" className="primary-btn"><BarChart3 /> VIEW MONTHLY PLAN</Link>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail, Icon, state]) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon /></div><div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div></div>)}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker"><BarChart3 /> PERFORMANCE REGISTER</div><h2>Operational KPI Performance</h2><p>Current operational indicators measured against defined planning and service targets.</p></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>UPDATED 03 SEP 2026</div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="table-head" style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '1.5fr .9fr .9fr .9fr 1fr', gap: '12px' }}>
              <span>METRIC</span><span>CURRENT</span><span>TARGET</span><span>CHANGE</span><span>STATUS</span>
            </div>

            <div style={{ minWidth: '760px' }}>
              {analyticsData.map((item) => {
                const isSelected = selectedMetric.id === item.id
                return <button key={item.id} onClick={() => setSelectedMetric(item)} aria-pressed={isSelected} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.5fr .9fr .9fr .9fr 1fr', gap: '12px', alignItems: 'center', padding: '13px 16px', border: 0, borderBottom: '1px solid var(--line)', borderLeft: isSelected ? '3px solid var(--teal)' : '3px solid transparent', background: isSelected ? '#E7F4F1' : 'var(--panel)', textAlign: 'left', minHeight: '62px', cursor: 'pointer', color: 'var(--foreground)', fontFamily: 'inherit' }}>
                  <span><strong style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>{item.metric}</strong>{isSelected && <small style={{ color: 'var(--teal)', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>SELECTED</small>}{!isSelected && <small style={{ display: 'block', marginTop: '4px', color: 'var(--subtle)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{item.id}</small>}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{item.current}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>{item.target}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: item.change.startsWith('-') ? 'var(--green)' : 'var(--teal)' }}>{item.change}</span>
                  <StateTag state={item.state}>{item.trend}</StateTag>
                </button>
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Activity /> SELECTED KPI</div><h2>Selected KPI</h2></div>
            <StateTag state={selectedMetric.state}>{selectedMetric.trend}</StateTag>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            <h3 style={{ margin: '12px 0 5px', fontSize: '17px', fontWeight: 600 }}>{selectedMetric.metric}</h3>
            <p style={{ marginBottom: '17px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selectedMetric.id}</p>

            <div style={{ padding: '16px', background: 'var(--elevated)', border: '1px solid var(--line)', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '.08em', marginBottom: '7px' }}>CURRENT VALUE</div>
              <strong style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '27px' }}>{selectedMetric.current}</strong>
              <small style={{ display: 'block', marginTop: '8px', color: 'var(--muted)', fontSize: '11px' }}>Target: {selectedMetric.target}</small>
            </div>

            {[
              ['CHANGE', selectedMetric.change],
              ['STATUS', selectedMetric.trend],
            ].map(([label, value]) => <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0' }}><span>{label}</span><span style={{ textAlign: 'right', fontSize: '12px', color: label === 'CHANGE' ? 'var(--green)' : undefined }}>{value}</span></div>)}

            <div style={{ marginTop: '16px', color: 'var(--teal)', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '.12em' }}><span className="pulse-dot" style={{ marginRight: '7px' }} /> KPI SELECTED</div>
          </div>
        </aside>
      </div>

      <div className="main-grid">
        <section className="panel" style={{ gridColumn: 'span 2', overflow: 'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker"><TrendingUp /> TREND ANALYSIS</div><h2>Six-Month Performance Trend</h2><p>Recent movement across availability, completion, and maintenance-related train delay.</p></div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="table-head" style={{ minWidth: '620px', display: 'grid', gridTemplateColumns: '.9fr 1.2fr 1.2fr 1.2fr', gap: '12px' }}>
              <span>PERIOD</span><span>AVAILABILITY</span><span>COMPLETION</span><span>AVG DELAY</span>
            </div>

            <div style={{ minWidth: '620px' }}>
              {monthlyTrend.map(([month, availability, completion, delay]) => <div key={month} style={{ display: 'grid', gridTemplateColumns: '.9fr 1.2fr 1.2fr 1.2fr', gap: '12px', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--line)', minHeight: '52px', fontSize: '12px' }}>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{month}</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--teal)' }}>{availability}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)' }}>{completion}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{delay}</span>
              </div>)}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Activity /> NETWORK HEALTH</div><h2>Operational Indicators</h2><p>Current network-level conditions supporting planning decisions.</p></div>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            {[
              ['Asset health', 'Stable', CheckCircle2, 'var(--green)'],
              ['Network load', '82%', Activity, 'var(--teal)'],
              ['Schedule adherence', '89.3%', Clock3, 'var(--teal)'],
              ['Open risks', '7', AlertTriangle, 'var(--yellow)'],
            ].map(([label, value, Icon, color], index, array) => <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: index === array.length - 1 ? 'none' : '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: '9px', alignItems: 'center' }}><Icon size={15} style={{ color }} /><span style={{ fontSize: '12px' }}>{label}</span></div>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{value}</strong>
            </div>)}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: '18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><Navigation /> ANALYTICS WORKFLOW</div><h2>Decision Support Status</h2><p>Operational indicators currently feeding the maintenance planning decision process.</p></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--line)', borderTop: '1px solid var(--line)' }}>
          {[
            [TrainFront, 'TRAIN OPERATIONS', 'Monitored'],
            [Navigation, 'NETWORK CAPACITY', '82%'],
            [TrendingUp, 'PERFORMANCE TREND', 'Positive'],
            [AlertTriangle, 'REVIEW REQUIRED', '7 Items'],
          ].map(([Icon, label, value]) => <div key={label} style={{ padding: '18px', background: 'var(--panel)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '9px' }}>
              <Icon size={15} style={{ color: label === 'REVIEW REQUIRED' ? 'var(--yellow)' : 'var(--teal)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '.05em' }}>{label}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 }}>{value}</div>
          </div>)}
        </div>
      </section>
    </main>
  )
}