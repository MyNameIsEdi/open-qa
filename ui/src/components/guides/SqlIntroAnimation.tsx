const css = `
  @keyframes qa-cabinetIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
  @keyframes qa-querySlide { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-rowPop { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`

const CRUD = [
  { op: 'CREATE', sql: 'INSERT INTO',  color: '#22c55e', delay: 1.2 },
  { op: 'READ',   sql: 'SELECT',       color: '#3b82f6', delay: 1.4 },
  { op: 'UPDATE', sql: 'UPDATE SET',   color: '#f97316', delay: 1.6 },
  { op: 'DELETE', sql: 'DELETE FROM',  color: '#ef4444', delay: 1.8 },
]

const ROWS = [
  { id: 1, name: 'Alice', email: 'alice@test.com', match: true  },
  { id: 2, name: 'Bob',   email: 'bob@test.com',   match: false },
  { id: 3, name: 'Carol', email: 'carol@test.com', match: true  },
]

export function SqlIntroAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Filing cabinet analogy */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          animation: 'qa-cabinetIn .45s ease .1s both',
          background: '#f1f5f9', border: '2px solid #cbd5e1',
          borderRadius: 10, padding: '12px 14px', textAlign: 'center', minWidth: 80,
        }}>
          <div style={{ fontSize: 32 }}>🗄️</div>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: '#475569', margin: '4px 0 0' }}>Database</p>
          <p style={{ fontSize: 9, color: '#94a3b8', margin: 0 }}>= filing cabinet</p>
        </div>

        <div style={{ animation: 'qa-querySlide .4s ease .5s both', flex: 1 }}>
          <div style={{
            background: '#1e293b', borderRadius: 9, padding: '10px 13px',
            fontFamily: 'monospace', fontSize: 11, marginBottom: 6,
          }}>
            <span style={{ color: '#93c5fd' }}>SELECT</span>
            <span style={{ color: '#e2e8f0' }}> name, email</span>
            <br />
            <span style={{ color: '#93c5fd' }}>FROM</span>
            <span style={{ color: '#fde68a' }}> users</span>
            <br />
            <span style={{ color: '#93c5fd' }}>WHERE</span>
            <span style={{ color: '#86efac' }}> id </span>
            <span style={{ color: '#e2e8f0' }}>= 1</span>
          </div>
          <p style={{ fontSize: 9.5, color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
            SQL = ask the filing cabinet a question in structured language
          </p>
        </div>
      </div>

      {/* Mini result table */}
      <div style={{ animation: 'qa-rowPop .4s ease .9s both', borderRadius: 9, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['id', 'name', 'email'].map(h => (
            <div key={h} style={{ padding: '5px 10px', fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {ROWS.map((r, i) => (
          <div key={r.id} style={{
            animation: `qa-rowPop .3s ease ${1.0 + i * 0.15}s both`,
            display: 'grid', gridTemplateColumns: '40px 1fr 1fr',
            background: r.match ? '#f0fdf4' : 'white',
            borderBottom: i < ROWS.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}>
            <div style={{ padding: '5px 10px', fontSize: 10, color: '#94a3b8' }}>{r.id}</div>
            <div style={{ padding: '5px 10px', fontSize: 10, color: '#1f2937', fontWeight: 500 }}>{r.name}</div>
            <div style={{ padding: '5px 10px', fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{r.email}</div>
          </div>
        ))}
      </div>

      {/* CRUD row */}
      <div style={{ display: 'flex', gap: 6 }}>
        {CRUD.map(c => (
          <div key={c.op} style={{
            animation: `qa-querySlide .35s ease ${c.delay}s both`,
            flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 9,
            background: c.color + '15', border: `1.5px solid ${c.color}44`,
          }}>
            <p style={{ fontSize: 9.5, fontWeight: 800, color: c.color, margin: '0 0 2px' }}>{c.op}</p>
            <code style={{ fontSize: 8.5, color: '#6b7280' }}>{c.sql}</code>
          </div>
        ))}
      </div>
    </div>
  )
}
