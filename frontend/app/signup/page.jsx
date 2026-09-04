'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react'

export default function SignupPage() {
  const [name,setName] = useState('')
  const [employeeId,setEmployeeId] = useState('')
  const [password,setPassword] = useState('')
  const [confirmPassword,setConfirmPassword] = useState('')
  const [error,setError] = useState('')

  function handleSignup(e) {
    e.preventDefault()

    if (!name.trim() || !employeeId.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const users = JSON.parse(localStorage.getItem('railoptix-users') || '[]')

    if (users.some(user => user.employeeId === employeeId.trim())) {
      setError('An account with this Employee ID already exists.')
      return
    }

    const newUser = {
      name:name.trim(),
      employeeId:employeeId.trim(),
      password
    }

    users.push(newUser)

    localStorage.setItem('railoptix-users',JSON.stringify(users))
    localStorage.setItem('railoptix-user',newUser.name)

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
      </section>

      <section style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 6vw'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <div style={{marginBottom:'26px'}}>
            <div className="eyebrow" style={{marginBottom:'10px'}}>NEW ACCESS</div>
            <h2 style={{fontSize:'30px',margin:'0 0 8px',fontWeight:600}}>Create account</h2>
            <p style={{margin:0,color:'var(--muted)',fontSize:'13px'}}>Register your RailOptix operator account.</p>
          </div>

          <form onSubmit={handleSignup}>
            <label style={{display:'block',fontSize:'10px',letterSpacing:'.08em',color:'var(--muted)',marginBottom:'8px'}}>
              FULL NAME
            </label>

            <div style={{position:'relative',marginBottom:'17px'}}>
              <UserRound size={15} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}} />
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="Enter your full name"
                style={{width:'100%',boxSizing:'border-box',height:'46px',padding:'0 14px 0 40px',border:'1px solid var(--line)',background:'var(--panel)',color:'var(--text)',outline:'none',fontSize:'12px'}}
              />
            </div>

            <label style={{display:'block',fontSize:'10px',letterSpacing:'.08em',color:'var(--muted)',marginBottom:'8px'}}>
              EMPLOYEE ID
            </label>

            <div style={{position:'relative',marginBottom:'17px'}}>
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

            <div style={{position:'relative',marginBottom:'17px'}}>
              <LockKeyhole size={15} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}} />
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Create password"
                style={{width:'100%',boxSizing:'border-box',height:'46px',padding:'0 14px 0 40px',border:'1px solid var(--line)',background:'var(--panel)',color:'var(--text)',outline:'none',fontSize:'12px'}}
              />
            </div>

            <label style={{display:'block',fontSize:'10px',letterSpacing:'.08em',color:'var(--muted)',marginBottom:'8px'}}>
              CONFIRM PASSWORD
            </label>

            <div style={{position:'relative',marginBottom:'20px'}}>
              <LockKeyhole size={15} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}} />
              <input
                type="password"
                value={confirmPassword}
                onChange={e=>setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={{width:'100%',boxSizing:'border-box',height:'46px',padding:'0 14px 0 40px',border:'1px solid var(--line)',background:'var(--panel)',color:'var(--text)',outline:'none',fontSize:'12px'}}
              />
            </div>

            {error && (
              <div style={{marginBottom:'16px',padding:'10px 12px',border:'1px solid rgba(217,74,74,.35)',color:'var(--red)',fontSize:'11px'}}>
                {error}
              </div>
            )}

            <button type="submit" className="primary-btn" style={{width:'100%',height:'46px',justifyContent:'center'}}>
              CREATE ACCOUNT <ArrowRight size={15}/>
            </button>
          </form>

          <div style={{marginTop:'24px',textAlign:'center',fontSize:'11px',color:'var(--muted)'}}>
            Already have an account?{' '}
            <Link href="/login" style={{color:'var(--teal)',textDecoration:'none'}}>
              Sign in
            </Link>
          </div>

          <div style={{marginTop:'22px',paddingTop:'18px',borderTop:'1px solid var(--line)',textAlign:'center',fontSize:'9px',letterSpacing:'.08em',color:'var(--muted)'}}>
            RAILOPTIX OPERATIONS PLATFORM · v1.0
          </div>
        </div>
      </section>
    </main>
  )
}