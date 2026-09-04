'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react'

export default function LoginPage() {
  const [employeeId,setEmployeeId] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()

    const users = JSON.parse(localStorage.getItem('railoptix-users') || '[]')
    const user = users.find(
      item => item.employeeId === employeeId.trim() && item.password === password
    )

    if (!user) {
      setError('Invalid Employee ID or password.')
      return
    }

    localStorage.setItem('railoptix-user',user.name)
    window.location.href = '/dashboard'
  }

  return (
    <main style={{minHeight:'100vh',background:'var(--bg)',display:'grid',gridTemplateColumns:'1.15fr .85fr',fontFamily:'var(--font-sans)'}}>
      <section style={{position:'relative',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'48px 7vw',overflow:'hidden',borderRight:'1px solid var(--line)'}}>
        <div style={{position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <img src="/images/Logo.jpeg" alt="RailOptix" style={{width:'55px',height:'50px',objectFit:'contain'}} />
            <div>
              <strong style={{display:'block',fontSize:'22px',letterSpacing:'.08em'}}>RAILOPTIX</strong>
              <span style={{fontSize:'9px',letterSpacing:'.16em',color:'var(--muted)'}}>RAILWAY OPERATIONS PLATFORM</span>
            </div>
          </div>
        </div>

        <div style={{position:'relative',zIndex:2,maxWidth:'570px'}}>
          <div className="section-kicker" style={{marginBottom:'14px'}}>
            NORTHERN RAILWAY · DELHI DIVISION
          </div>
          <h1 style={{fontSize:'clamp(36px,4vw,58px)',lineHeight:1.05,margin:'0 0 18px',fontWeight:600,letterSpacing:'-.03em'}}>
            Intelligent planning for railway operations.
          </h1>
          <p style={{maxWidth:'480px',fontSize:'14px',lineHeight:1.8,color:'var(--muted)',margin:0}}>
            AI-powered asset availability, maintenance planning and operational scheduling for safer and more efficient train operations.
          </p>
        </div>

        <div style={{position:'relative',zIndex:2,fontFamily:'var(--font-mono)',fontSize:'9px',letterSpacing:'.1em',color:'var(--muted)'}}>
          SYSTEM STATUS · OPERATIONAL
        </div>

        <div style={{position:'absolute',inset:'18% -5% 18% 8%',opacity:.32,pointerEvents:'none'}}>
          <svg viewBox="0 0 700 420" width="100%" height="100%">
            <path d="M20 330 C130 290,150 220,260 245 S390 330,480 235 S590 125,690 90" fill="none" stroke="var(--line-strong)" strokeWidth="2"/>
            <path d="M20 330 C150 370,215 350,260 245 S350 105,450 120 S580 100,690 90" fill="none" stroke="var(--line-strong)" strokeWidth="2"/>
            <circle cx="20" cy="330" r="5" fill="var(--teal)"/>
            <circle cx="260" cy="245" r="7" fill="var(--teal)"/>
            <circle cx="450" cy="120" r="5" fill="var(--teal)"/>
            <circle cx="690" cy="90" r="5" fill="var(--teal)"/>
          </svg>
        </div>
      </section>

      <section style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 6vw'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <div style={{marginBottom:'30px'}}>
            <div className="eyebrow" style={{marginBottom:'10px'}}>SECURE ACCESS</div>
            <h2 style={{fontSize:'30px',margin:'0 0 8px',fontWeight:600}}>Welcome back</h2>
            <p style={{margin:0,color:'var(--muted)',fontSize:'13px'}}>Sign in to continue to RailOptix.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label style={{display:'block',fontSize:'10px',letterSpacing:'.08em',color:'var(--muted)',marginBottom:'8px'}}>
              EMPLOYEE ID
            </label>

            <div style={{position:'relative',marginBottom:'20px'}}>
              <UserRound size={15} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}} />
              <input
                value={employeeId}
                onChange={e=>setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
                style={{width:'100%',boxSizing:'border-box',height:'46px',padding:'0 14px 0 40px',border:'1px solid var(--line)',background:'var(--panel)',color:'var(--text)',outline:'none',fontSize:'12px'}}
              />
            </div>

            <label style={{display:'block',fontSize:'10px',letterSpacing:'.08em',color:'var(--muted)',marginBottom:'8px'}}>
              PASSWORD
            </label>

            <div style={{position:'relative',marginBottom:'14px'}}>
              <LockKeyhole size={15} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}} />
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Enter password"
                style={{width:'100%',boxSizing:'border-box',height:'46px',padding:'0 14px 0 40px',border:'1px solid var(--line)',background:'var(--panel)',color:'var(--text)',outline:'none',fontSize:'12px'}}
              />
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <label style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'11px',color:'var(--muted)'}}>
                <input type="checkbox" />
                Remember me
              </label>

              <Link href="/signup" style={{fontSize:'11px',color:'var(--teal)',textDecoration:'none'}}>
                Create account
              </Link>
            </div>

            {error && (
              <div style={{marginBottom:'16px',padding:'10px 12px',border:'1px solid rgba(217,74,74,.35)',color:'var(--red)',fontSize:'11px'}}>
                {error}
              </div>
            )}

            <button type="submit" className="primary-btn" style={{width:'100%',height:'46px',justifyContent:'center'}}>
              SIGN IN <ArrowRight size={15}/>
            </button>
          </form>

          <div style={{marginTop:'30px',paddingTop:'18px',borderTop:'1px solid var(--line)',textAlign:'center',fontSize:'9px',letterSpacing:'.08em',color:'var(--muted)'}}>
            RAILOPTIX OPERATIONS PLATFORM · v1.0
          </div>

          <div style={{marginTop:'16px',textAlign:'center'}}>
            <Link href="/" style={{fontSize:'10px',color:'var(--muted)',textDecoration:'none'}}>
              ← BACK TO HOME
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}