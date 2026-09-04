'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Navigation,
  Plus,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'

const weekDays = [
  {
    day: 'MON',
    date: '07 SEP',
    fullDate: '07 Sep 2026',
    blocks: 5,
    trains: 21,
    impact: 'Low',
    state: 'healthy',
  },
  {
    day: 'TUE',
    date: '08 SEP',
    fullDate: '08 Sep 2026',
    blocks: 6,
    trains: 24,
    impact: 'Medium',
    state: 'warning',
  },
  {
    day: 'WED',
    date: '09 SEP',
    fullDate: '09 Sep 2026',
    blocks: 4,
    trains: 18,
    impact: 'Low',
    state: 'healthy',
  },
  {
    day: 'THU',
    date: '10 SEP',
    fullDate: '10 Sep 2026',
    blocks: 7,
    trains: 29,
    impact: 'High',
    state: 'high',
  },
  {
    day: 'FRI',
    date: '11 SEP',
    fullDate: '11 Sep 2026',
    blocks: 5,
    trains: 22,
    impact: 'Medium',
    state: 'warning',
  },
  {
    day: 'SAT',
    date: '12 SEP',
    fullDate: '12 Sep 2026',
    blocks: 8,
    trains: 17,
    impact: 'Low',
    state: 'healthy',
  },
  {
    day: 'SUN',
    date: '13 SEP',
    fullDate: '13 Sep 2026',
    blocks: 3,
    trains: 12,
    impact: 'Low',
    state: 'healthy',
  },
]

const maintenancePlan = [
  {
    id: 'PLN-26071',
    task: 'Track renewal',
    asset: 'TRK-DLI-042',
    location: 'Narela',
    date: '07 Sep 2026',
    window: '22:00 → 02:30',
    duration: '4h 30m',
    trains: 4,
    priority: 'High',
    state: 'high',
  },
  {
    id: 'PLN-26072',
    task: 'Signal inspection',
    asset: 'SIG-GZB-118',
    location: 'Ghaziabad',
    date: '08 Sep 2026',
    window: '23:30 → 01:30',
    duration: '2h',
    trains: 2,
    priority: 'Medium',
    state: 'warning',
  },
  {
    id: 'PLN-26073',
    task: 'OHE maintenance',
    asset: 'OHE-PNP-031',
    location: 'Panipat',
    date: '09 Sep 2026',
    window: '00:30 → 04:00',
    duration: '3h 30m',
    trains: 5,
    priority: 'High',
    state: 'high',
  },
  {
    id: 'PLN-26074',
    task: 'Bridge inspection',
    asset: 'BRG-MTH-017',
    location: 'Mathura',
    date: '10 Sep 2026',
    window: '01:00 → 03:00',
    duration: '2h',
    trains: 1,
    priority: 'Low',
    state: 'healthy',
  },
  {
    id: 'PLN-26075',
    task: 'Point machine service',
    asset: 'PNT-FBD-088',
    location: 'Faridabad',
    date: '11 Sep 2026',
    window: '21:00 → 23:00',
    duration: '2h',
    trains: 3,
    priority: 'Medium',
    state: 'warning',
  },
  {
    id: 'PLN-26076',
    task: 'Track maintenance',
    asset: 'TRK-RHT-056',
    location: 'Rohtak',
    date: '12 Sep 2026',
    window: '02:00 → 05:00',
    duration: '3h',
    trains: 2,
    priority: 'Medium',
    state: 'warning',
  },
]

const metrics = [
  ['Planned Tasks', '38', 'This week', CalendarDays, 'info'],
  ['Maintenance Hours', '126h', 'Scheduled work', Clock3, 'up'],
  ['Affected Trains', '143', 'Services evaluated', TrainFront, 'warn'],
  ['Planning Conflicts', '4', 'Require review', TriangleAlert, 'critical'],
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

export default function WeeklyPlanningPage() {
  const [selectedDay, setSelectedDay] = useState('MON')
  const [selectedId, setSelectedId] = useState(maintenancePlan[0].id)

  const selectedDayData =
    weekDays.find((day) => day.day === selectedDay) || weekDays[0]

  const selectedTask =
    maintenancePlan.find((item) => item.id === selectedId) ||
    maintenancePlan[0]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            PLANNING <span>/</span> WEEKLY
          </div>

          <h1>Weekly Maintenance Planning</h1>

          <p>
            Coordinate maintenance activities across the week while protecting
            train operations and available infrastructure.
          </p>
        </div>

        <Link href="/scheduler" className="primary-btn">
          OPEN SCHEDULER
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
              WEEKLY PLAN
            </div>

            <h2>07 Sep — 13 Sep 2026</h2>

            <p>
              Weekly maintenance workload and operational impact overview.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(7, minmax(100px, 1fr))',
            gap: '1px',
            background: 'var(--line)',
            borderTop: '1px solid var(--line)',
          }}
        >
          {weekDays.map((day) => {
            const isSelected = day.day === selectedDay

            return (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                aria-pressed={isSelected}
                style={{
                  border: 0,
                  borderBottom: isSelected
                    ? '3px solid var(--teal)'
                    : '3px solid transparent',
                  padding: '16px 10px',
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
                  {day.day}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                    marginBottom: '12px',
                  }}
                >
                  {day.date}
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '3px',
                  }}
                >
                  {day.blocks}
                </div>

                <div
                  style={{
                    color: 'var(--muted)',
                    fontSize: '10px',
                    marginBottom: '10px',
                  }}
                >
                  blocks
                </div>

                <StateTag state={day.state}>
                  {day.impact}
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
                MAINTENANCE REGISTER
              </div>

              <h2>Weekly Maintenance Plan</h2>

              <p>
                Planned work for the selected operating week.
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
                  '0.85fr 1.2fr 0.95fr 0.9fr 1.15fr 0.75fr 0.75fr 0.75fr',
                gap: '12px',
              }}
            >
              <span>PLAN ID</span>
              <span>TASK</span>
              <span>ASSET</span>
              <span>LOCATION</span>
              <span>DATE / WINDOW</span>
              <span>DURATION</span>
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
                        '0.85fr 1.2fr 0.95fr 0.9fr 1.15fr 0.75fr 0.75fr 0.75fr',
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
                        fontSize: '11px',
                      }}
                    >
                      {item.date}
                      <br />
                      <span style={{ color: 'var(--teal)' }}>
                        {item.window}
                      </span>
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
                SELECTED PLAN
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
              ['TASK', selectedTask.task],
              ['ASSET', selectedTask.asset],
              ['LOCATION', selectedTask.location],
              ['DATE', selectedTask.date],
              ['WINDOW', selectedTask.window],
              ['DURATION', selectedTask.duration],
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
              href="/scheduler"
              className="text-btn"
              style={{
                marginTop: '15px',
                padding: 0,
              }}
            >
              REVIEW IN SCHEDULER
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
              <TrainFront />
              SELECTED DAY
            </div>

            <h2>
              {selectedDayData.fullDate} Operational Load
            </h2>

            <p>
              Maintenance workload and train exposure for the selected day.
            </p>
          </div>

          <StateTag state={selectedDayData.state}>
            {selectedDayData.impact}
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
            ['MAINTENANCE BLOCKS', selectedDayData.blocks],
            ['AFFECTED TRAINS', selectedDayData.trains],
            ['OPERATIONAL IMPACT', selectedDayData.impact],
            [
              'PLANNING STATUS',
              selectedDayData.impact === 'High'
                ? 'Review Required'
                : 'Within Limits',
            ],
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
                  fontFamily:
                    title === 'MAINTENANCE BLOCKS' ||
                    title === 'AFFECTED TRAINS'
                      ? 'var(--font-mono)'
                      : 'inherit',
                  fontSize: '13px',
                  color:
                    title === 'OPERATIONAL IMPACT'
                      ? selectedDayData.state === 'high'
                        ? 'var(--orange)'
                        : selectedDayData.state === 'warning'
                        ? 'var(--yellow)'
                        : 'var(--green)'
                      : title === 'PLANNING STATUS' &&
                        selectedDayData.impact === 'High'
                      ? 'var(--orange)'
                      : 'var(--foreground)',
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
              PLANNING STATUS
            </div>

            <h2>Weekly Planning Controls</h2>

            <p>
              Key checks used before the weekly maintenance plan is finalized.
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
              'ASSET AVAILABILITY',
              'Maintenance windows fit current asset availability.',
              'healthy',
            ],
            [
              'TRAIN PROTECTION',
              'Priority train services remain protected.',
              'healthy',
            ],
            [
              'BLOCK CAPACITY',
              'Available engineering windows are within limits.',
              'healthy',
            ],
            [
              'CONFLICT REVIEW',
              'Four planning conflicts require attention.',
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