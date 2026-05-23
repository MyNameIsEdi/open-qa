const css = `
  @keyframes qa-cardIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qa-chipIn  { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
  @keyframes qa-starPop { 0%{transform:scale(0) rotate(-20deg)} 70%{transform:scale(1.2) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
`;

const QA_PAIRS = [
  {
    q: '"Tell me about a bug you found that others missed."',
    a: 'Describe your method: what you were testing, why you dug deeper, what the impact was. Show curiosity.',
    color: '#3b82f6',
    delay: 0.1,
  },
  {
    q: '"How do you decide what to automate?"',
    a: 'Use the decision matrix: regression & multi-browser ✅, one-time & exploratory ❌. Mention ROI.',
    color: '#22c55e',
    delay: 0.5,
  },
  {
    q: '"Write a test for a login page."',
    a: 'Happy path + negative (wrong password) + edge (empty fields). Show POM if time allows.',
    color: '#a855f7',
    delay: 0.9,
  },
];

const LOOK_FOR = [
  { icon: '🔍', label: 'Curiosity', delay: 1.4 },
  { icon: '🎯', label: 'Attention to detail', delay: 1.6 },
  { icon: '💬', label: 'Clear communication', delay: 1.8 },
  { icon: '🤝', label: 'Team mindset', delay: 2.0 },
];

export function InterviewTipsAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{css}</style>

      {/* Top 3 Q&A */}
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: 'var(--text-muted)',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        3 Most common QA interview questions
      </p>

      {QA_PAIRS.map((p, i) => (
        <div
          key={i}
          style={{
            animation: `qa-cardIn .42s ease ${p.delay}s both`,
            borderRadius: 11,
            overflow: 'hidden',
            border: `1.5px solid ${p.color}44`,
          }}
        >
          <div style={{ padding: '8px 12px', background: p.color + '12' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: p.color, margin: 0 }}>
              Q{i + 1}. {p.q}
            </p>
          </div>
          <div style={{ padding: '8px 12px', background: 'white' }}>
            <p style={{ fontSize: 10.5, color: '#374151', margin: 0, lineHeight: 1.5 }}>💡 {p.a}</p>
          </div>
        </div>
      ))}

      {/* What interviewers look for */}
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
          What interviewers actually look for
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {LOOK_FOR.map((l) => (
            <div
              key={l.label}
              style={{
                animation: `qa-chipIn .35s ease ${l.delay}s both`,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 99,
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 14 }}>{l.icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#374151' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio tip */}
      <div
        style={{
          animation: 'qa-cardIn .4s ease 2.3s both',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 13px',
          borderRadius: 10,
          background: '#0f172a',
          border: '1px solid #1e293b',
        }}
      >
        <span style={{ fontSize: 22 }}>🐙</span>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Build a GitHub portfolio
          </p>
          <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>
            Push a real Playwright test suite or SQL query collection — show, don't tell
          </p>
        </div>
      </div>
    </div>
  );
}
