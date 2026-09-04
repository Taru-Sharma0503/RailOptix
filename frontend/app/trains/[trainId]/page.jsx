'use client'

import { use } from 'react'
import Link from 'next/link'
import { Navigation, TrainFront } from 'lucide-react'
const trains = [
  {
    id: 'NDLS-12034',
    train: 'Delhi Shatabdi',
    service: 'Intercity Express',
    route: 'New Delhi → Chandigarh',
    origin: 'New Delhi',
    destination: 'Chandigarh',
    current: 'Panipat Junction',
    next: 'Karnal',
    status: 'On Time',
    delay: '0 min',
    priority: 'High',
    scheduledArrival: '17:45',
    estimatedArrival: '17:45',
    impact: 'No operational impact',
  },
  {
    id: 'NDLS-12482',
    train: 'Intercity Link',
    service: 'Passenger Express',
    route: 'New Delhi → Meerut City',
    origin: 'New Delhi',
    destination: 'Meerut City',
    current: 'Ghaziabad Junction',
    next: 'Modinagar',
    status: 'Approaching',
    delay: '3 min',
    priority: 'Medium',
    scheduledArrival: '15:20',
    estimatedArrival: '15:23',
    impact: 'Minor platform adjustment',
  },
  {
    id: 'NZM-12952',
    train: 'Capital Express',
    service: 'Superfast Express',
    route: 'Hazrat Nizamuddin → Mumbai Central',
    origin: 'Hazrat Nizamuddin',
    destination: 'Mumbai Central',
    current: 'Faridabad',
    next: 'Mathura Junction',
    status: 'Delayed',
    delay: '18 min',
    priority: 'High',
    scheduledArrival: '06:30',
    estimatedArrival: '06:48',
    impact: 'Pathing adjustment required',
  },
  {
    id: 'DLI-64002',
    train: 'Delhi MEMU',
    service: 'Suburban Service',
    route: 'Delhi Junction → Panipat',
    origin: 'Delhi Junction',
    destination: 'Panipat',
    current: 'Narela',
    next: 'Sonepat',
    status: 'On Time',
    delay: '0 min',
    priority: 'Medium',
    scheduledArrival: '16:10',
    estimatedArrival: '16:10',
    impact: 'No operational impact',
  },
  {
    id: 'NDLS-12056',
    train: 'Jan Shatabdi',
    service: 'Intercity Express',
    route: 'New Delhi → Dehradun',
    origin: 'New Delhi',
    destination: 'Dehradun',
    current: 'Ghaziabad Junction',
    next: 'Meerut City',
    status: 'At Risk',
    delay: '24 min',
    priority: 'Critical',
    scheduledArrival: '20:15',
    estimatedArrival: '20:39',
    impact: 'Connection risk at Meerut',
  },
  {
    id: 'DLI-54011',
    train: 'Delhi Passenger',
    service: 'Passenger Service',
    route: 'Delhi Junction → Rewari',
    origin: 'Delhi Junction',
    destination: 'Rewari',
    current: 'Gurugram',
    next: 'Pataudi Road',
    status: 'Stopped',
    delay: '11 min',
    priority: 'Low',
    scheduledArrival: '18:05',
    estimatedArrival: '18:16',
    impact: 'Awaiting line clearance',
  },
  {
    id: 'NDLS-12310',
    train: 'Rajendra Express',
    service: 'Superfast Express',
    route: 'New Delhi → Patna Junction',
    origin: 'New Delhi',
    destination: 'Patna Junction',
    current: 'New Delhi Yard',
    next: 'Ghaziabad Junction',
    status: 'Approaching',
    delay: '2 min',
    priority: 'High',
    scheduledArrival: '07:10',
    estimatedArrival: '07:12',
    impact: 'No operational impact',
  },
  {
    id: 'NZM-12138',
    train: 'Punjab Mail',
    service: 'Mail Express',
    route: 'Hazrat Nizamuddin → Firozpur',
    origin: 'Hazrat Nizamuddin',
    destination: 'Firozpur',
    current: 'Delhi Cantt',
    next: 'Gurugram',
    status: 'On Time',
    delay: '0 min',
    priority: 'Medium',
    scheduledArrival: '19:40',
    estimatedArrival: '19:40',
    impact: 'No operational impact',
  },
  {
    id: 'NDLS-14086',
    train: 'Haryana Express',
    service: 'Express Service',
    route: 'New Delhi → Hisar',
    origin: 'New Delhi',
    destination: 'Hisar',
    current: 'Rohtak Junction',
    next: 'Bhiwani',
    status: 'Delayed',
    delay: '9 min',
    priority: 'Low',
    scheduledArrival: '21:25',
    estimatedArrival: '21:34',
    impact: 'Minor crossing adjustment',
  },
  {
    id: 'DLI-64468',
    train: 'Delhi EMU',
    service: 'Suburban Service',
    route: 'Delhi Junction → Ghaziabad',
    origin: 'Delhi Junction',
    destination: 'Ghaziabad',
    current: 'Shahdara',
    next: 'Ghaziabad Junction',
    status: 'On Time',
    delay: '0 min',
    priority: 'Low',
    scheduledArrival: '14:55',
    estimatedArrival: '14:55',
    impact: 'No operational impact',
  },
  {
    id: 'NDLS-12414',
    train: 'Rajdhani Express',
    service: 'Premium Express',
    route: 'New Delhi → Ranchi',
    origin: 'New Delhi',
    destination: 'Ranchi',
    current: 'Panipat Junction',
    next: 'Karnal',
    status: 'At Risk',
    delay: '16 min',
    priority: 'Critical',
    scheduledArrival: '09:30',
    estimatedArrival: '09:46',
    impact: 'Priority path allocation needed',
  },
]

const statusColors = {
  'On Time': 'var(--green)',
  Approaching: 'var(--cyan)',
  Delayed: 'var(--yellow)',
  'At Risk': 'var(--red)',
  Stopped: 'var(--muted)',
}

const priorityColors = {
  Critical: 'var(--red)',
  High: 'var(--orange)',
  Medium: 'var(--yellow)',
  Low: 'var(--green)',
}

export default function TrainPage({ params }) {
  const { trainId } = use(params)
  const train = trains.find((item) => item.id === trainId)

  if (!train) {
    return (
      <main className="dashboard">
        <div className="page-intro">
          <div>
            <div className="breadcrumb">
              OPERATIONS <span>/</span> TRAINS <span>/</span> DETAILS
            </div>
            <h1>Train Not Found</h1>
            <p>The requested train could not be found.</p>
          </div>
        </div>

        <Link href="/trains" className="text-btn">
          <span>←</span> BACK TO TRAINS
        </Link>
      </main>
    )
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> TRAINS <span>/</span> DETAILS
          </div>
          <h1>Train Details</h1>
          <p>Operational details and current movement status for the selected train.</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">
              <TrainFront /> TRAIN SERVICE
            </div>

            <h2>{train.train}</h2>

            <p
              style={{
                marginTop: '5px',
                color: 'var(--cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              {train.id}
            </p>
          </div>

          <span
            className="block-state"
            style={{
              color: statusColors[train.status],
              borderColor: statusColors[train.status],
            }}
          >
            {train.status}
          </span>
        </div>

        <div
          style={{
            padding: '18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            ['SERVICE', train.service],
            ['ROUTE', train.route],
            ['ORIGIN', train.origin],
            ['DESTINATION', train.destination],
            ['CURRENT LOCATION', train.current],
            ['NEXT STATION', train.next],
          ].map(([label, value]) => (
            <div key={label}>
              <div
                style={{
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '.05em',
                  marginBottom: '6px',
                }}
              >
                {label}
              </div>

              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">
                <Navigation /> MOVEMENT
              </div>
              <h2>Journey Progress</h2>
            </div>
          </div>

          <div style={{ padding: '22px 18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
              }}
            >
              <span>{train.origin}</span>
              <span>{train.current}</span>
              <span>{train.next}</span>
              <span>{train.destination}</span>
            </div>

            <div
              style={{
                height: '3px',
                background: 'var(--line)',
                margin: '16px 8px',
                position: 'relative',
              }}
            >
              <i
                style={{
                  position: 'absolute',
                  left: '32%',
                  top: '-4px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: 'var(--teal)',
                  border: '2px solid #E7F4F1',
                }}
              />

              <i
                style={{
                  position: 'absolute',
                  left: '64%',
                  top: '-3px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: 'var(--cyan)',
                }}
              />
            </div>

            <div
              style={{
                color: 'var(--teal)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '.08em',
              }}
            >
              ORIGIN → CURRENT → NEXT → DESTINATION
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker">OPERATIONAL STATUS</div>
              <h2>Train Status</h2>
            </div>
          </div>

          <div style={{ padding: '4px 18px 18px' }}>
            {[
              ['STATUS', train.status, statusColors[train.status]],
              ['DELAY', train.delay],
              ['PRIORITY', train.priority, priorityColors[train.priority]],
              ['SCHEDULED ARRIVAL', train.scheduledArrival],
              ['ESTIMATED ARRIVAL', train.estimatedArrival],
              ['OPERATIONAL IMPACT', train.impact],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="table-head"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.3fr',
                  padding: '11px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{label}</span>

                <span
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color: color || 'var(--foreground)',
                    fontWeight: color ? 600 : 400,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            <Link
              href="/trains"
              className="text-btn"
              style={{ marginTop: '16px', padding: 0 }}
            >
              <span>←</span> BACK TO TRAINS
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}