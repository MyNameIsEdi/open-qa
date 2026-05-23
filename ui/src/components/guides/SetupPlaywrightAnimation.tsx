const css = `
  @keyframes qa-line { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes qa-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
`;

const LINES = [
  { text: '$ npm init playwright@latest', color: '#a3e635', bold: true, delay: 0.1 },
  { text: '✔  TypeScript?           → Yes', color: '#86efac', bold: false, delay: 0.8 },
  { text: '✔  Put your tests in:    tests/', color: '#86efac', bold: false, delay: 1.2 },
  { text: '✔  Add GitHub Actions?   → Yes', color: '#86efac', bold: false, delay: 1.6 },
  { text: '✔  Install browsers?     → Yes', color: '#86efac', bold: false, delay: 2.0 },
  { text: '   Downloading Chromium, Firefox, WebKit…', color: '#fbbf24', bold: false, delay: 2.5 },
  { text: '✓  Playwright is ready!  🎭', color: '#4ade80', bold: true, delay: 3.2 },
  { text: '   Run: npx playwright test', color: '#94a3b8', bold: false, delay: 3.6 },
];

export function SetupPlaywrightAnimation() {
  return (
    <div
      style={{
        background: '#0f172a',
        borderRadius: 14,
        padding: '16px 18px',
        fontFamily: "'JetBrains Mono', 'Fira Mono', 'Cascadia Code', monospace",
        fontSize: 11.5,
        lineHeight: 1.7,
      }}
    >
      <style>{css}</style>

      {/* Traffic lights */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 10, color: '#475569' }}>Terminal</span>
      </div>

      {LINES.map((l, i) => (
        <div
          key={i}
          style={{
            animation: `qa-line .35s ease ${l.delay}s both`,
            color: l.color,
            fontWeight: l.bold ? 700 : 400,
            whiteSpace: 'pre',
          }}
        >
          {l.text}
        </div>
      ))}

      {/* blinking cursor after last line */}
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 14,
          background: '#a3e635',
          marginTop: 2,
          animation: `qa-line .35s ease 3.7s both, qa-cursor 1s step-end 4s infinite`,
          verticalAlign: 'middle',
        }}
      />
    </div>
  );
}
