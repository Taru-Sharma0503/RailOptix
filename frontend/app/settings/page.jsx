'use client'

import { useState } from 'react'
import { Bell, CheckCircle2, Clock3, Database, Save, Settings, ShieldCheck, SlidersHorizontal, UserCog } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    notifications: true,
    conflictAlerts: true,
    maintenanceAlerts: true,
    simulationAlerts: false,
    autoRefresh: true,
    compactTables: false,
  })

  const toggleSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
    setSaved(false)
  }

  const saveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">SYSTEM / SETTINGS</div>
          <h1>System Settings</h1>
          <p>Configure RailOptix operational preferences, notifications, planning behaviour, and system controls.</p>
        </div>

        <button className="btn primary" onClick={saveSettings}>
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {[
          ['System Status', 'Operational', 'All core modules available'],
          ['Data Connection', 'Connected', 'Railway operational data'],
          ['Last Sync', '08:42', '03 Sep 2026'],
          ['Configuration', 'Default', 'Current system profile'],
        ].map(([label, value, detail]) => (
          <div className="metric" key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.35, whiteSpace: 'normal' }}>
                {label}
              </span>

              <strong style={{ fontSize: 18, lineHeight: 1.2, overflowWrap: 'anywhere' }}>
                {value}
              </strong>

              <small style={{ lineHeight: 1.35, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                {detail}
              </small>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker"><UserCog /> USER PREFERENCES</div>
              <h2>Interface Settings</h2>
            </div>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            <SettingRow
              icon={<UserCog size={16} />}
              title="Operator Profile"
              description="Planning Control · Operations"
              action={<strong style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Planning Control</strong>}
            />

            <SettingRow
              icon={<SlidersHorizontal size={16} />}
              title="Compact Tables"
              description="Reduce table row height across operational registers"
              action={<Toggle value={settings.compactTables} onChange={() => toggleSetting('compactTables')} />}
            />

            <SettingRow
              icon={<Clock3 size={16} />}
              title="Auto Refresh"
              description="Automatically refresh operational information"
              action={<Toggle value={settings.autoRefresh} onChange={() => toggleSetting('autoRefresh')} />}
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head compact">
            <div>
              <div className="section-kicker"><Bell /> NOTIFICATIONS</div>
              <h2>Operational Alerts</h2>
            </div>
          </div>

          <div style={{ padding: '2px 18px 18px' }}>
            <SettingRow
              icon={<Bell size={16} />}
              title="System Notifications"
              description="Receive important RailOptix system notifications"
              action={<Toggle value={settings.notifications} onChange={() => toggleSetting('notifications')} />}
            />

            <SettingRow
              icon={<ShieldCheck size={16} />}
              title="Conflict Alerts"
              description="Notify when planning conflicts require attention"
              action={<Toggle value={settings.conflictAlerts} onChange={() => toggleSetting('conflictAlerts')} />}
            />

            <SettingRow
              icon={<Settings size={16} />}
              title="Maintenance Alerts"
              description="Notify about maintenance tasks and blocks"
              action={<Toggle value={settings.maintenanceAlerts} onChange={() => toggleSetting('maintenanceAlerts')} />}
            />

            <SettingRow
              icon={<Database size={16} />}
              title="Simulation Alerts"
              description="Notify when operational simulations finish"
              action={<Toggle value={settings.simulationAlerts} onChange={() => toggleSetting('simulationAlerts')} />}
            />
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head compact">
          <div>
            <div className="section-kicker"><Settings /> SYSTEM CONFIGURATION</div>
            <h2>Operational Configuration</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {[
            [Database, 'Data Environment', 'Operational'],
            [ShieldCheck, 'Access Control', 'Protected'],
            [Settings, 'Planning Mode', 'Automatic'],
          ].map(([Icon, label, value]) => (
            <div
              className="metric"
              key={label}
              style={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />

              <span
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  lineHeight: 1.35,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                }}
              >
                {label}
              </span>

              <strong
                style={{
                  fontSize: 15,
                  lineHeight: 1.25,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                }}
              >
                {value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">SYSTEM INFORMATION</div>
            <h2>RailOptix Configuration</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {[
            ['Application', 'RailOptix'],
            ['Environment', 'Development'],
            ['Planning Horizon', 'September 2026 – February 2027'],
            ['Data Mode', 'Local Mock Data'],
            ['Last Configuration Update', '03 Sep 2026 · 08:42'],
            ['System Version', 'v1.0.0'],
          ].map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '14px 0 4px', borderTop: '1px solid var(--line)' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', overflowWrap: 'anywhere' }}>
          RailOptix · Railway maintenance decision-support system
        </span>

        <Link href="/dashboard" style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          RETURN TO DASHBOARD
        </Link>
      </section>
    </main>
  )
}

function SettingRow({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        minHeight: 58,
        padding: '10px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--line)',
            background: 'var(--elevated)',
            color: 'var(--teal)',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>
            {title}
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              marginTop: 3,
              lineHeight: 1.35,
              overflowWrap: 'anywhere',
            }}
          >
            {description}
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {action}
      </div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={value}
      style={{
        width: 38,
        height: 20,
        padding: 2,
        border: '1px solid var(--line)',
        background: value ? 'var(--teal)' : 'var(--elevated)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
        flexShrink: 0,
      }}
    >
      <span style={{ width: 14, height: 14, background: '#FFFFFF', display: 'block' }} />
    </button>
  )
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.35fr)',
        alignItems: 'center',
        gap: 16,
        minHeight: 46,
        padding: '10px 12px',
        border: '1px solid var(--line)',
        background: 'var(--elevated)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          lineHeight: 1.35,
          overflowWrap: 'anywhere',
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: 11,
          textAlign: 'right',
          lineHeight: 1.35,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </strong>
    </div>
  )
}