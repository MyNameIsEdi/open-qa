const css = `
  @keyframes qa-groupIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-barW    { from{width:0} to{width:var(--w)} }
`;

const GROUPS = [
  { user: 'alice@test.com', count: 7, bar: '70%', fails: true, delay: 0.4 },
  { user: 'bob@test.com', count: 2, bar: '20%', fails: false, delay: 0.65 },
  { user: 'carol@test.com', count: 9, bar: '90%', fails: true, delay: 0.9 },
  { user: 'dan@test.com', count: 1, bar: '10%', fails: false, delay: 1.15 },
];

export function GroupHavingAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Query */}
      <div
        style={{
          animation: 'qa-groupIn .4s ease .1s both',
          background: '#1e293b',
          borderRadius: 10,
          padding: '10px 14px',
          fontFamily: 'monospace',
          fontSize: 11,
        }}
      >
        <span style={{ color: '#93c5fd' }}>SELECT</span>
        <span style={{ color: '#e2e8f0' }}> email, </span>
        <span style={{ color: '#86efac' }}>COUNT</span>
        <span style={{ color: '#e2e8f0' }}>(*) </span>
        <span style={{ color: '#94a3b8' }}>AS failed_logins</span>
        <br />
        <span style={{ color: '#93c5fd' }}>FROM</span>
        <span style={{ color: '#fde68a' }}> login_attempts</span>
        <br />
        <span style={{ color: '#93c5fd' }}>WHERE</span>
        <span style={{ color: '#fca5a5' }}> success </span>
        <span style={{ color: '#e2e8f0' }}>= 0</span>
        <br />
        <span style={{ color: '#93c5fd' }}>GROUP BY</span>
        <span style={{ color: '#fde68a' }}> email</span>
        <br />
        <span style={{ color: '#93c5fd' }}>HAVING</span>
        <span style={{ color: '#86efac' }}> COUNT</span>
        <span style={{ color: '#e2e8f0' }}>(*) </span>
        <span style={{ color: '#94a3b8' }}>&gt; 5</span>
        <span style={{ color: '#94a3b8' }}>;</span>
      </div>

      {/* WHERE vs HAVING note */}
      <div style={{ display: 'flex', gap: 7 }}>
        {[
          {
            label: 'WHERE',
            desc: 'Filters individual rows (before grouping)',
            color: '#f97316',
            delay: 0.2,
          },
          {
            label: 'HAVING',
            desc: 'Filters groups (after GROUP BY)',
            color: '#3b82f6',
            delay: 0.35,
          },
        ].map((t) => (
          <div
            key={t.label}
            style={{
              animation: `qa-groupIn .35s ease ${t.delay}s both`,
              flex: 1,
              padding: '7px 10px',
              borderRadius: 9,
              background: t.color + '12',
              border: `1.5px solid ${t.color}44`,
            }}
          >
            <code style={{ fontSize: 11, fontWeight: 800, color: t.color }}>{t.label}</code>
            <p style={{ fontSize: 9.5, color: '#6b7280', margin: '3px 0 0' }}>{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Group bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {GROUPS.map((g) => (
          <div key={g.user} style={{ animation: `qa-groupIn .38s ease ${g.delay}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <code style={{ fontSize: 10, color: '#374151' }}>{g.user}</code>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: g.fails ? '#dc2626' : '#16a34a',
                }}
              >
                {g.count} {g.fails ? '⚠️ >5' : '✓ ok'}
              </span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99 }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 99,
                  background: g.fails ? '#ef4444' : '#22c55e',
                  width: g.bar,
                  ['--w' as string]: g.bar,
                  animation: `qa-barW .5s ease ${g.delay + 0.2}s both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          animation: 'qa-groupIn .38s ease 1.5s both',
          padding: '6px 12px',
          borderRadius: 8,
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          fontSize: 10.5,
          color: '#9a3412',
        }}
      >
        🔍 QA use case: detect brute-force login attempts — alice & carol flagged
      </div>
    </div>
  );
}
