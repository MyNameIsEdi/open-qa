const css = `
  @keyframes qa-stageIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-arrowIn  { from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }
  @keyframes qa-checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
`;

const PIPELINE = [
  { icon: '💻', label: 'Code Push', color: '#6366f1', delay: 0.1 },
  { icon: '🔨', label: 'Build', color: '#3b82f6', delay: 0.4 },
  { icon: '🧪', label: 'Test', color: '#22c55e', delay: 0.7 },
  { icon: '🚀', label: 'Deploy', color: '#f97316', delay: 1.0 },
];

const TEST_HOOKS = [
  { stage: 'On PR open', type: 'Smoke tests', color: '#22c55e', delay: 1.4 },
  { stage: 'On merge to main', type: 'Full regression', color: '#3b82f6', delay: 1.65 },
  { stage: 'On deploy', type: 'Sanity / E2E', color: '#f97316', delay: 1.9 },
];

const WORKFLOW_LINES = [
  { text: 'on: [push, pull_request]', color: '#94a3b8' },
  { text: 'jobs:', color: '#94a3b8' },
  { text: '  test:', color: '#fde68a' },
  { text: '    runs-on: ubuntu-latest', color: '#e2e8f0' },
  { text: '    steps:', color: '#94a3b8' },
  { text: '      - uses: actions/checkout@v4', color: '#86efac' },
  { text: '      - run: npx playwright test', color: '#86efac' },
  { text: '      - uses: actions/upload-artifact', color: '#86efac' },
];

export function DevOpsQaAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* CI/CD Pipeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {PIPELINE.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              style={{
                animation: `qa-stageIn .4s ease ${s.delay}s both`,
                flex: 1,
                textAlign: 'center',
                padding: '10px 4px',
                background: s.color + '15',
                border: `1.5px solid ${s.color}44`,
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: s.color, margin: '3px 0 0' }}>
                {s.label}
              </p>
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                style={{
                  animation: `qa-arrowIn .3s ease ${s.delay + 0.25}s both`,
                  fontSize: 14,
                  color: '#cbd5e1',
                  padding: '0 3px',
                  transformOrigin: 'left',
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Where tests plug in */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          Where tests plug in
        </p>
        {TEST_HOOKS.map((h) => (
          <div
            key={h.stage}
            style={{
              animation: `qa-stageIn .35s ease ${h.delay}s both`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 11px',
              borderRadius: 9,
              background: h.color + '10',
              border: `1.5px solid ${h.color}33`,
            }}
          >
            <span
              style={{
                animation: `qa-checkPop .35s ease ${h.delay + 0.2}s both`,
                fontSize: 14,
              }}
            >
              ✅
            </span>
            <span style={{ fontSize: 10.5, color: '#374151', flex: 1 }}>
              <strong>{h.stage}</strong> → {h.type}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 99,
                background: h.color,
                color: '#fff',
              }}
            >
              {h.type.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* GitHub Actions snippet */}
      <div
        style={{
          animation: 'qa-stageIn .38s ease 2.1s both',
          background: '#0f172a',
          borderRadius: 10,
          padding: '10px 13px',
          fontFamily: 'monospace',
          fontSize: 9.5,
        }}
      >
        <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ fontSize: 9, color: '#475569', marginLeft: 4 }}>
            .github/workflows/test.yml
          </span>
        </div>
        {WORKFLOW_LINES.map((l, i) => (
          <div key={i} style={{ color: l.color, lineHeight: 1.7 }}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
