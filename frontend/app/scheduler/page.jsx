'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarClock, CheckCircle2, Clock3, Navigation, Play, TrainFront, TriangleAlert } from 'lucide-react'

const schedules = [
  { id:'SCH-26091', task:'Track renewal', asset:'TRK-DLI-042', location:'Narela', date:'03 Sep 2026', start:'22:00', end:'02:30', duration:'4h 30m', trains:4, impact:'High', state:'high' },
  { id:'SCH-26092', task:'Signal inspection', asset:'SIG-GZB-118', location:'Ghaziabad', date:'03 Sep 2026', start:'23:30', end:'01:30', duration:'2h', trains:2, impact:'Medium', state:'warning' },
  { id:'SCH-26093', task:'OHE maintenance', asset:'OHE-PNP-031', location:'Panipat', date:'04 Sep 2026', start:'00:30', end:'04:00', duration:'3h 30m', trains:5, impact:'High', state:'high' },
  { id:'SCH-26094', task:'Bridge inspection', asset:'BRG-MTH-017', location:'Mathura', date:'04 Sep 2026', start:'01:00', end:'03:00', duration:'2h', trains:1, impact:'Low', state:'healthy' },
  { id:'SCH-26095', task:'Point machine service', asset:'PNT-FBD-088', location:'Faridabad', date:'03 Sep 2026', start:'21:00', end:'23:00', duration:'2h', trains:3, impact:'Medium', state:'warning' },
  { id:'SCH-26096', task:'Track maintenance', asset:'TRK-RHT-056', location:'Rohtak', date:'05 Sep 2026', start:'02:00', end:'05:00', duration:'3h', trains:2, impact:'Medium', state:'warning' },
]

const metrics = [
  ['Pending Tasks','24','Awaiting scheduling',Clock3,'warn'],
  ['Scheduled','38','Maintenance windows',CalendarClock,'info'],
  ['Conflicts','4','Require resolution',TriangleAlert,'critical'],
  ['Ready to Run','17','Eligible schedules',CheckCircle2,'up'],
]

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className="block-state" style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function SchedulerPage() {
  const [selectedId,setSelectedId] = useState(schedules[0].id)
  const [running,setRunning] = useState(false)
  const selected = schedules.find(item => item.id === selectedId) || schedules[0]

  function runScheduler() {
    setRunning(true)
    setTimeout(() => setRunning(false),1200)
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div><div className="breadcrumb">OPERATIONS <span>/</span> SCHEDULER</div><h1>Maintenance Scheduler</h1><p>Build and evaluate maintenance schedules against train operations and available block windows.</p></div>
        <button className="primary-btn" onClick={runScheduler} disabled={running}><Play size={15}/>{running ? 'RUNNING...' : 'RUN SCHEDULER'}</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label,value,detail,Icon,state]) => (
          <div className="metric" key={label}>
            <div className="metric-top"><span>{label}</span><Icon/></div>
            <div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel" style={{ overflow:'hidden' }}>
          <div className="panel-head compact">
            <div><div className="section-kicker"><CalendarClock/> SCHEDULING REGISTER</div><h2>Maintenance Schedule Candidates</h2><p>Candidate maintenance windows available for scheduling.</p></div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <div className="table-head" style={{ minWidth:'900px', display:'grid', gridTemplateColumns:'0.9fr 1.25fr 1fr 1fr .8fr .8fr .7fr .7fr', gap:'12px' }}>
              <span>SCHEDULE ID</span><span>TASK</span><span>ASSET</span><span>LOCATION</span><span>DATE</span><span>WINDOW</span><span>TRAINS</span><span>IMPACT</span>
            </div>

            <div style={{ minWidth:'900px' }}>
              {schedules.map(schedule => {
                const isSelected = schedule.id === selectedId
                return (
                  <button key={schedule.id} onClick={() => setSelectedId(schedule.id)} aria-pressed={isSelected} style={{ width:'100%', display:'grid', gridTemplateColumns:'0.9fr 1.25fr 1fr 1fr .8fr .8fr .7fr .7fr', gap:'12px', alignItems:'center', padding:'13px 16px', border:0, borderBottom:'1px solid var(--line)', borderLeft:isSelected ? '3px solid var(--teal)' : '3px solid transparent', background:isSelected ? '#E7F4F1' : 'var(--panel)', textAlign:'left', minHeight:'62px', cursor:'pointer' }}>
                    <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{schedule.id}</strong></span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{schedule.task}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>{schedule.asset}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{schedule.location}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{schedule.date}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{schedule.start} → {schedule.end}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{schedule.trains}</span>
                    <StateTag state={schedule.state}>{schedule.impact}</StateTag>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> SELECTED SCHEDULE</div><h2>Schedule Candidate</h2></div>
            <StateTag state={selected.state}>{selected.impact}</StateTag>
          </div>

          <div style={{ padding:'2px 18px 18px' }}>
            <h3 style={{ margin:'12px 0 5px', fontSize:'17px', fontWeight:600 }}>{selected.task}</h3>
            <p style={{ marginBottom:'17px', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>{selected.id}</p>

            <div style={{ padding:'14px 4px 18px', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:'9px' }}><span>START</span><span>MAINTENANCE WINDOW</span><span>END</span></div>
              <div style={{ height:'3px', background:'var(--line)', margin:'11px 5px', position:'relative' }}>
                <i style={{ position:'absolute', left:0, top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--cyan)' }}/>
                <i style={{ position:'absolute', left:'50%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:selected.state === 'high' ? 'var(--orange)' : 'var(--yellow)' }}/>
                <i style={{ position:'absolute', right:0, top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--green)' }}/>
              </div>
              <div style={{ color:'var(--teal)', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.08em' }}>{selected.start} → {selected.duration} → {selected.end}</div>
            </div>

            {[
              ['TASK',selected.task],
              ['ASSET',selected.asset],
              ['LOCATION',selected.location],
              ['DATE',selected.date],
              ['START TIME',selected.start],
              ['END TIME',selected.end],
              ['DURATION',selected.duration],
              ['AFFECTED TRAINS',selected.trains],
              ['OPERATIONAL IMPACT',selected.impact],
            ].map(([label,value]) => (
              <div key={label} className="table-head" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'9px 0', borderBottom:'1px solid var(--line)' }}>
                <span>{label}</span>
                <span style={{ textAlign:'right', fontSize:'12px', color:label === 'OPERATIONAL IMPACT' ? { High:'var(--orange)', Medium:'var(--yellow)', Low:'var(--green)' }[value] : undefined }}>{value}</span>
              </div>
            ))}

            <Link href={`/scheduler/results/${selected.id}`} className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}}><CalendarClock/> VIEW SCHEDULE DETAILS</Link>
          </div>
        </aside>
      </div>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><TrainFront/> SCHEDULING LOGIC</div><h2>Operational Constraints</h2><p>The scheduler evaluates maintenance windows against train movement and operational availability.</p></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['MAINTENANCE WINDOW','Available block duration'],
            ['TRAIN MOVEMENT','Affected services and paths'],
            ['ASSET AVAILABILITY','Current infrastructure state'],
            ['OPERATIONAL IMPACT','Delay and disruption risk'],
          ].map(([title,description]) => (
            <div key={title} style={{ padding:'18px', background:'var(--panel)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--teal)', letterSpacing:'.05em', marginBottom:'7px' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'12px', lineHeight:1.5 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}