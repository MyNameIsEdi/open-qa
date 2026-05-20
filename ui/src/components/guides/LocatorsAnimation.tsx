const css = `
  @keyframes qa-loc  { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-bar  { from{width:0} to{width:var(--w)} }
`

const LOCATORS = [
  { rank: 1, name: 'getByRole()',    example: "getByRole('button', { name: 'Submit' })", bar: '100%', color: '#22c55e', star: '★★★★★', tip: 'Best — semantic & resilient' },
  { rank: 2, name: 'getByLabel()',   example: "getByLabel('Email address')",              bar:  '80%', color: '#84cc16', star: '★★★★☆', tip: 'Great for form inputs'       },
  { rank: 3, name: 'getByTestId()',  example: "getByTestId('login-btn')",                 bar:  '60%', color: '#eab308', star: '★★★☆☆', tip: 'Add data-testid in HTML'    },
  { rank: 4, name: 'getByText()',    example: "getByText('Sign in')",                     bar:  '40%', color: '#f97316', star: '★★☆☆☆', tip: 'OK — breaks on text change' },
  { rank: 5, name: 'locator(css)',   example: "locator('.btn-primary > span')",           bar:  '20%', color: '#ef4444', star: '★☆☆☆☆', tip: 'Avoid — breaks on redesign' },
]

export function LocatorsAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <style>{css}</style>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px',
        textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Locator priority — use in this order ↓
      </p>

      {LOCATORS.map((l, i) => (
        <div
          key={l.rank}
          style={{ animation: `qa-loc .4s ease ${i * 0.3 + 0.1}s both` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: l.color, width: 14 }}>{l.rank}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1f2937', flex: 1 }}>{l.name}</span>
            <span style={{ fontSize: 10, color: l.color, letterSpacing: '-1px' }}>{l.star}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, marginLeft: 22, marginBottom: 3 }}>
            <div style={{
              height: '100%', borderRadius: 99, background: l.color,
              width: l.bar, animation: `qa-bar .5s ease ${i * 0.3 + 0.4}s both`,
              ['--w' as string]: l.bar,
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 22 }}>
            <code style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{l.example}</code>
            <span style={{ fontSize: 9.5, color: l.color, fontStyle: 'italic', marginLeft: 8, whiteSpace: 'nowrap' }}>{l.tip}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
