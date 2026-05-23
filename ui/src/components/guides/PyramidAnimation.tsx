const css = `
  @keyframes qa-slideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes qa-bugPop {
    0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
    60%  { opacity: 1; transform: scale(1.15) rotate(4deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  .qa-l1  { animation: qa-slideUp .5s ease .1s  both; }
  .qa-l2  { animation: qa-slideUp .5s ease .7s  both; }
  .qa-l3  { animation: qa-slideUp .5s ease 1.3s both; }
  .qa-ann { animation: qa-slideUp .4s ease 1.9s both; }
  .qa-bug { animation: qa-bugPop  .45s ease 2.4s both; }
`;

export function PyramidAnimation() {
  return (
    <div className="w-full flex justify-center rounded-xl overflow-hidden py-2">
      <style>{css}</style>
      <svg
        viewBox="0 0 440 255"
        className="w-full max-w-lg"
        aria-label="Testing pyramid diagram"
        style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
      >
        {/* ── Base layer — Unit Tests ───────────────────────────── */}
        <g className="qa-l1">
          <polygon points="20,238 420,238 352,178 88,178" fill="#6dbfa8" />
          <text x="220" y="212" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">
            Unit Tests
          </text>
          <text x="220" y="229" textAnchor="middle" fill="rgba(255,255,255,.78)" fontSize="9.5">
            Fast · Cheap · Thousands
          </text>
        </g>

        {/* ── Middle layer — Integration Tests ─────────────────── */}
        <g className="qa-l2">
          <polygon points="88,172 352,172 294,112 146,112" fill="#3e9e84" />
          <text x="220" y="147" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
            Integration Tests
          </text>
          <text x="220" y="163" textAnchor="middle" fill="rgba(255,255,255,.78)" fontSize="9.5">
            Components talking
          </text>
        </g>

        {/* ── Top layer — E2E Tests ─────────────────────────────── */}
        <g className="qa-l3">
          <polygon points="146,106 294,106 246,52 194,52" fill="#1e7c62" />
          <text x="220" y="84" textAnchor="middle" fill="#fff" fontSize="11.5" fontWeight="700">
            E2E (Playwright)
          </text>
        </g>

        {/* ── Side annotations ──────────────────────────────────── */}
        <g className="qa-ann" fill="#9ca3af" fontSize="9.5">
          <text x="6" y="220">
            ⚡ Fast
          </text>
          <text x="6" y="83">
            🐢 Slow
          </text>
          <text x="434" y="220" textAnchor="end">
            $ Cheap
          </text>
          <text x="434" y="83" textAnchor="end">
            $$ Costly
          </text>
        </g>

        {/* ── Bug lifecycle badge ───────────────────────────────── */}
        <g className="qa-bug">
          <rect
            x="2"
            y="2"
            width="134"
            height="38"
            rx="9"
            fill="#fff7ed"
            stroke="#fdba74"
            strokeWidth="1.2"
          />
          <text x="11" y="15" fill="#9a3412" fontSize="8.5" fontWeight="600">
            Bug lifecycle
          </text>
          <text x="11" y="29" fill="#c2410c" fontSize="8">
            New → Assigned → Fixed → Closed
          </text>
        </g>
      </svg>
    </div>
  );
}
