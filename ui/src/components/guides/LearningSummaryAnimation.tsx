const css = `
  @keyframes qa-checkIn  { from{opacity:0;transform:scale(0) rotate(-30deg)} 70%{transform:scale(1.2) rotate(4deg)} to{opacity:1;transform:scale(1) rotate(0)} }
  @keyframes qa-rowIn    { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes qa-confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(-8px) rotate(15deg)} }
  @keyframes qa-fadeIn   { from{opacity:0} to{opacity:1} }
`;

const MODULES_DONE = [
  { icon: '🎓', label: 'Welcome & QA Foundations', delay: 0.1 },
  { icon: '🤖', label: 'Automation Testing with Playwright', delay: 0.28 },
  { icon: '🌐', label: 'API Testing — Playwright & Postman', delay: 0.46 },
  { icon: '⚡', label: 'Load, Stress & Soak Testing (k6)', delay: 0.64 },
  { icon: '🔧', label: 'Hardware-Integrated & IoT Systems', delay: 0.82 },
  { icon: '🗄️', label: 'SQL for QA — SELECT to JOINs', delay: 1.0 },
  { icon: '🧠', label: 'AI, DevOps & Cybersecurity', delay: 1.18 },
  { icon: '🏁', label: 'Interview Prep & Next Steps', delay: 1.36 },
];

const NEXT_30 = [
  {
    day: 'Week 1',
    task: 'Write a Playwright test suite for a live website',
    color: '#3b82f6',
    delay: 1.6,
  },
  {
    day: 'Week 2',
    task: 'Build & run an API test collection in Postman',
    color: '#22c55e',
    delay: 1.85,
  },
  {
    day: 'Week 3',
    task: 'Write 10 QA SQL queries against a real database',
    color: '#f97316',
    delay: 2.1,
  },
  {
    day: 'Week 4',
    task: 'Push everything to GitHub — your first QA portfolio',
    color: '#a855f7',
    delay: 2.35,
  },
];

export function LearningSummaryAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{css}</style>

      {/* Celebration header */}
      <div
        style={{
          animation: 'qa-fadeIn .5s ease .05s both',
          textAlign: 'center',
          padding: '14px 12px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #7c3aed15, #3b82f615, #22c55e15)',
          border: '1.5px solid #e2e8f0',
        }}
      >
        <div
          style={{
            fontSize: 36,
            animation: 'qa-confetti 1.2s ease-in-out 1.5s infinite alternate',
          }}
        >
          🎓
        </div>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#1f2937', margin: '6px 0 2px' }}>
          Course Complete!
        </p>
        <p style={{ fontSize: 10.5, color: '#6b7280', margin: 0 }}>
          You covered 8 modules · 29 lessons · the full QA automation curriculum
        </p>
      </div>

      {/* Module checklist */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            margin: '0 0 7px',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          What you learned
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {MODULES_DONE.map((m, i) => (
            <div
              key={i}
              style={{
                animation: `qa-rowIn .35s ease ${m.delay}s both`,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '6px 10px',
                borderRadius: 9,
                background: 'var(--bg-body)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  animation: `qa-checkIn .4s ease ${m.delay + 0.2}s both`,
                  fontSize: 13,
                  color: '#16a34a',
                  flexShrink: 0,
                }}
              >
                ✅
              </span>
              <span style={{ fontSize: 10, color: '#1f2937' }}>
                {m.icon} {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 30-day plan */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            margin: '0 0 7px',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          Your next 30 days
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NEXT_30.map((n, i) => (
            <div
              key={i}
              style={{
                animation: `qa-rowIn .38s ease ${n.delay}s both`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 10,
                background: n.color + '0f',
                border: `1.5px solid ${n.color}33`,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 99,
                  background: n.color,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}
              >
                {n.day}
              </span>
              <span style={{ fontSize: 10.5, color: '#374151' }}>{n.task}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Final note */}
      <div
        style={{
          animation: 'qa-fadeIn .5s ease 2.7s both',
          padding: '9px 13px',
          borderRadius: 10,
          background: '#fef9c3',
          border: '1px solid #fde047',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: '#854d0e', margin: '0 0 2px' }}>
          🚀 You're ready to apply for your first QA role
        </p>
        <p style={{ fontSize: 10, color: '#92400e', margin: 0 }}>
          Playwright · Postman · SQL · k6 · GitHub Actions · OWASP
        </p>
      </div>
    </div>
  );
}
