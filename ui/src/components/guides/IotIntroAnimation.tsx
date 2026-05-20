const css = `
  @keyframes qa-devIn  { from{opacity:0;transform:scale(.8) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes qa-tagIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.4)} 50%{box-shadow:0 0 0 6px rgba(251,191,36,0)} }
`

const DEVICES = [
  {
    icon: '🏧', name: 'ATM',           delay: 0.1,
    tests: ['PIN validation', 'Transaction integrity', 'Timeout / session expiry'],
    color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
  },
  {
    icon: '🚦', name: 'Traffic Light',  delay: 0.45,
    tests: ['Signal timing accuracy', 'Fail-safe on power loss', 'Safety-critical states'],
    color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0',
  },
  {
    icon: '🧊', name: 'Smart Fridge',   delay: 0.80,
    tests: ['Simulated temperature sensor', 'Firmware OTA update', 'Connectivity loss handling'],
    color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff',
  },
]

const CHALLENGES = [
  { icon: '🔌', text: 'No browser — test via serial / JTAG', delay: 1.2 },
  { icon: '⏱️', text: 'Deterministic timing — ms matter',    delay: 1.45 },
  { icon: '🧪', text: 'Simulate sensors (MQTT, HIL rigs)',    delay: 1.70 },
  { icon: '🛡️', text: 'Safety-critical: bugs can harm people', delay: 1.95 },
]

export function IotIntroAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Device cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DEVICES.map(d => (
          <div key={d.name} style={{
            animation: `qa-devIn .4s ease ${d.delay}s both`,
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: d.bg, border: `1.5px solid ${d.border}`,
            borderRadius: 11, padding: '10px 13px',
          }}>
            <span style={{ fontSize: 28, lineHeight: 1, marginTop: 2 }}>{d.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: d.color, margin: '0 0 5px' }}>{d.name}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {d.tests.map((t, i) => (
                  <span key={i} style={{
                    animation: `qa-tagIn .3s ease ${d.delay + i * 0.15 + 0.2}s both`,
                    fontSize: 9.5, padding: '2px 8px', borderRadius: 99,
                    background: d.color + '18', border: `1px solid ${d.color}44`,
                    color: d.color, fontWeight: 500,
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <p style={{
        animation: 'qa-devIn .35s ease 1.1s both',
        fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
      }}>
        What makes IoT testing hard ↓
      </p>

      {/* Challenge list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {CHALLENGES.map((c, i) => (
          <div key={i} style={{
            animation: `qa-tagIn .35s ease ${c.delay}s both`,
            display: 'flex', alignItems: 'flex-start', gap: 7,
            padding: '8px 10px', borderRadius: 9,
            background: 'var(--bg-body)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            <p style={{ fontSize: 10, color: '#374151', margin: 0, lineHeight: 1.4 }}>{c.text}</p>
          </div>
        ))}
      </div>

      {/* Watchdog note */}
      <div style={{
        animation: 'qa-devIn .38s ease 2.2s both',
        padding: '7px 13px', borderRadius: 9,
        background: '#fef9c3', border: '1px solid #fde047',
        fontSize: 10.5, color: '#854d0e',
      }}>
        ⏰ <strong>Watchdog timer</strong> — if firmware hangs, the device resets itself. QA must test this failsafe.
      </div>
    </div>
  )
}
