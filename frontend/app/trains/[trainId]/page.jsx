'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Navigation, TrainFront } from 'lucide-react'
import { trainsApi } from '@/lib/api'

const mockTrain = {
  id: 'TR-003',
  train: 'Rajdhani Express',
  service: 'Superfast',
  route: 'COR-001',
  origin: 'New Delhi',
  destination: 'Mumbai Central',
  current: 'Mathura Junction',
  next: 'Agra Cantt',
  status: 'On Time',
  delay: '0 min',
  priority: 'High',
  scheduledArrival: '10:00',
  estimatedArrival: '10:00',
  impact: 'No operational impact',
}

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
  const [train, setTrain] = useState(mockTrain)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrain() {
      try {
        const data = await trainsApi.get(trainId)
        const t = data?.train

        if (!t) throw new Error('Invalid train response')

        setTrain({
          ...mockTrain,
          ...t,
          train: t.name || mockTrain.train,
          service:
            t.type === 'superfast' ? 'Superfast' :
            t.type === 'express' ? 'Express' :
            t.type === 'passenger' ? 'Passenger' :
            t.type === 'freight' ? 'Freight' : '—',
          route: t.corridorId || '—',
          origin: t.origin || mockTrain.origin,
          destination: t.destination || mockTrain.destination,
          current: t.current || mockTrain.current,
          next: t.next || mockTrain.next,
          status: t.status || mockTrain.status,
          delay: t.delay || mockTrain.delay,
          priority:
            t.priority >= 9 ? 'High' :
            t.priority >= 7 ? 'Medium' : 'Low',
          scheduledArrival: t.scheduledArrival || t.arrival || '—',
          estimatedArrival: t.estimatedArrival || t.arrival || '—',
          impact: t.operationalImpact || '—',
        })
      } catch (err) {
        console.error('Train details API failed, using mock data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTrain()
  }, [trainId])

  if (loading) return null

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
            <p style={{ marginTop: '5px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
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

        <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            ['SERVICE', train.service],
            ['ROUTE', train.route],
            ['ORIGIN', train.origin],
            ['DESTINATION', train.destination],
            ['CURRENT LOCATION', train.current],
            ['NEXT STATION', train.next],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '.05em', marginBottom: '6px' }}>
                {label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker"><Navigation /> MOVEMENT</div>
              <h2>Journey Progress</h2>
            </div>
          </div>

          <div style={{ padding: '22px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <span>{train.origin}</span>
              <span>{train.current}</span>
              <span>{train.next}</span>
              <span>{train.destination}</span>
            </div>

            <div style={{ height: '3px', background: 'var(--line)', margin: '16px 8px', position: 'relative' }}>
              <i style={{ position: 'absolute', left: '32%', top: '-4px', width: '11px', height: '11px', borderRadius: '50%', background: 'var(--teal)', border: '2px solid #E7F4F1' }} />
              <i style={{ position: 'absolute', left: '64%', top: '-3px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--cyan)' }} />
            </div>

            <div style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '.08em' }}>
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
              <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
                <span>{label}</span>
                <span style={{ textAlign: 'right', fontSize: '12px', color: color || 'var(--foreground)', fontWeight: color ? 600 : 400 }}>
                  {value}
                </span>
              </div>
            ))}

            <Link href="/trains" className="text-btn" style={{ marginTop: '16px', padding: 0 }}>
              <span>←</span> BACK TO TRAINS
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}