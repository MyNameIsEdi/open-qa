const css = `
  @keyframes qa-row { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes qa-ico { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.3);opacity:1} 100%{transform:scale(1);opacity:1} }
`;

const ROWS = [
  { label: 'Regression tests', ok: true, note: 'Run every deploy — ROI in days', delay: 0.1 },
  { label: 'Smoke tests', ok: true, note: 'Fast safety net after each build', delay: 0.45 },
  {
    label: 'Multi-browser checks',
    ok: true,
    note: 'Playwright runs Chromium, Firefox, WebKit',
    delay: 0.8,
  },
  {
    label: 'Exploratory testing',
    ok: false,
    note: 'Needs human curiosity & judgment',
    delay: 1.15,
  },
  { label: 'One-time test', ok: false, note: 'Manual is faster — skip automation', delay: 1.5 },
];

export function WhenToAutomateAnimation() {
  return (
    <div className="w-full">
      <style>{css}</style>
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        Automation Decision Matrix
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {ROWS.map((r) => (
          <div
            key={r.label}
            style={{
              animation: `qa-row .42s ease ${r.delay}s both`,
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 13px',
              borderRadius: 11,
              background: r.ok ? '#f0fdf4' : '#fff1f2',
              border: `1.5px solid ${r.ok ? '#bbf7d0' : '#fecdd3'}`,
            }}
          >
            <span
              style={{
                fontSize: 20,
                display: 'block',
                animation: `qa-ico .35s ease ${r.delay + 0.28}s both`,
              }}
            >
              {r.ok ? '✅' : '❌'}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                {r.label}
              </p>
              <p style={{ fontSize: 10.5, color: '#6b7280', margin: '2px 0 0' }}>{r.note}</p>
            </div>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                background: r.ok ? '#dcfce7' : '#fee2e2',
                color: r.ok ? '#16a34a' : '#dc2626',
              }}
            >
              {r.ok ? 'AUTOMATE' : 'MANUAL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
