const css = `
  @keyframes qa-msgIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-dotPulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
`

const CONVERSATION = [
  {
    role: 'user', delay: 0.1,
    text: 'Write a Playwright test that logs in with email "qa@test.com" and password "pass123", then asserts the dashboard title.',
  },
  {
    role: 'claude', delay: 0.7,
    text: `test('login and check dashboard', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill('qa@test.com');\n  await page.getByLabel('Password').fill('pass123');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page).toHaveTitle(/Dashboard/);\n});`,
    isCode: true,
  },
]

const USE_CASES = [
  { icon: '✍️', text: 'Generate test cases from requirements', delay: 1.6 },
  { icon: '🔍', text: 'Explain confusing error messages',       delay: 1.8 },
  { icon: '🗄️', text: 'Write SQL queries for data validation',  delay: 2.0 },
  { icon: '⚠️', text: 'Always run & verify generated tests',    delay: 2.2, warn: true },
]

export function AiTestingAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Chat window */}
      <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 13, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#7c3aed', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Claude — AI QA Assistant</span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fafaf9' }}>
          {CONVERSATION.map((m, i) => (
            <div key={i} style={{
              animation: `qa-msgIn .4s ease ${m.delay}s both`,
              display: 'flex', gap: 8,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{m.role === 'user' ? '👤' : '🤖'}</span>
              <div style={{
                maxWidth: '85%', padding: m.isCode ? '8px 11px' : '8px 11px',
                borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                background: m.role === 'user' ? '#7c3aed' : m.isCode ? '#1e293b' : '#fff',
                border: m.isCode ? 'none' : '1px solid #e2e8f0',
              }}>
                {m.isCode ? (
                  <pre style={{
                    margin: 0, fontSize: 9.5, fontFamily: 'monospace',
                    color: '#86efac', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                  }}>{m.text}</pre>
                ) : (
                  <p style={{ fontSize: 10.5, margin: 0, color: m.role === 'user' ? '#fff' : '#374151', lineHeight: 1.5 }}>{m.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use case chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {USE_CASES.map((u, i) => (
          <div key={i} style={{
            animation: `qa-msgIn .35s ease ${u.delay}s both`,
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 9,
            background: u.warn ? '#fff7ed' : 'var(--bg-body)',
            border: `1px solid ${u.warn ? '#fed7aa' : 'var(--border)'}`,
          }}>
            <span style={{ fontSize: 14 }}>{u.icon}</span>
            <span style={{ fontSize: 10.5, color: u.warn ? '#9a3412' : '#374151', fontWeight: u.warn ? 700 : 400 }}>{u.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
