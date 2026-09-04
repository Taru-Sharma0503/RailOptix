'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock3, Navigation, TrainFront, TriangleAlert } from 'lucide-react'

const conflicts = [
  { id:'CNF-26041', block:'BLK-26098', asset:'TRK-GZB-093', section:'Ghaziabad → Sahibabad', date:'03 Sep 2026', start:'03:00', end:'06:00', severity:'Critical', severityState:'critical', affectedTrains:6, conflictType:'Train movement overlap', status:'Unresolved', statusState:'critical', recommendation:'Move the maintenance block to the next available low-density window after 06:30.' },
  { id:'CNF-26042', block:'BLK-26091', asset:'TRK-DLI-042', section:'Delhi Junction → Narela', date:'03 Sep 2026', start:'22:00', end:'02:30', severity:'High', severityState:'high', affectedTrains:4, conflictType:'Express service overlap', status:'Review Required', statusState:'warning', recommendation:'Retain the window but reroute two lower-priority services through the alternate path.' },
  { id:'CNF-26043', block:'BLK-26093', asset:'OHE-PNP-031', section:'Panipat Junction', date:'04 Sep 2026', start:'00:30', end:'04:00', severity:'High', severityState:'high', affectedTrains:5, conflictType:'OHE block overlap', status:'Unresolved', statusState:'critical', recommendation:'Split the maintenance window into two engineering periods around the highest-priority train paths.' },
  { id:'CNF-26044', block:'BLK-26095', asset:'PNT-FBD-088', section:'Faridabad Yard', date:'03 Sep 2026', start:'21:00', end:'23:00', severity:'Medium', severityState:'warning', affectedTrains:3, conflictType:'Point machine overlap', status:'Review Required', statusState:'warning', recommendation:'Delay maintenance by 30 minutes to avoid the scheduled departure sequence.' },
  { id:'CNF-26045', block:'BLK-26092', asset:'SIG-GZB-118', section:'Ghaziabad Junction', date:'03 Sep 2026', start:'23:30', end:'01:30', severity:'Medium', severityState:'warning', affectedTrains:2, conflictType:'Signal maintenance overlap', status:'Resolved', statusState:'healthy', recommendation:'Conflict resolved by shifting one affected service to an alternate platform path.' },
  { id:'CNF-26046', block:'BLK-26096', asset:'TRK-RHT-056', section:'Rohtak Junction', date:'05 Sep 2026', start:'02:00', end:'05:00', severity:'Low', severityState:'healthy', affectedTrains:2, conflictType:'Scheduled movement overlap', status:'Resolved', statusState:'healthy', recommendation:'No schedule change required. Existing train path has sufficient operational margin.' },
]

const metrics = [
  ['Open Conflicts','4','Require resolution',TriangleAlert,'critical'],
  ['Critical','1','Immediate attention',AlertTriangle,'critical'],
  ['Affected Trains','20','Services impacted',TrainFront,'warn'],
  ['Resolved','2','Conflicts cleared',CheckCircle2,'up'],
]

function StateTag({ children, state }) {
  const colors = { healthy:'var(--green)', info:'var(--cyan)', warning:'var(--yellow)', critical:'var(--red)', high:'var(--orange)' }
  return <span className="block-state" style={{ color:colors[state] || 'var(--muted)', borderColor:colors[state] || 'var(--line)' }}>{children}</span>
}

export default function ConflictsPage() {
  const [selectedId,setSelectedId] = useState(conflicts[0].id)
  const selected = conflicts.find(item => item.id === selectedId) || conflicts[0]

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div><div className="breadcrumb">OPERATIONS <span>/</span> CONFLICTS</div><h1>Operational Conflicts</h1><p>Detect and resolve conflicts between maintenance blocks and train operations.</p></div>
        <Link href="/scheduler" className="primary-btn">OPEN SCHEDULER</Link>
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
            <div><div className="section-kicker"><TriangleAlert/> CONFLICT REGISTER</div><h2>Operational Conflicts</h2><p>Conflicts detected between maintenance windows and train movements.</p></div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <div className="table-head" style={{ minWidth:'920px', display:'grid', gridTemplateColumns:'0.85fr 0.9fr 1fr 1.25fr 0.8fr 0.9fr 0.65fr 0.9fr', gap:'12px' }}>
              <span>CONFLICT ID</span><span>BLOCK</span><span>ASSET</span><span>SECTION</span><span>DATE</span><span>WINDOW</span><span>TRAINS</span><span>SEVERITY</span>
            </div>

            <div style={{ minWidth:'920px' }}>
              {conflicts.map(conflict => {
                const isSelected = conflict.id === selectedId
                return (
                  <button key={conflict.id} onClick={() => setSelectedId(conflict.id)} aria-pressed={isSelected} style={{ width:'100%', display:'grid', gridTemplateColumns:'0.85fr 0.9fr 1fr 1.25fr 0.8fr 0.9fr 0.65fr 0.9fr', gap:'12px', alignItems:'center', padding:'13px 16px', border:0, borderBottom:'1px solid var(--line)', borderLeft:isSelected ? '3px solid var(--teal)' : '3px solid transparent', background:isSelected ? '#E7F4F1' : 'var(--panel)', textAlign:'left', minHeight:'62px', cursor:'pointer' }}>
                    <span><strong style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--cyan)' }}>{conflict.id}</strong></span>
                    <span style={{ color:'var(--muted)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>{conflict.block}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>{conflict.asset}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{conflict.section}</span>
                    <span style={{ color:'var(--muted)', fontSize:'12px' }}>{conflict.date}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{conflict.start} → {conflict.end}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px' }}>{conflict.affectedTrains}</span>
                    <StateTag state={conflict.severityState}>{conflict.severity}</StateTag>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Navigation/> SELECTED CONFLICT</div><h2>Conflict Details</h2></div>
            <StateTag state={selected.severityState}>{selected.severity}</StateTag>
          </div>

          <div style={{ padding:'2px 18px 18px' }}>
            <h3 style={{ margin:'12px 0 5px', fontSize:'17px', fontWeight:600 }}>{selected.conflictType}</h3>
            <p style={{ marginBottom:'17px', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>{selected.id}</p>

            <div style={{ padding:'14px 4px 18px', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:'9px' }}><span>START</span><span>CONFLICT WINDOW</span><span>END</span></div>
              <div style={{ height:'3px', background:'var(--line)', margin:'11px 5px', position:'relative' }}>
                <i style={{ position:'absolute', left:0, top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--cyan)' }}/>
                <i style={{ position:'absolute', left:'50%', top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:selected.severityState === 'critical' ? 'var(--red)' : selected.severityState === 'high' ? 'var(--orange)' : 'var(--yellow)' }}/>
                <i style={{ position:'absolute', right:0, top:'-4px', width:'10px', height:'10px', borderRadius:'50%', background:'var(--green)' }}/>
              </div>
              <div style={{ color:'var(--teal)', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'.08em' }}>{selected.start} → CONFLICT → {selected.end}</div>
            </div>

            {[
              ['CONFLICT TYPE',selected.conflictType],
              ['BLOCK',selected.block],
              ['ASSET',selected.asset],
              ['SECTION',selected.section],
              ['DATE',selected.date],
              ['START TIME',selected.start],
              ['END TIME',selected.end],
              ['AFFECTED TRAINS',selected.affectedTrains],
              ['STATUS',selected.status],
            ].map(([label,value]) => (
              <div key={label} className="table-head" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'9px 0', borderBottom:'1px solid var(--line)' }}>
                <span>{label}</span>
                <span style={{ textAlign:'right', fontSize:'12px', color:label === 'STATUS' ? selected.statusState === 'critical' ? 'var(--red)' : selected.statusState === 'warning' ? 'var(--yellow)' : 'var(--green)' : undefined }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop:'16px', padding:'14px', background:'var(--elevated)', border:'1px solid var(--line)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', color:'var(--orange)', fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, letterSpacing:'.06em' }}><Clock3 size={13}/> RECOMMENDED RESOLUTION</div>
              <p style={{ margin:0, color:'var(--muted)', fontSize:'12px', lineHeight:1.55 }}>{selected.recommendation}</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="panel" style={{ marginTop:'18px' }}>
        <div className="panel-head compact">
          <div><div className="section-kicker"><TrainFront/> OPERATIONAL IMPACT</div><h2>Conflict Resolution Context</h2><p>RailOptix identifies operational overlap before maintenance blocks are finalized.</p></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:'1px', background:'var(--line)', borderTop:'1px solid var(--line)' }}>
          {[
            ['TRAIN MOVEMENT','Check scheduled services crossing the maintenance window.'],
            ['BLOCK WINDOW','Compare requested maintenance duration with available paths.'],
            ['PRIORITY','Protect high-priority and time-sensitive train services.'],
            ['RESOLUTION','Recommend the lowest-impact schedule adjustment.'],
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