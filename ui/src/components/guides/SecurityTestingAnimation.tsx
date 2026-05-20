const css = `
  @keyframes qa-vulnIn  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-shieldIn{ from{opacity:0;transform:scale(.7) rotate(-10deg)} to{opacity:1;transform:scale(1) rotate(0)} }
`

const OWASP = [
  { rank: 'A01', name: 'Injection (SQL, XSS)',    icon: '💉', color: '#ef4444', delay: 0.10, qa: 'Test input fields with special chars' },
  { rank: 'A02', name: 'Broken Authentication',  icon: '🔐', color: '#f97316', delay: 0.35, qa: 'Try login with expired token' },
  { rank: 'A03', name: 'XSS',                    icon: '📜', color: '#eab308', delay: 0.60, qa: 'Submit <script>alert(1)</script>' },
  { rank: 'A05', name: 'Security Misconfiguration', icon: '⚙️', color: '#a855f7', delay: 0.85, qa: 'Check debug/stack trace in errors' },
  { rank: 'A07', name: 'IDOR / Broken Access',   icon: '🚪', color: '#6366f1', delay: 1.10, qa: 'Access /users/2 as user 1' },
]

const CHECKS = [
  { text: 'Error messages never expose stack traces', icon: '✅', delay: 1.4 },
  { text: 'Auth token required on every protected route', icon: '✅', delay: 1.6 },
  { text: '<script> in input field — sanitized, not executed', icon: '✅', delay: 1.8 },
]

export function SecurityTestingAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ animation: 'qa-shieldIn .5s ease .1s both', fontSize: 32 }}>🛡️</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', margin: 0 }}>OWASP Top 10 — QA Perspective</p>
          <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>Find security bugs before hackers do</p>
        </div>
      </div>

      {/* OWASP list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {OWASP.map(v => (
          <div key={v.rank} style={{
            animation: `qa-vulnIn .38s ease ${v.delay}s both`,
            display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 11px', borderRadius: 10,
            background: v.color + '0e', border: `1.5px solid ${v.color}33`,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{v.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 8.5, fontWeight: 800, padding: '1px 6px', borderRadius: 5,
                  background: v.color, color: '#fff' }}>{v.rank}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1f2937' }}>{v.name}</span>
              </div>
              <p style={{ fontSize: 9.5, color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
                QA check: {v.qa}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Basic checks */}
      <div style={{ borderRadius: 10, border: '1.5px solid #bbf7d0', overflow: 'hidden' }}>
        <div style={{ background: '#16a34a', padding: '5px 11px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0 }}>✓ Basic security checks every QA should run</p>
        </div>
        {CHECKS.map((c, i) => (
          <div key={i} style={{
            animation: `qa-vulnIn .35s ease ${c.delay}s both`,
            padding: '7px 11px', borderTop: i > 0 ? '1px solid #f0fdf4' : 'none',
            display: 'flex', gap: 7, alignItems: 'center', background: 'white',
          }}>
            <span style={{ fontSize: 13 }}>{c.icon}</span>
            <span style={{ fontSize: 10, color: '#374151' }}>{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
