'use client'

import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import Link from 'next/link'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, Construction, Navigation } from 'lucide-react'

const blocks = [
  { id:'BLK-26091', asset:'TRK-DLI-042', section:'Delhi Junction → Narela', location:'Narela', type:'Track Maintenance', start:'22:00', end:'02:30', duration:'4h 30m', status:'Active', statusState:'critical', impact:'High', impactState:'high', affectedTrains:'4', department:'Track Maintenance' },
  { id:'BLK-26092', asset:'SIG-GZB-118', section:'Ghaziabad Junction', location:'Ghaziabad', type:'Signal Maintenance', start:'23:30', end:'01:30', duration:'2h', status:'Scheduled', statusState:'warning', impact:'Medium', impactState:'warning', affectedTrains:'2', department:'Signal & Telecom' },
  { id:'BLK-26093', asset:'OHE-PNP-031', section:'Panipat Junction', location:'Panipat', type:'OHE Maintenance', start:'00:30', end:'04:00', duration:'3h 30m', status:'Scheduled', statusState:'warning', impact:'High', impactState:'high', affectedTrains:'5', department:'Electrical / OHE' },
  { id:'BLK-26094', asset:'BRG-MTH-017', section:'Mathura Section', location:'Mathura', type:'Bridge Inspection', start:'01:00', end:'03:00', duration:'2h', status:'Pending', statusState:'info', impact:'Low', impactState:'healthy', affectedTrains:'1', department:'Engineering' },
  { id:'BLK-26095', asset:'PNT-FBD-088', section:'Faridabad Yard', location:'Faridabad', type:'Point Machine Maintenance', start:'21:00', end:'23:00', duration:'2h', status:'Active', statusState:'critical', impact:'Medium', impactState:'warning', affectedTrains:'3', department:'Signal & Telecom' },
  { id:'BLK-26096', asset:'TRK-RHT-056', section:'Rohtak Junction', location:'Rohtak', type:'Track Maintenance', start:'02:00', end:'05:00', duration:'3h', status:'Scheduled', statusState:'warning', impact:'Medium', impactState:'warning', affectedTrains:'2', department:'Track Maintenance' },
  { id:'BLK-26097', asset:'SIG-DCT-044', section:'Delhi Cantt', location:'Delhi Cantt', type:'Signal Maintenance', start:'20:00', end:'22:00', duration:'2h', status:'Completed', statusState:'healthy', impact:'None', impactState:'healthy', affectedTrains:'0', department:'Signal & Telecom' },
  { id:'BLK-26098', asset:'TRK-GZB-093', section:'Ghaziabad → Sahibabad', location:'Ghaziabad', type:'Track Maintenance', start:'03:00', end:'06:00', duration:'3h', status:'Conflict', statusState:'critical', impact:'High', impactState:'high', affectedTrains:'6', department:'Track Maintenance' },
  { id:'BLK-26099', asset:'OHE-FBD-022', section:'Faridabad → Mathura', location:'Faridabad', type:'OHE Maintenance', start:'04:00', end:'07:30', duration:'3h 30m', status:'Scheduled', statusState:'warning', impact:'Medium', impactState:'warning', affectedTrains:'3', department:'Electrical / OHE' },
  { id:'BLK-26100', asset:'PNT-DLI-074', section:'Delhi Junction Yard', location:'Delhi Junction', type:'Point Machine Maintenance', start:'19:00', end:'21:00', duration:'2h', status:'Completed', statusState:'healthy', impact:'Low', impactState:'healthy', affectedTrains:'1', department:'Signal & Telecom' },
]

const metrics = [
  ['Active Blocks','18','Currently affecting operations',Construction,'info'],
  ['Scheduled','11','Upcoming maintenance blocks',CalendarClock,'warn'],
  ['Completed','27','Completed this week',CheckCircle2,'up'],
  ['Conflicts','4','Require resolution',AlertTriangle,'critical'],
]

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className={`block-state ${state === 'warning' ? 'soon' : ''}`} style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function BlocksPage() {
  const [selectedId,setSelectedId] = useState(blocks[0].id)
  const selected = blocks.find(block => block.id === selectedId) || blocks[0]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> BLOCKS</div>
          <h1>Block Management</h1>
          <p>Monitor maintenance blocks, track availability, schedules, and operational impact across the railway network.</p>
        </div>
        <Link href="/maintenance/new" className="primary-btn">CREATE BLOCK</Link>
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
            <div><div className="section-kicker"><Construction/> BLOCK REGISTER</div><h2>Active & Scheduled Blocks</h2><p>Maintenance blocks across Delhi Division.</p></div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <div className="table-head" style={{ minWidth:'930px', display:'grid', gridTemplateColumns:'0.9fr 1.1fr 1.25fr 1.25fr .7fr .7fr .8fr .65fr', gap:'12px' }}>
              <span>BLOCK ID</span><span>ASSET / SECTION</span><span>LOCATION</span><span>TYPE</span><span>START</span><span>END</span><span>STATUS</span><span>IMPACT</span>
            </div>

            <div style={{ minWidth:'930px' }}>
              {blocks.map(block => {
                const isSelected = block.id === selectedId
                return (
                  <button key={block.id} onClick={() => setSelectedId(block.id)} aria-pressed={isSelected} style={{ width:'100%', display:'grid', gridTemplateColumns:'0.9fr 1.1fr 1.25fr 1.25fr .7fr .7fr .8fr .65fr', gap:'12px', alignItems:'center', padding:'13px 16px', border:0, borderBottom:'1px solid var(--line)', borderLeft:isSelected ? '3px solid var(--teal)' : '3px solid transparent', background:isSelected ? '#E7F4F1' : 'var(--panel)', textAlign:'left', minHeight:'62px', cursor:'pointer' }}>
                    <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{block.id}</strong><small style={{ color:'var(--muted)', fontSize:'11px' }}>{block.asset}</small></span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{block.section}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{block.location}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{block.type}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{block.start}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{block.end}</span>
                    <StateTag state={block.statusState}>{block.status}</StateTag>
                    <StateTag state={block.impactState}>{block.impact}</StateTag>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> SELECTED BLOCK</div><h2>Selected Block</h2></div>
            <StateTag state={selected.statusState}>{selected.status}</StateTag>
          </div>

          <div style={{ padding:'2px 18px 18px' }}>
            <h3 style={{ margin:'12px 0 5px', fontSize:'17px', fontWeight:600 }}>{selected.section}</h3>
            <p style={{ marginBottom:'17px', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>{selected.id}</p>

            <div style={{ padding:'14px 4px 18px', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'8px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:'9px' }}><span>START</span><span>MAINTENANCE</span><span>END</span></div>
              <div style={{ height:'2px', background:'var(--line)', margin:'10px 5px', position:'relative' }}>
                <i style={{ position:'absolute', left:'0%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--cyan)', border:'2px solid #E7F4F1' }}/>
                <i style={{ position:'absolute', left:'50%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:selected.statusState === 'critical' ? 'var(--red)' : 'var(--yellow)', border:'2px solid #E7F4F1' }}/>
                <i style={{ position:'absolute', right:'0%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--green)', border:'2px solid #E7F4F1' }}/>
              </div>
              <div style={{ color:'var(--teal)', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.08em' }}>BLOCK START → MAINTENANCE WINDOW → BLOCK END</div>
            </div>

            {[
              ['ASSET / SECTION',selected.section],
              ['ASSET ID',selected.asset],
              ['LOCATION',selected.location],
              ['BLOCK TYPE',selected.type],
              ['START TIME',selected.start],
              ['END TIME',selected.end],
              ['DURATION',selected.duration],
              ['STATUS',selected.status],
              ['OPERATIONAL IMPACT',selected.impact],
              ['AFFECTED TRAINS',selected.affectedTrains],
              ['ASSIGNED DEPARTMENT',selected.department],
            ].map(([label,value]) => (
              <div key={label} className="table-head" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'9px 0', borderBottom:'1px solid var(--line)' }}>
                <span>{label}</span>
                <span style={{ textAlign:'right', fontSize:'12px', color:label === 'STATUS' ? { Active:'var(--red)', Scheduled:'var(--yellow)', Completed:'var(--green)', Pending:'var(--cyan)', Conflict:'var(--red)' }[value] : label === 'OPERATIONAL IMPACT' ? { High:'var(--orange)', Medium:'var(--yellow)', Low:'var(--green)', None:'var(--green)' }[value] : undefined }}>{value}</span>
              </div>
            ))}

            <Link href={`/blocks/${selected.id}`} className="primary-btn" style={{width:'100%',justifyContent:'center',marginTop:'18px'}}><GitBranch/> VIEW BLOCK DETAILS</Link>
          </div>
        </aside>
      </div>
    </main>
  )
}