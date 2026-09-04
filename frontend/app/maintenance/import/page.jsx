'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileUp, Upload, X } from 'lucide-react'

export default function ImportMaintenancePage() {
  const [file, setFile] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)

  function parseCSV(text) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length < 2) return []

    const headers = lines[0]
      .split(',')
      .map((header) => header.trim().replace(/^"|"$/g, ''))

    return lines.slice(1).map((line) => {
      const values = line
        .split(',')
        .map((value) => value.trim().replace(/^"|"$/g, ''))

      return headers.reduce((row, header, index) => {
        row[header] = values[index] || ''
        return row
      }, {})
    })
  }

  function handleFile(event) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setError('')
    setImported(false)

    const extension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`

    if (extension !== '.csv') {
      setFile(null)
      setRows([])
      setError('For the frontend prototype, please select a CSV file.')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || '')
        const parsed = parseCSV(text)

        if (!parsed.length) {
          setRows([])
          setError('The CSV file does not contain any maintenance tasks.')
          return
        }

        setRows(parsed)
      } catch {
        setRows([])
        setError('The selected CSV file could not be read.')
      }
    }

    reader.readAsText(selectedFile)
  }

  function removeFile() {
    setFile(null)
    setRows([])
    setError('')
    setImported(false)
  }

  function formatDuration(value) {
    const minutes = Number(value)

    if (!minutes) return ''

    return minutes >= 60 && minutes % 60 === 0
      ? `${minutes / 60} hr${minutes / 60 > 1 ? 's' : ''}`
      : `${minutes} min`
  }

  function importTasks() {
    if (!rows.length) return

    const importedTasks = rows.map((row, index) => {
      const priority = row.Priority || row.priority || 'Medium'

      const priorityState = {
        Low: 'healthy',
        Medium: 'warning',
        High: 'high',
        Critical: 'critical',
      }[priority] || 'warning'

      return {
        id:
          row['Task ID'] ||
          row['TASK ID'] ||
          row.ID ||
          row.id ||
          `MNT-IMP-${String(Date.now()).slice(-5)}-${index + 1}`,
        asset: row.Asset || row.asset || 'Imported Asset',
        location: row.Location || row.location || '',
        type:
          row['Maintenance Type'] ||
          row['MAINTENANCE TYPE'] ||
          row.Type ||
          row.type ||
          'Maintenance',
        priority,
        priorityState,
        scheduled:
          row.Scheduled ||
          row['Scheduled Date'] ||
          row['SCHEDULED DATE'] ||
          row.Date ||
          row.date ||
          '',
        duration: formatDuration(
          row.Duration ||
          row['Estimated Duration'] ||
          row['ESTIMATED DURATION'] ||
          row.duration
        ),
        requiredBlock:
          row['Required Block'] ||
          row['REQUIRED BLOCK'] ||
          row.Block ||
          row.block ||
          'No',
        impact:
          row['Operational Impact'] ||
          row['OPERATIONAL IMPACT'] ||
          row.Impact ||
          row.impact ||
          '',
        department:
          row['Assigned Department'] ||
          row['ASSIGNED DEPARTMENT'] ||
          row.Department ||
          row.department ||
          '',
        notes: row.Notes || row.NOTES || row.notes || '',
        status: 'Planned',
        statusState: 'neutral',
      }
    })

    try {
      const savedTasks = JSON.parse(
        window.localStorage.getItem('railoptix-maintenance-tasks') || '[]'
      )

      const existingIds = new Set(
        Array.isArray(savedTasks)
          ? savedTasks.map((task) => task.id)
          : []
      )

      const nextTasks = [
        ...(Array.isArray(savedTasks) ? savedTasks : []),
        ...importedTasks.filter((task) => !existingIds.has(task.id)),
      ]

      window.localStorage.setItem(
        'railoptix-maintenance-tasks',
        JSON.stringify(nextTasks)
      )

      setImported(true)
    } catch {
      setError('The tasks could not be saved locally.')
    }
  }

  const previewColumns = rows.length
    ? Object.keys(rows[0]).slice(0, 5)
    : []

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">
            OPERATIONS <span>/</span> MAINTENANCE <span>/</span> IMPORT
          </div>

          <h1>Import Maintenance Tasks</h1>

          <p>
            Import maintenance activities into the RailOptix planning
            system.
          </p>
        </div>
      </div>

      <Link
        href="/maintenance"
        className="text-btn"
        style={{ padding: 0, marginBottom: '18px' }}
      >
        <ArrowLeft size={15} />
        BACK TO MAINTENANCE
      </Link>

      <section
        className="panel"
        style={{
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <div className="panel-head compact">
          <div>
            <div className="section-kicker">
              <FileUp />
              TASK IMPORT
            </div>

            <h2>Import Maintenance Data</h2>

            <p>
              Upload a maintenance task file for processing.
            </p>
          </div>
        </div>

        <div style={{ padding: '8px 20px 24px' }}>
          {!file && !imported && (
            <label
              style={{
                display: 'block',
                border: '1px dashed var(--strong-line)',
                background: 'var(--elevated)',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Upload
                size={32}
                style={{
                  color: 'var(--cyan)',
                  marginBottom: '14px',
                }}
              />

              <h3
                style={{
                  margin: '0 0 7px',
                  fontSize: '16px',
                }}
              >
                Upload Maintenance File
              </h3>

              <p
                style={{
                  margin: '0 0 20px',
                  color: 'var(--muted)',
                  fontSize: '13px',
                }}
              >
                CSV maintenance task data can be imported here.
              </p>

              <span
                className="primary-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={15} />
                CHOOSE FILE
              </span>

              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  marginTop: '12px',
                  color: 'var(--muted)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                CSV FILES
              </div>
            </label>
          )}

          {file && !imported && (
            <>
              <div
                style={{
                  border: '1px solid var(--line)',
                  background: 'var(--elevated)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '15px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid var(--line)',
                      background: 'var(--panel)',
                      color: 'var(--cyan)',
                    }}
                  >
                    <FileUp size={18} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </strong>

                    <small
                      style={{
                        color: 'var(--muted)',
                        fontSize: '11px',
                      }}
                    >
                      {(file.size / 1024).toFixed(1)} KB · {rows.length} task
                      {rows.length !== 1 ? 's' : ''} found
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="secondary-btn"
                  style={{ padding: '8px 10px' }}
                >
                  <X size={14} />
                  REMOVE
                </button>
              </div>

              {rows.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div
                    className="section-kicker"
                    style={{ marginBottom: '10px' }}
                  >
                    <FileUp />
                    IMPORT PREVIEW
                  </div>

                  <div
                    style={{
                      overflowX: 'auto',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '600px',
                      }}
                    >
                      <thead>
                        <tr>
                          {previewColumns.map((column) => (
                            <th
                              key={column}
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid var(--line)',
                                background: 'var(--elevated)',
                                color: 'var(--muted)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '9px',
                                textAlign: 'left',
                                letterSpacing: '.08em',
                              }}
                            >
                              {column.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {rows.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {previewColumns.map((column) => (
                              <td
                                key={column}
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid var(--line)',
                                  color: 'var(--muted)',
                                  fontSize: '12px',
                                }}
                              >
                                {row[column]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rows.length > 5 && (
                    <p
                      style={{
                        margin: '9px 0 0',
                        color: 'var(--muted)',
                        fontSize: '11px',
                      }}
                    >
                      Showing first 5 of {rows.length} tasks.
                    </p>
                  )}
                </div>
              )}

              <div
                style={{
                  marginTop: '18px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '9px',
                }}
              >
                <button
                  type="button"
                  onClick={removeFile}
                  className="secondary-btn"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={importTasks}
                  className="primary-btn"
                  disabled={!rows.length}
                  style={{
                    opacity: rows.length ? 1 : 0.5,
                    cursor: rows.length ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Upload size={15} />
                  IMPORT {rows.length} TASK{rows.length !== 1 ? 'S' : ''}
                </button>
              </div>
            </>
          )}

          {error && (
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                border: '1px solid var(--red)',
                color: 'var(--red)',
                background: 'var(--elevated)',
                fontSize: '12px',
              }}
            >
              {error}
            </div>
          )}

          {imported && (
            <div
              style={{
                border: '1px solid #A7D7D0',
                background: '#E7F4F1',
                padding: '28px 24px',
                textAlign: 'center',
              }}
            >
              <CheckCircle2
                size={34}
                style={{
                  color: 'var(--teal)',
                  marginBottom: '12px',
                }}
              />

              <h3
                style={{
                  margin: '0 0 7px',
                  fontSize: '16px',
                }}
              >
                Maintenance Tasks Imported
              </h3>

              <p
                style={{
                  margin: '0 0 20px',
                  color: 'var(--muted)',
                  fontSize: '13px',
                }}
              >
                {rows.length} maintenance task
                {rows.length !== 1 ? 's have' : ' has'} been added to
                the maintenance register.
              </p>

              <Link
                href="/maintenance"
                className="primary-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                VIEW MAINTENANCE
                <span>→</span>
              </Link>
            </div>
          )}

          {!file && !imported && (
            <div
              style={{
                marginTop: '18px',
                padding: '12px 14px',
                border: '1px solid var(--line)',
                background: 'var(--elevated)',
                color: 'var(--muted)',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Frontend prototype supports CSV file selection, preview,
              validation, and local task import. Backend file processing
              can be connected later.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}