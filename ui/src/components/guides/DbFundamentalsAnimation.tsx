const css = `
  @keyframes qa-tblIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-lineIn { from{opacity:0;stroke-dashoffset:120} to{opacity:1;stroke-dashoffset:0} }
`

export function DbFundamentalsAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* ERD diagram */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* users table */}
        <div style={{
          animation: 'qa-tblIn .4s ease .1s both',
          border: '2px solid #3b82f6', borderRadius: 10, overflow: 'hidden', minWidth: 130, flex: 1,
        }}>
          <div style={{ background: '#3b82f6', padding: '5px 10px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', margin: 0 }}>👤 users</p>
          </div>
          {[
            { col: '🔑 id',    note: 'PRIMARY KEY', bold: true },
            { col: 'name',     note: 'VARCHAR(100)' },
            { col: 'email',    note: 'VARCHAR(255)' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 10px', borderTop: '1px solid #eff6ff',
              background: i === 0 ? '#eff6ff' : 'white',
            }}>
              <span style={{ fontSize: 10, fontWeight: r.bold ? 700 : 400, color: r.bold ? '#1d4ed8' : '#374151' }}>{r.col}</span>
              <span style={{ fontSize: 8.5, color: '#94a3b8', fontFamily: 'monospace' }}>{r.note}</span>
            </div>
          ))}
        </div>

        {/* FK arrow */}
        <div style={{ animation: 'qa-tblIn .4s ease .6s both', padding: '0 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>1</div>
          <div style={{ fontSize: 18, color: '#cbd5e1' }}>⟶</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>N</div>
        </div>

        {/* orders table */}
        <div style={{
          animation: 'qa-tblIn .4s ease .4s both',
          border: '2px solid #22c55e', borderRadius: 10, overflow: 'hidden', minWidth: 130, flex: 1,
        }}>
          <div style={{ background: '#22c55e', padding: '5px 10px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', margin: 0 }}>📦 orders</p>
          </div>
          {[
            { col: '🔑 id',      note: 'PRIMARY KEY', bold: true },
            { col: '🔗 user_id', note: 'FOREIGN KEY',  fk: true  },
            { col: 'amount',     note: 'DECIMAL(10,2)' },
            { col: 'status',     note: 'VARCHAR(20)' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 10px', borderTop: '1px solid #f0fdf4',
              background: r.fk ? '#fefce8' : i === 0 ? '#f0fdf4' : 'white',
            }}>
              <span style={{ fontSize: 10, fontWeight: r.bold || r.fk ? 700 : 400, color: r.fk ? '#854d0e' : r.bold ? '#15803d' : '#374151' }}>{r.col}</span>
              <span style={{ fontSize: 8.5, color: r.fk ? '#ca8a04' : '#94a3b8', fontFamily: 'monospace' }}>{r.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FK explanation */}
      <div style={{
        animation: 'qa-tblIn .38s ease 0.9s both',
        padding: '7px 12px', borderRadius: 9,
        background: '#fefce8', border: '1px solid #fde047', fontSize: 10.5, color: '#854d0e',
      }}>
        🔗 <strong>user_id</strong> in orders points to <strong>id</strong> in users — one user can have many orders (1:N)
      </div>

      {/* Relational vs NoSQL */}
      <div style={{ display: 'flex', gap: 7 }}>
        {[
          { label: 'Relational (SQL)',  icon: '📋', desc: 'Tables, rows, strict schema', color: '#3b82f6', delay: 1.1 },
          { label: 'NoSQL',             icon: '📄', desc: 'Documents, flexible schema',  color: '#a855f7', delay: 1.3 },
        ].map(t => (
          <div key={t.label} style={{
            animation: `qa-tblIn .35s ease ${t.delay}s both`,
            flex: 1, padding: '8px 11px', borderRadius: 9,
            background: t.color + '10', border: `1.5px solid ${t.color}33`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: t.color, margin: '0 0 3px' }}>{t.icon} {t.label}</p>
            <p style={{ fontSize: 9.5, color: '#6b7280', margin: 0 }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
