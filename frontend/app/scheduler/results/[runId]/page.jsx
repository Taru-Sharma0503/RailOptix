'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Navigation,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'

const results = {
  'SCH-26091': {
    id: 'SCH-26091',
    task: 'Track renewal',
    asset: 'TRK-DLI-042',
    location: 'Narela',
    date: '03 Sep 2026',
    start: '22:00',
    end: '02:30',
    duration: '4h 30m',
    status: 'Approved',
    statusState: 'healthy',
    impact: 'High',
    impactState: 'high',
    affectedTrains: 4,
    department: 'Track Maintenance',
    reason:
      'Night maintenance window selected to minimize disruption to scheduled passenger services.',
  },

  'SCH-26092': {
    id: 'SCH-26092',
    task: 'Signal inspection',
    asset: 'SIG-GZB-118',
    location: 'Ghaziabad',
    date: '03 Sep 2026',
    start: '23:30',
    end: '01:30',
    duration: '2h',
    status: 'Approved',
    statusState: 'healthy',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: 2,
    department: 'Signal & Telecom',
    reason:
      'Scheduled within a low-density operating window with limited train conflicts.',
  },

  'SCH-26093': {
    id: 'SCH-26093',
    task: 'OHE maintenance',
    asset: 'OHE-PNP-031',
    location: 'Panipat',
    date: '04 Sep 2026',
    start: '00:30',
    end: '04:00',
    duration: '3h 30m',
    status: 'Approved',
    statusState: 'healthy',
    impact: 'High',
    impactState: 'high',
    affectedTrains: 5,
    department: 'Electrical / OHE',
    reason:
      'Block aligned with the available engineering window and optimized against train movements.',
  },

  'SCH-26094': {
    id: 'SCH-26094',
    task: 'Bridge inspection',
    asset: 'BRG-MTH-017',
    location: 'Mathura',
    date: '04 Sep 2026',
    start: '01:00',
    end: '03:00',
    duration: '2h',
    status: 'Approved',
    statusState: 'healthy',
    impact: 'Low',
    impactState: 'healthy',
    affectedTrains: 1,
    department: 'Engineering',
    reason:
      'Low-impact inspection window identified with minimal service disruption.',
  },

  'SCH-26095': {
    id: 'SCH-26095',
    task: 'Point machine service',
    asset: 'PNT-FBD-088',
    location: 'Faridabad',
    date: '03 Sep 2026',
    start: '21:00',
    end: '23:00',
    duration: '2h',
    status: 'Review Required',
    statusState: 'warning',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: 3,
    department: 'Signal & Telecom',
    reason:
      'Schedule is feasible but requires operational review because of overlapping train movements.',
  },

  'SCH-26096': {
    id: 'SCH-26096',
    task: 'Track maintenance',
    asset: 'TRK-RHT-056',
    location: 'Rohtak',
    date: '05 Sep 2026',
    start: '02:00',
    end: '05:00',
    duration: '3h',
    status: 'Approved',
    statusState: 'healthy',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: 2,
    department: 'Track Maintenance',
    reason:
      'Maintenance window fits within the available block period without critical service conflicts.',
  },
}

function StateTag({ children, state }) {
  const colors = {
    healthy: 'var(--green)',
    info: 'var(--cyan)',
    warning: 'var(--yellow)',
    critical: 'var(--red)',
    high: 'var(--orange)',
  }

  return (
    <span
      className="block-state"
      style={{
        color: colors[state] || 'var(--muted)',
        borderColor: colors[state] || 'var(--line)',
      }}
    >
      {children}
    </span>
  )
}

export default function SchedulerResultPage({ params }) {
  const { runId } = use(params)

  const result = results[runId] || results['SCH-26091']

  return (
    <main className="dashboard">

      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> SCHEDULER <span>/</span> RESULT
          </div>

          <h1>Scheduler Result</h1>

          <p>
            Review the generated maintenance schedule and its operational impact.
          </p>
        </div>

        <Link href="/scheduler" className="secondary-btn">
          <ArrowLeft size={15} />
          BACK TO SCHEDULER
        </Link>
      </div>

      <div
        className="metric-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
        }}
      >
        <div className="metric">
          <div className="metric-top">
            <span>SCHEDULE STATUS</span>
            <CheckCircle2 />
          </div>

          <div className="metric-bottom">
            <strong style={{ fontSize: '18px' }}>
              {result.status}
            </strong>

            <small className="up">
              Scheduler decision
            </small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>MAINTENANCE WINDOW</span>
            <Clock3 />
          </div>

          <div className="metric-bottom">
            <strong>{result.duration}</strong>
            <small className="info">
              {result.start} → {result.end}
            </small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>AFFECTED TRAINS</span>
            <TrainFront />
          </div>

          <div className="metric-bottom">
            <strong>{result.affectedTrains}</strong>
            <small className="warn">
              Services evaluated
            </small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>OPERATIONAL IMPACT</span>
            <TriangleAlert />
          </div>

          <div className="metric-bottom">
            <strong>{result.impact}</strong>
            <small
              className={
                result.impact === 'High'
                  ? 'critical'
                  : result.impact === 'Medium'
                    ? 'warn'
                    : 'up'
              }
            >
              Schedule impact
            </small>
          </div>
        </div>
      </div>

      <div className="main-grid">

        <section
          className="panel"
          style={{ overflow: 'hidden' }}
        >
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Navigation />
                SELECTED SCHEDULE
              </div>

              <h2>{result.task}</h2>

              <p>
                {result.asset} · {result.location}
              </p>
            </div>

            <StateTag state={result.statusState}>
              {result.status}
            </StateTag>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: 'var(--line)',
              borderTop: '1px solid var(--line)',
            }}
          >
            {[
              ['SCHEDULE ID', result.id],
              ['DEPARTMENT', result.department],
              ['ASSET', result.asset],
              ['LOCATION', result.location],
              ['DATE', result.date],
              ['DURATION', result.duration],
              ['START TIME', result.start],
              ['END TIME', result.end],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '15px 16px',
                  background: 'var(--panel)',
                }}
              >
                <div
                  className="table-head"
                  style={{
                    marginBottom: '6px',
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily:
                      label === 'SCHEDULE ID' || label === 'ASSET'
                        ? 'var(--font-mono)'
                        : undefined,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">

          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <CheckCircle2 />
                SCHEDULER DECISION
              </div>

              <h2>Decision Summary</h2>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              margin: '0 18px 18px',
              background: 'var(--elevated)',
              borderLeft: '3px solid var(--teal)',
            }}
          >
            <StateTag state={result.statusState}>
              {result.status}
            </StateTag>

            <p
              style={{
                margin: '12px 0 0',
                color: 'var(--muted)',
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            >
              {result.reason}
            </p>
          </div>

          <div style={{ padding: '0 18px 18px' }}>

            <div className="section-kicker">
              <TriangleAlert />
              OPERATIONAL IMPACT
            </div>

            {[
              ['Affected trains', `${result.affectedTrains} services`],
              ['Impact level', result.impact],
              ['Block required', 'Yes'],
              ['Schedule date', result.date],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: '11px',
                  }}
                >
                  {label}
                </span>

                <strong
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color:
                      label === 'Impact level'
                        ? result.impactState === 'high'
                          ? 'var(--orange)'
                          : result.impactState === 'warning'
                            ? 'var(--yellow)'
                            : 'var(--green)'
                        : undefined,
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}

          </div>
        </aside>

      </div>

      <section
        className="panel"
        style={{ marginTop: '18px' }}
      >
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">
              <Clock3 />
              SCHEDULE TIMELINE
            </div>

            <h2>Maintenance Window</h2>

            <p>
              Operational window selected by the scheduler.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '8px 18px 22px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 100px',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div>
              <div className="table-head">START</div>

              <strong
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                }}
              >
                {result.start}
              </strong>
            </div>

            <div>
              <div
                style={{
                  height: '4px',
                  background: 'var(--line)',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '-4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--cyan)',
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '-4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background:
                      result.impactState === 'high'
                        ? 'var(--orange)'
                        : 'var(--yellow)',
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '-4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--green)',
                  }}
                />
              </div>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: '10px',
                  color: 'var(--muted)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '.06em',
                }}
              >
                MAINTENANCE WINDOW · {result.duration}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="table-head">END</div>

              <strong
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                }}
              >
                {result.end}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="panel"
        style={{ marginTop: '18px' }}
      >
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">
              <TrainFront />
              AFFECTED TRAIN OPERATIONS
            </div>

            <h2>Service Impact</h2>

            <p>
              Train paths evaluated against the selected maintenance window.
            </p>
          </div>

          <StateTag state={result.impactState}>
            {result.impact} IMPACT
          </StateTag>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1px',
            background: 'var(--line)',
            borderTop: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              padding: '18px',
              background: 'var(--panel)',
            }}
          >
            <div className="table-head">
              AFFECTED SERVICES
            </div>

            <strong
              style={{
                display: 'block',
                fontSize: '20px',
                marginTop: '7px',
              }}
            >
              {result.affectedTrains}
            </strong>
          </div>

          <div
            style={{
              padding: '18px',
              background: 'var(--panel)',
            }}
          >
            <div className="table-head">
              IMPACT LEVEL
            </div>

            <strong
              style={{
                display: 'block',
                fontSize: '14px',
                marginTop: '9px',
                color:
                  result.impactState === 'high'
                    ? 'var(--orange)'
                    : result.impactState === 'warning'
                      ? 'var(--yellow)'
                      : 'var(--green)',
              }}
            >
              {result.impact}
            </strong>
          </div>

          <div
            style={{
              padding: '18px',
              background: 'var(--panel)',
            }}
          >
            <div className="table-head">
              BLOCK REQUIREMENT
            </div>

            <strong
              style={{
                display: 'block',
                fontSize: '14px',
                marginTop: '9px',
              }}
            >
              Required
            </strong>
          </div>

          <div
            style={{
              padding: '18px',
              background: 'var(--panel)',
            }}
          >
            <div className="table-head">
              SCHEDULE DATE
            </div>

            <strong
              style={{
                display: 'block',
                fontSize: '13px',
                marginTop: '9px',
              }}
            >
              {result.date}
            </strong>
          </div>
        </div>
      </section>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '18px',
        }}
      >
        <Link
          href="/scheduler"
          className="text-btn"
        >
          <CalendarClock size={15} />
          RETURN TO SCHEDULER
          <span>→</span>
        </Link>
      </div>

    </main>
  )
}