'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Plus,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

const mockTasks = [
  { id: 'MNT-260901', asset: 'TRK-102 · Main Line Track', location: 'New Delhi – Ghaziabad', priority: 'Critical', priorityState: 'critical', type: 'Track geometry correction', scheduled: '02 Sep 2026 · 10:15', duration: '4 hrs', status: 'In Progress', statusState: 'info', impact: '30 min traffic restriction', department: 'Engineering' },
  { id: 'MNT-260902', asset: 'SIG-091 · Interlocking Signal', location: 'Panipat Junction', priority: 'Critical', priorityState: 'critical', type: 'Signal replacement', scheduled: '02 Sep 2026 · 14:00', duration: '2 hrs', status: 'Scheduled', statusState: 'warning', impact: 'Platform route disruption', department: 'S&T' },
  { id: 'MNT-260903', asset: 'PTM-018 · Point Machine', location: 'Ghaziabad Junction', priority: 'High', priorityState: 'high', type: 'Point machine servicing', scheduled: '03 Sep 2026 · 01:30', duration: '3 hrs', status: 'Scheduled', statusState: 'warning', impact: 'Loop line unavailable', department: 'S&T' },
  { id: 'MNT-260904', asset: 'OHE-221 · Contact System', location: 'Panipat – Karnal', priority: 'High', priorityState: 'high', type: 'OHE inspection', scheduled: '03 Sep 2026 · 11:00', duration: '2 hrs', status: 'Planned', statusState: 'neutral', impact: 'No planned restriction', department: 'Traction' },
  { id: 'MNT-260905', asset: 'BRG-007 · Yamuna Bridge', location: 'Delhi – Shahdara', priority: 'Medium', priorityState: 'warning', type: 'Bridge bearing inspection', scheduled: '04 Sep 2026 · 09:00', duration: '5 hrs', status: 'Planned', statusState: 'neutral', impact: 'Caution order required', department: 'Engineering' },
  { id: 'MNT-260906', asset: 'LC-014 · Level Crossing', location: 'Sonepat Outer', priority: 'Medium', priorityState: 'warning', type: 'Level crossing maintenance', scheduled: '04 Sep 2026 · 22:30', duration: '90 min', status: 'Scheduled', statusState: 'warning', impact: 'Road closure during work', department: 'Engineering' },
  { id: 'MNT-260907', asset: 'TRK-187 · Loop Line Track', location: 'Meerut City', priority: 'Low', priorityState: 'healthy', type: 'Ultrasonic rail testing', scheduled: '05 Sep 2026 · 08:00', duration: '3 hrs', status: 'Planned', statusState: 'neutral', impact: 'No operational impact', department: 'Engineering' },
  { id: 'MNT-260908', asset: 'SIG-044 · Block Signal', location: 'New Delhi Yard', priority: 'Low', priorityState: 'healthy', type: 'Signal calibration', scheduled: '01 Sep 2026 · 23:00', duration: '1 hr', status: 'Completed', statusState: 'healthy', impact: 'No operational impact', department: 'S&T' },
  { id: 'MNT-260909', asset: 'OHE-106 · Mast Assembly', location: 'Gurugram – Rewari', priority: 'High', priorityState: 'high', type: 'Insulator replacement', scheduled: '01 Sep 2026 · 16:00', duration: '2 hrs', status: 'Delayed', statusState: 'critical', impact: '20 min traffic restriction', department: 'Traction' },
  { id: 'MNT-260910', asset: 'PTM-031 · Point Machine', location: 'New Delhi Yard', priority: 'Medium', priorityState: 'warning', type: 'Point machine servicing', scheduled: '06 Sep 2026 · 00:30', duration: '2 hrs', status: 'Scheduled', statusState: 'warning', impact: 'Yard movement restriction', department: 'S&T' },
  { id: 'MNT-260911', asset: 'TRK-214 · Rail Expansion Joint', location: 'Meerut – Daurala', priority: 'High', priorityState: 'high', type: 'Track inspection', scheduled: '06 Sep 2026 · 12:30', duration: '2 hrs', status: 'Planned', statusState: 'neutral', impact: 'Caution order required', department: 'Engineering' },
]

const metrics = [
  ['Open Tasks', '86', 'Across all departments', ClipboardList, 'info'],
  ['Critical', '12', 'Immediate review', TriangleAlert, 'critical'],
  ['In Progress', '31', 'Work underway', Wrench, 'warn'],
  ['Completed This Week', '143', 'On schedule', CheckCircle2, 'up'],
]

function StateTag({ children, state }) {
  const colors = {
    critical: 'var(--red)',
    high: 'var(--orange)',
    warning: 'var(--yellow)',
    healthy: 'var(--green)',
    info: 'var(--cyan)',
  }

  return (
    <span
      className={`block-state ${state === 'warning' ? 'soon' : ''}`}
      style={{
        color: colors[state],
        borderColor: colors[state]
          ? `color-mix(in srgb, ${colors[state]} 45%, transparent)`
          : undefined,
      }}
    >
      {children}
    </span>
  )
}

export default function MaintenancePage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedId, setSelectedId] = useState(null)

  const selected =
    tasks.find((task) => task.id === selectedId) || tasks[0]

  useEffect(() => {
  async function loadMaintenanceTasks() {
    try {
      const data = await apiFetch('/api/maintenance')

      const realTasks =
        Array.isArray(data?.tasks)
          ? data.tasks
          : Array.isArray(data)
            ? data
            : null

      if (!realTasks) {
        console.warn(
          'Unexpected maintenance API response:',
          data
        )
        return
      }

      const safeTasks = realTasks.map((task) => {
        const priority =
          task.priorityScore >= 90
            ? 'Critical'
            : task.priorityScore >= 70
              ? 'High'
              : task.priorityScore >= 40
                ? 'Medium'
                : 'Low'

        const priorityState =
          priority === 'Critical'
            ? 'critical'
            : priority === 'High'
              ? 'high'
              : priority === 'Medium'
                ? 'warning'
                : 'healthy'

        const statusState =
          task.status === 'completed'
            ? 'healthy'
            : task.status === 'pending'
              ? 'warning'
              : task.status === 'in_progress'
                ? 'info'
                : task.status === 'delayed'
                  ? 'critical'
                  : 'neutral'

        return {
          ...task,

          asset:
            task.assetId && task.assetName
              ? `${task.assetId} · ${task.assetName}`
              : task.assetName || task.assetId || '—',

          location:
            task.corridorId || '—',

          priority,
          priorityState,

          type:
            task.description || 'Maintenance',

          scheduled:
            task.deadline
              ? new Date(
                  task.deadline
                ).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—',

          duration:
            task.estimatedDuration
              ? task.estimatedDuration >= 60
                ? `${Math.floor(
                    task.estimatedDuration / 60
                  )} hrs${
                    task.estimatedDuration % 60
                      ? ` ${task.estimatedDuration % 60} min`
                      : ''
                  }`
                : `${task.estimatedDuration} min`
              : '—',

          status:
            task.status === 'in_progress'
              ? 'In Progress'
              : task.status === 'pending'
                ? 'Scheduled'
                : task.status === 'completed'
                  ? 'Completed'
                  : task.status === 'delayed'
                    ? 'Delayed'
                    : task.status || '—',

          statusState,

          impact:
            task.operationalImpact || '—',

          department:
            task.departmentName ||
            task.departmentId ||
            '—',

          requiredBlock:
            task.requiredBlock || 'No',

          notes:
            task.notes || 'No additional notes',
        }
      })

      if (safeTasks.length > 0) {
        setTasks(safeTasks)
        setSelectedId(safeTasks[0].id)
      } else {
        setTasks([])
        setSelectedId(null)
      }
    } catch (err) {
      console.error(
        'Failed to load maintenance tasks from backend:',
        err
      )
    }
  }

  loadMaintenanceTasks()
}, [])
  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> MAINTENANCE
          </div>

          <h1>Maintenance Management</h1>

          <p>
            Monitor maintenance work, priorities, schedules, and
            operational impact.
          </p>
        </div>

        <div className="intro-actions">
          <Link
            href="/maintenance/import"
            className="secondary-btn hover:!bg-[#E7F4F1] hover:!text-[#172126]"
          >
            <Download /> IMPORT TASKS
          </Link>

          <Link
            href="/maintenance/new"
            className="primary-btn"
          >
            <Plus /> NEW MAINTENANCE TASK
          </Link>
        </div>
      </div>

      <div
        className="metric-grid"
        style={{
          gridTemplateColumns:
            'repeat(auto-fit, minmax(165px, 1fr))',
        }}
      >
        {metrics.map(
          ([label, value, detail, Icon, state]) => (
            <div className="metric" key={label}>
              <div className="metric-top">
                <span>{label}</span>
                <Icon />
              </div>

              <div className="metric-bottom">
                <strong>{value}</strong>

                <small className={state}>
                  {detail}
                </small>
              </div>
            </div>
          )
        )}
      </div>

      <div className="main-grid">
        <section
          className="panel"
          style={{ overflow: 'hidden' }}
        >
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <ClipboardList /> MAINTENANCE REGISTER
              </div>

              <h2>Maintenance Tasks</h2>

              <p>
                {tasks.length} priority tasks shown · Delhi
                Division
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
                  '1fr 1.5fr 1.35fr .75fr 1.45fr 1.35fr .7fr .95fr',
                gap: '12px',
              }}
            >
              <span>TASK ID</span>
              <span>ASSET</span>
              <span>LOCATION</span>
              <span>PRIORITY</span>
              <span>TYPE</span>
              <span>SCHEDULED</span>
              <span>DURATION</span>
              <span>STATUS</span>
            </div>

            <div style={{ minWidth: '900px' }}>
              {tasks.map((task) => {
                const isSelected = task.id === selectedId

                return (
                  <button
                    key={task.id}
                    onClick={() =>
                      setSelectedId(task.id)
                    }
                    aria-pressed={isSelected}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr 1.5fr 1.35fr .75fr 1.45fr 1.35fr .7fr .95fr',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '13px 16px',
                      border: 0,
                      borderBottom:
                        '1px solid var(--line)',
                      borderLeft: isSelected
                        ? '3px solid var(--teal)'
                        : '3px solid transparent',
                      background: isSelected
                        ? '#E7F4F1'
                        : 'var(--panel)',
                      textAlign: 'left',
                      minHeight: '62px',
                    }}
                  >
                    <strong
                      style={{
                        fontFamily:
                          'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--cyan)',
                      }}
                    >
                      {task.id}
                    </strong>

                    <span>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {task.asset}
                      </strong>

                      {isSelected && (
                        <small
                          style={{
                            color: 'var(--teal)',
                            fontSize: '10px',
                            fontFamily:
                              'var(--font-mono)',
                            letterSpacing: '.08em',
                          }}
                        >
                          SELECTED
                        </small>
                      )}
                    </span>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                      }}
                    >
                      {task.location}
                    </span>

                    <StateTag
                      state={task.priorityState}
                    >
                      {task.priority}
                    </StateTag>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                      }}
                    >
                      {task.type}
                    </span>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                      }}
                    >
                      {task.scheduled}
                    </span>

                    <span
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                      }}
                    >
                      {task.duration}
                    </span>

                    <StateTag
                      state={task.statusState}
                    >
                      {task.status}
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
                <Clock3 /> SELECTED MAINTENANCE TASK
              </div>

              <h2>Selected Maintenance Task</h2>
            </div>

            <StateTag state={selected.statusState}>
              {selected.status}
            </StateTag>
          </div>

          <div
            style={{
              padding: '2px 18px 18px',
            }}
          >
            <h3
              style={{
                margin: '12px 0 5px',
                fontSize: '17px',
                fontWeight: 600,
              }}
            >
              {selected.asset}
            </h3>

            <p
              style={{
                marginBottom: '17px',
                color: 'var(--cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              {selected.id}
            </p>

            {[
              ['LOCATION', selected.location],
              ['MAINTENANCE TYPE', selected.type],
              ['PRIORITY', selected.priority],
              ['SCHEDULED DATE', selected.scheduled],
              ['ESTIMATED DURATION', selected.duration],
              ['REQUIRED BLOCK', selected.requiredBlock || 'No'],
              ['STATUS', selected.status],
              ['OPERATIONAL IMPACT', selected.impact],
              ['ASSIGNED DEPARTMENT', selected.department],
              ['NOTES', selected.notes || 'No additional notes'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="table-head"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '10px 0',
                  borderBottom:
                    label === 'NOTES'
                      ? '1px solid var(--line)'
                      : undefined,
                }}
              >
                <span>{label}</span>

                <span
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color:
                      label === 'PRIORITY'
                        ? {
                            Critical: 'var(--red)',
                            High: 'var(--orange)',
                            Medium: 'var(--yellow)',
                            Low: 'var(--green)',
                          }[value]
                        : undefined,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            <div
              style={{
                marginTop: '16px',
                color: 'var(--teal)',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '.12em',
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  marginRight: '7px',
                }}
              />

              TASK SELECTED
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}