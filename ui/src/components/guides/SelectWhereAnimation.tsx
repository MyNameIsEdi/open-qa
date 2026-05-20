const css = `
  @keyframes qa-rowIn    { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-fadeOut  { from{opacity:1} to{opacity:.18} }
  @keyframes qa-queryIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
`

const ROWS = [
  { id: 1, name: 'Alice',   status: 'failed',  amount: 250,  match: true  },
  { id: 2, name: 'Bob',     status: 'success', amount: 80,   match: false },
  { id: 3, name: 'Carol',   status: 'failed',  amount: 540,  match: true  },
  { id: 4, name: 'Dan',     status: 'pending', amount: 120,  match: false },
  { id: 5, name: 'Eve',     status: 'failed',  amount: 910,  match: true  },
]

export function SelectWhereAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Query */}
      <div style={{
        animation: 'qa-queryIn .4s ease .1s both',
        background: '#1e293b', borderRadius: 10, padding: '10px 14px',
        fontFamily: 'monospace', fontSize: 11.5,
      }}>
        <span style={{ color: '#93c5fd' }}>SELECT</span>
        <span style={{ color: '#e2e8f0' }}> id, name, amount</span>
        <br />
        <span style={{ color: '#93c5fd' }}>FROM</span>
        <span style={{ color: '#fde68a' }}> orders</span>
        <br />
        <span style={{ color: '#93c5fd' }}>WHERE</span>
        <span style={{ color: '#86efac' }}> status </span>
        <span style={{ color: '#e2e8f0' }}>= </span>
        <span style={{ color: '#fca5a5' }}>'failed'</span>
        <span style={{ color: '#94a3b8' }}>;</span>
      </div>

      {/* Table with WHERE filter highlight */}
      <div style={{ borderRadius: 9, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 70px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['id', 'name', 'status', 'amount'].map(h => (
            <div key={h} style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {ROWS.map((r, i) => (
          <div key={r.id} style={{
            animation: `qa-rowIn .35s ease ${i * 0.15 + 0.4}s both`,
            display: 'grid', gridTemplateColumns: '36px 1fr 80px 70px',
            background: r.match ? '#f0fdf4' : 'white',
            borderBottom: i < ROWS.length - 1 ? '1px solid #f1f5f9' : 'none',
            opacity: 1,
            filter: r.match ? 'none' : 'opacity(0.35)',
            transition: 'filter .3s ease',
          }}>
            <div style={{ padding: '5px 8px', fontSize: 10, color: '#94a3b8' }}>{r.id}</div>
            <div style={{ padding: '5px 8px', fontSize: 10, color: '#1f2937', fontWeight: r.match ? 600 : 400 }}>{r.name}</div>
            <div style={{ padding: '5px 8px' }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                background: r.status === 'failed' ? '#fee2e2' : r.status === 'success' ? '#dcfce7' : '#fef9c3',
                color: r.status === 'failed' ? '#dc2626' : r.status === 'success' ? '#16a34a' : '#ca8a04',
              }}>{r.status}</span>
            </div>
            <div style={{ padding: '5px 8px', fontSize: 10, color: r.match ? '#15803d' : '#94a3b8', fontWeight: r.match ? 700 : 400 }}>
              ${r.amount}
            </div>
          </div>
        ))}
      </div>

      {/* Result note */}
      <div style={{
        animation: 'qa-queryIn .38s ease 1.4s both',
        padding: '6px 12px', borderRadius: 8,
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        fontSize: 10.5, color: '#166534',
      }}>
        ✓ 3 rows match <code style={{ fontFamily: 'monospace' }}>status = 'failed'</code> — QA use case: find all failed orders
      </div>
    </div>
  )
}
