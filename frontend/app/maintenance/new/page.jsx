'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ClipboardPlus, Plus, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'

const initialForm = {
asset: '', type: '', location: '', priority: '', date: '', time: '',
duration: '', block: 'No', impact: '', department: '', notes: ''
}

const fieldStyle = {
width: '100%', border: '1px solid var(--line)', background: 'var(--panel)',
color: 'var(--foreground)', borderRadius: '3px', padding: '10px 11px',
fontSize: '13px', outline: 'none', minHeight: '39px'
}

const labelStyle = {
display: 'block', marginBottom: '7px', color: 'var(--muted)',
fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em'
}

export default function NewMaintenancePage() {
const [form, setForm] = useState(initialForm)
const [errors, setErrors] = useState({})
const [createdTask, setCreatedTask] = useState('')
const [assets, setAssets] = useState([])
const [departments, setDepartments] = useState([])

useEffect(() => {
async function loadFormData() {
try {
const [assetsData, departmentsData] = await Promise.all([
apiFetch('/api/assets'),
apiFetch('/api/departments')
])


    setAssets(assetsData?.assets || assetsData || [])
    setDepartments(departmentsData?.departments || departmentsData || [])
  } catch (err) {
    console.error('Failed to load assets/departments:', err)
  }
}

loadFormData()

}, [])

function updateField(field, value) {
setForm(current => ({ ...current, [field]: value }))
setErrors(current => ({ ...current, [field]: undefined }))
}

function selectAsset(value) {
const asset = assets.find(item => item.id === value)

setForm(current => ({
  ...current,
  asset: value,
  location: asset?.location && typeof asset.location === 'object'
    ? `${asset.location.latitude}, ${asset.location.longitude}`
    : asset?.location || current.location
}))

setErrors(current => ({ ...current, asset: undefined, location: undefined }))

}

async function submitTask(event) {
event.preventDefault()

const required = [
  'asset', 'type', 'location', 'priority', 'date',
  'time', 'duration', 'impact', 'department'
]

const nextErrors = required.reduce((result, field) => {
  if (!String(form[field]).trim()) result[field] = 'Required'
  return result
}, {})

if (Object.keys(nextErrors).length) {
  setErrors(nextErrors)
  return
}

try {
  const severityMap = { Low: 3, Medium: 5, High: 8, Critical: 10 }
  const safetyRiskMap = { Low: 3, Medium: 5, High: 8 }

  const payload = {
    assetId: form.asset,
    departmentId: form.department,
    description: form.notes.trim()
      ? `${form.type} — ${form.notes.trim()}`
      : form.type,
    severity: severityMap[form.priority],
    estimatedDuration: Number(form.duration),
    deadline: form.date,
    safetyRisk: safetyRiskMap[form.impact]
  }

  console.log('Maintenance payload:', payload)

  const data = await apiFetch('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  const created = data?.task || data?.maintenance || data

  if (!created?.id) {
    throw new Error('Maintenance task was created but no task ID was returned.')
  }

  setCreatedTask(created.id)
} catch (err) {
  console.error('Failed to create maintenance task:', err)
  setErrors({ submit: err.message || 'Failed to create maintenance task' })
}

}

if (createdTask) {
return ( <main className="dashboard"> <div className="page-intro"> <div> <div className="breadcrumb">OPERATIONS <span>/</span> MAINTENANCE <span>/</span> NEW TASK</div> <h1>Create Maintenance Task</h1> <p>Define a maintenance activity and its operational requirements.</p> </div> </div>

    <section className="panel" style={{ maxWidth: '720px', padding: '32px', margin: '0 auto' }}>
      <div style={{ width: '42px', height: '42px', display: 'grid', placeItems: 'center', border: '1px solid #A7D7D0', background: '#E7F4F1', color: 'var(--teal)', borderRadius: '50%', marginBottom: '18px' }}>
        <CheckCircle2 />
      </div>

      <div className="section-kicker"><ClipboardPlus /> TASK CREATED</div>
      <h2 style={{ margin: '8px 0', fontSize: '20px', fontWeight: 600 }}>
        Maintenance task created successfully.
      </h2>

      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
        The task has been created successfully in RailOptix and is ready for review.
      </p>

      <div style={{ margin: '22px 0', padding: '15px', border: '1px solid var(--line)', background: 'var(--elevated)' }}>
        <span className="eyebrow">GENERATED TASK ID</span>
        <strong style={{ display: 'block', marginTop: '7px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '18px' }}>
          {createdTask}
        </strong>
      </div>

      <Link href="/maintenance" className="primary-btn">
        VIEW MAINTENANCE <span>→</span>
      </Link>
    </section>
  </main>
)

}

const FieldError = ({ field }) =>
errors[field] && (
<small style={{ display: 'block', color: 'var(--red)', fontSize: '11px', marginTop: '5px' }}>
{errors[field]} </small>
)

return ( <main className="dashboard"> <div className="page-intro"> <div> <div className="breadcrumb">OPERATIONS <span>/</span> MAINTENANCE <span>/</span> NEW TASK</div> <h1>Create Maintenance Task</h1> <p>Define a maintenance activity and its operational requirements.</p> </div> </div>

  <form onSubmit={submitTask} className="panel" style={{ maxWidth: '980px', margin: '0 auto' }} noValidate>
    <div className="panel-head compact">
      <div>
        <div className="section-kicker"><ClipboardPlus /> TASK DEFINITION</div>
        <h2>Maintenance Requirements</h2>
        <p>Fields marked required must be completed before creating a task.</p>
      </div>
    </div>

    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>

      <div>
        <label htmlFor="asset" style={labelStyle}>ASSET *</label>
        <select id="asset" value={form.asset} onChange={e => selectAsset(e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.asset ? 'var(--red)' : 'var(--line)' }}>
          <option value="">Select asset</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.id} · {asset.name}
            </option>
          ))}
        </select>
        <FieldError field="asset" />
      </div>

      <div>
        <label htmlFor="type" style={labelStyle}>MAINTENANCE TYPE *</label>
        <select id="type" value={form.type} onChange={e => updateField('type', e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.type ? 'var(--red)' : 'var(--line)' }}>
          <option value="">Select maintenance type</option>
          {[
            'Track Inspection',
            'Signal Maintenance',
            'Point Machine Service',
            'OHE Inspection',
            'Level Crossing Maintenance',
            'Other'
          ].map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <FieldError field="type" />
      </div>

      <div>
        <label htmlFor="location" style={labelStyle}>LOCATION *</label>
        <input id="location" value={form.location} onChange={e => updateField('location', e.target.value)}
          placeholder="Enter operational location"
          style={{ ...fieldStyle, borderColor: errors.location ? 'var(--red)' : 'var(--line)' }} />
        <FieldError field="location" />
      </div>

      <div>
        <label htmlFor="priority" style={labelStyle}>PRIORITY *</label>
        <select id="priority" value={form.priority} onChange={e => updateField('priority', e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.priority ? 'var(--red)' : 'var(--line)' }}>
          <option value="">Select priority</option>
          {['Low', 'Medium', 'High', 'Critical'].map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
        <FieldError field="priority" />
      </div>

      <div>
        <label htmlFor="date" style={labelStyle}>PREFERRED DATE *</label>
        <input id="date" type="date" value={form.date} onChange={e => updateField('date', e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.date ? 'var(--red)' : 'var(--line)' }} />
        <FieldError field="date" />
      </div>

      <div>
        <label htmlFor="time" style={labelStyle}>PREFERRED TIME *</label>
        <input id="time" type="time" value={form.time} onChange={e => updateField('time', e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.time ? 'var(--red)' : 'var(--line)' }} />
        <FieldError field="time" />
      </div>

      <div>
        <label htmlFor="duration" style={labelStyle}>ESTIMATED DURATION (MINUTES) *</label>
        <input id="duration" type="number" min="1" value={form.duration}
          onChange={e => updateField('duration', e.target.value)} placeholder="e.g. 120"
          style={{ ...fieldStyle, borderColor: errors.duration ? 'var(--red)' : 'var(--line)' }} />
        <FieldError field="duration" />
      </div>

      <div>
        <label htmlFor="block" style={labelStyle}>REQUIRED BLOCK</label>
        <select id="block" value={form.block} onChange={e => updateField('block', e.target.value)} style={fieldStyle}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <div>
        <label htmlFor="impact" style={labelStyle}>OPERATIONAL IMPACT *</label>
        <select id="impact" value={form.impact} onChange={e => updateField('impact', e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.impact ? 'var(--red)' : 'var(--line)' }}>
          <option value="">Select impact</option>
          {['Low', 'Medium', 'High'].map(impact => (
            <option key={impact} value={impact}>{impact}</option>
          ))}
        </select>
        <FieldError field="impact" />
      </div>

      <div>
        <label htmlFor="department" style={labelStyle}>ASSIGNED DEPARTMENT *</label>
        <select id="department" value={form.department} onChange={e => updateField('department', e.target.value)}
          style={{ ...fieldStyle, borderColor: errors.department ? 'var(--red)' : 'var(--line)' }}>
          <option value="">Select department</option>
          {departments.map(department => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <FieldError field="department" />
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <label htmlFor="notes" style={labelStyle}>NOTES</label>
        <textarea id="notes" value={form.notes} onChange={e => updateField('notes', e.target.value)}
          rows="4" placeholder="Add any operating instructions, safety notes, or access requirements."
          style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }} />
      </div>

    </div>

    {errors.submit && (
      <div style={{
        margin: '0 20px 12px',
        padding: '10px 12px',
        border: '1px solid rgba(217,74,74,.35)',
        color: 'var(--red)',
        fontSize: '12px'
      }}>
        {errors.submit}
      </div>
    )}

    <div style={{ borderTop: '1px solid var(--line)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '9px' }}>
      <Link href="/maintenance" className="secondary-btn hover:!bg-[#E7F4F1] hover:!text-[#172126]">
        <X /> CANCEL
      </Link>
      <button type="submit" className="primary-btn">
        <Plus /> CREATE TASK
      </button>
    </div>
  </form>
</main>
)
}
