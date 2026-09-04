'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Construction,
  Navigation,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'

const blocks = [
  {
    id: 'BLK-26091',
    asset: 'TRK-DLI-042',
    section: 'Delhi Junction → Narela',
    location: 'Narela',
    type: 'Track Maintenance',
    start: '22:00',
    end: '02:30',
    duration: '4h 30m',
    date: '03 Sep 2026',
    status: 'Active',
    statusState: 'critical',
    impact: 'High',
    impactState: 'high',
    affectedTrains: ['NDLS-12310', 'DLI-64002', 'NDLS-14086', 'DLI-64468'],
    department: 'Track Maintenance',
    supervisor: 'Rajesh Kumar',
    reason: 'Scheduled track renewal and inspection activity.',
  },
  {
    id: 'BLK-26092',
    asset: 'SIG-GZB-118',
    section: 'Ghaziabad Junction',
    location: 'Ghaziabad',
    type: 'Signal Maintenance',
    start: '23:30',
    end: '01:30',
    duration: '2h',
    date: '03 Sep 2026',
    status: 'Scheduled',
    statusState: 'warning',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: ['NDLS-12482', 'NZM-12138'],
    department: 'Signal & Telecom',
    supervisor: 'Amit Sharma',
    reason: 'Preventive inspection of signalling equipment.',
  },
  {
    id: 'BLK-26093',
    asset: 'OHE-PNP-031',
    section: 'Panipat Junction',
    location: 'Panipat',
    type: 'OHE Maintenance',
    start: '00:30',
    end: '04:00',
    duration: '3h 30m',
    date: '04 Sep 2026',
    status: 'Scheduled',
    statusState: 'warning',
    impact: 'High',
    impactState: 'high',
    affectedTrains: ['NDLS-12034', 'NDLS-14086', 'NDLS-12310'],
    department: 'Electrical / OHE',
    supervisor: 'Vikram Singh',
    reason: 'Overhead equipment inspection and maintenance.',
  },
  {
    id: 'BLK-26094',
    asset: 'BRG-MTH-017',
    section: 'Mathura Section',
    location: 'Mathura',
    type: 'Bridge Inspection',
    start: '01:00',
    end: '03:00',
    duration: '2h',
    date: '04 Sep 2026',
    status: 'Pending',
    statusState: 'info',
    impact: 'Low',
    impactState: 'healthy',
    affectedTrains: ['NZM-12952'],
    department: 'Engineering',
    supervisor: 'Sanjay Verma',
    reason: 'Routine structural bridge inspection.',
  },
  {
    id: 'BLK-26095',
    asset: 'PNT-FBD-088',
    section: 'Faridabad Yard',
    location: 'Faridabad',
    type: 'Point Machine Maintenance',
    start: '21:00',
    end: '23:00',
    duration: '2h',
    date: '03 Sep 2026',
    status: 'Active',
    statusState: 'critical',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: ['NZM-12952', 'NDLS-12056', 'DLI-54011'],
    department: 'Signal & Telecom',
    supervisor: 'Manoj Yadav',
    reason: 'Point machine servicing and alignment.',
  },
  {
    id: 'BLK-26096',
    asset: 'TRK-RHT-056',
    section: 'Rohtak Junction',
    location: 'Rohtak',
    type: 'Track Maintenance',
    start: '02:00',
    end: '05:00',
    duration: '3h',
    date: '05 Sep 2026',
    status: 'Scheduled',
    statusState: 'warning',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: ['NDLS-14086', 'DLI-54011'],
    department: 'Track Maintenance',
    supervisor: 'Deepak Mehta',
    reason: 'Rail and sleeper maintenance activity.',
  },
  {
    id: 'BLK-26097',
    asset: 'SIG-DCT-044',
    section: 'Delhi Cantt',
    location: 'Delhi Cantt',
    type: 'Signal Maintenance',
    start: '20:00',
    end: '22:00',
    duration: '2h',
    date: '02 Sep 2026',
    status: 'Completed',
    statusState: 'healthy',
    impact: 'None',
    impactState: 'healthy',
    affectedTrains: [],
    department: 'Signal & Telecom',
    supervisor: 'Amit Sharma',
    reason: 'Completed preventive signal maintenance.',
  },
  {
    id: 'BLK-26098',
    asset: 'TRK-GZB-093',
    section: 'Ghaziabad → Sahibabad',
    location: 'Ghaziabad',
    type: 'Track Maintenance',
    start: '03:00',
    end: '06:00',
    duration: '3h',
    date: '05 Sep 2026',
    status: 'Conflict',
    statusState: 'critical',
    impact: 'High',
    impactState: 'high',
    affectedTrains: ['NDLS-12482', 'NDLS-12310', 'NDLS-12056'],
    department: 'Track Maintenance',
    supervisor: 'Rajesh Kumar',
    reason: 'Planned track maintenance overlaps with train movement.',
  },
  {
    id: 'BLK-26099',
    asset: 'OHE-FBD-022',
    section: 'Faridabad → Mathura',
    location: 'Faridabad',
    type: 'OHE Maintenance',
    start: '04:00',
    end: '07:30',
    duration: '3h 30m',
    date: '06 Sep 2026',
    status: 'Scheduled',
    statusState: 'warning',
    impact: 'Medium',
    impactState: 'warning',
    affectedTrains: ['NZM-12952', 'NDLS-12056'],
    department: 'Electrical / OHE',
    supervisor: 'Vikram Singh',
    reason: 'Planned overhead equipment maintenance.',
  },
  {
    id: 'BLK-26100',
    asset: 'PNT-DLI-074',
    section: 'Delhi Junction Yard',
    location: 'Delhi Junction',
    type: 'Point Machine Maintenance',
    start: '19:00',
    end: '21:00',
    duration: '2h',
    date: '02 Sep 2026',
    status: 'Completed',
    statusState: 'healthy',
    impact: 'Low',
    impactState: 'healthy',
    affectedTrains: ['DLI-64002'],
    department: 'Signal & Telecom',
    supervisor: 'Manoj Yadav',
    reason: 'Point machine inspection and servicing completed.',
  },
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

export default function BlockDetailsPage({ params }) {
  const { blockId } = use(params)

  const block = blocks.find((item) => item.id === blockId)

  if (!block) {
    return (
      <main className="dashboard">
        <div className="page-intro">
          <div>
            <div className="breadcrumb">
              OPERATIONS <span>/</span> BLOCKS
            </div>
            <h1>Block Not Found</h1>
            <p>
              The requested maintenance block could not be found.
            </p>
          </div>
        </div>

        <Link href="/blocks" className="text-btn">
          <ArrowLeft size={16} />
          BACK TO BLOCKS
        </Link>
      </main>
    )
  }

  const statusColors = {
    Active: 'var(--red)',
    Scheduled: 'var(--yellow)',
    Completed: 'var(--green)',
    Pending: 'var(--cyan)',
    Conflict: 'var(--red)',
  }

  const impactColors = {
    High: 'var(--orange)',
    Medium: 'var(--yellow)',
    Low: 'var(--green)',
    None: 'var(--green)',
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> BLOCKS <span>/</span> {block.id}
          </div>

          <h1>Block Details</h1>

          <p>
            Detailed maintenance block information, schedule, and
            operational impact.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/blocks" className="text-btn" style={{ padding: 0 }}>
          <ArrowLeft size={15} />
          BACK TO BLOCKS
        </Link>

        <StateTag state={block.statusState}>
          {block.status}
        </StateTag>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Construction />
                BLOCK INFORMATION
              </div>

              <h2>{block.section}</h2>

              <p>{block.id} · {block.location}</p>
            </div>
          </div>

          <div style={{ padding: '4px 18px 20px' }}>
            {[
              ['BLOCK ID', block.id],
              ['ASSET ID', block.asset],
              ['SECTION', block.section],
              ['LOCATION', block.location],
              ['BLOCK TYPE', block.type],
              ['DATE', block.date],
              ['START TIME', block.start],
              ['END TIME', block.end],
              ['DURATION', block.duration],
              ['STATUS', block.status],
              ['OPERATIONAL IMPACT', block.impact],
              ['ASSIGNED DEPARTMENT', block.department],
              ['SUPERVISOR', block.supervisor],
            ].map(([label, value]) => (
              <div
                key={label}
                className="table-head"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.2fr',
                  padding: '11px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{label}</span>

                <span
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color:
                      label === 'STATUS'
                        ? statusColors[value]
                        : label === 'OPERATIONAL IMPACT'
                          ? impactColors[value]
                          : label === 'BLOCK ID' ||
                              label === 'ASSET ID'
                            ? 'var(--cyan)'
                            : undefined,
                    fontFamily:
                      label === 'BLOCK ID' ||
                      label === 'ASSET ID' ||
                      label === 'START TIME' ||
                      label === 'END TIME'
                        ? 'var(--font-mono)'
                        : undefined,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Clock3 />
                MAINTENANCE WINDOW
              </div>

              <h2>Operational Timeline</h2>
            </div>
          </div>

          <div style={{ padding: '8px 18px 20px' }}>
            <div
              style={{
                padding: '20px 8px',
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--muted)',
                }}
              >
                <span>BLOCK START</span>
                <span>MAINTENANCE</span>
                <span>BLOCK END</span>
              </div>

              <div
                style={{
                  height: '3px',
                  background: 'var(--line)',
                  margin: '14px 4px',
                  position: 'relative',
                }}
              >
                <i
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '-4px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    background: 'var(--cyan)',
                  }}
                />

                <i
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '-4px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    background:
                      block.statusState === 'critical'
                        ? 'var(--red)'
                        : 'var(--yellow)',
                  }}
                />

                <i
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '-4px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    background: 'var(--green)',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                }}
              >
                <span>{block.start}</span>
                <span>{block.duration}</span>
                <span>{block.end}</span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  background: 'var(--elevated)',
                  border: '1px solid var(--line)',
                }}
              >
                <CalendarClock size={17} />
                <div>
                  <div className="section-kicker">SCHEDULE</div>
                  <strong style={{ fontSize: '13px' }}>
                    {block.date}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  background: 'var(--elevated)',
                  border: '1px solid var(--line)',
                }}
              >
                <Construction size={17} />
                <div>
                  <div className="section-kicker">MAINTENANCE TYPE</div>
                  <strong style={{ fontSize: '13px' }}>
                    {block.type}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  background: 'var(--elevated)',
                  border: '1px solid var(--line)',
                }}
              >
                <TriangleAlert size={17} />
                <div>
                  <div className="section-kicker">OPERATIONAL IMPACT</div>
                  <strong
                    style={{
                      fontSize: '13px',
                      color: impactColors[block.impact],
                    }}
                  >
                    {block.impact}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="main-grid" style={{ marginTop: '18px' }}>
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <TrainFront />
                AFFECTED SERVICES
              </div>

              <h2>Train Impact Register</h2>

              <p>
                Services affected by this maintenance block.
              </p>
            </div>
          </div>

          <div style={{ padding: '4px 18px 18px' }}>
            {block.affectedTrains.length === 0 ? (
              <div
                style={{
                  padding: '20px 0',
                  color: 'var(--green)',
                  fontSize: '13px',
                }}
              >
                No active train services are affected by this block.
              </div>
            ) : (
              block.affectedTrains.map((trainId) => (
                <div
                  key={trainId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--cyan)',
                      fontSize: '12px',
                    }}
                  >
                    {trainId}
                  </span>

                  <span
                    style={{
                      color: 'var(--muted)',
                      fontSize: '12px',
                    }}
                  >
                    Operational impact review required
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Navigation />
                BLOCK REASON
              </div>

              <h2>Maintenance Context</h2>
            </div>
          </div>

          <div style={{ padding: '8px 18px 20px' }}>
            <p
              style={{
                margin: '0 0 18px',
                color: 'var(--muted)',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              {block.reason}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                border: '1px solid var(--line)',
                background: 'var(--elevated)',
              }}
            >
              <CheckCircle2 size={17} />

              <div>
                <div className="section-kicker">
                  RESPONSIBLE DEPARTMENT
                </div>

                <strong style={{ fontSize: '13px' }}>
                  {block.department}
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}