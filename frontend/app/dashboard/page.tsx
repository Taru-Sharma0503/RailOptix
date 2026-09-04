'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, BarChart3, Bell, BrainCircuit, CalendarClock, ChevronDown,
  CircleGauge, Clock3, Database, Gauge, GitBranch, LayoutDashboard, ListChecks,
  Map, Menu, Network, Play, Plus, Settings2, ShieldCheck, SlidersHorizontal,
  Sparkles, TrainFront, TrendingDown, Wrench, Zap, X
} from 'lucide-react'

const nav = [
  { label:'Dashboard', href:'/dashboard', icon:LayoutDashboard, group:'OPERATIONS' },
  { label:'Network', href:'/network', icon:Network, group:'OPERATIONS' },
  { label:'Assets', href:'/assets', icon:Database, group:'ASSETS' },
  { label:'Maintenance', href:'/maintenance', icon:Wrench, group:'ASSETS' },
  { label:'Trains', href:'/trains', icon:TrainFront, group:'ASSETS' },
  { label:'Blocks', href:'/blocks', icon:GitBranch, group:'ASSETS' },
  { label:'Scheduler', href:'/scheduler', icon:CalendarClock, group:'PLANNING' },
  { label:'Conflicts', href:'/conflicts', icon:AlertTriangle, group:'PLANNING' },
  { label:'Simulation', href:'/simulation', icon:Play, group:'PLANNING' },
  { label:'Weekly Plan', href:'/planning/weekly', icon:ListChecks, group:'PLANNING' },
  { label:'Monthly Plan', href:'/planning/monthly', icon:CalendarClock, group:'PLANNING' },
  { label:'Analytics', href:'/analytics', icon:BarChart3, group:'INSIGHTS' },
  { label:'History', href:'/history', icon:Clock3, group:'INSIGHTS' },
  { label:'Departments', href:'/departments', icon:ShieldCheck, group:'INSIGHTS' },
  { label:'Settings', href:'/settings', icon:Settings2, group:'SYSTEM' },
]

const metrics = [
  ['Assets Monitored','1,248','2.4%','up',Database],
  ['High-Risk Assets','27','3 today','critical',AlertTriangle],
  ['Active Maintenance Tasks','84','12 due today','warn',Wrench],
  ['Today’s Block Requests','18','6 pending','info',GitBranch],
  ['Network Availability','97.8%','0.6%','up',Gauge],
  ['Average Delay Risk','8.4 min','1.2 min','down',TrendingDown],
]

const priorities = [
  { id:'01', asset:'TRK-102', title:'Track degradation', risk:'92%', level:'CRITICAL', due:'Due in 2 days', impact:'High', color:'critical' },
  { id:'02', asset:'SIG-044', title:'Signal failure probability', risk:'84%', level:'HIGH', due:'Due in 4 days', impact:'High', color:'warn' },
  { id:'03', asset:'OHE-221', title:'OHE inspection', risk:'71%', level:'MEDIUM', due:'Due in 6 days', impact:'Medium', color:'info' },
]

function Logo() {
  return (
    <div className="brand">
      <img
        src="/images/Logo.jpeg"
          alt="RailOptix"
        className="logo-image"
      />
      <div>
        <div className="brand-name">RAIL<span>OPTIX</span></div>
        <div className="brand-sub">AI-POWERED RAILWAY<br/>MAINTENANCE</div>
      </div>
    </div>
  )
}

function Sidebar({ open,onClose }: { open:boolean; onClose:()=>void }) {
  const [userName,setUserName] = useState('')

  useEffect(() => {
    const savedUser = localStorage.getItem('railoptix-user')
    if (savedUser) setUserName(savedUser)
  },[])

  return (
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="sidebar-head">
        <Logo/>
        <button className="icon-btn close-mobile" onClick={onClose} aria-label="Close navigation">
          <X/>
        </button>
      </div>

      <div className="nav-scroll">
        {['OPERATIONS','ASSETS','PLANNING','INSIGHTS','SYSTEM'].map(group => (
          <div className="nav-group" key={group}>
            <div className="nav-label">{group}</div>

            {nav.filter(n=>n.group===group).map(({label,href,icon:Icon}) => (
              <Link
                key={label}
                href={href}
                className={`nav-item ${label==='Dashboard'?'active':''}`}
                onClick={onClose}
              >
                <Icon/>
                <span>{label}</span>
                {label==='Dashboard'&&<i/>}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="system-live">
          <span className="pulse-dot"></span>
          <div>
            <strong>System operational</strong>
            <small>All services nominal</small>
          </div>
        </div>

        {userName ? (
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <Link href="/settings" className="operator">
              <div className="avatar">
                {userName
                  .split(' ')
                  .map(word=>word[0])
                  .join('')
                  .slice(0,2)
                  .toUpperCase()}
              </div>

              <div>
                <strong>{userName}</strong>
                <small>Operations Planner</small>
              </div>

              <ChevronDown/>
            </Link>

            <button
              className="secondary-btn"
              onClick={() => {
                localStorage.removeItem('railoptix-user')
                window.location.href='/login'
              }}
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <Link
              href="/login"
              className="secondary-btn"
              style={{textDecoration:'none'}}
            >
              LOGIN
            </Link>

            <Link
              href="/signup"
              className="primary-btn"
              style={{textDecoration:'none'}}
            >
              SIGN UP
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

function Topbar({ onMenu,onNotify }: { onMenu:()=>void; onNotify:()=>void }) {
  const [showZone,setShowZone] = useState(false)
  const [now,setNow] = useState<Date | null>(null)
  const [userName,setUserName] = useState('')

  useEffect(() => {
    const updateTime = () => setNow(new Date())

    updateTime()

    const savedUser = localStorage.getItem('railoptix-user')
    if (savedUser) setUserName(savedUser)

    const timer = setInterval(updateTime,1000)

    return () => clearInterval(timer)
  },[])

  const date = now
    ? now.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
      }).toUpperCase()
    : ''

  const time = now
    ? now.toLocaleTimeString('en-GB',{
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit',
        hour12:false
      })
    : ''

  return (
    <header className="topbar">
      <button
        className="icon-btn menu-btn"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu/>
      </button>

      <div className="context">
        <div className="context-block">
          <span className="eyebrow">CURRENT ZONE</span>
          <strong>Northern Railway</strong>
        </div>

        <div className="divider"></div>

        <div className="context-block">
          <span className="eyebrow">DIVISION</span>
          <strong>Delhi</strong>
        </div>

        <button
          className="status"
          onClick={()=>setShowZone(!showZone)}
        >
          <span className="pulse-dot"></span> OPERATIONAL
        </button>

        {showZone&&
          <div
            style={{
              position:'absolute',
              top:'52px',
              left:'18px',
              padding:'12px 14px',
              background:'var(--panel)',
              border:'1px solid var(--line)',
              zIndex:20,
              fontSize:'11px'
            }}
          >
            <strong>System Status</strong>
            <div style={{marginTop:'5px',color:'var(--muted)'}}>
              All services nominal
            </div>
          </div>
        }
      </div>

      <div className="top-actions">
        <div className="sync">
          <span className="sync-dot"></span> DATA SYNCED{' '}
          <b style={{color:'var(--text)'}}>{time}</b>
        </div>

        <div className="date">
          {date}{' '}
          <b style={{color:'var(--text)'}}>
            {time ? `${time.slice(0,5)} IST` : ''}
          </b>
        </div>

        <button
          className="icon-btn notify"
          onClick={onNotify}
          aria-label="Notifications"
        >
          <Bell/>
          <em>3</em>
        </button>

        {userName ? (
          <Link href="/settings" className="top-avatar">
            {userName
              .split(' ')
              .map(word=>word[0])
              .join('')
              .slice(0,2)
              .toUpperCase()}
          </Link>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <Link
              href="/login"
              className="secondary-btn"
              style={{textDecoration:'none'}}
            >
              LOGIN
            </Link>

            <Link
              href="/signup"
              className="primary-btn"
              style={{textDecoration:'none'}}
            >
              SIGN UP
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

function MetricStrip() {
  return <div className="metric-grid">{metrics.map(([label,value,trend,type,Icon])=><div className="metric" key={label as string}><div className="metric-top"><span>{label}</span><Icon/></div><div className="metric-bottom"><strong>{value}</strong><small className={type as string}>{type==='up'?'▲ ':type==='down'?'▼ ':''}{trend}</small></div></div>)}</div>
}

function DigitalTwin() {
  const [filter,setFilter] = useState('ALL')
  const [showFilters,setShowFilters] = useState(false)

  const visible = type => filter === 'ALL' || filter === type

  return (
    <section className="panel twin">
      <div className="panel-head">
        <div><div className="section-kicker"><Map/> LIVE NETWORK VIEW</div><h2>Railway Digital Twin</h2><p>Delhi Division · 248.6 route km monitored</p></div>
        <div className="panel-tools">
          <button className="tool-btn active">LIVE</button>
          <button className={`tool-btn ${showFilters?'active':''}`} onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal/> FILTER</button>
          <button className="icon-btn" onClick={()=>setShowFilters(!showFilters)} aria-label="Network controls"><CircleGauge/></button>
        </div>
      </div>

      {showFilters && (
        <div style={{display:'flex',gap:'6px',padding:'10px 16px',borderBottom:'1px solid var(--line)',flexWrap:'wrap'}}>
          {['ALL','HEALTHY','AT RISK','HIGH RISK','BLOCKS','TRAINS'].map(item => (
            <button key={item} className={`tool-btn ${filter===item?'active':''}`} onClick={()=>setFilter(item)}>{item}</button>
          ))}
        </div>
      )}

      <div className="twin-map">
        <div className="map-grid"></div>
        <svg viewBox="0 0 760 380" role="img" aria-label="Schematic railway network connecting Delhi region stations" preserveAspectRatio="xMidYMid meet">
          <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <path className="route-secondary" d="M80 292 C170 260,205 208,285 218 S410 270,485 214 S600 138,690 108"/>
          <path className="route" d="M80 292 C170 260,205 208,285 218 S410 270,485 214 S600 138,690 108"/>
          <path className="route" d="M80 292 C160 315,232 320,285 218 S340 115,438 95 S580 102,690 108"/>
          <path className="route-secondary" d="M285 218 C350 185,355 130,438 95"/>

          <g className="station" transform="translate(80 292)"><circle r="7"/><circle r="3"/><text y="-16" x="-8">GURUGRAM</text></g>
          <g className="station" transform="translate(285 218)"><circle r="9"/><circle r="4"/><text y="-19" x="-27">NEW DELHI</text></g>
          <g className="station" transform="translate(438 95)"><circle r="7"/><circle r="3"/><text y="-16" x="-24">PANIPAT</text></g>
          <g className="station" transform="translate(485 214)"><circle r="7"/><circle r="3"/><text y="23" x="-28">GHAZIABAD</text></g>
          <g className="station" transform="translate(690 108)"><circle r="7"/><circle r="3"/><text y="-16" x="-18">MEERUT</text></g>

          {visible('HEALTHY') && <g className="asset healthy" transform="translate(185 252)"><circle r="5"/><path d="M0-10v20M-10 0h20"/></g>}
          {visible('HIGH RISK') && <g className="asset risk" transform="translate(350 247)"><circle r="6"/><path d="M-3-3l6 6m0-6l-6 6"/></g>}
          {visible('AT RISK') && <g className="asset warn" transform="translate(548 175)"><circle r="5"/><path d="M0-10v20M-10 0h20"/></g>}
          {visible('HIGH RISK') && <g className="signal" transform="translate(390 117)"><rect width="8" height="16" rx="2"/><circle cx="4" cy="4" r="2"/><circle cx="4" cy="11" r="2"/></g>}
          {visible('BLOCKS') && <g className="block" transform="translate(445 221)"><rect x="-9" y="-9" width="18" height="18" rx="2"/><path d="M-5-5l10 10m0-10l-10 10"/></g>}
          {visible('TRAINS') && <g className="train" filter="url(#glow)" transform="translate(210 241)"><circle r="9"/><path d="M-5 0h10M0-5v10"/></g>}
          {visible('TRAINS') && <g className="train train-two" filter="url(#glow)" transform="translate(575 161)"><circle r="9"/><path d="M-5 0h10M0-5v10"/></g>}
        </svg>

        <div className="map-readout"><span><i className="green-dot"></i> 1,221 HEALTHY</span><span><i className="yellow-dot"></i> 12 BLOCKS</span><span><i className="red-dot"></i> 27 HIGH RISK</span></div>
        <div className="legend"><span><i className="legend-train"></i> TRAIN</span><span><i className="legend-line"></i> TRACK</span><span><i className="legend-signal"></i> SIGNAL</span><span><i className="legend-ohe"></i> OHE</span><span><i className="legend-block"></i> BLOCK</span></div>
      </div>
    </section>
  )
}

function Priority() {
  return (
    <section className="panel priority">
      <div className="panel-head compact"><div><div className="section-kicker"><BrainCircuit/> AI PRIORITIZED</div><h2>AI Maintenance Priority</h2></div><Link href="/maintenance" className="text-btn">VIEW ALL <span>→</span></Link></div>
      <div className="table-head"><span>ASSET / ISSUE</span><span>RISK</span><span>IMPACT</span><span>DEADLINE</span></div>
      {priorities.map(p=>(
        <Link href={`/assets/${p.asset}`} className="priority-row" key={p.id}>
          <div className="asset-title"><b>{p.id}</b><div><strong>{p.asset}</strong><small>{p.title}</small></div></div>
          <div className="risk-cell"><strong className={p.color}>{p.risk}</strong><div className="risk-bar"><i className={p.color} style={{width:p.risk}}></i></div><small className={p.color}>{p.level}</small></div>
          <span className="impact">{p.impact}</span><span className="deadline">{p.due}</span>
        </Link>
      ))}
    </section>
  )
}

function Blocks() {
  const blocks = [
    ['08:30','Ghaziabad → New Delhi','Engineering','30 min'],
    ['10:15','Delhi → Meerut','S&T','45 min'],
    ['14:00','Ghaziabad → Panipat','Traction','60 min']
  ]

  return (
    <section className="panel blocks">
      <div className="panel-head compact"><div><div className="section-kicker"><GitBranch/> DISPATCH SCHEDULE</div><h2>Upcoming Blocks</h2></div><Link href="/blocks" className="icon-btn" aria-label="View blocks"><Plus/></Link></div>
      <div className="timeline">
        {blocks.map((b,i)=>(
          <Link href="/blocks" className="block-row" key={b[0]}>
            <div className="block-time" style={{color:'var(--text)'}}>{b[0]}<small>TODAY</small></div>
            <div className="timeline-line"><i></i></div>
            <div className="block-info"><strong>{b[1]}</strong><span>{b[2]} <b>·</b> {b[3]}</span></div>
            <span className={`block-state ${i===0?'soon':''}`}>{i===0?'NEXT':'SCHEDULED'}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Recommendation() {
  const [expanded,setExpanded] = useState(false)

  return (
    <section className="recommendation">
      <div className="recommend-head">
        <div className="ai-orbit"><Sparkles/></div>
        <div><div className="section-kicker">AI RECOMMENDATION <span className="live-tag">LIVE</span></div><h2>Consolidate planned work</h2></div>
        <button className="icon-btn" onClick={()=>setExpanded(!expanded)} aria-label="Toggle explanation"><ChevronDown/></button>
      </div>
      <p>Combine <b>TRK-102 maintenance</b> with the scheduled Engineering block at 10:15 to avoid an additional traffic restriction.</p>
      {expanded&&<div style={{margin:'0 0 15px',padding:'12px 14px',border:'1px solid var(--line)',background:'var(--elevated)',color:'var(--muted)',fontSize:'12px',lineHeight:1.5}}>RailOptix recommends consolidation because both activities can be handled within the same operational window, reducing additional restrictions.</div>}
      <div className="rec-stats"><div><strong>4</strong><span>CONFLICTS AVOIDED</span></div><div><strong>23 min</strong><span>DELAY REDUCTION</span></div><div><strong>+2.1%</strong><span>ASSET AVAILABILITY</span></div></div>
      <div className="rec-actions"><Link href="/planning/weekly" className="primary-btn">REVIEW PLAN <span>→</span></Link><button className="secondary-btn" onClick={()=>setExpanded(!expanded)}>VIEW EXPLANATION</button></div>
    </section>
  )
}

function Analytics() {
  const data = {
    '24 HOURS': {
      bars:[72,68,75,70,82,80,88,84,91,87,95,92,97,94,96,98],
      labels:['00:00','06:00','12:00','18:00','NOW'],
      availability:'97.8%',change:'+0.6%',risk:'−12.4%',delay:'8.4 min',delayChange:'−1.2 min'
    },
    '7 DAYS': {
      bars:[78,74,81,76,85,83,89,87,91,88,94,92,96,93,97,98],
      labels:['MON','TUE','WED','THU','FRI','SAT','SUN'],
      availability:'96.9%',change:'+1.1%',risk:'−9.8%',delay:'9.1 min',delayChange:'−0.8 min'
    },
    '30 DAYS': {
      bars:[68,72,70,76,74,79,77,82,80,84,86,83,89,91,94,96],
      labels:['W1','W2','W3','W4','NOW'],
      availability:'95.8%',change:'+2.3%',risk:'−7.2%',delay:'10.2 min',delayChange:'−0.4 min'
    }
  }

  const [range,setRange] = useState<'24 HOURS'|'7 DAYS'|'30 DAYS'>('24 HOURS')
  const [open,setOpen] = useState(false)
  const current = data[range]

  return (
    <section className="panel analytics">
      <div className="panel-head compact">
        <div><div className="section-kicker"><Activity/> SYSTEM TELEMETRY</div><h2>Operational Analytics</h2></div>
        <div style={{position:'relative'}}>
          <button className="tool-btn" onClick={()=>setOpen(!open)}>LAST {range}<ChevronDown/></button>
          {open&&<div style={{position:'absolute',right:0,top:'calc(100% + 6px)',zIndex:30,minWidth:'130px',background:'var(--panel)',border:'1px solid var(--line)',boxShadow:'0 8px 20px rgba(0,0,0,.06)'}}>
            {(['24 HOURS','7 DAYS','30 DAYS'] as const).map(item=>(
              <button key={item} onClick={()=>{setRange(item);setOpen(false)}} style={{display:'block',width:'100%',padding:'9px 12px',border:0,background:item===range?'var(--elevated)':'transparent',color:'inherit',textAlign:'left',fontSize:'11px',cursor:'pointer'}}>LAST {item}</button>
            ))}
          </div>}
        </div>
      </div>

      <div className="charts">
        <div className="chart-card">
          <div className="chart-label"><span>NETWORK AVAILABILITY</span><strong>{current.availability}</strong><small>{current.change}</small></div>
          <div className="bar-chart">{current.bars.map((h,i)=><i key={i} style={{height:`${h}%`}} className={h>92?'hot':''}></i>)}</div>
          <div className="chart-axis">{current.labels.map(label=><span key={label}>{label}</span>)}</div>
        </div>

        <div className="chart-card line-card">
          <div className="chart-label"><span>MAINTENANCE RISK TREND</span><strong>{current.risk}</strong><small>Improving</small></div>
          <svg viewBox="0 0 300 75" preserveAspectRatio="none">
            <path d="M0 60 C28 50,35 62,58 45 S88 50,112 38 S140 45,165 26 S192 37,215 29 S246 32,270 14 S290 23,300 8"/>
            <path className="area" d="M0 60 C28 50,35 62,58 45 S88 50,112 38 S140 45,165 26 S192 37,215 29 S246 32,270 14 S290 23,300 8 V75 H0Z"/>
          </svg>
          <div className="chart-axis"><span>LOW</span><span>MEDIUM</span><span>HIGH</span></div>
        </div>

        <div className="chart-card delay-card">
          <div className="chart-label"><span>TRAIN DELAY RISK</span><strong>{current.delay}</strong><small>{current.delayChange}</small></div>
          <div className="delay-gauge"><div><strong>84</strong><span>/ 100</span></div></div>
          <div className="gauge-label"><span>LOW RISK</span><span>HIGH RISK</span></div>
        </div>
      </div>
    </section>
  )
}

function QuickActions() {
  return (
    <div className="quick-actions">
      <span className="eyebrow">QUICK ACTIONS</span>
      <Link href="/maintenance/new" style={{border:'1px solid var(--line)',background:'#FFFFFF',padding:'10px 12px',color:'#53636A',fontSize:'10px',letterSpacing:'.04em',display:'flex',alignItems:'center',gap:'7px',borderRadius:'3px',textDecoration:'none'}}><Plus/> CREATE MAINTENANCE TASK</Link>
      <Link href="/blocks" style={{border:'1px solid var(--line)',background:'#FFFFFF',padding:'10px 12px',color:'#53636A',fontSize:'10px',letterSpacing:'.04em',display:'flex',alignItems:'center',gap:'7px',borderRadius:'3px',textDecoration:'none'}}><GitBranch/> REQUEST BLOCK</Link>
      <Link href="/simulation" style={{border:'1px solid var(--line)',background:'#FFFFFF',padding:'10px 12px',color:'#53636A',fontSize:'10px',letterSpacing:'.04em',display:'flex',alignItems:'center',gap:'7px',borderRadius:'3px',textDecoration:'none'}}><Play/> RUN SIMULATION</Link>
      <Link href="/scheduler" style={{border:'1px solid #A7D7D0',background:'#E7F4F1',padding:'10px 12px',color:'#17665D',fontSize:'10px',letterSpacing:'.04em',display:'flex',alignItems:'center',gap:'7px',borderRadius:'3px',textDecoration:'none'}}><Zap/> RUN OPTIMIZATION</Link>
    </div>
  )
}

export default function Page() {
  const [menuOpen,setMenuOpen] = useState(false)
  const [notifications,setNotifications] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/>
      {menuOpen&&<button className="scrim" onClick={()=>setMenuOpen(false)} aria-label="Close menu"/>}

      <div className="main-area">
        <Topbar onMenu={()=>setMenuOpen(true)} onNotify={()=>setNotifications(!notifications)}/>

        {notifications&&<div style={{position:'fixed',top:'70px',right:'20px',zIndex:100,width:'280px',padding:'16px',background:'var(--panel)',border:'1px solid var(--line)',boxShadow:'0 10px 30px rgba(0,0,0,.08)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}><strong>Notifications</strong><button className="icon-btn" onClick={()=>setNotifications(false)} aria-label="Close notifications"><X/></button></div>
          <div style={{padding:'10px 0',borderBottom:'1px solid var(--line)',fontSize:'12px'}}>3 high-risk assets require review.</div>
          <div style={{padding:'10px 0',borderBottom:'1px solid var(--line)',fontSize:'12px'}}>4 operational conflicts detected.</div>
          <div style={{padding:'10px 0',fontSize:'12px'}}>6 block requests are pending.</div>
        </div>}

        <main className="dashboard">
          <div className="page-intro">
            <div><div className="breadcrumb">OPERATIONS <span>/</span> COMMAND CENTER</div><h1>Dashboard</h1><p>Predict. Optimize. Simulate. Decide.</p></div>
            <div className="intro-actions">
              <Link href="/planning/weekly" className="secondary-btn"><CalendarClock/> {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}</Link>
              <Link href="/scheduler" className="primary-btn"><Zap/> OPTIMIZATION READY</Link>
            </div>
          </div>

          <MetricStrip/>

          <div className="main-grid">
            <DigitalTwin/>
            <div className="right-stack"><Priority/><Blocks/></div>
          </div>

          <div className="lower-grid"><Recommendation/><Analytics/></div>
          <QuickActions/>
        </main>

        <footer>RAILOPTIX CONTROL SYSTEM <span>v2.4.1</span><span className="footer-right">LAST SYSTEM CHECK 14:31:52 IST · NORTHERN RAILWAY</span></footer>
      </div>
    </div>
  )
}