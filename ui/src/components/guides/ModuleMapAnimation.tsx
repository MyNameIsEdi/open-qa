const css = `
  @keyframes qa-cardIn {
    from { opacity: 0; transform: scale(.75) translateY(12px); }
    to   { opacity: 1; transform: scale(1)  translateY(0);     }
  }
  @keyframes qa-arrowSlide {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
`;

const MODULES = [
  { icon: '🎓', label: 'Welcome', color: '#e0f2fe', border: '#7dd3fc', delay: 0.05 },
  { icon: '🤖', label: 'Automation', color: '#dcfce7', border: '#86efac', delay: 0.2 },
  { icon: '🌐', label: 'API Testing', color: '#fef9c3', border: '#fde047', delay: 0.35 },
  { icon: '⚡', label: 'Load Tests', color: '#fff7ed', border: '#fdba74', delay: 0.5 },
  { icon: '🔧', label: 'IoT/HW', color: '#f3e8ff', border: '#d8b4fe', delay: 0.65 },
  { icon: '🗄️', label: 'SQL', color: '#fce7f3', border: '#f9a8d4', delay: 0.8 },
  { icon: '🧠', label: 'AI & DevOps', color: '#ecfdf5', border: '#6ee7b7', delay: 0.95 },
  { icon: '🏁', label: 'Summary', color: '#f1f5f9', border: '#94a3b8', delay: 1.1 },
];

export function ModuleMapAnimation() {
  return (
    <div className="w-full rounded-xl overflow-hidden p-1">
      <style>{css}</style>

      {/* Arrow banner */}
      <p
        className="text-center text-xs font-semibold mb-3 tracking-wide"
        style={{
          color: 'var(--text-muted)',
          animation: 'qa-arrowSlide .4s ease .05s both',
        }}
      >
        Your learning journey →
      </p>

      {/* 4 × 2 card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {MODULES.map((m, idx) => (
          <div
            key={m.label}
            style={{
              animation: `qa-cardIn .38s ease ${m.delay}s both`,
              background: m.color,
              border: `1.5px solid ${m.border}`,
              borderRadius: 12,
              padding: '10px 6px',
              textAlign: 'center',
              cursor: 'default',
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1 }}>{m.icon}</div>
            <div
              style={{
                fontSize: 9.5,
                marginTop: 5,
                fontWeight: 600,
                color: '#374151',
                lineHeight: 1.3,
              }}
            >
              {idx + 1}. {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
