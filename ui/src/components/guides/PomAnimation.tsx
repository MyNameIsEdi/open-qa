const css = `
  @keyframes qa-fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-slideR  { from{opacity:0;transform:translateX(18px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes qa-arrow   { from{opacity:0;transform:scale(.5)}         to{opacity:1;transform:scale(1)} }
`;

const BEFORE_TESTS = [
  "login.spec.ts  → '#email', '#password', '.btn'",
  "checkout.spec.ts → '#email', '#password', '.btn'",
  "profile.spec.ts  → '#email', '#password', '.btn'",
];

const POM_CLASS = [
  'class LoginPage {',
  "  goto()  { page.goto('/login') }",
  '  login() { /* fill + click */ }',
  '}',
];

const AFTER_TESTS = [
  'login.spec.ts    → loginPage.login()',
  'checkout.spec.ts → loginPage.login()',
  'profile.spec.ts  → loginPage.login()',
];

export function PomAnimation() {
  return (
    <div>
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 10.5,
            fontWeight: 700,
            color: '#ef4444',
            animation: 'qa-fadeIn .4s ease .1s both',
          }}
        >
          ❌ Without POM
        </div>
        <div style={{ width: 24 }} />
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 10.5,
            fontWeight: 700,
            color: '#22c55e',
            animation: 'qa-fadeIn .4s ease .1s both',
          }}
        >
          ✅ With POM
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Before */}
        <div
          style={{
            flex: 1,
            background: '#fff1f2',
            border: '1.5px solid #fecdd3',
            borderRadius: 10,
            padding: '10px 12px',
          }}
        >
          {BEFORE_TESTS.map((t, i) => (
            <div
              key={i}
              style={{
                animation: `qa-fadeIn .35s ease ${i * 0.2 + 0.2}s both`,
                fontSize: 9.5,
                fontFamily: 'monospace',
                color: '#9f1239',
                marginBottom: 5,
                lineHeight: 1.5,
              }}
            >
              {t}
            </div>
          ))}
          <div
            style={{
              animation: 'qa-fadeIn .35s ease .9s both',
              fontSize: 9,
              color: '#be123c',
              marginTop: 4,
              fontStyle: 'italic',
            }}
          >
            ↑ selector duplicated 3×
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30 }}
        >
          <div style={{ animation: 'qa-arrow .4s ease 1.1s both', fontSize: 18 }}>→</div>
        </div>

        {/* After */}
        <div style={{ flex: 1 }}>
          {/* POM class */}
          <div
            style={{
              animation: 'qa-slideR .4s ease 1.3s both',
              background: '#1e293b',
              borderRadius: 9,
              padding: '8px 11px',
              marginBottom: 7,
              fontFamily: 'monospace',
              fontSize: 9.5,
            }}
          >
            {POM_CLASS.map((l, i) => (
              <div key={i} style={{ color: i === 0 ? '#93c5fd' : '#94a3b8' }}>
                {l}
              </div>
            ))}
          </div>
          {/* Tests using POM */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            {AFTER_TESTS.map((t, i) => (
              <div
                key={i}
                style={{
                  animation: `qa-slideR .35s ease ${i * 0.18 + 1.6}s both`,
                  fontSize: 9.5,
                  fontFamily: 'monospace',
                  color: '#166534',
                  marginBottom: 5,
                  lineHeight: 1.5,
                }}
              >
                {t}
              </div>
            ))}
            <div
              style={{
                animation: 'qa-slideR .35s ease 2.2s both',
                fontSize: 9,
                color: '#15803d',
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              ↑ one place to update
            </div>
          </div>
        </div>
      </div>

      {/* Takeaway */}
      <div
        style={{
          animation: 'qa-fadeIn .4s ease 2.5s both',
          marginTop: 10,
          padding: '7px 12px',
          borderRadius: 9,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          fontSize: 10.5,
          color: '#1e40af',
          textAlign: 'center',
        }}
      >
        🎮 POM = TV remote — one place for all controls
      </div>
    </div>
  );
}
