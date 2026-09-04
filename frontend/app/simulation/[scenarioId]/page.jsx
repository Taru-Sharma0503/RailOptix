'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Navigation,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'

const scenarios = [
  {
    id: 'SIM-26041',
    name: 'Night Maintenance Plan',
    date: '03 Sep 2026',
    blocks: 4,
    trains: 18,
    duration: '22:00 → 06:00',
    delay: '6 min',
    impact: 'Low',
    state: 'healthy',
    status: 'Ready',
    score: '92%',
    conflicts: 1,
    recommendation:
      'Preferred scenario. The maintenance windows fit within low-density operating periods with limited train disruption.',
  },
  {
    id: 'SIM-26042',
    name: 'High Priority Track Works',
    date: '04 Sep 2026',
    blocks: 5,
    trains: 24,
    duration: '00:30 → 07:30',
    delay: '14 min',
    impact: 'Medium',
    state: 'warning',
    status: 'Ready',
    score: '78%',
    conflicts: 3,
    recommendation:
      'Acceptable scenario, but two train paths require adjustment during the peak maintenance period.',
  },
  {
    id: 'SIM-26043',
    name: 'Express Protection Plan',
    date: '05 Sep 2026',
    blocks: 3,
    trains: 16,
    duration: '21:00 → 05:00',
    delay: '3 min',
    impact: 'Low',
    state: 'healthy',
    status: 'Ready',
    score: '96%',
    conflicts: 0,
    recommendation:
      'Strong operational candidate. Priority services remain protected while maintenance is completed overnight.',
  },
  {
    id: 'SIM-26044',
    name: 'Maximum Maintenance Window',
    date: '06 Sep 2026',
    blocks: 7,
    trains: 31,
    duration: '22:00 → 08:00',
    delay: '27 min',
    impact: 'High',
    state: 'high',
    status: 'Needs Review',
    score: '61%',
    conflicts: 6,
    recommendation:
      'Not recommended without modification. The number of simultaneous blocks creates significant operational disruption.',
  },
  {
    id: 'SIM-26045',
    name: 'Weekend Engineering Plan',
    date: '07 Sep 2026',
    blocks: 6,
    trains: 21,
    duration: '23:00 → 07:00',
    delay: '9 min',
    impact: 'Medium',
    state: 'warning',
    status: 'Ready',
    score: '84%',
    conflicts: 2,
    recommendation:
      'Viable weekend scenario with moderate operational impact and sufficient engineering capacity.',
  },
  {
    id: 'SIM-26046',
    name: 'Minimal Disruption Plan',
    date: '08 Sep 2026',
    blocks: 3,
    trains: 14,
    duration: '01:00 → 05:30',
    delay: '2 min',
    impact: 'Low',
    state: 'healthy',
    status: 'Ready',
    score: '98%',
    conflicts: 0,
    recommendation:
      'Best disruption profile. Maintenance scope is smaller but can be executed with minimal impact on train movement.',
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

export default function SimulationDetailPage({ params }) {
  const { scenarioId } = use(params)

  const selected =
    scenarios.find((item) => item.id === scenarioId) || scenarios[0]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> SIMULATION <span>/</span>{' '}
            {selected.id}
          </div>

          <h1>{selected.name}</h1>

          <p>
            Detailed operational evaluation of the selected maintenance
            scenario.
          </p>
        </div>

        <Link href="/simulation" className="primary-btn">
          <ArrowLeft size={15} />
          BACK TO SIMULATION
        </Link>
      </div>

      <div
        className="metric-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
        }}
      >
        {[
          [
            'SIMULATION SCORE',
            selected.score,
            'Overall scenario rating',
            Activity,
            selected.state,
          ],
          [
            'AFFECTED TRAINS',
            selected.trains,
            'Services evaluated',
            TrainFront,
            'info',
          ],
          [
            'ESTIMATED DELAY',
            selected.delay,
            'Network impact',
            Clock3,
            selected.state,
          ],
          [
            'CONFLICTS',
            selected.conflicts,
            'Detected overlaps',
            TriangleAlert,
            selected.conflicts > 2 ? 'warning' : 'healthy',
          ],
        ].map(([label, value, detail, Icon, state]) => (
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
              <CheckCircle2 />
              SIMULATION RESULT
            </div>

            <h2>Operational Evaluation</h2>

            <p>
              The selected scenario has been evaluated against the current
              maintenance and train movement plan.
            </p>
          </div>

          <StateTag state={selected.state}>
            {selected.status}
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
            ['SCENARIO', selected.id],
            ['DATE', selected.date],
            ['MAINTENANCE BLOCKS', selected.blocks],
            ['AFFECTED TRAINS', selected.trains],
            ['SIMULATION WINDOW', selected.duration],
            ['ESTIMATED DELAY', selected.delay],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: '18px',
                background: 'var(--panel)',
              }}
            >
              <div
                className="table-head"
                style={{
                  marginBottom: '8px',
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--foreground)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <CalendarClock />
                SIMULATION TIMELINE
              </div>

              <h2>Maintenance Window</h2>

              <p>
                Timeline of the simulated maintenance operating period.
              </p>
            </div>
          </div>

          <div style={{ padding: '8px 20px 22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
              }}
            >
              <span>START</span>
              <span>MAINTENANCE</span>
              <span>END</span>
            </div>

            <div
              style={{
                height: '4px',
                background: 'var(--line)',
                margin: '15px 7px',
                position: 'relative',
              }}
            >
              <i
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

              <i
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '-4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background:
                    selected.state === 'high'
                      ? 'var(--orange)'
                      : selected.state === 'warning'
                      ? 'var(--yellow)'
                      : 'var(--teal)',
                }}
              />

              <i
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
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px',
                marginTop: '18px',
              }}
            >
              <div>
                <div className="table-head">START</div>

                <div
                  style={{
                    marginTop: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                >
                  {selected.duration.split(' → ')[0]}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div className="table-head">WINDOW</div>

                <div
                  style={{
                    marginTop: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--teal)',
                  }}
                >
                  {selected.duration}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="table-head">END</div>

                <div
                  style={{
                    marginTop: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                >
                  {selected.duration.split(' → ')[1]}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Navigation />
                AI EVALUATION
              </div>

              <h2>Recommended Decision</h2>
            </div>
          </div>

          <div style={{ padding: '4px 18px 20px' }}>
            <div
              style={{
                padding: '15px',
                background: 'var(--elevated)',
                border: '1px solid var(--line)',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--teal)',
                  letterSpacing: '.06em',
                  marginBottom: '8px',
                }}
              >
                SCENARIO ASSESSMENT
              </div>

              <p
                style={{
                  margin: 0,
                  color: 'var(--muted)',
                  fontSize: '12px',
                  lineHeight: 1.6,
                }}
              >
                {selected.recommendation}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1px',
                background: 'var(--line)',
              }}
            >
              <div
                style={{
                  padding: '15px',
                  background: 'var(--panel)',
                }}
              >
                <div className="table-head">SCORE</div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    fontSize: '21px',
                    color: 'var(--teal)',
                  }}
                >
                  {selected.score}
                </strong>
              </div>

              <div
                style={{
                  padding: '15px',
                  background: 'var(--panel)',
                }}
              >
                <div className="table-head">CONFLICTS</div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    fontSize: '21px',
                    color:
                      selected.conflicts > 2
                        ? 'var(--red)'
                        : selected.conflicts > 0
                        ? 'var(--yellow)'
                        : 'var(--green)',
                  }}
                >
                  {selected.conflicts}
                </strong>
              </div>
            </div>
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
              TRAIN IMPACT
            </div>

            <h2>Affected Train Operations</h2>

            <p>
              Estimated effect of the selected maintenance scenario on train
              movement.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div
            className="table-head"
            style={{
              minWidth: '700px',
              display: 'grid',
              gridTemplateColumns:
                '1.2fr 1.4fr 1fr 1fr 1fr',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <span>TRAIN SERVICE</span>
            <span>ROUTE</span>
            <span>EXPECTED DELAY</span>
            <span>OPERATIONAL EFFECT</span>
            <span>STATUS</span>
          </div>

          <div style={{ minWidth: '700px' }}>
            {[
              [
                'NDLS-12034',
                'New Delhi → Chandigarh',
                '0 min',
                'No impact',
                'Protected',
                'healthy',
              ],
              [
                'NDLS-12482',
                'New Delhi → Meerut City',
                '3 min',
                'Minor path adjustment',
                'Monitored',
                'warning',
              ],
              [
                'NZM-12952',
                'Hazrat Nizamuddin → Mumbai',
                '6 min',
                'Pathing adjustment',
                'Monitored',
                'warning',
              ],
              [
                'NDLS-12056',
                'New Delhi → Dehradun',
                '8 min',
                'Connection risk',
                'At Risk',
                'critical',
              ],
            ].map(
              ([
                train,
                route,
                delay,
                effect,
                status,
                state,
              ]) => (
                <div
                  key={train}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1.2fr 1.4fr 1fr 1fr 1fr',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '13px 16px',
                    borderBottom: '1px solid var(--line)',
                    minHeight: '58px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--cyan)',
                    }}
                  >
                    {train}
                  </span>

                  <span
                    style={{
                      color: 'var(--muted)',
                      fontSize: '12px',
                    }}
                  >
                    {route}
                  </span>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                    }}
                  >
                    {delay}
                  </span>

                  <span
                    style={{
                      color: 'var(--muted)',
                      fontSize: '12px',
                    }}
                  >
                    {effect}
                  </span>

                  <span>
                    <StateTag state={state}>{status}</StateTag>
                  </span>
                </div>
              )
            )}
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
              <TriangleAlert />
              DECISION SUMMARY
            </div>

            <h2>Simulation Conclusion</h2>

            <p>
              Summary of the simulated operational outcome for this scenario.
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
              'MAINTENANCE FEASIBILITY',
              selected.state === 'high'
                ? 'Requires modification'
                : 'Operationally feasible',
            ],
            [
              'TRAIN DISRUPTION',
              selected.impact === 'Low'
                ? 'Limited'
                : selected.impact === 'Medium'
                ? 'Moderate'
                : 'High',
            ],
            [
              'CONFLICT LEVEL',
              selected.conflicts === 0
                ? 'None detected'
                : `${selected.conflicts} conflict${
                    selected.conflicts > 1 ? 's' : ''
                  } detected`,
            ],
            [
              'RECOMMENDATION',
              selected.state === 'high'
                ? 'Review before execution'
                : 'Suitable for planning',
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
                  marginBottom: '7px',
                }}
              >
                {title}
              </div>

              <div
                style={{
                  color: 'var(--muted)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}