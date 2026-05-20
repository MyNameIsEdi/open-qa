const css = `
  @keyframes qa-reqIn  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keytml qa-resIn  { from{opacity:0;transform:translateX(20px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes qa-resIn  { from{opacity:0;transform:translateX(20px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes qa-arrowPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
`

const VERBS = [
  {
    method: 'GET',    color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
    url:    '/api/users',
    code:   'const res = await request.get("/api/users")',
    status: 200, statusLabel: 'OK', statusColor: '#22c55e',
    desc:   'Fetch a list of resources',
    delay: 0.1,
  },
  {
    method: 'POST',   color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0',
    url:    '/api/users',
    code:   'const res = await request.post("/api/users", { data })',
    status: 201, statusLabel: 'Created', statusColor: '#22c55e',
    desc:   'Create a new resource',
    delay: 0.55,
  },
  {
    method: 'DELETE', color: '#ef4444', bg: '#fff1f2', border: '#fecdd3',
    url:    '/api/users/42',
    code:   'const res = await request.delete("/api/users/42")',
    status: 404, statusLabel: 'Not Found', statusColor: '#ef4444',
    desc:   'Remove a resource (assert 404 after)',
    delay: 1.0,
  },
]

export function ApiPlaywrightAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Header */}
      <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', margin: 0,
        textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        REST Verbs — Playwright request fixture
      </p>

      {VERBS.map(v => (
        <div key={v.method} style={{
          animation: `qa-reqIn .4s ease ${v.delay}s both`,
          background: v.bg, border: `1.5px solid ${v.border}`,
          borderRadius: 11, padding: '10px 13px',
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {/* Top row: method + url + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
              background: v.color, color: '#fff', letterSpacing: '0.04em',
            }}>{v.method}</span>
            <code style={{ fontSize: 11, color: '#374151', flex: 1 }}>{v.url}</code>
            <span style={{ fontSize: 10, fontWeight: 700, color: v.statusColor }}>
              {v.status} {v.statusLabel}
            </span>
          </div>

          {/* Code line */}
          <code style={{
            fontSize: 10, color: '#475569',
            background: '#0f172a18', padding: '4px 8px', borderRadius: 6,
            fontFamily: 'monospace', display: 'block',
          }}>{v.code}</code>

          <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{v.desc}</p>
        </div>
      ))}

      {/* Bottom note */}
      <div style={{
        animation: 'qa-reqIn .4s ease 1.5s both',
        padding: '6px 12px', borderRadius: 9,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        fontSize: 10.5, color: '#475569', textAlign: 'center',
      }}>
        ⚡ API tests are ~10× faster than UI tests — no browser needed
      </div>
    </div>
  )
}
