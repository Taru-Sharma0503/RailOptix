'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Navigation,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'

const months = [
  {
    id: 'SEP-2026',
    month: 'SEPTEMBER',
    year: '2026',
    tasks: 168,
    blocks: 52,
    trains: 624,
    hours: '486h',
    impact: 'Medium',
    state: 'warning',
  },
  {
    id: 'OCT-2026',
    month: 'OCTOBER',
    year: '2026',
    tasks: 154,
    blocks: 47,
    trains: 571,
    hours: '442h',
    impact: 'Low',
    state: 'healthy',
  },
  {
    id: 'NOV-2026',
    month: 'NOVEMBER',
    year: '2026',
    tasks: 176,
    blocks: 55,
    trains: 682,
    hours: '519h',
    impact: 'Medium',
    state: 'warning',
  },
  {
    id: 'DEC-2026',
    month: 'DECEMBER',
    year: '2026',
    tasks: 141,
    blocks: 43,
    trains: 518,
    hours: '401h',
    impact: 'Low',
    state: 'healthy',
  },
  {
    id: 'JAN-2027',
    month: 'JANUARY',
    year: '2027',
    tasks: 183,
    blocks: 59,
    trains: 711,
    hours: '548h',
    impact: 'High',
    state: 'high',
  },
  {
    id: 'FEB-2027',
    month: 'FEBRUARY',
    year: '2027',
    tasks: 149,
    blocks: 46,
    trains: 563,
    hours: '427h',
    impact: 'Low',
    state: 'healthy',
  },
]

const maintenancePlan = [
  {
    id: 'MPL-26091',
    task: 'Track renewal programme',
    asset: 'TRK-DLI-042',
    location: 'Narela',
    period: '07–11 Sep',
    duration: '18h',
    trains: 14,
    priority: 'High',
    state: 'high',
  },
  {
    id: 'MPL-26092',
    task: 'Signal inspection cycle',
    asset: 'SIG-GZB-118',
    location: 'Ghaziabad',
    period: '08–15 Sep',
    duration: '10h',
    trains: 8,
    priority: 'Medium',
    state: 'warning',
  },
  {
    id: 'MPL-26093',
    task: 'OHE maintenance programme',
    asset: 'OHE-PNP-031',
    location: 'Panipat',
    period: '09–19 Sep',
    duration: '24h',
    trains: 21,
    priority: 'High',
    state: 'high',
  },
  {
    id: 'MPL-26094',
    task: 'Bridge inspection cycle',
    asset: 'BRG-MTH-017',
    location: 'Mathura',
    period: '10–17 Sep',
    duration: '8h',
    trains: 5,
    priority: 'Low',
    state: 'healthy',
  },
  {
    id: 'MPL-26095',
    task: 'Point machine service',
    asset: 'PNT-FBD-088',
    location: 'Faridabad',
    period: '11–22 Sep',
    duration: '12h',
    trains: 11,
    priority: 'Medium',
    state: 'warning',
  },
  {
    id: 'MPL-26096',
    task: 'Track maintenance cycle',
    asset: 'TRK-RHT-056',
    location: 'Rohtak',
    period: '12–26 Sep',
    duration: '15h',
    trains: 9,
    priority: 'Medium',
    state: 'warning',
  },
]

const metrics = [
  ['Planned Tasks', '168', 'September workload', CalendarDays, 'info'],
  ['Maintenance Hours', '486h', 'Engineering capacity', Clock3, 'up'],
  ['Affected Trains', '624', 'Services evaluated', TrainFront, 'warn'],
  ['Planning Risks', '7', 'Require review', TriangleAlert, 'critical'],
]

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

export default function MonthlyPlanningPage() {
  const [selectedMonth, setSelectedMonth] = useState(months[0].id)
  const [selectedId, setSelectedId] = useState(maintenancePlan[0].id)

  const selected =
    months.find((item) => item.id === selectedMonth) || months[0]

  const selectedTask =
    maintenancePlan.find((item) => item.id === selectedId) ||
    maintenancePlan[0]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            PLANNING <span>/</span> MONTHLY
          </div>

          <h1>Monthly Maintenance Planning</h1>

          <p>
            Plan maintenance capacity, engineering blocks, and train impact
            across the monthly operating horizon.
          </p>
        </div>

        <Link href="/planning/weekly" className="primary-btn">
          OPEN WEEKLY PLAN
        </Link>
      </div>

      <div
        className="metric-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
        }}
      >
        {metrics.map(([label, value, detail, Icon, state]) => (
          <div className="metric" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <Icon />
            </div>

            <div className="metric-bottom">
              <strong>{value}</strong>
              <small className={state}>{detail}</small>
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">
              <CalendarDays />
              MONTHLY HORIZON
            </div>

            <h2>September 2026 — February 2027</h2>

            <p>
              Maintenance workload and operational exposure across the planning
              horizon.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(6, minmax(120px, 1fr))',
            gap: '1px',
            background: 'var(--line)',
            borderTop: '1px solid var(--line)',
          }}
        >
          {months.map((month) => {
            const isSelected = month.id === selectedMonth

            return (
              <button
                key={month.id}
                onClick={() => setSelectedMonth(month.id)}
                aria-pressed={isSelected}
                style={{
                  border: 0,
                  borderBottom: isSelected
                    ? '3px solid var(--teal)'
                    : '3px solid transparent',
                  padding: '16px 12px',
                  background: isSelected
                    ? '#E7F4F1'
                    : 'var(--panel)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isSelected
                      ? 'var(--teal)'
                      : 'var(--muted)',
                    marginBottom: '5px',
                  }}
                >
                  {month.month}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginBottom: '12px',
                  }}
                >
                  {month.year}
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '3px',
                  }}
                >
                  {month.tasks}
                </div>

                <div
                  style={{
                    color: 'var(--muted)',
                    fontSize: '10px',
                    marginBottom: '10px',
                  }}
                >
                  tasks
                </div>

                <StateTag state={month.state}>
                  {month.impact}
                </StateTag>
              </button>
            )
          })}
        </div>
      </section>

      <div className="main-grid">
        <section
          className="panel"
          style={{ overflow: 'hidden' }}
        >
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Navigation />
                MONTHLY REGISTER
              </div>

              <h2>{selected.month} Maintenance Plan</h2>

              <p>
                Major maintenance activities planned within the selected
                month.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div
              className="table-head"
              style={{
                minWidth: '900px',
                display: 'grid',
                gridTemplateColumns:
                  '0.85fr 1.3fr 0.95fr 0.9fr 1fr 0.75fr 0.75fr 0.75fr',
                gap: '12px',
              }}
            >
              <span>PLAN ID</span>
              <span>ACTIVITY</span>
              <span>ASSET</span>
              <span>LOCATION</span>
              <span>PERIOD</span>
              <span>HOURS</span>
              <span>TRAINS</span>
              <span>PRIORITY</span>
            </div>

            <div style={{ minWidth: '900px' }}>
              {maintenancePlan.map((item) => {
                const isSelected = item.id === selectedId

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={isSelected}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns:
                        '0.85fr 1.3fr 0.95fr 0.9fr 1fr 0.75fr 0.75fr 0.75fr',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '13px 16px',
                      border: 0,
                      borderBottom: '1px solid var(--line)',
                      borderLeft: isSelected
                        ? '3px solid var(--teal)'
                        : '3px solid transparent',
                      background: isSelected
                        ? '#E7F4F1'
                        : 'var(--panel)',
                      textAlign: 'left',
                      minHeight: '62px',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--cyan)',
                      }}
                    >
                      {item.id}
                    </span>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                      }}
                    >
                      {item.task}
                    </span>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                      }}
                    >
                      {item.asset}
                    </span>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                      }}
                    >
                      {item.location}
                    </span>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                      }}
                    >
                      {item.period}
                    </span>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                      }}
                    >
                      {item.duration}
                    </span>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                      }}
                    >
                      {item.trains}
                    </span>

                    <StateTag state={item.state}>
                      {item.priority}
                    </StateTag>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Navigation />
                SELECTED ACTIVITY
              </div>

              <h2>Maintenance Details</h2>
            </div>

            <StateTag state={selectedTask.state}>
              {selectedTask.priority}
            </StateTag>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            <h3
              style={{
                margin: '12px 0 5px',
                fontSize: '17px',
                fontWeight: 600,
              }}
            >
              {selectedTask.task}
            </h3>

            <p
              style={{
                marginBottom: '17px',
                color: 'var(--cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              {selectedTask.id}
            </p>

            {[
              ['ACTIVITY', selectedTask.task],
              ['ASSET', selectedTask.asset],
              ['LOCATION', selectedTask.location],
              ['PLANNED PERIOD', selectedTask.period],
              ['MAINTENANCE HOURS', selectedTask.duration],
              ['AFFECTED TRAINS', selectedTask.trains],
              ['PRIORITY', selectedTask.priority],
            ].map(([label, value]) => (
              <div
                key={label}
                className="table-head"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{label}</span>

                <span
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color:
                      label === 'PRIORITY'
                        ? selectedTask.state === 'high'
                          ? 'var(--orange)'
                          : selectedTask.state === 'warning'
                          ? 'var(--yellow)'
                          : 'var(--green)'
                        : undefined,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            <Link
              href="/planning/weekly"
              className="text-btn"
              style={{
                marginTop: '15px',
                padding: 0,
              }}
            >
              REVIEW WEEKLY PLAN
              <span>→</span>
            </Link>
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
              MONTHLY CAPACITY
            </div>

            <h2>{selected.month} Planning Capacity</h2>

            <p>
              Maintenance capacity and expected operational exposure for the
              selected month.
            </p>
          </div>

          <StateTag state={selected.state}>
            {selected.impact}
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
          {[
            ['PLANNED TASKS', selected.tasks],
            ['MAINTENANCE BLOCKS', selected.blocks],
            ['AFFECTED TRAINS', selected.trains],
            ['ENGINEERING HOURS', selected.hours],
          ].map(([title, value]) => (
            <div
              key={title}
              style={{
                padding: '18px',
                background: 'var(--panel)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--teal)',
                  letterSpacing: '.05em',
                  marginBottom: '8px',
                }}
              >
                {title}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  color: 'var(--foreground)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="panel"
        style={{ marginTop: '18px' }}
      >
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">
              <CheckCircle2 />
              LONG-RANGE PLANNING
            </div>

            <h2>Monthly Planning Checks</h2>

            <p>
              Key checks used to keep the monthly maintenance programme
              operationally feasible.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1px',
            background: 'var(--line)',
            borderTop: '1px solid var(--line)',
          }}
        >
          {[
            [
              'MAINTENANCE CAPACITY',
              'Planned engineering work remains within available capacity.',
              'healthy',
            ],
            [
              'TRAIN AVAILABILITY',
              'Major maintenance windows are checked against train demand.',
              'healthy',
            ],
            [
              'BLOCK DISTRIBUTION',
              'Maintenance blocks are distributed across the planning horizon.',
              'healthy',
            ],
            [
              'RISK REVIEW',
              'Higher-impact activities require additional scheduling review.',
              'warning',
            ],
          ].map(([title, description, state]) => (
            <div
              key={title}
              style={{
                padding: '18px',
                background: 'var(--panel)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <CheckCircle2
                  size={14}
                  style={{
                    color:
                      state === 'warning'
                        ? 'var(--yellow)'
                        : 'var(--green)',
                  }}
                />

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--teal)',
                    letterSpacing: '.05em',
                  }}
                >
                  {title}
                </div>
              </div>

              <div
                style={{
                  color: 'var(--muted)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                {description}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}