'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, GitBranch, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { networkApi, requireAuth } from '../../lib/api'

function buildCorridorSummary(corridorId, data) {
  const stations = (data.stations || []).filter((s) => s.corridorId === corridorId)
  const assets = (data.assets || []).filter((a) => a.corridorId === corridorId)
  const blocks = (data.activeBlocks || []).filter((b) => b.corridorId === corridorId)
  const trains = (data.trains || []).filter((t) => t.corridorId === corridorId)
  const criticalAssets = assets.filter((a) => a.condition === 'critical').length
  const state = criticalAssets > 0 ? 'critical' : blocks.length > 0 ? 'warning' : 'healthy'

  return {
    stations,
    assetCount: assets.length,
    criticalAssets,
    blockCount: blocks.length,
    nextBlock: blocks[0] ? `${blocks[0].start} – ${blocks[0].end}` : 'No active block',
    trainCount: trains.length,
    state,
  }
}

function Node({ x, y, label, selected, onSelect, id }) {
  return (
    <g className={`station network-node ${selected ? 'selected' : ''}`} transform={`translate(${x} ${y})`} onClick={() => onSelect(id)} role="button" tabIndex="0" aria-label={`Select ${label}`} onKeyDown={(event) => event.key === 'Enter' && onSelect(id)}>
      {selected && <circle r="16" fill="none" stroke="var(--teal)" strokeWidth="2" opacity=".45" />}
      <circle r={selected ? '12' : '9'} style={selected ? { stroke: 'var(--teal)', strokeWidth: 3, fill: '#E7F4F1' } : undefined} />
      <circle r="4" />
      <text y="-19" x="-24">{label}</text>
    </g>
  )
}

export default function NetworkPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [selectedCorridorId, setSelectedCorridorId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  function load() {
    return networkApi.get().then((res) => {
      setData(res)
      if (!selectedCorridorId && res.corridors?.length) setSelectedCorridorId(res.corridors[0].id)
    })
  }

  useEffect(() => {
    if (!requireAuth(router)) return
    let cancelled = false
    load()
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load network data.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  function refreshStatus() {
    if (refreshing) return
    setRefreshing(true)
    load().catch((err) => setError(err.message || 'Could not refresh.')).finally(() => setRefreshing(false))
  }

  const corridors = data?.corridors || []
  const selected = selectedCorridorId ? buildCorridorSummary(selectedCorridorId, data || {}) : null
  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId)

  const totalAssets = (data?.assets || []).length
  const criticalAssets = (data?.assets || []).filter((a) => a.condition === 'critical').length
  const activeBlocks = (data?.activeBlocks || []).length

  const metrics = [
    ['Corridors', String(corridors.length), 'Monitored corridors', GitBranch, 'info'],
    ['Total Assets', String(totalAssets), 'Across the network', Activity, 'up'],
    ['Assets at Risk', String(criticalAssets), 'Need attention', TriangleAlert, 'critical'],
    ['Active Blocks', String(activeBlocks), 'Currently occupying corridors', ShieldCheck, 'warn'],
  ]

  // Lay out stations for the selected corridor along a simple curve for the schematic view.
  const positions = (selected?.stations || []).map((s, i, arr) => {
    const t = arr.length > 1 ? i / (arr.length - 1) : 0
    return { ...s, x: 60 + t * 640, y: 200 - Math.sin(t * Math.PI) * 90 }
  })

  return (
    <main className="dashboard">
      <div className="page-intro">
        <div>
          <div className="breadcrumb">OPERATIONS <span>/</span> NETWORK</div>
          <h1>Railway Network</h1>
          <p>Live corridor status, assets, and active blocks across the network.</p>
        </div>
        <button className="secondary-btn" onClick={refreshStatus} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? 'spin' : ''} /> {refreshing ? 'REFRESHING…' : 'REFRESH STATUS'}
        </button>
      </div>

      {error && <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid rgba(217,74,74,.35)', color: 'var(--red)', fontSize: '12px' }}>Couldn't reach the backend: {error}</div>}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
        {metrics.map(([label, value, detail, Icon, state]) => (
          <div className="metric" key={label}>
            <div className="metric-top"><span>{label}</span><Icon /></div>
            <div className="metric-bottom"><strong>{value}</strong><small className={state}>{detail}</small></div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <section className="panel twin">
          <div className="panel-head">
            <div><div className="section-kicker"><GitBranch /> LIVE NETWORK VIEW</div><h2>{selectedCorridor?.name || 'Select a corridor'}</h2><p>{selectedCorridor ? `${selectedCorridor.lengthKm ?? '—'} route km` : ''}</p></div>
            <div className="panel-tools">
              {corridors.map((c) => (
                <button key={c.id} className={`tool-btn ${c.id === selectedCorridorId ? 'active' : ''}`} onClick={() => setSelectedCorridorId(c.id)}>{c.name || c.id}</button>
              ))}
            </div>
          </div>

          <div className="twin-map">
            <div className="map-grid"></div>
            {!loading && positions.length > 0 && (
              <svg viewBox="0 0 760 380" role="img" aria-label="Schematic railway corridor" preserveAspectRatio="xMidYMid meet">
                <path className="route" d={`M${positions.map((p) => `${p.x} ${p.y}`).join(' L ')}`} fill="none" />
                {positions.map((p) => (
                  <Node key={p.id} id={p.id} x={p.x} y={p.y} label={(p.name || p.id).toUpperCase()} selected={false} onSelect={() => {}} />
                ))}
              </svg>
            )}
            {!loading && positions.length === 0 && (
              <div style={{ padding: '40px 16px', fontSize: '12px', color: 'var(--muted)' }}>No stations found for this corridor.</div>
            )}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head compact">
            <div><div className="section-kicker"><Activity /> CORRIDOR STATUS</div><h2>Section Detail</h2></div>
          </div>

          {!selected ? (
            <div style={{ padding: '20px 18px', fontSize: '12px', color: 'var(--muted)' }}>{loading ? 'Loading…' : 'Select a corridor.'}</div>
          ) : (
            <div style={{ padding: '4px 18px 18px' }}>
              {[
                ['STATUS', selectedCorridor?.status || '—'],
                ['STATIONS', selected.stations.length],
                ['ACTIVE ASSETS', selected.assetCount],
                ['ASSETS AT RISK', selected.criticalAssets],
                ['ACTIVE BLOCKS', selected.blockCount],
                ['NEXT BLOCK', selected.nextBlock],
                ['TRAINS ON CORRIDOR', selected.trainCount],
              ].map(([label, value]) => (
                <div key={label} className="table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>{label}</span>
                  <span style={{ textAlign: 'right', fontSize: '12px', color: label === 'ASSETS AT RISK' && value > 0 ? 'var(--red)' : undefined }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}