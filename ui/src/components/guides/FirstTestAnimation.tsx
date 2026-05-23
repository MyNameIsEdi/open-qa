const css = `
  @keyframes qa-codeLine { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-label    { from{opacity:0;transform:translateY(6px)}   to{opacity:1;transform:translateY(0)} }
`;

const PARTS = [
  {
    code: "test('Page title is correct', async ({ page }) => {",
    label: '① Name the test scenario',
    labelColor: '#818cf8',
    delay: 0.1,
  },
  {
    code: "  await page.goto('https://playwright.dev/');",
    label: '② Navigate to the URL',
    labelColor: '#34d399',
    delay: 0.7,
  },
  {
    code: "  await page.getByRole('link', { name: 'Get started' }).click();",
    label: '③ Interact with the page',
    labelColor: '#fbbf24',
    delay: 1.3,
  },
  {
    code: '  await expect(page).toHaveTitle(/Getting started/);',
    label: '④ Assert the expected result',
    labelColor: '#f87171',
    delay: 1.9,
  },
  {
    code: '});',
    label: '',
    labelColor: '',
    delay: 2.5,
  },
];

export function FirstTestAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <style>{css}</style>

      {/* Code block */}
      <div
        style={{
          background: '#1e293b',
          borderRadius: 12,
          padding: '14px 16px',
          fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
          fontSize: 11,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ marginLeft: 6, fontSize: 9.5, color: '#475569' }}>first.spec.ts</span>
        </div>

        {PARTS.map((p, i) => (
          <div key={i} style={{ animation: `qa-codeLine .38s ease ${p.delay}s both` }}>
            <span style={{ color: i === 0 ? '#93c5fd' : i === 3 ? '#f9a8d4' : '#e2e8f0' }}>
              {p.code}
            </span>
          </div>
        ))}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
        {PARTS.filter((p) => p.label).map((p, i) => (
          <div
            key={i}
            style={{
              animation: `qa-label .35s ease ${p.delay + 0.3}s both`,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 10px',
              borderRadius: 8,
              background: p.labelColor + '18',
              border: `1px solid ${p.labelColor}44`,
            }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 700, color: p.labelColor }}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
