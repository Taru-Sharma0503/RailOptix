'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronDown, ClipboardPlus, Plus, X } from 'lucide-react'

const assets = [
  ['TRK-102 · Main Line Track Section', 'New Delhi – Ghaziabad'],
  ['SIG-091 · Electronic Interlocking Signal', 'Panipat Junction'],
  ['PTM-018 · Point Machine No. 18', 'Ghaziabad Junction'],
  ['OHE-221 · Overhead Contact System', 'Panipat – Karnal'],
  ['LC-014 · Manned Level Crossing', 'Sonepat Outer'],
  ['BRG-007 · Yamuna River Bridge', 'Delhi – Shahdara'],
]

const initialForm = { asset: '', type: '', location: '', priority: '', date: '', time: '', duration: '', block: 'No', impact: '', department: '', notes: '' }
const fieldStyle = { width: '100%', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--foreground)', borderRadius: '3px', padding: '10px 11px', fontSize: '13px', outline: 'none', minHeight: '39px' }
const labelStyle = { display: 'block', marginBottom: '7px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em' }

export default function NewMaintenancePage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [createdTask, setCreatedTask] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function selectAsset(value) {
    const asset = assets.find(([name]) => name === value)
    setForm((current) => ({ ...current, asset: value, location: asset ? asset[1] : current.location }))
    setErrors((current) => ({ ...current, asset: undefined, location: undefined }))
  }

  function submitTask(event) {
    event.preventDefault()
    const required = ['asset', 'type', 'location', 'priority', 'date', 'time', 'duration', 'impact', 'department']
    const nextErrors = required.reduce((result, field) => {
      if (!String(form[field]).trim()) result[field] = 'Required'
      return result
    }, {})

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const taskId = `MNT-${String(Date.now()).slice(-6)}`
    const priorityState = { Low: 'healthy', Medium: 'warning', High: 'high', Critical: 'critical' }[form.priority]
    const formattedDate = new Date(`${form.date}T00:00:00`).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const minutes = Number(form.duration)
const formattedDuration = minutes >= 60 && minutes % 60 === 0
  ? `${minutes / 60} hr${minutes / 60 > 1 ? 's' : ''}`
  : `${minutes} min`

const newTask = {
  id: taskId,
  asset: form.asset,
  location: form.location,
  type: form.type,
  priority: form.priority,
  priorityState,
  scheduled: `${formattedDate} · ${form.time}`,
  duration: formattedDuration,
  requiredBlock: form.block,
  impact: form.impact,
  department: form.department,
  notes: form.notes,
  status: 'Planned',
  statusState: 'neutral',
}

    try {
      const savedTasks = JSON.parse(window.localStorage.getItem('railoptix-maintenance-tasks') || '[]')
      const nextTasks = Array.isArray(savedTasks) && !savedTasks.some((task) => task.id === taskId) ? [...savedTasks, newTask] : savedTasks
      window.localStorage.setItem('railoptix-maintenance-tasks', JSON.stringify(nextTasks))
    } catch {
      // Keep the local prototype usable if browser storage is unavailable.
    }

    setCreatedTask(taskId)
  }

  if (createdTask) {
    return (
      <main className="dashboard">
        <div className="page-intro"><div><div className="breadcrumb">OPERATIONS <span>/</span> MAINTENANCE <span>/</span> NEW TASK</div><h1>Create Maintenance Task</h1><p>Define a maintenance activity and its operational requirements.</p></div></div>
        <section className="panel" style={{ maxWidth: '720px', padding: '32px', margin: '0 auto' }}>
          <div style={{ width: '42px', height: '42px', display: 'grid', placeItems: 'center', border: '1px solid #A7D7D0', background: '#E7F4F1', color: 'var(--teal)', borderRadius: '50%', marginBottom: '18px' }}><CheckCircle2 /></div>
          <div className="section-kicker"><ClipboardPlus /> TASK CREATED</div>
          <h2 style={{ margin: '8px 0', fontSize: '20px', fontWeight: 600 }}>Maintenance task created successfully.</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>The task has been created in this local prototype and is ready for review.</p>
          <div style={{ margin: '22px 0', padding: '15px', border: '1px solid var(--line)', background: 'var(--elevated)' }}><span className="eyebrow">GENERATED TASK ID</span><strong style={{ display: 'block', marginTop: '7px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '18px' }}>{createdTask}</strong></div>
          <Link href="/maintenance" className="primary-btn">VIEW MAINTENANCE <span>→</span></Link>
        </section>
      </main>
    )
  }

  const FieldError = ({ field }) => errors[field] && <small style={{ display: 'block', color: 'var(--red)', fontSize: '11px', marginTop: '5px' }}>{errors[field]}</small>

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div><div className="breadcrumb">OPERATIONS <span>/</span> MAINTENANCE <span>/</span> NEW TASK</div><h1>Create Maintenance Task</h1><p>Define a maintenance activity and its operational requirements.</p></div>
      </div>
      <form onSubmit={submitTask} className="panel" style={{ maxWidth: '980px', margin: '0 auto' }} noValidate>
        <div className="panel-head compact"><div><div className="section-kicker"><ClipboardPlus /> TASK DEFINITION</div><h2>Maintenance Requirements</h2><p>Fields marked required must be completed before creating a task.</p></div></div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          <div><label htmlFor="asset" style={labelStyle}>ASSET *</label><select id="asset" value={form.asset} onChange={(event) => selectAsset(event.target.value)} style={{ ...fieldStyle, borderColor: errors.asset ? 'var(--red)' : 'var(--line)' }}><option value="">Select asset</option>{assets.map(([asset]) => <option key={asset}>{asset}</option>)}</select><FieldError field="asset" /></div>
          <div><label htmlFor="type" style={labelStyle}>MAINTENANCE TYPE *</label><select id="type" value={form.type} onChange={(event) => updateField('type', event.target.value)} style={{ ...fieldStyle, borderColor: errors.type ? 'var(--red)' : 'var(--line)' }}><option value="">Select type</option>{['Track Inspection', 'Signal Maintenance', 'Point Machine Service', 'OHE Inspection', 'Level Crossing Maintenance', 'Other'].map((type) => <option key={type}>{type}</option>)}</select><FieldError field="type" /></div>
          <div><label htmlFor="location" style={labelStyle}>LOCATION *</label><input id="location" value={form.location} onChange={(event) => updateField('location', event.target.value)} placeholder="Enter operational location" style={{ ...fieldStyle, borderColor: errors.location ? 'var(--red)' : 'var(--line)' }} /><FieldError field="location" /></div>
          <div><label htmlFor="priority" style={labelStyle}>PRIORITY *</label><select id="priority" value={form.priority} onChange={(event) => updateField('priority', event.target.value)} style={{ ...fieldStyle, borderColor: errors.priority ? 'var(--red)' : 'var(--line)' }}><option value="">Select priority</option>{['Low', 'Medium', 'High', 'Critical'].map((priority) => <option key={priority}>{priority}</option>)}</select><FieldError field="priority" /></div>
          <div><label htmlFor="date" style={labelStyle}>PREFERRED DATE *</label><input id="date" type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} style={{ ...fieldStyle, borderColor: errors.date ? 'var(--red)' : 'var(--line)' }} /><FieldError field="date" /></div>
          <div><label htmlFor="time" style={labelStyle}>PREFERRED TIME *</label><input id="time" type="time" value={form.time} onChange={(event) => updateField('time', event.target.value)} style={{ ...fieldStyle, borderColor: errors.time ? 'var(--red)' : 'var(--line)' }} /><FieldError field="time" /></div>
          <div><label htmlFor="duration" style={labelStyle}>ESTIMATED DURATION (MINUTES) *</label><input id="duration" type="number" min="1" value={form.duration} onChange={(event) => updateField('duration', event.target.value)} placeholder="e.g. 120" style={{ ...fieldStyle, borderColor: errors.duration ? 'var(--red)' : 'var(--line)' }} /><FieldError field="duration" /></div>
          <div><label htmlFor="block" style={labelStyle}>REQUIRED BLOCK</label><select id="block" value={form.block} onChange={(event) => updateField('block', event.target.value)} style={fieldStyle}><option>Yes</option><option>No</option></select></div>
          <div><label htmlFor="impact" style={labelStyle}>OPERATIONAL IMPACT *</label><select id="impact" value={form.impact} onChange={(event) => updateField('impact', event.target.value)} style={{ ...fieldStyle, borderColor: errors.impact ? 'var(--red)' : 'var(--line)' }}><option value="">Select impact</option>{['Low', 'Medium', 'High'].map((impact) => <option key={impact}>{impact}</option>)}</select><FieldError field="impact" /></div>
          <div><label htmlFor="department" style={labelStyle}>ASSIGNED DEPARTMENT *</label><select id="department" value={form.department} onChange={(event) => updateField('department', event.target.value)} style={{ ...fieldStyle, borderColor: errors.department ? 'var(--red)' : 'var(--line)' }}><option value="">Select department</option>{['Track Maintenance', 'Signalling', 'Electrical / OHE', 'Civil', 'Operations'].map((department) => <option key={department}>{department}</option>)}</select><FieldError field="department" /></div>
          <div style={{ gridColumn: '1 / -1' }}><label htmlFor="notes" style={labelStyle}>NOTES</label><textarea id="notes" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows="4" placeholder="Add any operating instructions, safety notes, or access requirements." style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }} /></div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '9px' }}>
          <Link href="/maintenance" className="secondary-btn hover:!bg-[#E7F4F1] hover:!text-[#172126]"><X /> CANCEL</Link>
          <button type="submit" className="primary-btn"><Plus /> CREATE TASK</button>
        </div>
      </form>
    </main>
  )
}
