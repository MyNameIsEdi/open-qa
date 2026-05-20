const css = `
  @keyframes qa-barGrow { from{height:0;opacity:0} to{height:var(--h);opacity:1} }
  @keyframes qa-cardIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-pulse   { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06)} }
`

const TYPES = [
  {
    icon: '🚗', name: 'Load Test',        color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
    barH: '55%', delay: 0.1,
    analogy: 'Normal highway traffic',
    what: 'Expected number of users',
    metric: 'P95 response < 500ms',
  },
  {
    icon: '🚦', name: 'Performance Test', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0',
    barH: '70%', delay: 0.45,
    analogy: 'Measure speed at rush hour',
    what: 'How fast does it respond?',
    metric: 'TPS, P99, latency',
  },
  {
    icon: '💥', name: 'Stress Test',      color: '#f97316', bg: '#fff7ed', border: '#fed7aa',
    barH: '90%', delay: 0.80,
    analogy: 'Accident — traffic jam',
    what: 'Push until it breaks',
    metric: 'Breaking point & recovery',
  },
  {
    icon: '🏃', name: 'Soak Test',        color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff',
    barH: '60%', delay: 1.15,
    analogy: 'Marathon — hours of running',
    what: 'Sustained load over time',
    metric: 'Memory leaks, drift',
  },
]

export function LoadTypesAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Bar chart row */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 12,
        background: 'var(--bg-body)', borderRadius: 12,
        padding: '16px 12px 8px', height: 110,
      }}>
        {TYPES.map(t => (
          <div key={t.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', maxWidth: 52,
              height: t.barH, ['--h' as string]: t.barH,
              background: t.color, borderRadius: '6px 6px 0 0', opacity: 0.85,
              animation: `qa-barGrow .55s ease ${t.delay}s both`,
            }} />
            <span style={{ fontSize: 16, animation: `qa-cardIn .35s ease ${t.delay + .3}s both` }}>{t.icon}</span>
          </div>
        ))}
      </div>

      {/* Detail cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {TYPES.map(t => (
          <div key={t.name} style={{
            animation: `qa-cardIn .38s ease ${t.delay + 0.4}s both`,
            background: t.bg, border: `1.5px solid ${t.border}`,
            borderRadius: 10, padding: '9px 11px',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: t.color, margin: '0 0 3px' }}>
              {t.icon} {t.name}
            </p>
            <p style={{ fontSize: 9.5, color: '#6b7280', margin: '0 0 2px', fontStyle: 'italic' }}>
              {t.analogy}
            </p>
            <p style={{ fontSize: 9.5, color: '#374151', margin: '0 0 2px' }}>{t.what}</p>
            <p style={{ fontSize: 9, fontWeight: 600, color: t.color, margin: 0 }}>📊 {t.metric}</p>
          </div>
        ))}
      </div>

      {/* k6 hint */}
      <div style={{
        animation: `qa-cardIn .38s ease 1.8s both`,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 9,
        background: '#1e293b', border: '1px solid #334155',
      }}>
        <span style={{ fontSize: 13 }}>⚙️</span>
        <code style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
          k6 run --vus 50 --duration 60s script.js
        </code>
        <span style={{ fontSize: 9.5, color: '#4ade80', marginLeft: 'auto', whiteSpace: 'nowrap' }}>50 VUs · 1 min</span>
      </div>
    </div>
  )
}
