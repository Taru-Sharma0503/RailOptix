export default function ModulePlaceholder({ pageName }) {
  return (
    <main style={{ minHeight: '100vh', padding: '48px', background: 'var(--background)' }}>
      <p style={{ color: 'var(--teal)', fontWeight: 700, letterSpacing: '.14em' }}>RAILOPTIX</p>
      <h1 style={{ fontSize: '28px', fontWeight: 600 }}>{pageName}</h1>
      <p style={{ color: 'var(--muted)' }}>This module is under development.</p>
    </main>
  )
}
