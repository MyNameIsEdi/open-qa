const css = `
  @keyframes qa-circIn  { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
  @keyframes qa-rowSort { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-labelIn { from{opacity:0} to{opacity:1} }
`

const SORTED_ROWS = [
  { name: 'Bug #88', priority: 'HIGH',   date: '2024-03-15', delay: 1.0 },
  { name: 'Bug #42', priority: 'HIGH',   date: '2024-03-10', delay: 1.2 },
  { name: 'Bug #17', priority: 'MEDIUM', date: '2024-03-08', delay: 1.4 },
]

export function AndOrOrderAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* AND vs OR Venn */}
      <div style={{ display: 'flex', gap: 10 }}>
        {/* AND */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AND — stricter</p>
          <div style={{ position: 'relative', height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              animation: 'qa-circIn .4s ease .1s both',
              position: 'absolute', left: '10%', width: 54, height: 54, borderRadius: '50%',
              background: '#bfdbfe', opacity: .75, border: '2px solid #3b82f6',
            }} />
            <div style={{
              animation: 'qa-circIn .4s ease .25s both',
              position: 'absolute', left: '30%', width: 54, height: 54, borderRadius: '50%',
              background: '#bbf7d0', opacity: .75, border: '2px solid #22c55e',
            }} />
            <div style={{
              animation: 'qa-labelIn .4s ease .6s both',
              position: 'absolute', left: '28%', fontSize: 9, fontWeight: 800, color: '#1f2937',
            }}>✓</div>
          </div>
          <code style={{ fontSize: 9.5, color: '#475569' }}>status='open' AND priority='HIGH'</code>
        </div>

        <div style={{ width: 1, background: '#e2e8f0', margin: '8px 0' }} />

        {/* OR */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#a855f7', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>OR — broader</p>
          <div style={{ position: 'relative', height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              animation: 'qa-circIn .4s ease .1s both',
              position: 'absolute', left: '8%', width: 54, height: 54, borderRadius: '50%',
              background: '#e9d5ff', border: '2px solid #a855f7',
            }} />
            <div style={{
              animation: 'qa-circIn .4s ease .25s both',
              position: 'absolute', left: '28%', width: 54, height: 54, borderRadius: '50%',
              background: '#fecdd3', border: '2px solid #f43f5e',
            }} />
            <div style={{
              animation: 'qa-labelIn .4s ease .6s both',
              position: 'absolute', left: '5%', fontSize: 9, fontWeight: 800, color: '#7e22ce',
            }}>✓</div>
            <div style={{
              animation: 'qa-labelIn .4s ease .7s both',
              position: 'absolute', right: '5%', fontSize: 9, fontWeight: 800, color: '#be123c',
            }}>✓</div>
          </div>
          <code style={{ fontSize: 9.5, color: '#475569' }}>status='open' OR status='pending'</code>
        </div>
      </div>

      {/* ORDER BY demo */}
      <div>
        <div style={{
          animation: 'qa-rowSort .35s ease .7s both',
          background: '#1e293b', borderRadius: '9px 9px 0 0', padding: '7px 12px',
          fontFamily: 'monospace', fontSize: 10.5,
        }}>
          <span style={{ color: '#93c5fd' }}>ORDER BY</span>
          <span style={{ color: '#fde68a' }}> priority</span>
          <span style={{ color: '#e2e8f0' }}>, created_at </span>
          <span style={{ color: '#93c5fd' }}>DESC</span>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 9px 9px', overflow: 'hidden' }}>
          {SORTED_ROWS.map((r, i) => (
            <div key={i} style={{
              animation: `qa-rowSort .35s ease ${r.delay}s both`,
              display: 'flex', gap: 10, padding: '6px 12px', alignItems: 'center',
              borderBottom: i < SORTED_ROWS.length - 1 ? '1px solid #f1f5f9' : 'none',
              background: i === 0 ? '#fef9c3' : 'white',
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', width: 16 }}>↑{i+1}</span>
              <span style={{ fontSize: 10.5, flex: 1, color: '#1f2937' }}>{r.name}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                background: r.priority === 'HIGH' ? '#fee2e2' : '#fef9c3',
                color: r.priority === 'HIGH' ? '#dc2626' : '#ca8a04',
              }}>{r.priority}</span>
              <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'monospace' }}>{r.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
