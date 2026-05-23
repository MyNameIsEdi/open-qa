const css = `
  @keyframes qa-pmIn   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-pmSlide{ from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-pmPass { 0%{width:0} 100%{width:100%} }
`;

const COLLECTION = [
  { name: '📁 Users API', indent: 0, delay: 0.1 },
  { name: '  GET  /users', indent: 1, delay: 0.35, method: 'GET', color: '#3b82f6' },
  { name: '  POST /users', indent: 1, delay: 0.55, method: 'POST', color: '#22c55e' },
  { name: '📁 Auth API', indent: 0, delay: 0.75 },
  { name: '  POST /login', indent: 1, delay: 0.95, method: 'POST', color: '#22c55e' },
];

const TEST_RESULTS = [
  { text: '✓  Status is 200', pass: true, delay: 1.6 },
  { text: '✓  Response has userId', pass: true, delay: 1.85 },
  { text: '✗  Token expires in 1h', pass: false, delay: 2.1 },
];

export function ApiPostmanAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <style>{css}</style>

      <div
        style={{
          border: '1.5px solid #e2e8f0',
          borderRadius: 13,
          overflow: 'hidden',
          animation: 'qa-pmIn .4s ease 0s both',
        }}
      >
        {/* Postman-style top bar */}
        <div
          style={{
            background: '#ef6c00',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13 }}>🟠</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Postman</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,.7)' }}>My Workspace</span>
        </div>

        <div style={{ display: 'flex', minHeight: 160 }}>
          {/* Left — Collections panel */}
          <div
            style={{
              width: 160,
              borderRight: '1px solid #e2e8f0',
              background: '#fafafa',
              padding: '10px 0',
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#94a3b8',
                padding: '0 12px 6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              Collections
            </p>
            {COLLECTION.map((c, i) => (
              <div
                key={i}
                style={{
                  animation: `qa-pmSlide .35s ease ${c.delay}s both`,
                  padding: '3px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {c.method && (
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: c.color, width: 28 }}>
                    {c.method}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 10,
                    color: c.method ? '#374151' : '#1f2937',
                    fontWeight: c.method ? 400 : 600,
                  }}
                >
                  {c.method ? c.name.trim().split(' ').slice(1).join(' ') : c.name}
                </span>
              </div>
            ))}
          </div>

          {/* Right — Request + Tests */}
          <div
            style={{
              flex: 1,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* URL bar */}
            <div
              style={{
                animation: 'qa-pmIn .4s ease 1.0s both',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: '#22c55e',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '3px 7px',
                  borderRadius: 5,
                }}
              >
                POST
              </span>
              <code
                style={{
                  flex: 1,
                  fontSize: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: '#374151',
                }}
              >
                {'{{baseUrl}}/api/login'}
              </code>
              <button
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  padding: '4px 10px',
                  cursor: 'default',
                }}
              >
                Send
              </button>
            </div>

            {/* Test script */}
            <div
              style={{
                animation: 'qa-pmIn .4s ease 1.25s both',
                background: '#1e293b',
                borderRadius: 7,
                padding: '7px 10px',
                fontFamily: 'monospace',
                fontSize: 9.5,
              }}
            >
              <div style={{ color: '#94a3b8', marginBottom: 2 }}>// Tests tab</div>
              <div style={{ color: '#86efac' }}>{'pm.test("Status is 200", () => {'}</div>
              <div style={{ color: '#e2e8f0' }}>{'  pm.expect(pm.response.code).to.eq(200)'}</div>
              <div style={{ color: '#86efac' }}>{'})'}</div>
            </div>

            {/* Test results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TEST_RESULTS.map((r, i) => (
                <div
                  key={i}
                  style={{
                    animation: `qa-pmIn .3s ease ${r.delay}s both`,
                    fontSize: 10,
                    fontWeight: r.pass ? 500 : 600,
                    color: r.pass ? '#16a34a' : '#dc2626',
                  }}
                >
                  {r.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newman badge */}
      <div
        style={{
          animation: 'qa-pmIn .4s ease 2.4s both',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 13px',
          borderRadius: 9,
          background: '#1e293b',
          border: '1px solid #334155',
        }}
      >
        <span style={{ fontSize: 14 }}>⚙️</span>
        <div>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Run in CI with Newman
          </p>
          <code style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'monospace' }}>
            newman run collection.json --env-var baseUrl=https://api.prod
          </code>
        </div>
      </div>
    </div>
  );
}
