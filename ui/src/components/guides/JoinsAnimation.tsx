const css = `
  @keyframes qa-joinIn { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
  @keyframes qa-rowIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
`

const JOIN_TYPES = [
  {
    name: 'INNER JOIN',
    desc: 'Only matching rows from both tables',
    leftFill: 'rgba(59,130,246,.15)', rightFill: 'rgba(34,197,94,.15)', midFill: '#6366f1',
    color: '#6366f1', delay: 0.1,
    rows: [
      { left: 'order #1', right: 'iPhone 15', note: '✓ match' },
      { left: 'order #3', right: 'MacBook',   note: '✓ match' },
    ],
    note: 'QA: verify all orders have a valid product',
  },
  {
    name: 'LEFT JOIN',
    desc: 'All left rows + match if exists (NULL if not)',
    leftFill: '#3b82f6', rightFill: 'rgba(34,197,94,.15)', midFill: '#3b82f6',
    color: '#3b82f6', delay: 0.5,
    rows: [
      { left: 'order #1', right: 'iPhone 15',  note: '✓' },
      { left: 'order #2', right: 'NULL',        note: '⚠️ orphan' },
      { left: 'order #3', right: 'MacBook',     note: '✓' },
    ],
    note: 'QA: find orders with no matching product (data integrity bug)',
  },
]

export function JoinsAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{css}</style>

      {JOIN_TYPES.map(j => (
        <div key={j.name} style={{ animation: `qa-joinIn .4s ease ${j.delay}s both` }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {/* Mini Venn */}
            <div style={{ position: 'relative', width: 64, height: 36, flexShrink: 0 }}>
              <div style={{
                position: 'absolute', left: 2, top: 3, width: 32, height: 30, borderRadius: '50%',
                background: j.leftFill, border: `2px solid ${j.color}`,
              }} />
              <div style={{
                position: 'absolute', left: 18, top: 3, width: 32, height: 30, borderRadius: '50%',
                background: j.rightFill, border: '2px solid #22c55e',
              }} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: j.color, margin: 0 }}>{j.name}</p>
              <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{j.desc}</p>
            </div>
          </div>

          {/* Result rows */}
          <div style={{ borderRadius: 9, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['orders', 'products', ''].map((h, i) => (
                <div key={i} style={{ padding: '4px 9px', fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {j.rows.map((r, i) => (
              <div key={i} style={{
                animation: `qa-rowIn .3s ease ${j.delay + i * 0.15 + 0.25}s both`,
                display: 'grid', gridTemplateColumns: '1fr 1fr 80px',
                background: r.right === 'NULL' ? '#fff7ed' : 'white',
                borderBottom: i < j.rows.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{ padding: '5px 9px', fontSize: 10, color: '#374151' }}>{r.left}</div>
                <div style={{ padding: '5px 9px', fontSize: 10, fontFamily: 'monospace', color: r.right === 'NULL' ? '#ef4444' : '#374151', fontWeight: r.right === 'NULL' ? 700 : 400 }}>{r.right}</div>
                <div style={{ padding: '5px 9px', fontSize: 9.5, color: r.right === 'NULL' ? '#f97316' : '#16a34a' }}>{r.note}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 9.5, color: '#6b7280', margin: 0, fontStyle: 'italic' }}>💡 {j.note}</p>
        </div>
      ))}
    </div>
  )
}
