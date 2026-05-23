const css = `
  @keyframes qa-cardSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

const QUERIES = [
  {
    title: 'Find duplicate emails',
    sql: `SELECT email, COUNT(*) AS cnt\nFROM users\nGROUP BY email\nHAVING cnt > 1`,
    tag: 'Duplicates',
    tagColor: '#ef4444',
    delay: 0.1,
  },
  {
    title: 'Find NULL emails',
    sql: `SELECT id, name FROM users\nWHERE email IS NULL`,
    tag: 'NULLs',
    tagColor: '#f97316',
    delay: 0.35,
  },
  {
    title: 'Row count validation',
    sql: `SELECT COUNT(*) FROM orders\nWHERE created_at > '2024-01-01'`,
    tag: 'Count',
    tagColor: '#3b82f6',
    delay: 0.6,
  },
  {
    title: 'Stale data check',
    sql: `SELECT * FROM sessions\nWHERE updated_at < NOW() - INTERVAL 30 DAY`,
    tag: 'Stale',
    tagColor: '#a855f7',
    delay: 0.85,
  },
  {
    title: 'Before/after migration',
    sql: `SELECT COUNT(*), SUM(amount)\nFROM orders`,
    tag: 'Migration',
    tagColor: '#22c55e',
    delay: 1.1,
  },
  {
    title: 'Find orphaned records',
    sql: `SELECT o.id FROM orders o\nLEFT JOIN users u ON o.user_id = u.id\nWHERE u.id IS NULL`,
    tag: 'Integrity',
    tagColor: '#6366f1',
    delay: 1.35,
  },
];

export function SqlQaQueriesAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <style>{css}</style>
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: 'var(--text-muted)',
          margin: '0 0 2px',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        6 battle-tested QA SQL patterns
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {QUERIES.map((q) => (
          <div
            key={q.title}
            style={{
              animation: `qa-cardSlide .38s ease ${q.delay}s both`,
              borderRadius: 10,
              overflow: 'hidden',
              border: `1.5px solid ${q.tagColor}33`,
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: q.tagColor + '12',
                borderBottom: `1px solid ${q.tagColor}22`,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1f2937' }}>{q.title}</span>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 99,
                  background: q.tagColor,
                  color: '#fff',
                }}
              >
                {q.tag}
              </span>
            </div>
            {/* SQL */}
            <div
              style={{
                padding: '7px 10px',
                background: '#0f172a',
                fontFamily: 'monospace',
                fontSize: 9,
                color: '#94a3b8',
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
              }}
            >
              {q.sql.split('\n').map((line, i) => (
                <div
                  key={i}
                  style={{
                    color: /^(SELECT|FROM|WHERE|GROUP|HAVING|LEFT|ON)/.test(line.trim())
                      ? '#93c5fd'
                      : '#94a3b8',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
