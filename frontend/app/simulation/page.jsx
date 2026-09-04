'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, CalendarClock, CheckCircle2, Clock3, Navigation, Play, TrainFront, TriangleAlert } from 'lucide-react'

const scenarios = [
  { id:'SIM-26041', name:'Night Maintenance Plan', date:'03 Sep 2026', blocks:4, trains:18, duration:'22:00 → 06:00', delay:'6 min', impact:'Low', state:'healthy', status:'Ready' },
  { id:'SIM-26042', name:'High Priority Track Works', date:'04 Sep 2026', blocks:5, trains:24, duration:'00:30 → 07:30', delay:'14 min', impact:'Medium', state:'warning', status:'Ready' },
  { id:'SIM-26043', name:'Express Protection Plan', date:'05 Sep 2026', blocks:3, trains:16, duration:'21:00 → 05:00', delay:'3 min', impact:'Low', state:'healthy', status:'Ready' },
  { id:'SIM-26044', name:'Maximum Maintenance Window', date:'06 Sep 2026', blocks:7, trains:31, duration:'22:00 → 08:00', delay:'27 min', impact:'High', state:'high', status:'Needs Review' },
  { id:'SIM-26045', name:'Weekend Engineering Plan', date:'07 Sep 2026', blocks:6, trains:21, duration:'23:00 → 07:00', delay:'9 min', impact:'Medium', state:'warning', status:'Ready' },
  { id:'SIM-26046', name:'Minimal Disruption Plan', date:'08 Sep 2026', blocks:3, trains:14, duration:'01:00 → 05:30', delay:'2 min', impact:'Low', state:'healthy', status:'Ready' },
]

const metrics = [
  ['Scenarios','12','Available simulations',Activity,'info'],
  ['Ready to Run','8','Validated scenarios',CheckCircle2,'up'],
  ['At Risk','3','Higher impact plans',TriangleAlert,'warn'],
  ['Avg Delay','8 min','Estimated network impact',Clock3,'info'],
]

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className="block-state" style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function SimulationPage() {
  const [selectedId,setSelectedId] = useState(scenarios[0].id)
  const [running,setRunning] = useState(false)
  const selected = scenarios.find(item => item.id === selectedId) || scenarios[0]

  function runSimulation() {
    setRunning(true)
    setTimeout(() => setRunning(false),1400)
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> SIMULATION</div>
          <h1>Operational Simulation</h1>
          <p>Evaluate maintenance scenarios and estimate their impact on train operations before execution.</p>
        </div>
        <button className="primary-btn" onClick={runSimulation} disabled={running}><Play size={15}/>{running ? 'RUNNING...' : 'RUN SIMULATION'}</button>
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
            <div>
              <div className="section-kicker"><Activity/> SCENARIO REGISTER</div>
              <h2>Simulation Scenarios</h2>
              <p>Compare proposed maintenance plans before they are applied to operations.</p>
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <div className="table-head" style={{ minWidth:'900px', display:'grid', gridTemplateColumns:'0.9fr 1.25fr 0.9fr 0.65fr 0.65fr 1fr 0.7fr 0.8fr', gap:'12px' }}>
              <span>SCENARIO ID</span><span>SCENARIO</span><span>DATE</span><span>BLOCKS</span><span>TRAINS</span><span>WINDOW</span><span>DELAY</span><span>IMPACT</span>
            </div>

            <div style={{ minWidth:'900px' }}>
              {scenarios.map(scenario => {
                const isSelected = scenario.id === selectedId
                return (
                  <button key={scenario.id} onClick={() => setSelectedId(scenario.id)} aria-pressed={isSelected} style={{ width:'100%', display:'grid', gridTemplateColumns:'0.9fr 1.25fr 0.9fr 0.65fr 0.65fr 1fr 0.7fr 0.8fr', gap:'12px', alignItems:'center', padding:'13px 16px', border:0, borderBottom:'1px solid var(--line)', borderLeft:isSelected ? '3px solid var(--teal)' : '3px solid transparent', background:isSelected ? '#E7F4F1' : 'var(--panel)', textAlign:'left', minHeight:'62px', cursor:'pointer' }}>
                    <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{scenario.id}</strong></span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{scenario.name}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{scenario.date}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{scenario.blocks}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{scenario.trains}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{scenario.duration}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{scenario.delay}</span>
                    <StateTag state={scenario.state}>{scenario.impact}</StateTag>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> SELECTED SCENARIO</div><h2>Scenario Details</h2></div>
            <StateTag state={selected.state}>{selected.status}</StateTag>
          </div>

          <div style={{ padding:'2px 18px 18px' }}>
            <h3 style={{ margin:'12px 0 5px', fontSize:'17px', fontWeight:600 }}>{selected.name}</h3>
            <p style={{ marginBottom:'17px', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>{selected.id}</p>

            <div style={{ padding:'14px 4px 18px', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:'9px' }}><span>START</span><span>SIMULATION WINDOW</span><span>END</span></div>
              <div style={{ height:'3px', background:'var(--line)', margin:'11px 5px', position:'relative' }}>
                <i style={{ position:'absolute', left:0, top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--cyan)' }}/>
                <i style={{ position:'absolute', left:'50%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:selected.state === 'high' ? 'var(--orange)' : selected.state === 'warning' ? 'var(--yellow)' : 'var(--teal)' }}/>
                <i style={{ position:'absolute', right:0, top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--green)' }}/>
              </div>
              <div style={{ color:'var(--teal)', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.08em' }}>{selected.duration}</div>
            </div>

            {[
              ['SCENARIO',selected.name],
              ['DATE',selected.date],
              ['MAINTENANCE BLOCKS',selected.blocks],
              ['AFFECTED TRAINS',selected.trains],
              ['SIMULATION WINDOW',selected.duration],
              ['ESTIMATED DELAY',selected.delay],
              ['OPERATIONAL IMPACT',selected.impact],
              ['STATUS',selected.status],
            ].map(([label,value]) => (
              <div key={label} className="table-head" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'9px 0', borderBottom:'1px solid var(--line)' }}>
                <span>{label}</span>
                <span style={{ textAlign:'right', fontSize:'12px', color:label === 'OPERATIONAL IMPACT' ? { High:'var(--orange)', Medium:'var(--yellow)', Low:'var(--green)' }[value] : label === 'STATUS' ? selected.state === 'high' ? 'var(--orange)' : selected.state === 'warning' ? 'var(--yellow)' : 'var(--green)' : undefined }}>{value}</span>
              </div>
            ))}

            <Link href={`/simulation/${selected.id}`} className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}}><Play/> VIEW SIMULATION DETAILS</Link>
          </div>
        </aside>
      </div>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><TrainFront/> SIMULATION PARAMETERS</div><h2>Operational Evaluation</h2><p>Each scenario is evaluated against maintenance requirements and expected train movement.</p></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['MAINTENANCE BLOCKS','Number and duration of planned engineering blocks.'],
            ['TRAIN MOVEMENT','Services crossing or approaching affected sections.'],
            ['ESTIMATED DELAY','Projected delay caused by the simulated plan.'],
            ['OPERATIONAL IMPACT','Overall disruption risk across the network.'],
          ].map(([title,description]) => (
            <div key={title} style={{ padding:'18px', background:'var(--panel)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--teal)', letterSpacing:'.05em', marginBottom:'7px' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'12px', lineHeight:1.5 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><CalendarClock/> SIMULATION WORKFLOW</div><h2>Scenario Evaluation Flow</h2><p>RailOptix evaluates a proposed plan before it is considered for operational execution.</p></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['01','SELECT PLAN','Choose a maintenance scenario.'],
            ['02','SIMULATE','Evaluate the proposed operational window.'],
            ['03','COMPARE','Measure delay, conflicts, and train impact.'],
            ['04','DECIDE','Select the lowest-impact operational plan.'],
          ].map(([number,title,description]) => (
            <div key={number} style={{ padding:'18px', background:'var(--panel)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--cyan)', marginBottom:'10px' }}>{number}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--teal)', letterSpacing:'.05em', marginBottom:'7px' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'12px', lineHeight:1.5 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}