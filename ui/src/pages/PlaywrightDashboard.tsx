import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Download,
  Bug,
  Eye,
  Camera,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Circle,
  AlertTriangle,
  X,
  Settings,
  LayoutDashboard,
  Globe,
  Monitor,
  Film,
  FileText,
  Code2,
  Copy,
  Check,
  Search,
  Clock,
  TrendingUp,
  FolderOpen,
  Save,
  BookOpen,
  Terminal,
  MousePointer2,
  FlaskConical,
  Layers,
  ExternalLink,
  Hash,
  Grid3x3,
  List,
  Tag,
  PenLine,
  Plus,
  Trash2,
  RefreshCw,
  CheckSquare,
  Send,
  Paperclip,
  GitBranch,
} from 'lucide-react';
import { OfficeCanvas } from '../office/components/OfficeCanvas';
import { OfficeState } from '../office/engine/officeState';
import { loadDefaultLayout, loadOfficeAssets } from '../office/assetLoader';
import { useSettings, TEAM_MANAGER_ID } from '../context/SettingsContext';
import type {
  AgentConfig,
  Attachment,
  Message,
  SpriteType,
  QASummaryData,
} from '../context/SettingsContext';
import type { OfficeLayout } from '../office/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'passed' | 'failed' | 'skipped' | 'pending' | 'running';
type FilterKey = 'all' | 'active' | 'passed' | 'failed' | 'skipped';
type ViewKey = 'dashboard' | 'docs';
type DashboardMode = 'list' | 'matrix';
type BrowserKey = 'chromium' | 'firefox' | 'webkit';
type ErrorType = 'Timeout' | 'Assertion' | 'Locator' | 'Network' | 'Error';

interface BrowserResult {
  browser: BrowserKey;
  status: Status;
  duration: number;
}

interface TestStep {
  title: string;
  duration: number;
  status: 'passed' | 'failed';
}

interface TestCase {
  id: string;
  title: string;
  status: Status;
  duration: number;
  browser: BrowserKey;
  error?: string;
  retries?: number;
  tags?: string[];
  browserResults?: BrowserResult[];
  steps?: TestStep[];
}

interface TestSuite {
  id: string;
  file: string;
  title: string;
  tests: TestCase[];
}

interface ArtifactModalState {
  testId: string;
  testTitle: string;
}

/** A single archived run returned by GET /api/playwright/history */
interface RunRecord {
  id: string;
  runAt: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  spec?: string | null;
}

// ─── Playwright Config Type ───────────────────────────────────────────────────

interface PlaywrightConfig {
  baseUrl: string;
  testDir: string;
  outputDir: string;
  timeout: number;
  retries: number;
  workers: number;
  browsers: { chromium: boolean; firefox: boolean; webkit: boolean };
  screenshot: 'on' | 'off' | 'only-on-failure';
  video: 'on' | 'off' | 'retain-on-failure';
  trace: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  reporter: 'html' | 'json' | 'junit' | 'line' | 'dot';
  headed: boolean;
  forbidOnly: boolean;
  fullyParallel: boolean;
  // Test-run filters
  grep: string;
  grepInvert: string;
}

const DEFAULT_CONFIG: PlaywrightConfig = {
  baseUrl: 'http://localhost:3000',
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 30000,
  retries: 1,
  workers: 4,
  browsers: { chromium: true, firefox: false, webkit: false },
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
  reporter: 'html',
  headed: false,
  forbidOnly: true,
  fullyParallel: true,
  grep: '',
  grepInvert: '',
};

// ─── SSE / request types ──────────────────────────────────────────────────────

/** Shape of the body sent to /api/playwright/run */
interface RunRequest {
  spec?: string;
  specs?: string[];
  config?: PlaywrightConfig;
}

/** Discriminated union for the three structured summary SSE events */
type SummaryEvent =
  | { evt: 'summary_start' }
  | { evt: 'summary_chunk'; text?: string }
  | {
      evt: 'summary_done';
      failures?: QASummaryData['failures'];
      total?: number;
      passed?: number;
      failed?: number;
      skipped?: number;
      duration?: number;
    };

const STORAGE_KEY = 'pw_dashboard_config_v1';
const API_BASE = 'http://localhost:3001';

// Clear any stale localStorage run-history cache left over from pre-SQLite builds
try {
  localStorage.removeItem('pw_run_history_v1');
} catch {
  /* ignore */
}

const PW_TEXT_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'log',
  'txt',
  'md',
  'css',
  'html',
  'xml',
  'yaml',
  'yml',
  'sh',
  'py',
  'java',
  'cs',
]);

/** Per-sprite accent palette for PW panel agent cards */
const PW_SPRITE_ACCENT: Record<
  SpriteType,
  { bg: string; ring: string; text: string; bar: string }
> = {
  tester: { bg: '#0d2a1a', ring: '#166534', text: '#4ade80', bar: '#22c55e' },
  dev: { bg: '#0f1f3d', ring: '#1a3a8f', text: '#60a5fa', bar: '#3b82f6' },
  analyst: { bg: '#1e0a40', ring: '#7c3aed', text: '#c084fc', bar: '#a855f7' },
  devops: { bg: '#2a0e02', ring: '#c2410c', text: '#fb923c', bar: '#f97316' },
  manager: { bg: '#2a1200', ring: '#d97706', text: '#E8A728', bar: '#f59e0b' },
};

// ─── PW-Dashboard OfficeState singleton ──────────────────────────────────────
// Separate from OfficePage's _officeState — same cached assets, different instance.
let _pwOfficeState: OfficeState | null = null;
function pwAgentNumId(idx: number) {
  return idx + 1;
}

// ─── Run History ──────────────────────────────────────────────────────────────

const CHART_H = 32;

/** Format a runAt ISO string into a short label */
function fmtRunLabel(runAt: string): string {
  try {
    const d = new Date(runAt);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '?';
  }
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div style={{ width: 52, height: 22 }} />;
  const W = 52,
    H = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={W} height={H} style={{ overflow: 'visible', flexShrink: 0 }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ─── Failure Reasons Donut Chart ──────────────────────────────────────────────

const FAILURE_REASON_META: Record<ErrorType, { label: string; color: string }> = {
  Assertion: { label: 'UI Text Change', color: '#4F72D4' },
  Locator: { label: 'Element Not Found', color: '#34C759' },
  Timeout: { label: 'Timeout', color: '#E8A728' },
  Network: { label: 'Network Error', color: '#ef4444' },
  Error: { label: 'Other', color: '#6b7280' },
};

function FailureReasonsChart({ tests }: { tests: TestCase[] }) {
  const failed = tests.filter((t) => t.status === 'failed');
  const counts = Object.fromEntries(
    (Object.keys(FAILURE_REASON_META) as ErrorType[]).map((k) => [k, 0]),
  ) as Record<ErrorType, number>;
  for (const t of failed) counts[parseErrorType(t.error ?? '')]++;

  const total = failed.length;
  const entries = (Object.entries(counts) as [ErrorType, number][])
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-6 gap-2">
        <CheckCircle2 size={24} style={{ color: '#34C759' }} />
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          No failures to analyse
        </p>
      </div>
    );
  }

  const R = 40,
    cx = 48,
    cy = 48,
    strokeW = 16;
  const circumference = 2 * Math.PI * R;
  let dashOffset = 0;
  const arcs = entries.map(([type, count]) => {
    const dash = (count / total) * circumference;
    const arc = { type, count, dash, off: dashOffset };
    dashOffset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-3">
      <svg width={96} height={96} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border)" strokeWidth={strokeW} />
        {arcs.map(({ type, dash, off }) => (
          <circle
            key={type}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={FAILURE_REASON_META[type].color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text
          x={cx}
          y={cy - 3}
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill="var(--text-main)"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="7"
          fontWeight="600"
          fill="var(--text-muted)"
          letterSpacing="0.08em"
        >
          FAILS
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {entries.map(([type, count]) => {
          const { label, color } = FAILURE_REASON_META[type];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={type} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--text-main)' }}>
                {label}
              </span>
              <span
                className="text-[11px] font-bold shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Top Failed Tests Panel ───────────────────────────────────────────────────

function TopFailedPanel({ suites, onViewAll }: { suites: TestSuite[]; onViewAll: () => void }) {
  const failed = suites
    .flatMap((s) =>
      s.tests.filter((t) => t.status === 'failed').map((t) => ({ ...t, suiteTitle: s.title })),
    )
    .sort((a, b) => (b.retries ?? 0) - (a.retries ?? 0))
    .slice(0, 5);

  if (failed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-6 gap-2">
        <CheckCircle2 size={24} style={{ color: '#34C759' }} />
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          No failed tests
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        {failed.map((test, i) => {
          const errType = parseErrorType(test.error ?? '');
          const { label, color } = FAILURE_REASON_META[errType];
          const count = (test.retries ?? 0) + 1;
          return (
            <div
              key={test.id}
              className={`flex items-center gap-2 py-2 ${i > 0 ? 'border-t' : ''}`}
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-semibold truncate"
                  style={{ color: 'var(--text-main)' }}
                >
                  {test.title}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {test.suiteTitle}
                </p>
              </div>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                {label}
              </span>
              <span
                className="text-xs font-black shrink-0 w-4 text-right"
                style={{ color: '#EF4444' }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
      <button
        onClick={onViewAll}
        className="mt-3 text-[11px] font-semibold hover:opacity-70 transition-opacity text-start"
        style={{ color: '#1a3a8f' }}
      >
        View all failures →
      </button>
    </div>
  );
}

function HistoryChart({
  runs,
  selectedId,
  onSelect,
}: {
  runs: RunRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // ── UX upgrade ─────────────────────────────────────────────────────────────
  // • Hover tooltip (replaces native title="…" attribute) with rich content
  // • Inline pass-rate overlay line (moving-average) that tracks reliability
  // • Per-bar pass-rate label on hover so a quick scan tells you the story
  // • "Latest" pin on the newest bar
  // The native `title` tooltip is removed so we don't get duplicate UI.
  const [hoverId, setHoverId] = useState<string | null>(null);

  const displayed = runs.slice().reverse(); // oldest → newest left → right
  const maxTotal = Math.max(...displayed.map((r) => r.total), 1);

  // Moving-average pass rate (window of 3) — gives a smoother trend than per-bar % alone
  const passRates = displayed.map((r) => (r.total > 0 ? r.passed / r.total : 0));
  const movingAvg = passRates.map((_, i) => {
    const start = Math.max(0, i - 2);
    const slice = passRates.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  if (runs.length === 0) {
    return (
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg-body)',
          }}
        >
          <TrendingUp size={13} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
            Run History
          </span>
        </div>
        <div className="px-4 py-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          No run history yet — click <strong>Run Tests</strong> to record your first run.
        </div>
      </div>
    );
  }

  const hoveredRun = hoverId ? (displayed.find((r) => r.id === hoverId) ?? null) : null;
  const hoveredRate =
    hoveredRun && hoveredRun.total > 0
      ? Math.round((hoveredRun.passed / hoveredRun.total) * 100)
      : null;

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-body)',
        }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={13} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
            Run History
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            · {runs.length} run{runs.length !== 1 ? 's' : ''} · hover for details · click to view
          </span>
        </div>
        <div className="flex items-center gap-4">
          {(
            [
              ['#34C759', 'Passed'],
              ['#ef4444', 'Failed'],
              ['#E8A728', 'Skipped'],
              ['#3b82f6', 'Pass-rate trend'],
            ] as const
          ).map(([color, label]) => (
            <span
              key={label}
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span
                className={
                  label === 'Pass-rate trend'
                    ? 'inline-block shrink-0'
                    : 'w-2 h-2 rounded-sm inline-block shrink-0'
                }
                style={
                  label === 'Pass-rate trend'
                    ? {
                        width: 10,
                        height: 2,
                        backgroundColor: color,
                        borderRadius: 1,
                      }
                    : { backgroundColor: color }
                }
              />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 pt-3 pb-3 relative">
        {/* Hover tooltip — pinned to top of chart so it doesn't shift layout */}
        {hoveredRun && (
          <div
            className="absolute z-10 px-3 py-2 rounded-lg shadow-lg pointer-events-none text-[10px]"
            style={{
              top: 6,
              right: 12,
              backgroundColor: '#2D2823',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: 180,
            }}
          >
            <div className="font-bold text-[11px] mb-1 flex items-center justify-between gap-3">
              <span>
                {new Date(hoveredRun.runAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {hoveredRate != null && (
                <span
                  className="px-1.5 py-px rounded font-bold"
                  style={{
                    background:
                      hoveredRate >= 80
                        ? 'rgba(16,185,129,0.20)'
                        : hoveredRate >= 50
                          ? 'rgba(251,191,36,0.20)'
                          : 'rgba(239,68,68,0.20)',
                    color:
                      hoveredRate >= 80 ? '#34d399' : hoveredRate >= 50 ? '#E8A728' : '#f87171',
                  }}
                >
                  {hoveredRate}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-0.5">
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-sm inline-block"
                  style={{ backgroundColor: '#34C759' }}
                />
                {hoveredRun.passed}
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-sm inline-block"
                  style={{ backgroundColor: '#EF4444' }}
                />
                {hoveredRun.failed}
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-sm inline-block"
                  style={{ backgroundColor: '#E8A728' }}
                />
                {hoveredRun.skipped}
              </span>
              <span className="opacity-60 ml-auto">{formatMs(hoveredRun.duration)}</span>
            </div>
            {hoveredRun.spec && (
              <div
                className="font-mono opacity-60 text-[9px] truncate mt-1"
                title={hoveredRun.spec}
              >
                {hoveredRun.spec.replace(/^tests[\\/]/g, '').replace(/\.spec\.(ts|js)/g, '')}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 relative" style={{ height: CHART_H + 26 }}>
          {/* Moving-average trend line — overlaid on top of the bars */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${displayed.length * 100} ${CHART_H}`}
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.85}
              points={movingAvg
                .map((r, i) => {
                  const x = i * 100 + 50;
                  const y = CHART_H - r * CHART_H;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
          {displayed.map((run, i) => {
            const passH = Math.round((run.passed / maxTotal) * CHART_H);
            const failH = Math.round((run.failed / maxTotal) * CHART_H);
            const skipH = Math.round((run.skipped / maxTotal) * CHART_H);
            const isSelected = run.id === selectedId;
            const isHover = hoverId === run.id;
            const isLatest = i === displayed.length - 1; // rightmost
            return (
              <div
                key={run.id}
                onClick={() => onSelect(run.id)}
                onMouseEnter={() => setHoverId(run.id)}
                onMouseLeave={() => setHoverId((prev) => (prev === run.id ? null : prev))}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  opacity: selectedId === null || isSelected || isHover ? 1 : 0.55,
                  transition: 'opacity 150ms',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    width: '100%',
                    position: 'relative',
                    outline: isSelected
                      ? '2px solid #1a3a8f'
                      : isHover
                        ? '2px solid rgba(26,58,143,0.4)'
                        : undefined,
                    borderRadius: 3,
                    transform: isHover && !isSelected ? 'translateY(-1px)' : undefined,
                    transition: 'transform 120ms',
                  }}
                >
                  {passH > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: passH,
                        backgroundColor: '#34C759',
                        borderRadius: failH === 0 && skipH === 0 ? '3px 3px 0 0' : '0',
                      }}
                    />
                  )}
                  {failH > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: passH,
                        left: 0,
                        right: 0,
                        height: failH,
                        backgroundColor: '#ef4444',
                        borderRadius: skipH === 0 ? '3px 3px 0 0' : '0',
                      }}
                    />
                  )}
                  {skipH > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: passH + failH,
                        left: 0,
                        right: 0,
                        height: skipH,
                        backgroundColor: '#E8A728',
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  )}
                  {isLatest && (
                    <span
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: '#1a3a8f',
                        boxShadow: '0 0 0 2px var(--bg-card)',
                      }}
                      title="Latest run"
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    flexShrink: 0,
                    lineHeight: 1,
                    color: isSelected || isHover ? '#1a3a8f' : 'var(--text-muted)',
                    fontWeight: isSelected ? 700 : isHover ? 600 : 400,
                  }}
                >
                  {fmtRunLabel(run.runAt)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Runs Panel (collapsible table of all recorded runs) ──────────────────────

function RunsPanel({
  runs,
  selectedId,
  onSelect,
  onLoadLatest,
  onClearHistory,
  isDemo,
}: {
  runs: RunRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLoadLatest: () => void;
  onClearHistory: () => void;
  isDemo: boolean;
}) {
  // Open by default when there is real data
  const [open, setOpen] = useState(!isDemo && runs.length > 0);
  const [confirmClear, setConfirmClear] = useState(false);

  // Keep open state in sync when runs first arrive
  React.useEffect(() => {
    if (!isDemo && runs.length > 0) setOpen(true);
  }, [isDemo, runs.length]);

  if (runs.length === 0) return null;

  const total = runs.length; // used for #N numbering (newest = #total)

  return (
    <div
      className="rounded-2xl overflow-hidden mb-8"
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── header ── */}
      <button
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors"
        onClick={() => setOpen((o) => !o)}
        style={{ backgroundColor: 'var(--bg-body)' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <Clock size={13} style={{ color: '#6366f1' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
          Run History
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          · {runs.length} run{runs.length !== 1 ? 's' : ''} recorded
        </span>
        {isDemo && (
          <span className="text-[10px] px-2 py-px rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            demo
          </span>
        )}
        {selectedId && !isDemo && (
          <span
            className="text-[10px] font-bold px-2 py-px rounded-full"
            style={{
              background: 'rgba(26,58,143,0.08)',
              color: '#1a3a8f',
              border: '1px solid rgba(26,58,143,0.2)',
            }}
          >
            viewing #{total - runs.findIndex((r) => r.id === selectedId)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {selectedId && !isDemo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLoadLatest();
              }}
              className="text-[11px] font-semibold hover:underline"
              style={{ color: '#1a3a8f' }}
            >
              ← Latest
            </button>
          )}
          {!isDemo && !confirmClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmClear(true);
              }}
              className="text-[11px] font-semibold hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear history
            </button>
          )}
          {!isDemo && confirmClear && (
            <span className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Are you sure?
              </span>
              <button
                onClick={() => {
                  setConfirmClear(false);
                  onClearHistory();
                }}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-[11px] font-semibold hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </span>
          )}
          {open ? (
            <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </button>

      {/* ── table ── */}
      {open && (
        <div className="overflow-x-auto border-t" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-body)',
                }}
              >
                <th
                  className="text-left px-4 py-2 font-semibold w-8"
                  style={{ color: 'var(--text-muted)' }}
                >
                  #
                </th>
                <th
                  className="text-left px-2 py-2 font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Date
                </th>
                <th
                  className="text-left px-2 py-2 font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Spec
                </th>
                <th
                  className="text-right px-3 py-2 font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Total
                </th>
                <th className="text-right px-3 py-2 font-semibold" style={{ color: '#16A34A' }}>
                  ✓
                </th>
                <th className="text-right px-3 py-2 font-semibold" style={{ color: '#EF4444' }}>
                  ✗
                </th>
                <th className="text-right px-3 py-2 font-semibold" style={{ color: '#D97706' }}>
                  –
                </th>
                <th
                  className="text-right px-3 py-2 font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Duration
                </th>
                <th
                  className="text-right px-4 py-2 font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Pass %
                </th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => {
                const isSelected = run.id === selectedId;
                const prevRun = runs[i + 1]; // runs[0] = newest
                const dFail = prevRun != null ? run.failed - prevRun.failed : 0;
                const hasDelta = prevRun != null && dFail !== 0;
                const rate = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;
                const runNum = total - i;

                return (
                  <tr
                    key={run.id}
                    onClick={() => !isDemo && onSelect(run.id)}
                    className={`transition-colors ${isDemo ? '' : 'cursor-pointer'}`}
                    style={{
                      borderBottom: i < runs.length - 1 ? '1px solid var(--border)' : undefined,
                      backgroundColor: isSelected ? 'rgba(26,58,143,0.06)' : 'var(--bg-card)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isDemo)
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-body)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                        ? 'rgba(26,58,143,0.06)'
                        : 'var(--bg-card)';
                    }}
                  >
                    {/* # */}
                    <td
                      className="px-4 py-2.5 font-mono text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isSelected ? (
                        <span className="font-bold" style={{ color: '#1a3a8f' }}>
                          #{runNum}
                        </span>
                      ) : (
                        `#${runNum}`
                      )}
                    </td>
                    {/* Date + latest badge */}
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium" style={{ color: 'var(--text-main)' }}>
                          {new Date(run.runAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {i === 0 && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-px rounded-full shrink-0"
                            style={{
                              background: 'rgba(26,58,143,0.08)',
                              color: '#1a3a8f',
                              border: '1px solid rgba(26,58,143,0.2)',
                            }}
                          >
                            latest
                          </span>
                        )}
                        {hasDelta && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-px rounded-full shrink-0"
                            style={
                              dFail > 0
                                ? {
                                    background: 'rgba(239,68,68,0.08)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                  }
                                : {
                                    background: 'rgba(52,199,89,0.08)',
                                    color: '#16A34A',
                                    border: '1px solid rgba(52,199,89,0.2)',
                                  }
                            }
                          >
                            {dFail > 0 ? `+${dFail}✗` : `${dFail}✗`}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Spec */}
                    <td className="px-2 py-2.5 max-w-[160px]">
                      {run.spec ? (
                        <span
                          className="font-mono text-[10px] truncate block"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {
                            run.spec
                              .replace(/^tests[\\/]/g, '') // strip leading tests/
                              .replace(/,tests[\\/]/g, ', ') // strip tests/ after comma
                              .replace(/\.spec\.(ts|js)/g, '') // strip .spec.ts extension
                          }
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          all
                        </span>
                      )}
                    </td>
                    <td
                      className="px-3 py-2.5 text-right font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {run.total}
                    </td>
                    <td
                      className="px-3 py-2.5 text-right font-mono font-semibold"
                      style={{ color: '#16A34A' }}
                    >
                      {run.passed}
                    </td>
                    <td
                      className="px-3 py-2.5 text-right font-mono font-semibold"
                      style={{
                        color: run.failed > 0 ? '#EF4444' : 'var(--text-muted)',
                      }}
                    >
                      {run.failed}
                    </td>
                    <td
                      className="px-3 py-2.5 text-right font-mono"
                      style={{
                        color: run.skipped > 0 ? '#D97706' : 'var(--text-muted)',
                      }}
                    >
                      {run.skipped}
                    </td>
                    <td
                      className="px-3 py-2.5 text-right font-mono text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatMs(run.duration)}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right font-bold"
                      style={{ color: rate >= 80 ? '#16A34A' : '#EF4444' }}
                    >
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Config Generator ─────────────────────────────────────────────────────────

function generateConfig(c: PlaywrightConfig): string {
  const DEVICE_MAP: Record<string, string> = {
    chromium: 'Desktop Chrome',
    firefox: 'Desktop Firefox',
    webkit: 'Desktop Safari',
  };
  const browsers = (Object.keys(c.browsers) as Array<keyof typeof c.browsers>)
    .filter((k) => c.browsers[k])
    .map((k) => `    { name: '${k}', use: { ...devices['${DEVICE_MAP[k]}'] } },`)
    .join('\n');

  return `import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '${c.testDir}',
  outputDir: '${c.outputDir}',
  fullyParallel: ${c.fullyParallel},
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : ${c.retries},
  workers: process.env.CI ? 1 : ${c.workers},
  timeout: ${c.timeout},
  reporter: '${c.reporter}',

  use: {
    baseURL: '${c.baseUrl}',
    headless: ${!c.headed},
    screenshot: '${c.screenshot}',
    video: '${c.video}',
    trace: '${c.trace}',
  },

  projects: [
${browsers || '    // No browsers selected'}
  ],
})`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMs(ms: number) {
  if (ms === 0) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function StatusIcon({ status, size = 15 }: { status: Status; size?: number }) {
  const s = size;
  if (status === 'passed')
    return <CheckCircle2 size={s} className="shrink-0" style={{ color: '#34C759' }} />;
  if (status === 'failed')
    return <XCircle size={s} className="shrink-0" style={{ color: '#EF4444' }} />;
  if (status === 'skipped')
    return <MinusCircle size={s} className="shrink-0" style={{ color: '#E8A728' }} />;
  if (status === 'running')
    return (
      <span className="inline-block shrink-0" style={{ width: s, height: s }}>
        <span className="block w-full h-full rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </span>
    );
  return <Circle size={s} className="shrink-0" style={{ color: 'var(--text-muted)' }} />;
}

function StatusBadge({ status }: { status: Status }) {
  const base = 'text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide';
  if (status === 'passed')
    return (
      <span
        className={`${base}`}
        style={{
          background: 'rgba(52,199,89,0.12)',
          color: '#16A34A',
          border: '1px solid rgba(52,199,89,0.2)',
        }}
      >
        pass
      </span>
    );
  if (status === 'failed')
    return (
      <span
        className={`${base}`}
        style={{
          background: 'rgba(239,68,68,0.12)',
          color: '#DC2626',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        fail
      </span>
    );
  if (status === 'skipped')
    return (
      <span
        className={`${base}`}
        style={{
          background: 'rgba(232,167,40,0.12)',
          color: '#D97706',
          border: '1px solid rgba(232,167,40,0.2)',
        }}
      >
        skip
      </span>
    );
  if (status === 'running')
    return (
      <span
        className={`${base}`}
        style={{
          background: 'rgba(26,58,143,0.12)',
          color: '#1a3a8f',
          border: '1px solid rgba(26,58,143,0.2)',
        }}
      >
        running…
      </span>
    );
  return (
    <span
      className={`${base}`}
      style={{
        background: 'rgba(148,163,184,0.1)',
        color: '#94a3b8',
        border: '1px solid rgba(148,163,184,0.15)',
      }}
    >
      pending
    </span>
  );
}

// ─── Settings Sub-components ──────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{ backgroundColor: checked ? '#1a3a8f' : '#d1d5db' }}
    >
      <span
        className="inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg border text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg-body)',
        color: 'var(--text-main)',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  mono = true,
  width = 'w-48',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  width?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${mono ? 'font-mono' : ''} ${width}`}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg-body)',
        color: 'var(--text-main)',
      }}
    />
  );
}

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-6 py-3 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
          {label}
        </p>
        {desc && (
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {desc}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingCard({
  icon,
  title,
  subtitle,
  children,
  warning,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  warning?: string;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: warning ? '#fca5a5' : 'var(--border)' }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-body)',
        }}
      >
        <span style={{ color: warning ? '#ef4444' : '#3b82f6' }}>{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
            {title}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>
        {warning && (
          <span
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: '#fee2e2', color: '#b91c1c' }}
          >
            <AlertTriangle size={10} /> {warning}
          </span>
        )}
      </div>
      <div className="px-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────

const REPORTER_DESCRIPTIONS: Record<PlaywrightConfig['reporter'], string> = {
  html: 'Interactive HTML report — best for local debugging and sharing results',
  json: 'Raw JSON output — ideal for CI pipelines and custom tooling',
  junit: 'JUnit XML — compatible with Jenkins, GitLab CI, and most CI/CD tools',
  line: 'Single-line per test — minimal and fast output in terminal',
  dot: 'One dot per test — ultra-compact, ideal for large suites in CI',
};

function SettingsView({
  config,
  onChange,
}: {
  config: PlaywrightConfig;
  onChange: (c: PlaywrightConfig) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const configCode = useMemo(() => generateConfig(config), [config]);
  const noBrowsers = !Object.values(config.browsers).some(Boolean);

  const set = <K extends keyof PlaywrightConfig>(key: K, value: PlaywrightConfig[K]) =>
    onChange({ ...config, [key]: value });

  const copyConfig = async () => {
    await navigator.clipboard.writeText(configCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([configCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playwright.config.ts';
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Main grid: left settings + right preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Setting groups */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* General */}
          <SettingCard
            icon={<Globe size={14} />}
            title="General"
            subtitle="Base URL, timeouts, parallelism and CI options"
          >
            <SettingRow label="Base URL" desc="Root URL used in page.goto('/path') calls">
              <TextInput value={config.baseUrl} onChange={(v) => set('baseUrl', v)} width="w-52" />
            </SettingRow>
            <SettingRow label="Timeout" desc="Default assertion + action timeout per test">
              <SelectControl
                value={String(config.timeout)}
                onChange={(v) => set('timeout', Number(v))}
                options={[
                  { value: '10000', label: '10 s' },
                  { value: '20000', label: '20 s' },
                  { value: '30000', label: '30 s' },
                  { value: '60000', label: '60 s' },
                  { value: '120000', label: '120 s' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Retries" desc="Automatically retry failing tests">
              <SelectControl
                value={String(config.retries)}
                onChange={(v) => set('retries', Number(v))}
                options={[
                  { value: '0', label: '0 — disabled' },
                  { value: '1', label: '1 retry' },
                  { value: '2', label: '2 retries' },
                  { value: '3', label: '3 retries' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Workers" desc="Parallel worker processes for test execution">
              <SelectControl
                value={String(config.workers)}
                onChange={(v) => set('workers', Number(v))}
                options={[
                  { value: '1', label: '1 (serial)' },
                  { value: '2', label: '2 workers' },
                  { value: '4', label: '4 workers' },
                  { value: '8', label: '8 workers' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Fully Parallel" desc="Each test file runs in its own worker process">
              <ToggleSwitch
                checked={config.fullyParallel}
                onChange={(v) => set('fullyParallel', v)}
              />
            </SettingRow>
            <SettingRow
              label="Forbid .only"
              desc="Fail the run if test.only is accidentally committed"
            >
              <ToggleSwitch checked={config.forbidOnly} onChange={(v) => set('forbidOnly', v)} />
            </SettingRow>
            <SettingRow label="Headed mode" desc="Run tests with a visible browser window">
              <ToggleSwitch checked={config.headed} onChange={(v) => set('headed', v)} />
            </SettingRow>
          </SettingCard>

          {/* Test Paths */}
          <SettingCard
            icon={<FolderOpen size={14} />}
            title="Test Paths"
            subtitle="Directories for specs and output artifacts"
          >
            <SettingRow label="Test directory" desc="Root folder Playwright scans for spec files">
              <TextInput value={config.testDir} onChange={(v) => set('testDir', v)} width="w-44" />
            </SettingRow>
            <SettingRow
              label="Output directory"
              desc="Where screenshots, videos, and traces are saved"
            >
              <TextInput
                value={config.outputDir}
                onChange={(v) => set('outputDir', v)}
                width="w-44"
              />
            </SettingRow>
          </SettingCard>

          {/* Browsers */}
          <SettingCard
            icon={<Monitor size={14} />}
            title="Browsers"
            subtitle="Select which browser engines to run tests against"
            warning={noBrowsers ? 'None selected' : undefined}
          >
            {(
              [
                {
                  key: 'chromium',
                  label: 'Chromium',
                  desc: 'Chrome & Edge — fastest, widest coverage',
                },
                {
                  key: 'firefox',
                  label: 'Firefox',
                  desc: 'Gecko engine — catches Firefox-specific bugs',
                },
                {
                  key: 'webkit',
                  label: 'WebKit',
                  desc: 'Safari engine — essential for macOS & iOS',
                },
              ] as const
            ).map(({ key, label, desc }) => (
              <SettingRow key={key} label={label} desc={desc}>
                <ToggleSwitch
                  checked={config.browsers[key]}
                  onChange={(v) => set('browsers', { ...config.browsers, [key]: v })}
                />
              </SettingRow>
            ))}
            {noBrowsers && (
              <div
                className="flex items-center gap-2 py-2.5 text-[11px]"
                style={{ color: '#b91c1c' }}
              >
                <AlertTriangle size={12} className="shrink-0" />
                At least one browser must be enabled to run tests.
              </div>
            )}
          </SettingCard>

          {/* Artifacts */}
          <SettingCard
            icon={<Film size={14} />}
            title="Artifacts"
            subtitle="Control when screenshots, videos and traces are saved"
          >
            <SettingRow label="Screenshots" desc="Capture a PNG snapshot of the page">
              <SelectControl
                value={config.screenshot}
                onChange={(v) => set('screenshot', v as PlaywrightConfig['screenshot'])}
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'only-on-failure', label: 'On failure only' },
                  { value: 'on', label: 'Always' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Video" desc="Record a video of each test run">
              <SelectControl
                value={config.video}
                onChange={(v) => set('video', v as PlaywrightConfig['video'])}
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'retain-on-failure', label: 'Keep on failure' },
                  { value: 'on', label: 'Always' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Trace" desc="Playwright trace for time-travel debugging">
              <SelectControl
                value={config.trace}
                onChange={(v) => set('trace', v as PlaywrightConfig['trace'])}
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'on-first-retry', label: 'On first retry' },
                  { value: 'retain-on-failure', label: 'Keep on failure' },
                  { value: 'on', label: 'Always' },
                ]}
              />
            </SettingRow>
          </SettingCard>

          {/* Test Filtering */}
          <SettingCard
            icon={<Search size={14} />}
            title="Test Filtering"
            subtitle="Narrow which tests run by title or pattern"
          >
            <SettingRow
              label="Grep (include)"
              desc="Only run tests whose title matches this pattern (regex or plain string)"
            >
              <TextInput
                value={config.grep}
                onChange={(v) => set('grep', v)}
                width="w-52"
                placeholder="e.g. @smoke or Login"
              />
            </SettingRow>
            <SettingRow
              label="Grep invert (exclude)"
              desc="Skip tests whose title matches this pattern"
            >
              <TextInput
                value={config.grepInvert}
                onChange={(v) => set('grepInvert', v)}
                width="w-52"
                placeholder="e.g. @slow or flaky"
              />
            </SettingRow>
          </SettingCard>

          {/* Reporter */}
          <SettingCard
            icon={<FileText size={14} />}
            title="Reporter"
            subtitle="How test results are formatted and output"
          >
            <div className="pt-3 pb-2">
              <div className="grid grid-cols-5 gap-2 mb-3">
                {(['html', 'json', 'junit', 'line', 'dot'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => set('reporter', r)}
                    className="py-2 rounded-xl border text-xs font-bold transition-all"
                    style={
                      config.reporter === r
                        ? {
                            background: '#1a3a8f',
                            color: '#fff',
                            borderColor: '#1a3a8f',
                          }
                        : {
                            background: 'var(--bg-body)',
                            color: 'var(--text-muted)',
                            borderColor: 'var(--border)',
                          }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {REPORTER_DESCRIPTIONS[config.reporter]}
              </p>
            </div>
          </SettingCard>
        </div>

        {/* Right: Generated playwright.config.ts */}
        <div className="lg:col-span-2">
          <div
            className="sticky top-4 rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              <div className="flex items-center gap-2">
                <Code2 size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                  playwright.config.ts
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: 'rgba(52,199,89,0.10)',
                    color: '#16A34A',
                    border: '1px solid rgba(52,199,89,0.25)',
                  }}
                >
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyConfig}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadConfig}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                  title="Download as playwright.config.ts"
                >
                  {downloaded ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Download size={12} />
                  )}
                  {downloaded ? 'Saved!' : '.ts'}
                </button>
              </div>
            </div>

            {/* Validation banner */}
            {noBrowsers && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-medium border-b"
                style={{
                  background: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#b91c1c',
                }}
              >
                <AlertTriangle size={12} className="shrink-0" />
                No browsers selected — the generated config will skip all projects.
              </div>
            )}

            {/* Code */}
            <pre
              className="text-[11px] font-mono p-4 overflow-auto leading-relaxed"
              style={{
                backgroundColor: '#1e1e2e',
                color: '#cdd6f4',
                maxHeight: '68vh',
              }}
            >
              {configCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Playwright-specific helpers ─────────────────────────────────────────────

/** Parse a Playwright error string and return a human-readable category */
function parseErrorType(error: string): ErrorType {
  if (/timeout/i.test(error)) return 'Timeout';
  if (/toHave|toBe|toContain|expect/i.test(error)) return 'Assertion';
  if (/locator|strict mode|resolved to/i.test(error)) return 'Locator';
  if (/net::|ERR_|fetch|request/i.test(error)) return 'Network';
  return 'Error';
}

const ERROR_TYPE_STYLES: Record<ErrorType, { bg: string; color: string; border: string }> = {
  Timeout: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Assertion: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  Locator: { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
  Network: { bg: '#e0f2fe', color: '#0c4a6e', border: '#bae6fd' },
  Error: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};

const BROWSER_META: Record<BrowserKey, { label: string; color: string; emoji: string }> = {
  chromium: { label: 'Chromium', color: '#4285f4', emoji: '🔵' },
  firefox: { label: 'Firefox', color: '#ff6611', emoji: '🦊' },
  webkit: { label: 'WebKit', color: '#999999', emoji: '🧡' },
};

// ─── Browser Matrix View ──────────────────────────────────────────────────────

function BrowserMatrixView({ suites }: { suites: TestSuite[] }) {
  const testsWithCross = suites
    .flatMap((s) => s.tests)
    .filter((t) => t.browserResults && t.browserResults.length > 0);
  const browsers: BrowserKey[] = ['chromium', 'firefox', 'webkit'];

  if (testsWithCross.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-2xl border"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No cross-browser data — add <code className="font-mono text-xs">browserResults</code> to
          your tests.
        </p>
      </div>
    );
  }

  function cellStatus(test: TestCase, browser: BrowserKey): Status | null {
    if (!test.browserResults) return null;
    return test.browserResults.find((r) => r.browser === browser)?.status ?? null;
  }

  const StatusCell = ({ status }: { status: Status | null }) => {
    if (!status)
      return (
        <td className="px-3 py-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          —
        </td>
      );
    const bgMap: Record<Status, string> = {
      passed: 'rgba(16,185,129,0.1)',
      failed: 'rgba(239,68,68,0.1)',
      skipped: 'rgba(251,191,36,0.1)',
      pending: 'rgba(148,163,184,0.08)',
      running: 'rgba(59,130,246,0.1)',
    };
    return (
      <td className="px-3 py-2 text-center" style={{ backgroundColor: bgMap[status] }}>
        <div className="flex justify-center">
          <StatusIcon status={status} size={13} />
        </div>
      </td>
    );
  };

  // Group tests by suite
  const bysuite = suites
    .map((s) => ({
      ...s,
      tests: s.tests.filter((t) => t.browserResults && t.browserResults.length > 0),
    }))
    .filter((s) => s.tests.length > 0);

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-body)',
        }}
      >
        <Globe size={13} style={{ color: '#7c3aed' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
          Browser Matrix
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          — test results per browser project
        </span>
        <div className="ml-auto flex items-center gap-3">
          {browsers.map((b) => (
            <span
              key={b}
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>{BROWSER_META[b].emoji}</span> {BROWSER_META[b].label}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg-body)',
              }}
            >
              <th
                className="text-left px-4 py-2 font-semibold w-full"
                style={{ color: 'var(--text-muted)' }}
              >
                Test
              </th>
              {browsers.map((b) => (
                <th
                  key={b}
                  className="px-4 py-2 font-bold text-center whitespace-nowrap"
                  style={{ color: BROWSER_META[b].color }}
                >
                  {BROWSER_META[b].emoji} {BROWSER_META[b].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bysuite.map((suite) => (
              <React.Fragment key={suite.id}>
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-body)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {suite.title}
                  </td>
                </tr>
                {suite.tests.map((test, i) => (
                  <tr
                    key={test.id}
                    style={{
                      borderBottom:
                        i < suite.tests.length - 1 ? '1px solid var(--border)' : undefined,
                      backgroundColor: 'var(--bg-card)',
                    }}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={test.status} size={13} />
                        <span className="truncate max-w-xs" style={{ color: 'var(--text-main)' }}>
                          {test.title}
                        </span>
                        {test.retries && test.status === 'passed' && (
                          <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-amber-100 text-amber-700 shrink-0">
                            FLAKY
                          </span>
                        )}
                        {(test.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-1.5 py-px rounded border shrink-0"
                            style={{
                              color: 'var(--text-muted)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    {browsers.map((b) => (
                      <StatusCell key={b} status={cellStatus(test, b)} />
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Flaky Test Panel ─────────────────────────────────────────────────────────

function FlakyPanel({ suites }: { suites: TestSuite[] }) {
  const flakyTests = suites.flatMap((s) =>
    s.tests
      .filter((t) => (t.retries ?? 0) > 0 && t.status === 'passed')
      .map((t) => ({ ...t, suiteFile: s.file, suiteTitle: s.title })),
  );

  if (flakyTests.length === 0) return null;

  return (
    <div
      className="mt-4 rounded-2xl border shadow-sm overflow-hidden"
      style={{ borderColor: '#E8A728', backgroundColor: 'var(--bg-card)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}
      >
        <AlertTriangle size={13} style={{ color: '#d97706' }} />
        <span className="text-xs font-bold" style={{ color: '#92400e' }}>
          Flaky Tests
        </span>
        <span className="text-[11px]" style={{ color: '#b45309' }}>
          — passed only after retrying
        </span>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          {flakyTests.length} test{flakyTests.length > 1 ? 's' : ''}
        </span>
      </div>
      <div>
        {flakyTests.map((test, i) => (
          <div
            key={test.id}
            className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t' : ''}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <AlertTriangle size={13} style={{ color: '#f59e0b' }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate" style={{ color: 'var(--text-main)' }}>
                {test.title}
              </p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {test.suiteFile}
              </p>
            </div>
            {(test.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-1.5 py-px rounded border shrink-0"
                style={{
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border)',
                }}
              >
                {tag}
              </span>
            ))}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              {test.retries} retry
            </span>
            <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
              {formatMs(test.duration)}
            </span>
          </div>
        ))}
      </div>
      <div
        className="px-4 py-2.5 border-t text-[11px]"
        style={{
          borderColor: '#fde68a',
          backgroundColor: '#fffbeb',
          color: '#b45309',
        }}
      >
        💡 Flaky tests destabilise CI. Investigate network dependencies, race conditions, or use{' '}
        <code className="font-mono">test.setTimeout()</code> to isolate the root cause.
      </div>
    </div>
  );
}

// ─── Test Step Timeline ───────────────────────────────────────────────────────

function StepTimeline({ steps }: { steps: TestStep[] }) {
  const maxDur = Math.max(...steps.map((s) => s.duration), 1);
  return (
    <div
      className="mx-4 mb-3 rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="px-3 py-1.5 border-b text-[10px] font-bold uppercase tracking-widest"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-body)',
          color: 'var(--text-muted)',
        }}
      >
        Steps
      </div>
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-3 py-2 ${i > 0 ? 'border-t' : ''}`}
          style={{
            borderColor: 'var(--border)',
            backgroundColor: step.status === 'failed' ? 'rgba(239,68,68,0.05)' : undefined,
          }}
        >
          <StatusIcon status={step.status} size={11} />
          <span
            className="flex-1 text-[11px] font-mono truncate"
            style={{
              color: step.status === 'failed' ? '#dc2626' : 'var(--text-main)',
            }}
          >
            {step.title}
          </span>
          <div
            className="w-24 h-1 rounded-full overflow-hidden shrink-0"
            style={{ backgroundColor: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${(step.duration / maxDur) * 100}%`,
                backgroundColor: step.status === 'failed' ? '#ef4444' : '#34C759',
              }}
            />
          </div>
          <span
            className="text-[10px] font-mono w-14 text-right shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {formatMs(step.duration)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Docs View ────────────────────────────────────────────────────────────────

/** Syntax-highlighted code block (Catppuccin-dark theme matching the config preview) */
function CodeBlock({ code, lang = 'ts' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="relative rounded-xl overflow-hidden border my-2"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: '#181825' }}
      >
        <span className="text-[10px] font-mono font-semibold" style={{ color: '#6c7086' }}>
          {lang}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-opacity hover:opacity-70"
          style={{ color: copied ? '#a6e3a1' : '#6c7086' }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        className="text-[11.5px] font-mono px-4 py-3 overflow-x-auto leading-relaxed"
        style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4', margin: 0 }}
      >
        {code.trim()}
      </pre>
    </div>
  );
}

/** Section heading with icon and anchor */
function DocSection({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#1a3a8f' }}>{icon}</span>
        <h2 className="text-sm font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
          {title}
        </h2>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity ml-auto"
        >
          <Hash size={12} style={{ color: 'var(--text-muted)' }} />
        </a>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/** Pill table row for locator/assertion reference */
function RefRow({
  label,
  desc,
  badge,
  badgeColor = '#1a3a8f',
}: {
  label: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 px-3 py-2.5 rounded-xl border"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg-body)',
      }}
    >
      <code
        className="text-[11px] font-mono font-semibold shrink-0 mt-px"
        style={{ color: '#89b4fa' }}
      >
        {label}
      </code>
      <span className="flex-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {desc}
      </span>
      {badge && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 leading-none self-center"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
            border: `1px solid ${badgeColor}40`,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/** External docs link chip */
function DocsLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-70"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg-body)',
        color: '#1a3a8f',
      }}
    >
      {label} <ExternalLink size={10} />
    </a>
  );
}

function DocsView() {
  const tocItems = [
    { id: 'quickstart', label: 'Quick Start', icon: <Terminal size={12} /> },
    { id: 'locators', label: 'Locator Strategies', icon: <MousePointer2 size={12} /> },
    { id: 'assertions', label: 'Core Assertions', icon: <FlaskConical size={12} /> },
    { id: 'patterns', label: 'Common Patterns', icon: <Layers size={12} /> },
    { id: 'auth', label: 'Authentication', icon: <Globe size={12} /> },
    { id: 'visual', label: 'Visual & A11y', icon: <Camera size={12} /> },
    { id: 'cicd', label: 'CI / CD', icon: <GitBranch size={12} /> },
    { id: 'cli', label: 'CLI Reference', icon: <Terminal size={12} /> },
  ];

  return (
    <div className="flex gap-6 items-start">
      {/* ── Sticky TOC sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-1 shrink-0 sticky top-4 w-44">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          On this page
        </p>
        {tocItems.map(({ id, label, icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {icon} {label}
          </a>
        ))}

        <div
          className="mt-4 pt-4 border-t flex flex-col gap-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Official Docs
          </p>
          <DocsLink href="https://playwright.dev/docs/intro" label="Playwright Docs" />
          <DocsLink href="https://playwright.dev/docs/locators" label="Locators" />
          <DocsLink href="https://playwright.dev/docs/test-assertions" label="Assertions" />
          <DocsLink href="https://playwright.dev/docs/api/class-page" label="Page API" />
          <DocsLink href="https://playwright.dev/docs/auth" label="Authentication" />
          <DocsLink href="https://playwright.dev/docs/accessibility-testing" label="A11y Testing" />
          <DocsLink href="https://playwright.dev/docs/ci" label="CI Integration" />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        {/* ── Quick Start ─────────────────────────────────── */}
        <DocSection id="quickstart" icon={<Terminal size={14} />} title="Quick Start">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Install Playwright, scaffold your config, and have your first green test in under 3
            minutes.
          </p>

          {[
            {
              step: '1 — Install & scaffold',
              content: (
                <>
                  <CodeBlock lang="bash" code={`npm init playwright@latest`} />
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    The wizard creates <code className="font-mono">playwright.config.ts</code>, a{' '}
                    <code className="font-mono">tests/</code> directory, and downloads browser
                    binaries. Choose TypeScript when prompted.
                  </p>
                </>
              ),
            },
            {
              step: '2 — Write your first test',
              content: (
                <CodeBlock
                  lang="typescript"
                  code={`import { test, expect } from '@playwright/test'

test('home page loads with correct title', async ({ page }) => {
  await page.goto('https://example.com')
  await expect(page).toHaveTitle(/Example Domain/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})`}
                />
              ),
            },
            {
              step: '3 — Run',
              content: (
                <CodeBlock
                  lang="bash"
                  code={`npx playwright test                   # headless, all browsers
npx playwright test --headed          # see the browser
npx playwright test --ui              # interactive UI mode
npx playwright test --last-failed     # retry only failed tests
npx playwright show-report            # open HTML report`}
                />
              ),
            },
            {
              step: '4 — playwright.config.ts essentials',
              content: (
                <CodeBlock
                  lang="typescript"
                  code={`import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,          // per-test timeout (ms)
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'pw-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['iPhone 14'] } },
  ],
})`}
                />
              ),
            },
          ].map(({ step, content }) => (
            <div
              key={step}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="px-4 py-2.5 border-b flex items-center gap-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                  {step}
                </span>
              </div>
              <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                {content}
              </div>
            </div>
          ))}
        </DocSection>

        {/* ── Locator Strategies ──────────────────────────── */}
        <DocSection id="locators" icon={<MousePointer2 size={14} />} title="Locator Strategies">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Playwright recommends locators in this priority order — higher entries survive UI
            redesigns and serve as living accessibility checks.
          </p>

          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <div
              className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                Priority order
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                — prefer top entries first
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {[
                {
                  label: 'getByRole()',
                  desc: 'Find by ARIA role + accessible name. Survives redesigns and works with screen readers.',
                  badge: '★ Best',
                  badgeColor: '#059669',
                },
                {
                  label: 'getByLabel()',
                  desc: 'Find form input by its associated <label> text. Ideal for all form controls.',
                  badge: '★ Best',
                  badgeColor: '#059669',
                },
                {
                  label: 'getByPlaceholder()',
                  desc: 'Find input by placeholder attribute. Use when no visible label exists.',
                  badge: 'Good',
                  badgeColor: '#1a3a8f',
                },
                {
                  label: 'getByText()',
                  desc: 'Find any element by visible text. Use { exact: true } for precision.',
                  badge: 'Good',
                  badgeColor: '#1a3a8f',
                },
                {
                  label: 'getByAltText()',
                  desc: 'Find images by alt attribute. Essential for image-heavy UIs.',
                  badge: 'Good',
                  badgeColor: '#1a3a8f',
                },
                {
                  label: 'getByTitle()',
                  desc: 'Find element by its title attribute. Useful for icon buttons with tooltips.',
                  badge: 'OK',
                  badgeColor: '#d97706',
                },
                {
                  label: 'getByTestId()',
                  desc: 'Find by data-testid. Requires adding attributes to source — very stable once added.',
                  badge: 'OK',
                  badgeColor: '#d97706',
                },
                {
                  label: "locator('css')",
                  desc: 'CSS selector fallback. Use only when semantic locators are unavailable.',
                  badge: 'Last resort',
                  badgeColor: '#ef4444',
                },
                {
                  label: "locator('xpath')",
                  desc: 'XPath selector. Brittle and verbose — avoid unless absolutely required.',
                  badge: 'Avoid',
                  badgeColor: '#ef4444',
                },
              ].map((r) => (
                <RefRow key={r.label} {...r} />
              ))}
            </div>
          </div>

          <CodeBlock
            lang="typescript"
            code={`// ✅ Preferred — role + accessible name survives redesigns
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: /sign in/i })
page.getByRole('heading', { level: 1 })
page.getByRole('dialog').getByRole('button', { name: 'Close' })

// ✅ Form controls
page.getByLabel('Email address')
page.getByLabel(/password/i)
page.getByPlaceholder('Search…')

// ✅ Content & images
page.getByText('Forgot password?')
page.getByText('Confirm', { exact: true })
page.getByAltText('Company logo')

// ✅ Chaining — narrow scope first
page.getByRole('list').getByRole('listitem').filter({ hasText: 'Alice' })

// ⚠️ CSS — use as a fallback
page.locator('[data-testid="submit-btn"]')

// ❌ Avoid — breaks on any DOM restructure
page.locator('div > div:nth-child(3) > span')`}
          />
        </DocSection>

        {/* ── Core Assertions ─────────────────────────────── */}
        <DocSection id="assertions" icon={<FlaskConical size={14} />} title="Core Assertions">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            All <code className="font-mono text-[11px]">expect()</code> assertions are{' '}
            <strong>auto-retrying</strong> — they poll until the condition is met or the timeout
            expires (default 5 s). Use <code className="font-mono text-[11px]">expect.soft()</code>{' '}
            to accumulate non-fatal failures.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Visibility',
                rows: [
                  { label: 'toBeVisible()', desc: 'Element is in DOM and not hidden.' },
                  { label: 'toBeHidden()', desc: 'Element is absent or display:none.' },
                  { label: 'toBeInViewport()', desc: 'Element is within the visible viewport.' },
                  {
                    label: 'toBeAttached()',
                    desc: 'Element is attached to the DOM (even if hidden).',
                  },
                ],
              },
              {
                title: 'Element State',
                rows: [
                  { label: 'toBeEnabled()', desc: 'Form control is not disabled.' },
                  { label: 'toBeDisabled()', desc: 'Form control has the disabled attribute.' },
                  { label: 'toBeChecked()', desc: 'Checkbox or radio is checked.' },
                  { label: 'toBeFocused()', desc: 'Element has keyboard focus.' },
                  { label: 'toBeEditable()', desc: 'Input is editable (not readonly).' },
                ],
              },
              {
                title: 'Content',
                rows: [
                  { label: 'toHaveText()', desc: "Matches element's full text (string or regex)." },
                  { label: 'toContainText()', desc: "Element's text contains the substring." },
                  { label: 'toHaveValue()', desc: 'Input / select has the expected value.' },
                  { label: 'toHaveValues()', desc: 'Multi-select has all expected values.' },
                  { label: 'toHaveAttribute()', desc: 'Element has a specific attribute value.' },
                  { label: 'toHaveClass()', desc: 'Element has the expected CSS class.' },
                  { label: 'toHaveCSS()', desc: 'Element has the expected computed CSS property.' },
                  { label: 'toHaveCount()', desc: 'Locator matches N elements.' },
                ],
              },
              {
                title: 'Page-level',
                rows: [
                  { label: 'toHaveTitle()', desc: 'Page <title> matches string or regex.' },
                  { label: 'toHaveURL()', desc: 'Current URL matches string or regex.' },
                  { label: 'toHaveScreenshot()', desc: 'Visual snapshot matches baseline PNG.' },
                  { label: 'toHaveAccessibilityTree()', desc: 'Full ARIA tree snapshot matches.' },
                ],
              },
            ].map(({ title, rows }) => (
              <div
                key={title}
                className="rounded-2xl border overflow-hidden shadow-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="px-3 py-2 border-b"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
                >
                  <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                    {title}
                  </p>
                </div>
                <div
                  className="p-3 flex flex-col gap-1.5"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  {rows.map((r) => (
                    <RefRow key={r.label} label={r.label} desc={r.desc} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <CodeBlock
            lang="typescript"
            code={`// Visibility & state
await expect(page.getByRole('dialog')).toBeVisible()
await expect(page.getByText('Loading…')).toBeHidden()
await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled()

// Content
await expect(page.getByRole('heading')).toHaveText('Welcome back')
await expect(page.getByLabel('Email')).toHaveValue('user@example.com')
await expect(page.getByRole('listitem')).toHaveCount(5)

// Page
await expect(page).toHaveTitle(/Dashboard/)
await expect(page).toHaveURL('/dashboard')

// Custom timeout (overrides the 5 s default)
await expect(locator).toBeVisible({ timeout: 15_000 })

// Negate any assertion
await expect(page.getByRole('alert')).not.toBeVisible()

// Soft assertions — accumulate failures, report all at end
await expect.soft(page.getByTestId('badge')).toHaveText('Pro')
await expect.soft(page.getByTestId('plan')).toHaveText('Annual')`}
          />
        </DocSection>

        {/* ── Common Patterns ─────────────────────────────── */}
        <DocSection id="patterns" icon={<Layers size={14} />} title="Common Patterns">
          {[
            {
              title: 'Page Object Model (POM)',
              subtitle: '— one class per page, shared across all specs',
              code: `// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitBtn: Locator
  readonly errorAlert: Locator

  constructor(private page: Page) {
    this.emailInput   = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitBtn    = page.getByRole('button', { name: 'Sign In' })
    this.errorAlert   = page.getByRole('alert')
  }

  async goto()                           { await this.page.goto('/login') }
  async login(email: string, pw: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(pw)
    await this.submitBtn.click()
  }
}

// tests/login.spec.ts
test('valid credentials redirect to dashboard', async ({ page }) => {
  const login = new LoginPage(page)
  await login.goto()
  await login.login('user@example.com', 'secret')
  await expect(page).toHaveURL('/dashboard')
})`,
            },
            {
              title: 'Custom Fixtures',
              subtitle: '— extend test with pre-authenticated state',
              code: `// support/fixtures.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

type Fixtures = {
  loginPage: LoginPage
  dashboardPage: DashboardPage
  loggedIn: void
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),

  loggedIn: async ({ loginPage }, use) => {
    await loginPage.goto()
    await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASS!)
    await use()   // hand control to the test
  },
})

// tests/dashboard.spec.ts — loggedIn fixture runs beforeEach automatically
test('dashboard shows user name', async ({ page, loggedIn, dashboardPage }) => {
  await expect(dashboardPage.welcomeBanner).toContainText('Welcome')
})`,
            },
            {
              title: 'Network Interception & Mocking',
              subtitle: '— control API responses without a real backend',
              code: `// Intercept and fulfil with fixture data
await page.route('**/api/products', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Widget', price: 9.99 }]),
  }),
)

// Abort specific requests (simulate network errors)
await page.route('**/api/analytics', (route) => route.abort())

// Modify a real response on the fly
await page.route('**/api/user', async (route) => {
  const response = await route.fetch()
  const json = await response.json()
  await route.fulfill({ response, json: { ...json, role: 'admin' } })
})

// Assert a request was fired with the right payload
const [request] = await Promise.all([
  page.waitForRequest((req) =>
    req.url().includes('/api/checkout') && req.method() === 'POST',
  ),
  page.getByRole('button', { name: 'Buy Now' }).click(),
])
expect(request.postDataJSON()).toMatchObject({ currency: 'USD' })`,
            },
            {
              title: 'Lifecycle Hooks',
              subtitle: '— before / after at describe and global scope',
              code: `// global setup — runs once for the entire test suite
// playwright.config.ts
export default defineConfig({ globalSetup: './global-setup.ts' })

// global-setup.ts
export default async function globalSetup() {
  // seed database, start mock server, etc.
}

// per-describe hooks
test.describe('Cart', () => {
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    await ctx.storageState({ path: 'auth.json' })
    await ctx.close()
  })

  test.beforeEach(async ({ page }) => { await page.goto('/cart') })

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: \`screenshots/\${testInfo.title}.png\` })
    }
  })

  test.afterAll(async () => { /* tear down */ })
})`,
            },
            {
              title: 'Parallel & Sharded runs',
              subtitle: '— speed up CI by splitting across machines',
              code: `// playwright.config.ts — run tests in parallel within each file
export default defineConfig({
  fullyParallel: true,  // parallel across files AND within files
  workers: 4,
})

// Shard across CI machines (e.g. GitHub Actions matrix)
// Machine 1: npx playwright test --shard=1/4
// Machine 2: npx playwright test --shard=2/4
// ...

// Tag tests and run a subset
test('checkout @smoke', async ({ page }) => { … })
// npx playwright test --grep @smoke`,
            },
          ].map(({ title, subtitle, code }) => (
            <div
              key={title}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="px-4 py-2.5 border-b flex items-center gap-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                  {title}
                </span>
                {subtitle && (
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {subtitle}
                  </span>
                )}
              </div>
              <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <CodeBlock lang="typescript" code={code} />
              </div>
            </div>
          ))}
        </DocSection>

        {/* ── Authentication ──────────────────────────────── */}
        <DocSection id="auth" icon={<Globe size={14} />} title="Authentication">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Log in once per project and reuse the browser storage state across every test — no
            re-authenticating per spec.
          </p>

          {[
            {
              title: 'Save auth state once (global setup)',
              code: `// global-setup.ts
import { chromium, FullConfig } from '@playwright/test'

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(config.projects[0].use.baseURL + '/login')
  await page.getByLabel('Email').fill(process.env.TEST_EMAIL!)
  await page.getByLabel('Password').fill(process.env.TEST_PASS!)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/dashboard')

  // Persist cookies + localStorage → reused by every test worker
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
  await browser.close()
}`,
            },
            {
              title: 'Reuse auth state in config',
              code: `// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  globalSetup: './global-setup.ts',
  projects: [
    // Authenticated project — shares the saved auth state
    {
      name: 'authenticated',
      use: { storageState: 'playwright/.auth/user.json' },
    },
    // Unauthenticated project — for login / public pages
    {
      name: 'unauthenticated',
      testMatch: '**/auth.spec.ts',
    },
  ],
})`,
            },
            {
              title: 'Multiple roles (admin vs user)',
              code: `// global-setup.ts — save two auth states
await loginAs('admin@example.com', 'admin-pass')
await page.context().storageState({ path: 'playwright/.auth/admin.json' })

await loginAs('user@example.com', 'user-pass')
await page.context().storageState({ path: 'playwright/.auth/user.json' })

// playwright.config.ts
projects: [
  { name: 'admin', use: { storageState: 'playwright/.auth/admin.json' } },
  { name: 'user',  use: { storageState: 'playwright/.auth/user.json' } },
]

// In your test — the context is already authenticated
test('admin can delete users', async ({ page }) => {
  await page.goto('/admin/users')
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
})`,
            },
            {
              title: 'API-based auth (faster than UI login)',
              code: `// global-setup.ts — POST to your auth API directly
const response = await request.post('/api/auth/login', {
  data: { email: process.env.TEST_EMAIL, password: process.env.TEST_PASS },
})
const { token } = await response.json()

// Inject the JWT into every browser context via extraHTTPHeaders
// playwright.config.ts
use: {
  extraHTTPHeaders: { Authorization: \`Bearer \${process.env.AUTH_TOKEN}\` },
}`,
            },
          ].map(({ title, code }) => (
            <div
              key={title}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                  {title}
                </span>
              </div>
              <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <CodeBlock lang="typescript" code={code} />
              </div>
            </div>
          ))}
        </DocSection>

        {/* ── Visual & A11y Testing ───────────────────────── */}
        <DocSection id="visual" icon={<Camera size={14} />} title="Visual & Accessibility Testing">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Catch pixel-level regressions and WCAG accessibility violations before they reach
            production.
          </p>

          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <div
              className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                Visual snapshot workflow
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <RefRow
                label="First run — update"
                desc="npx playwright test --update-snapshots  →  creates the baseline PNGs."
                badge="Setup"
                badgeColor="#1a3a8f"
              />
              <RefRow
                label="Subsequent runs"
                desc="Playwright diffs the screenshot pixel-by-pixel against the stored baseline."
                badge="Auto"
                badgeColor="#059669"
              />
              <RefRow
                label="Review failures"
                desc="Open the HTML report — it shows expected vs actual with a diff overlay."
                badge="Report"
                badgeColor="#d97706"
              />
              <RefRow
                label="Update baseline"
                desc="npx playwright test --update-snapshots  →  accept the new appearance."
                badge="Accept"
                badgeColor="#6b7280"
              />
            </div>
          </div>

          <CodeBlock
            lang="typescript"
            code={`// Visual regression — full page
await expect(page).toHaveScreenshot('home.png')

// Clip to a specific element
await expect(page.getByRole('banner')).toHaveScreenshot('header.png')

// Tolerance for minor anti-aliasing differences
await expect(page).toHaveScreenshot('hero.png', { maxDiffPixelRatio: 0.01 })

// Mask dynamic regions (timestamps, ads)
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.getByTestId('last-updated'), page.locator('.ad-banner')],
})`}
          />

          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                Accessibility — WCAG audits with axe-core
              </span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
                Install <code className="font-mono">@axe-core/playwright</code> to run WCAG 2.1 AA
                audits inside your Playwright tests.
              </p>
              <CodeBlock lang="bash" code={`npm install --save-dev @axe-core/playwright`} />
              <div className="mt-3">
                <CodeBlock
                  lang="typescript"
                  code={`import { checkA11y, injectAxe } from '@axe-core/playwright'

test('home page passes WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)

  // Scan the entire page
  await checkA11y(page, undefined, {
    axeOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
    detailedReport: true,
  })
})

test('modal has no critical violations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open dialog' }).click()
  await injectAxe(page)

  // Scope scan to just the modal
  await checkA11y(page, '[role="dialog"]')
})`}
                />
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <div
              className="px-4 py-2 border-b"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                Accessibility checklist
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {[
                {
                  label: 'Keyboard navigation',
                  desc: 'Tab through all interactive elements — confirm focus order is logical.',
                },
                {
                  label: 'Focus visible',
                  desc: 'Every focused element must have a visible outline (WCAG 2.4.7).',
                },
                {
                  label: 'Colour contrast',
                  desc: 'Text must meet 4.5:1 ratio (normal) or 3:1 (large text) per WCAG 1.4.3.',
                },
                {
                  label: 'Alt text on images',
                  desc: 'Informational images need descriptive alt; decorative images use alt="".',
                },
                {
                  label: 'Form labels',
                  desc: 'Every input must have an associated <label> or aria-label.',
                },
                {
                  label: 'ARIA landmarks',
                  desc: 'Use <header>, <main>, <nav>, <footer> — or their ARIA equivalents.',
                },
                {
                  label: 'RTL support',
                  desc: 'Set dir="rtl" on the <html> element for Hebrew / Arabic layouts.',
                },
              ].map((r) => (
                <RefRow key={r.label} label={r.label} desc={r.desc} />
              ))}
            </div>
          </div>
        </DocSection>

        {/* ── CI / CD Integration ─────────────────────────── */}
        <DocSection id="cicd" icon={<GitBranch size={14} />} title="CI / CD Integration">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Run Playwright headlessly in your pipeline and upload the HTML report as a build
            artifact.
          </p>

          {[
            {
              title: 'GitHub Actions',
              code: `# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }

      - run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run tests
        run: npx playwright test
        env:
          BASE_URL: \${{ secrets.STAGING_URL }}
          TEST_EMAIL: \${{ secrets.TEST_EMAIL }}
          TEST_PASS: \${{ secrets.TEST_PASS }}

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: always()          # upload even on failure
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload test results (for open-qa)
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: pw-results
          path: pw-results.json`,
            },
            {
              title: 'Sharding across parallel jobs',
              code: `# Run 4 shards in parallel — each picks up 1/4 of the test files
jobs:
  test:
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}

  merge-reports:
    needs: test
    steps:
      - run: npx playwright merge-reports --reporter html ./all-blobs
      - uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report/ }`,
            },
            {
              title: 'Environment variables & secrets',
              code: `// playwright.config.ts — read from CI environment
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: {
      'x-api-key': process.env.API_KEY ?? '',
    },
  },
})

// .env.test — local overrides (git-ignored)
BASE_URL=http://localhost:3000
TEST_EMAIL=qa@example.com
TEST_PASS=secret

// Load in config
import { config } from 'dotenv'
config({ path: '.env.test' })`,
            },
            {
              title: 'Recommended CI flags',
              code: `# Optimal CI configuration
npx playwright test \\
  --reporter=list,json    \\  # list for logs, json for open-qa dashboard
  --workers=1             \\  # single worker avoids resource contention
  --retries=2             \\  # retry flaky tests before marking failed
  --forbid-only              # fail if test.only is left in source`,
            },
          ].map(({ title, code }) => (
            <div
              key={title}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                  {title}
                </span>
              </div>
              <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <CodeBlock lang="yaml" code={code} />
              </div>
            </div>
          ))}
        </DocSection>

        {/* ── CLI Reference ───────────────────────────────── */}
        <DocSection id="cli" icon={<Terminal size={14} />} title="CLI Reference">
          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <div
              className="px-4 py-2 border-b"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
            >
              <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                npx playwright test [options]
              </p>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {[
                { flag: '--headed', desc: 'Run with a visible browser window' },
                { flag: '--ui', desc: 'Open the interactive Playwright UI mode' },
                { flag: '--debug', desc: 'Pause before each action — step through with DevTools' },
                { flag: '--project=chromium', desc: 'Run only in the specified project / browser' },
                { flag: '--grep "login"', desc: 'Run only tests whose title matches the pattern' },
                { flag: '--grep-invert "slow"', desc: 'Exclude tests matching the pattern' },
                { flag: '--workers=4', desc: 'Override number of parallel workers' },
                { flag: '--retries=2', desc: 'Override retry count' },
                {
                  flag: '--reporter=json',
                  desc: 'Override reporter (html | json | junit | line | dot)',
                },
                { flag: '--timeout=60000', desc: 'Override per-test timeout in ms' },
                {
                  flag: '--last-failed',
                  desc: 'Re-run only the tests that failed in the last run',
                },
                { flag: '--forbid-only', desc: 'Fail if test.only is present (for CI)' },
                { flag: '--shard=1/4', desc: 'Run a fraction of tests for parallel CI' },
                { flag: '--update-snapshots', desc: 'Accept new visual snapshot baselines' },
                { flag: '--config=pw.config.ts', desc: 'Use a non-default config file' },
                { flag: '--pass-with-no-tests', desc: 'Exit 0 even if no tests match the filter' },
              ].map(({ flag, desc }) => (
                <RefRow key={flag} label={flag} desc={desc} />
              ))}
            </div>
          </div>

          <CodeBlock
            lang="bash"
            code={`# Run a single spec file
npx playwright test tests/login.spec.ts

# Run only tests tagged @smoke
npx playwright test --grep @smoke

# Run on Firefox + WebKit only
npx playwright test --project=firefox --project=webkit

# Open the trace viewer for a recorded trace
npx playwright show-trace test-results/trace.zip

# Record actions in a browser → generate test code
npx playwright codegen https://example.com

# Install / update browser binaries
npx playwright install
npx playwright install chromium --with-deps   # + system libs (for CI)

# Merge sharded blob reports into one HTML report
npx playwright merge-reports --reporter html ./blob-reports

# Print all available CLI options
npx playwright test --help`}
          />
        </DocSection>
      </div>
    </div>
  );
}

// ─── Artifact Modal ───────────────────────────────────────────────────────────

interface ArtifactFile {
  name: string;
  path: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArtifactModal({ state, onClose }: { state: ArtifactModalState; onClose: () => void }) {
  const [artifacts, setArtifacts] = useState<ArtifactFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/playwright/artifacts`)
      .then((r) => r.json() as Promise<{ artifacts: ArtifactFile[] }>)
      .then((data) => {
        setArtifacts(data.artifacts);
        setLoading(false);
      })
      .catch(() => {
        setArtifacts([]);
        setLoading(false);
      });
  }, [state.testId]);

  const extType = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() ?? '?';
    return ext;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl border shadow-2xl p-6 w-full max-w-md"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
            Test Artifacts
          </h3>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <p className="text-xs mb-4 font-mono truncate" style={{ color: 'var(--text-muted)' }}>
          {state.testTitle}
        </p>

        {loading ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            Loading artifacts…
          </p>
        ) : artifacts.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No artifacts found. Run tests with{' '}
            <code className="font-mono">screenshot: &apos;on&apos;</code> or{' '}
            <code className="font-mono">trace: &apos;on&apos;</code> to generate files.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {artifacts.map((file) => (
              <a
                key={file.path}
                href={`${API_BASE}/test-results/${file.path}`}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs hover:opacity-80 transition-opacity no-underline"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-body)',
                }}
              >
                <span
                  className="font-mono truncate flex-1 mr-2"
                  style={{ color: 'var(--text-main)' }}
                >
                  {file.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span style={{ color: 'var(--text-muted)' }}>{formatBytes(file.size)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-semibold text-[10px]">
                    {extType(file.name)}
                  </span>
                  <Download size={11} style={{ color: 'var(--text-muted)' }} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Failed Test Action Bar ───────────────────────────────────────────────────

function FailedActions({
  test,
  suiteFile,
  onViewArtifacts,
}: {
  test: TestCase;
  suiteFile: string;
  onViewArtifacts: (state: ArtifactModalState) => void;
}) {
  const [jiraCopied, setJiraCopied] = useState(false);

  const exportJira = () => {
    const payload = {
      summary: `[QA] Test failure: ${test.title}`,
      description: `**File:** \`${suiteFile}\`\n**Error:**\n\`\`\`\n${test.error}\n\`\`\``,
      labels: ['automated-test', 'playwright'],
      priority: 'High',
    };
    navigator.clipboard
      .writeText(JSON.stringify(payload, null, 2))
      .then(() => {
        setJiraCopied(true);
        setTimeout(() => setJiraCopied(false), 2000);
      })
      .catch(() => {
        // Fallback: show the JSON in a small alert for browsers that block clipboard
        prompt('Copy this Jira payload:', JSON.stringify(payload, null, 2));
      });
  };

  const viewTrace = () => {
    window.open('http://localhost:3001/playwright-report/index.html', '_blank');
  };

  return (
    <div
      className="flex items-center gap-1.5 px-5 py-2 border-t"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'rgba(239,68,68,0.04)',
      }}
    >
      <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>
        Actions:
      </span>
      <button
        onClick={exportJira}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100"
      >
        {jiraCopied ? (
          <>
            <Check size={11} /> Copied!
          </>
        ) : (
          <>
            <Bug size={11} /> Copy Jira JSON
          </>
        )}
      </button>
      <button
        onClick={viewTrace}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100"
      >
        <Eye size={11} /> View Report
      </button>
      <button
        onClick={() => onViewArtifacts({ testId: test.id, testTitle: test.title })}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200"
      >
        <Camera size={11} /> View Artifacts
      </button>
    </div>
  );
}

// ─── Editor View ─────────────────────────────────────────────────────────────

const NEW_SPEC_STUB = `import { test, expect } from '@playwright/test'

test.describe('My test suite', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.*/)
  })
})
`;

function EditorView({
  specs,
  onReloadSpecs,
  onRunSpec,
}: {
  specs: string[];
  onReloadSpecs: () => void;
  onRunSpec: (spec: string) => void;
}) {
  const [activeFile, setActiveFile] = useState<string | null>(specs[0] ?? null);
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const isDirty = content !== savedContent;
  const [loadKey, setLoadKey] = useState(0);

  // Auto-select first spec when the list arrives (handles async fetchSpecs timing)
  useEffect(() => {
    if (!activeFile && specs.length > 0) setActiveFile(specs[0]);
  }, [specs, activeFile]);

  // Load file content — re-runs when activeFile or loadKey changes (loadKey = manual retry)
  useEffect(() => {
    if (!activeFile) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/playwright/file?name=${encodeURIComponent(activeFile)}`)
      .then(async (r) => {
        const text = await r.text();
        try {
          const d = JSON.parse(text) as { content?: string; error?: string };
          if (d.content !== undefined) {
            setContent(d.content);
            setSavedContent(d.content);
          } else {
            setError(d.error ?? 'Failed to load file');
          }
        } catch {
          setError(
            `Server returned an unexpected response (HTTP ${r.status}) — check your server console`,
          );
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(
          msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
            ? 'Cannot connect to localhost:3001 — make sure the server is running (npm run dev)'
            : msg,
        );
      })
      .finally(() => setLoading(false));
  }, [activeFile, loadKey]);

  const saveFile = useCallback(async () => {
    if (!activeFile) return;
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/playwright/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeFile, content }),
      });
      const d = await r.json();
      if (d.ok) {
        setSavedContent(content);
        setSaveMsg('Saved!');
        setTimeout(() => setSaveMsg(null), 2000);
      } else setError(d.error ?? 'Save failed');
    } catch {
      setError('Save failed — server not reachable');
    } finally {
      setSaving(false);
    }
  }, [activeFile, content]);

  const createFile = useCallback(async () => {
    const name = newName.trim().replace(/\.spec\.(ts|js)$/, '') + '.spec.ts';
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/playwright/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content: NEW_SPEC_STUB }),
      });
      const d = await r.json();
      if (d.ok) {
        setShowNew(false);
        setNewName('');
        onReloadSpecs();
        // Small delay so specs list refreshes before we select
        setTimeout(() => setActiveFile(name), 200);
      } else setError(d.error ?? 'Create failed');
    } catch {
      setError('Create failed — server not reachable');
    }
  }, [newName, onReloadSpecs]);

  const deleteFile = useCallback(
    async (name: string) => {
      setError(null);
      try {
        const r = await fetch(`${API_BASE}/api/playwright/file?name=${encodeURIComponent(name)}`, {
          method: 'DELETE',
        });
        const d = await r.json();
        if (d.ok) {
          setDelConfirm(null);
          if (activeFile === name) {
            setActiveFile(null);
            setContent('');
            setSavedContent('');
          }
          onReloadSpecs();
        } else setError(d.error ?? 'Delete failed');
      } catch {
        setError('Delete failed — server not reachable');
      }
    },
    [activeFile, onReloadSpecs],
  );

  // Tab → insert 2 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const s = el.selectionStart;
      const end = el.selectionEnd;
      const next = content.slice(0, s) + '  ' + content.slice(end);
      setContent(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  };

  const lineCount = content.split('\n').length;

  return (
    <div
      className="flex gap-0 rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: 'var(--border)', minHeight: '72vh' }}
    >
      {/* ── Left sidebar: file list ── */}
      <div
        className="w-52 shrink-0 flex flex-col border-r"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
            Tests
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onReloadSpecs}
              title="Refresh"
              className="p-1 rounded hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <RefreshCw size={11} />
            </button>
            <button
              onClick={() => setShowNew((v) => !v)}
              title="New spec file"
              className="p-1 rounded transition-colors"
              style={showNew ? { color: '#1a3a8f' } : { color: 'var(--text-muted)' }}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* New file input */}
        {showNew && (
          <div
            className="px-2 py-2 border-b flex flex-col gap-1.5"
            style={{ borderColor: 'var(--border)' }}
          >
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFile();
                if (e.key === 'Escape') {
                  setShowNew(false);
                  setNewName('');
                }
              }}
              placeholder="my-test"
              className="w-full px-2 py-1 rounded-lg border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-main)',
              }}
            />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              .spec.ts will be appended
            </p>
            <button
              onClick={createFile}
              disabled={!newName.trim()}
              className="w-full py-1 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ backgroundColor: '#1a3a8f', color: '#fff' }}
            >
              Create
            </button>
          </div>
        )}

        {/* File list */}
        <div className="flex-1 overflow-y-auto py-1">
          {specs.length === 0 && (
            <p className="px-3 py-4 text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
              No spec files found
            </p>
          )}
          {specs.map((s) => (
            <div
              key={s}
              className="group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
              style={
                activeFile === s
                  ? {
                      backgroundColor: 'rgba(26,58,143,0.08)',
                      borderLeft: '2px solid #1a3a8f',
                    }
                  : { borderLeft: '2px solid transparent' }
              }
              onClick={() => setActiveFile(s)}
              onMouseEnter={(e) => {
                if (activeFile !== s)
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-body)';
              }}
              onMouseLeave={(e) => {
                if (activeFile !== s) (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              <span
                className="text-[11px] font-mono truncate"
                style={{
                  color: activeFile === s ? '#1a3a8f' : 'var(--text-main)',
                }}
              >
                {s.replace(/\.spec\.(ts|js)$/, '')}
                <span className="opacity-40">.spec.ts</span>
              </span>
              {delConfirm === s ? (
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => deleteFile(s)}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    del
                  </button>
                  <button
                    onClick={() => setDelConfirm(null)}
                    className="text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDelConfirm(s);
                  }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5 rounded"
                  style={{ color: '#ef4444' }}
                  title="Delete file"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: editor ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b shrink-0"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div className="flex items-center gap-2">
            <FileText size={12} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-main)' }}>
              {activeFile ?? '—'}
            </span>
            {isDirty && (
              <span
                className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                title="Unsaved changes"
              />
            )}
            {saveMsg && (
              <span className="text-[11px] font-semibold text-emerald-500">{saveMsg}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[11px] font-semibold text-red-400 max-w-xs truncate"
                  title={error}
                >
                  {error}
                </span>
                {activeFile && (
                  <button
                    onClick={() => setLoadKey((k) => k + 1)}
                    className="text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    title="Retry loading file"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {lineCount} lines
            </span>
            <button
              onClick={saveFile}
              disabled={!activeFile || saving || !isDirty}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
              style={
                isDirty && !saving
                  ? {
                      backgroundColor: '#1a3a8f',
                      borderColor: '#1a3a8f',
                      color: '#fff',
                    }
                  : {
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                    }
              }
              title="Save (Ctrl+S)"
            >
              {saving ? <RotateCcw size={11} className="animate-spin" /> : <Save size={11} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => activeFile && onRunSpec(activeFile)}
              disabled={!activeFile || isDirty}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
              style={{
                backgroundColor: '#059669',
                borderColor: '#059669',
                color: '#fff',
              }}
              title={isDirty ? 'Save before running' : 'Run this spec'}
            >
              <Play size={11} /> Run
            </button>
          </div>
        </div>

        {/* Editor body */}
        {!activeFile ? (
          <div
            className="flex-1 flex items-center justify-center flex-col gap-3"
            style={{ backgroundColor: '#1e1e2e' }}
          >
            <PenLine size={32} style={{ color: '#4c4f69' }} />
            <p className="text-sm" style={{ color: '#6c7086' }}>
              Select a spec file to edit
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: '#1a3a8f', color: '#fff' }}
            >
              <Plus size={12} /> New spec file
            </button>
          </div>
        ) : loading ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: '#1e1e2e' }}
          >
            <RotateCcw size={18} className="animate-spin" style={{ color: '#6c7086' }} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: '#1e1e2e' }}>
            {/* Line numbers */}
            <div
              ref={lineNumbersRef}
              className="select-none text-right pr-3 pl-3 py-3 text-[12px] font-mono leading-[1.6] shrink-0 overflow-hidden pointer-events-none"
              style={{ color: '#4c4f69', minWidth: '3rem', userSelect: 'none' }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            {/* Code textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={(e) => {
                if (lineNumbersRef.current)
                  lineNumbersRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
              }}
              spellCheck={false}
              className="flex-1 resize-none focus:outline-none py-3 pr-4 text-[12.5px] font-mono leading-[1.6]"
              style={{
                backgroundColor: '#1e1e2e',
                color: '#cdd6f4',
                caretColor: '#cdd6f4',
                tabSize: 2,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PW Office Panel — helper components ─────────────────────────────────────

function PwMarkdownContent({
  text,
  onRunCode,
  agentName,
}: {
  text: string;
  onRunCode?: (code: string, agentName?: string) => void;
  agentName?: string;
}) {
  const [copied, setCopied] = useState<number | null>(null);
  const [running, setRunning] = useState<number | null>(null);
  const copyCode = useCallback((code: string, idx: number) => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g);
  return (
    <div className="text-[11px] leading-relaxed">
      {parts.map((part, i) => {
        const fm = /^```([\w]*)\n([\s\S]*?)```$/.exec(part);
        if (fm) {
          const lang = fm[1] || 'text';
          const code = fm[2].trimEnd();
          const isRunnable = !!onRunCode && /^(typescript|javascript|ts|js)$/i.test(lang);
          return (
            <div
              key={i}
              className="relative my-1.5 rounded-lg overflow-hidden"
              style={{ background: '#0d1117', border: '1px solid #30363d' }}
            >
              <div
                className="flex items-center justify-between px-2 py-1"
                style={{
                  background: '#161b22',
                  borderBottom: '1px solid #30363d',
                }}
              >
                <span className="text-[9px] font-mono uppercase" style={{ color: '#8b949e' }}>
                  {lang}
                </span>
                <div className="flex items-center gap-1">
                  {isRunnable && (
                    <button
                      onClick={() => {
                        setRunning(i);
                        onRunCode!(code, agentName);
                        setTimeout(() => setRunning(null), 3000);
                      }}
                      disabled={running === i}
                      className="text-[9px] px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5"
                      style={{
                        color: running === i ? '#58a6ff' : '#3fb950',
                        background: running === i ? 'rgba(88,166,255,0.1)' : 'rgba(63,185,80,0.08)',
                        border: `1px solid ${running === i ? 'rgba(88,166,255,0.3)' : 'rgba(63,185,80,0.25)'}`,
                        opacity: running !== null && running !== i ? 0.5 : 1,
                      }}
                    >
                      {running === i ? '⟳ Queued' : '▶ Run in Dashboard'}
                    </button>
                  )}
                  <button
                    onClick={() => copyCode(code, i)}
                    className="text-[9px] px-1.5 py-0.5 rounded transition-colors"
                    style={{
                      color: copied === i ? '#3fb950' : '#8b949e',
                      background: copied === i ? 'rgba(63,185,80,0.1)' : 'transparent',
                    }}
                  >
                    {copied === i ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre
                className="px-3 py-2 overflow-x-auto font-mono text-[10px]"
                style={{ color: '#e6edf3', margin: 0 }}
              >
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        const lines = part.split('\n');
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const segs = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
              return (
                <span key={li}>
                  {segs.map((seg, si) => {
                    if (/^`[^`]+`$/.test(seg))
                      return (
                        <code
                          key={si}
                          className="px-0.5 rounded text-[10px] font-mono"
                          style={{
                            background: 'rgba(110,118,129,0.2)',
                            color: '#f0883e',
                          }}
                        >
                          {seg.slice(1, -1)}
                        </code>
                      );
                    if (/^\*\*[^*]+\*\*$/.test(seg))
                      return (
                        <strong key={si} style={{ color: '#e6edf3' }}>
                          {seg.slice(2, -2)}
                        </strong>
                      );
                    if (/^\*[^*]+\*$/.test(seg)) return <em key={si}>{seg.slice(1, -1)}</em>;
                    return <span key={si}>{seg}</span>;
                  })}
                  {li < lines.length - 1 && <br />}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function PwMessageBubble({
  msg,
  isStreaming,
  agents,
  onRunCode,
}: {
  msg: Message;
  isStreaming: boolean;
  agents: AgentConfig[];
  onRunCode?: (code: string, agentName?: string) => void;
}) {
  const isUser = msg.role === 'user';
  const agent = msg.agentId ? agents.find((a) => a.id === msg.agentId) : null;
  const accent = agent ? PW_SPRITE_ACCENT[agent.characterSprite] : null;
  const avatarBg = isUser ? '#1e3a5f' : (accent?.bg ?? '#0f2a1a');
  const avatarRing = isUser ? '#1a3a8f' : (accent?.ring ?? '#166534');
  const avatarText = isUser ? '#93c5fd' : (accent?.text ?? '#4ade80');
  const initials = isUser ? 'U' : (msg.senderName?.slice(0, 2).toUpperCase() ?? 'AI');

  // ── Multi-agent collaboration: detect role from the " · label" suffix the
  // server adds to senderName (e.g. "Bug Triager · Critique (round 1)") and
  // render it as a colour-coded role pill so the user can tell at a glance
  // who is drafting / critiquing / synthesising.
  const senderParts = (msg.senderName ?? '').split(' · ');
  const agentLabel = senderParts[0];
  const roleLabel = senderParts.length > 1 ? senderParts.slice(1).join(' · ') : null;
  const rolePalette = (() => {
    if (!roleLabel) return null;
    const l = roleLabel.toLowerCase();
    if (l.includes('synthesis') || l.includes('final'))
      return {
        bg: 'rgba(16,185,129,0.16)',
        color: '#34d399',
        border: 'rgba(16,185,129,0.30)',
      }; // synthesis = emerald
    if (l.includes('critique') || l.includes('review'))
      return {
        bg: 'rgba(245,158,11,0.16)',
        color: '#E8A728',
        border: 'rgba(245,158,11,0.30)',
      }; // critic = amber
    if (l.includes('draft') || l.includes('refined') || l.includes('round'))
      return {
        bg: 'rgba(59,130,246,0.16)',
        color: '#60a5fa',
        border: 'rgba(59,130,246,0.30)',
      }; // primary = blue
    return {
      bg: 'rgba(148,163,184,0.16)',
      color: '#cbd5e1',
      border: 'rgba(148,163,184,0.30)',
    };
  })();

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
        style={{
          background: avatarBg,
          color: avatarText,
          border: `1.5px solid ${avatarRing}`,
        }}
      >
        {initials}
      </div>
      <div className={`flex flex-col gap-0.5 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span
          className="text-[9px] font-medium px-0.5 flex items-center gap-1.5 flex-wrap"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{agentLabel}</span>
          {roleLabel && rolePalette && (
            <span
              className="inline-flex items-center text-[8px] font-bold uppercase tracking-wider px-1.5 py-px rounded leading-none"
              style={{
                background: rolePalette.bg,
                color: rolePalette.color,
                border: `1px solid ${rolePalette.border}`,
              }}
              title={`Collaboration step: ${roleLabel}`}
            >
              {roleLabel}
            </span>
          )}
          <span className="font-normal opacity-60">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </span>
        <div
          className="rounded-xl px-2.5 py-2"
          style={{
            background: isUser ? 'linear-gradient(135deg,#1e3a5f,#1a3050)' : 'var(--bg-card)',
            border: `1px solid ${isUser ? '#1e4080' : 'var(--border)'}`,
            color: 'var(--text-main)',
            wordBreak: 'break-word',
          }}
        >
          {msg.attachments
            ?.filter((a) => !a.type.startsWith('image/'))
            .map((att, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 mr-1 mb-1.5 px-1.5 py-0.5 rounded text-[9px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <FileText size={8} />
                {att.name}
              </span>
            ))}
          {msg.attachments
            ?.filter((a) => a.type.startsWith('image/'))
            .map((att, i) => (
              <img
                key={i}
                src={att.content}
                alt={att.name}
                className="max-w-full rounded-lg mb-1.5 block"
                style={{
                  border: '1px solid var(--border)',
                  maxHeight: 150,
                  objectFit: 'cover',
                }}
              />
            ))}
          {isUser ? (
            <span className="text-[11px] leading-relaxed whitespace-pre-wrap">{msg.content}</span>
          ) : msg.content ? (
            <PwMarkdownContent text={msg.content} onRunCode={onRunCode} agentName={agent?.name} />
          ) : (
            <span className="flex gap-0.5 items-center py-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          )}
          {isStreaming && msg.content && (
            <span
              className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
              style={{
                background: accent?.bar ?? '#4ade80',
                verticalAlign: 'middle',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PW Office Panel ─────────────────────────────────────────────────────────

interface PwOfficePanelProps {
  running: boolean;
  suites: TestSuite[];
  onRunCode?: (code: string, agentName?: string) => void;
  onRunAll?: () => void;
}

function PwOfficePanel({ running, suites, onRunCode, onRunAll }: PwOfficePanelProps) {
  const {
    agents,
    settings,
    updateSettings,
    messages,
    appendMessage,
    appendChunk,
    updateMessage,
    clearHistory,
    activeTypingAgents,
    setAgentStatus,
    setActiveTyping,
    removeActiveTyping,
  } = useSettings();

  const panRef = useRef({ x: 0, y: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [assetsReady, setAssetsReady] = useState(false);
  const [inputText, setInputText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<Attachment[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Default selected agent to first available
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) setSelectedAgentId(agents[0].id);
  }, [agents, selectedAgentId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMsgId]);

  // ── Mount: init singleton + load assets ──────────────────────────────────
  useEffect(() => {
    if (!_pwOfficeState) _pwOfficeState = new OfficeState();
    const os = _pwOfficeState;
    Promise.all([loadOfficeAssets(), loadDefaultLayout()])
      .then(([, rawLayout]) => {
        if (rawLayout) os.rebuildFromLayout(rawLayout as OfficeLayout);
        agents.forEach((_agent, idx) => {
          const numId = pwAgentNumId(idx);
          if (!os.characters.has(numId)) {
            os.addAgent(numId, undefined, undefined, undefined, true);
          }
          const active =
            running ||
            (hasFailures && (_agent.id === 'agent-triage' || _agent.id === 'agent-healer'));
          os.setAgentActive(numId, active);
        });
        setAssetsReady(true);
      })
      .catch(() => setAssetsReady(true));
  }, []);

  // ── Derive failure flag ───────────────────────────────────────────────────
  const hasFailures = suites.some((s) => s.tests.some((t) => t.status === 'failed'));

  // ── Sync: drive animations from test state ────────────────────────────────
  useEffect(() => {
    if (!_pwOfficeState) return;
    agents.forEach((agent, idx) => {
      const numId = pwAgentNumId(idx);
      const active =
        running || (hasFailures && (agent.id === 'agent-triage' || agent.id === 'agent-healer'));
      _pwOfficeState!.setAgentActive(numId, active);
    });
  }, [agents, running, hasFailures]);

  const handleAgentClick = (charId: number) => {
    const agent = agents[charId - 1];
    if (!agent) return;
    setSelectedAgentId(agent.id);
  };

  // ── @-mention autocomplete ────────────────────────────────────────────────

  const mentionMatches =
    mentionQuery !== null
      ? agents.filter(
          (a) =>
            a.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            a.role.toLowerCase().includes(mentionQuery.toLowerCase()),
        )
      : [];

  const insertMention = useCallback(
    (agentName: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const pos = textarea.selectionStart;
      const text = inputText;
      const atIdx = text.lastIndexOf('@', pos - 1);
      if (atIdx === -1) return;
      const next = `${text.slice(0, atIdx)}@${agentName} ${text.slice(pos)}`;
      setInputText(next);
      setMentionQuery(null);
      requestAnimationFrame(() => {
        const newPos = atIdx + agentName.length + 2;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      });
    },
    [inputText],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    const atMatch = /@([\w ]*)$/.exec(val.slice(0, e.target.selectionStart));
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else setMentionQuery(null);
  };

  const handleKeyDownChat = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionMatches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionMatches.length) % mentionMatches.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionMatches[mentionIndex].name);
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ── File attachment ───────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () =>
          setPendingFiles((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              content: reader.result as string,
            },
          ]);
        reader.readAsDataURL(file);
      } else if (PW_TEXT_EXTENSIONS.has(ext)) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const inlined = `[File: ${file.name}]\n\`\`\`\n${text}\n\`\`\``;
          setInputText((prev) => (prev ? `${prev}\n\n${inlined}` : inlined));
          setPendingFiles((prev) => [
            ...prev,
            { name: file.name, type: 'text/plain', content: text },
          ]);
        };
        reader.readAsText(file);
      }
    });
    e.target.value = '';
  };

  // ── Parse @-mentions ──────────────────────────────────────────────────────

  const parseTaggedAgents = useCallback(
    (text: string) => {
      const names = [...text.matchAll(/@([\w]+(?:\s[\w]+)*)/g)].map((m) => m[1].trim());
      const matched = names
        .map((name) => agents.find((a) => a.name.toLowerCase() === name.toLowerCase()))
        .filter((a): a is AgentConfig => a !== undefined);
      return [...new Map(matched.map((a) => [a.id, a])).values()];
    },
    [agents],
  );

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text && pendingFiles.length === 0) return;
    if (streamingMsgId) return;

    setMentionQuery(null);
    setErrorBanner(null);

    const imageAtts = pendingFiles.filter((f) => f.type.startsWith('image/'));
    const allAtts = pendingFiles;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      senderName: 'User',
      timestamp: Date.now(),
      attachments: allAtts.length > 0 ? allAtts : undefined,
    };
    appendMessage(userMsg);
    setInputText('');
    setPendingFiles([]);

    // ── Slash-command interception: @AgentName /command ────────────────────
    const slashMatch = /^@([\w][\w ]*?)\s+\/([\w-]+)/i.exec(text.trim());
    if (slashMatch) {
      const [, mentionedName, command] = slashMatch;
      const cmdAgent = agents.find(
        (a) => a.name.toLowerCase() === mentionedName.toLowerCase().trim(),
      );
      if (cmdAgent && ['run', 'run-all', 'fix-failures'].includes(command.toLowerCase())) {
        setAgentStatus(cmdAgent.id, 'working');
        const cmdMsg: Message = {
          id: crypto.randomUUID(),
          role: 'model',
          content: `▶ Command \`/${command}\` received — triggering automation suite…`,
          senderName: cmdAgent.name,
          agentId: cmdAgent.id,
          timestamp: Date.now(),
        };
        appendMessage(cmdMsg);
        // Kick off test run and restore idle state when done
        onRunAll?.();
        setTimeout(() => setAgentStatus(cmdAgent.id, 'idle'), 5000);
        setStreamingMsgId(null);
        return;
      }
    }

    const tagged = parseTaggedAgents(text);
    const targets =
      tagged.length > 0
        ? tagged
        : selectedAgentId
          ? agents.filter((a) => a.id === selectedAgentId)
          : agents.length > 0
            ? [agents[0]]
            : [];
    if (targets.length === 0) return;

    setActiveTyping(targets.map((a) => a.id));
    targets.forEach((a) => setAgentStatus(a.id, 'working'));

    const modelMsgId = crypto.randomUUID();
    const respondentName =
      targets.length === 1 ? targets[0].name : targets.map((a) => a.name).join(' + ');

    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      senderName: respondentName,
      agentId: targets.length === 1 ? targets[0].id : undefined,
      timestamp: Date.now(),
    };
    appendMessage(modelMsg);
    setStreamingMsgId(modelMsgId);

    const priorMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const isOllama = settings.provider === 'ollama';
      const resp = await fetch(`${API_BASE}/api/qa-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.geminiApiKey}`,
        },
        body: JSON.stringify({
          message: text,
          history: priorMessages,
          agentIds: targets.map((a) => a.id),
          agents: agents.map((a) => ({
            id: a.id,
            name: a.name,
            systemPrompt: a.systemPrompt,
          })),
          imageAttachments: isOllama
            ? []
            : imageAtts.map((att) => ({
                name: att.name,
                type: att.type,
                content: att.content,
              })),
          model: isOllama ? settings.ollamaModel : settings.defaultModel,
          provider: settings.provider,
          ollamaBaseUrl: settings.ollamaBaseUrl,
          // ── Multi-agent collaboration trigger ───────────────────────────────
          // Auto-enable when the user tags 2+ agents (intent: "team huddle") or
          // tags the manager (intent: "go through the team"). Gemini-only.
          collaborate:
            !isOllama && (targets.length >= 2 || targets.some((a) => a.id === TEAM_MANAGER_ID)),
          maxRounds: 2,
        }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const errData = (await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))) as {
          error?: string;
        };
        appendChunk(modelMsgId, `\n\n[Error: ${errData.error ?? 'Unknown error'}]`);
        targets.forEach((a) => setAgentStatus(a.id, 'error'));
        setActiveTyping([]);
        setStreamingMsgId(null);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Multi-agent collaboration mode: the server emits `turn_start | chunk |
      // turn_done` events as the team passes work back and forth. Each turn
      // gets its own chat message so the user sees a threaded conversation.
      // `activeMsgId` tracks which message subsequent `chunk` events flow into.
      let activeMsgId: string = modelMsgId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const payload = JSON.parse(raw) as {
              chunk?: string;
              done?: boolean;
              error?: string;
              evt?: 'turn_start' | 'turn_done' | 'turn_verdict';
              agentId?: string;
              agentName?: string;
              role?: 'primary' | 'critic' | 'synthesis';
              round?: number;
              label?: string;
              verdict?: 'lgtm' | 'needs_work';
            };
            if (payload.error) {
              appendChunk(activeMsgId, `\n\n[Error: ${payload.error}]`);
              targets.forEach((a) => setAgentStatus(a.id, 'error'));
              setActiveTyping([]);
              setStreamingMsgId(null);
              return;
            }
            // Collaboration turn boundary — replace the initial placeholder
            // on the first turn_start, then create a fresh message per subsequent turn.
            if (payload.evt === 'turn_start' && payload.agentId) {
              const senderName = payload.label
                ? `${payload.agentName ?? 'Agent'} · ${payload.label}`
                : (payload.agentName ?? 'Agent');
              // First turn reuses modelMsgId (and clears its placeholder name);
              // subsequent turns spawn a brand-new message.
              if (activeMsgId === modelMsgId && payload.round === 1 && payload.role === 'primary') {
                updateMessage(modelMsgId, {
                  senderName,
                  agentId: payload.agentId,
                });
              } else {
                const newId = crypto.randomUUID();
                appendMessage({
                  id: newId,
                  role: 'model',
                  content: '',
                  senderName,
                  agentId: payload.agentId,
                  timestamp: Date.now(),
                });
                activeMsgId = newId;
                setStreamingMsgId(newId);
              }
              if (payload.agentId) setAgentStatus(payload.agentId, 'working');
              continue;
            }
            if (payload.evt === 'turn_done') {
              if (payload.agentId) setAgentStatus(payload.agentId, 'idle');
              continue;
            }
            if (payload.evt === 'turn_verdict') {
              // Inline marker — appended to current message so the user sees the critic's verdict
              const tag =
                payload.verdict === 'lgtm'
                  ? '\n\n✅ Verdict: LGTM'
                  : '\n\n🔁 Verdict: needs another pass';
              appendChunk(activeMsgId, tag);
              continue;
            }
            if (payload.chunk) appendChunk(activeMsgId, payload.chunk);
            if (payload.done) {
              targets.forEach((a) => {
                setAgentStatus(a.id, 'idle');
                removeActiveTyping(a.id);
              });
              setStreamingMsgId(null);
              return;
            }
          } catch {
            /* malformed line */
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errMsg = err instanceof Error ? err.message : 'Network error';
      appendChunk(modelMsgId, `\n\n[Error: ${errMsg}]`);
      targets.forEach((a) => setAgentStatus(a.id, 'error'));
      setActiveTyping([]);
      setStreamingMsgId(null);
    }
  }, [
    inputText,
    pendingFiles,
    streamingMsgId,
    settings,
    agents,
    messages,
    selectedAgentId,
    appendMessage,
    appendChunk,
    updateMessage,
    parseTaggedAgents,
    setActiveTyping,
    setAgentStatus,
    removeActiveTyping,
    onRunAll,
  ]);

  const handleStop = () => {
    abortRef.current?.abort();
    setStreamingMsgId(null);
    setActiveTyping([]);
    agents.forEach((a) => {
      if (activeTypingAgents.includes(a.id)) setAgentStatus(a.id, 'idle');
    });
  };

  const anyTyping = activeTypingAgents.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-3"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-body)',
          height: 34,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">🏢</span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-main)' }}>
            QA Office
          </span>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            · {agents.length} agents
          </span>
        </div>
        <div className="flex items-center gap-2">
          {running && (
            <span
              className="flex items-center gap-1 text-[9px] font-semibold"
              style={{ color: '#60a5fa' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />{' '}
              Running
            </span>
          )}
          {!running && hasFailures && (
            <span
              className="flex items-center gap-1 text-[9px] font-semibold"
              style={{ color: '#f87171' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Failures
            </span>
          )}
          {!running && !hasFailures && agents.length > 0 && (
            <span
              className="flex items-center gap-1 text-[9px] font-semibold"
              style={{ color: '#34d399' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> All idle
            </span>
          )}
          {/* Provider toggle */}
          <div
            className="flex items-center rounded overflow-hidden"
            style={{ border: '1px solid var(--border)', fontSize: 8 }}
          >
            {(['gemini', 'ollama'] as const).map((p) => (
              <button
                key={p}
                onClick={() => updateSettings({ provider: p })}
                className="px-1.5 py-0.5 font-bold transition-colors"
                style={{
                  background:
                    settings.provider === p
                      ? p === 'gemini'
                        ? '#1a3a8f'
                        : '#065f46'
                      : 'transparent',
                  color: settings.provider === p ? '#fff' : 'var(--text-muted)',
                }}
              >
                {p === 'gemini' ? '✨' : '🦙'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/*
        ── Canvas — cropped to content area (no "blue void" at top) ─────────
        `default-layout-1.json` is 21 × 22 tiles, but rows 0–9 are void
        (tile 255). OfficeCanvas sizes itself to the FULL 21×22 aspect ratio,
        so without intervention the upper ~45% of the rendered area shows
        only the canvas background colour — that's the "blue blank" the user
        reported in the PW Dashboard sidebar.

        Fix without touching the layout JSON or the shared OfficeCanvas
        component (both used by OfficePage too):
          1. Outer wrapper uses the CONTENT-ONLY aspect ratio (21 wide × 12
             rows tall ≈ 1.75) + `overflow: hidden`.
          2. Inner wrapper is `position: absolute; bottom: 0` so the canvas
             — which still computes its own height as 21:22 — overflows
             UPWARD past the clip boundary. Only the bottom 12 rows of
             actual office content are visible.

        Mouse events still hit the canvas at its translated DOM position
        (offsetX/Y on the canvas element are unaffected by the offset of
        its containing element).
      */}
      <div
        className="w-full shrink-0 relative"
        style={{
          background: '#1a1a2e',
          overflow: 'hidden',
          aspectRatio: '21 / 12',
        }}
      >
        {assetsReady && _pwOfficeState ? (
          <div className="absolute left-0 right-0 bottom-0">
            <OfficeCanvas
              officeState={_pwOfficeState}
              onAgentClick={handleAgentClick}
              zoom={1}
              onZoomChange={() => {}}
              panRef={panRef}
              locked
            />
          </div>
        ) : (
          <div className="flex items-center justify-center absolute inset-0">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── Compact agent strip ───────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-1 px-2 py-1.5 overflow-x-auto"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-body)',
          scrollbarWidth: 'none',
        }}
      >
        {agents.map((agent) => {
          const accent = PW_SPRITE_ACCENT[agent.characterSprite];
          const active =
            running ||
            (hasFailures && (agent.id === 'agent-triage' || agent.id === 'agent-healer'));
          const isTyping = activeTypingAgents.includes(agent.id);
          const isSelected = agent.id === selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0 transition-all"
              style={{
                background: isSelected ? accent.bg : 'transparent',
                border: `1px solid ${isSelected ? accent.ring : 'var(--border)'}`,
                color: isSelected ? accent.text : 'var(--text-muted)',
                boxShadow: isSelected ? `0 0 0 1px ${accent.ring}40` : undefined,
              }}
              title={agent.role}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${active || isTyping ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: active || isTyping ? '#60a5fa' : accent.bar,
                }}
              />
              {agent.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* ── Chat toolbar ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-1.5 px-2 py-1 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-body)' }}
      >
        {/* Full agent selector (synced with strip above) */}
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="flex-1 min-w-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            outline: 'none',
          }}
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.role}
            </option>
          ))}
        </select>
        <button
          onClick={clearHistory}
          className="shrink-0 p-1 rounded hover:text-red-400 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Clear history"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* ── Hints / banners ──────────────────────────────────────────────── */}
      {settings.provider === 'ollama' && settings.ollamaModel && (
        <div
          className="shrink-0 px-2 py-0.5 text-[9px]"
          style={{ background: '#052e16', color: '#4ade80' }}
        >
          🦙 {settings.ollamaModel} · local
        </div>
      )}
      {settings.provider === 'ollama' && !settings.ollamaModel.trim() && (
        <div
          className="shrink-0 px-2 py-0.5 text-[9px]"
          style={{ background: '#451a03', color: '#E8A728' }}
        >
          ⚠ No Ollama model — configure in Settings
        </div>
      )}
      {settings.provider === 'gemini' && !settings.geminiApiKey.trim() && (
        <div
          className="shrink-0 px-2 py-0.5 text-[9px]"
          style={{ background: '#451a03', color: '#E8A728' }}
        >
          ⚠ No Gemini API key — configure in Settings
        </div>
      )}
      {errorBanner && (
        <div
          className="shrink-0 flex items-center gap-1 px-2 py-0.5 text-[9px]"
          style={{ background: '#2d0a0a', color: '#fca5a5' }}
        >
          <span className="flex-1">{errorBanner}</span>
          <button onClick={() => setErrorBanner(null)}>
            <X size={9} />
          </button>
        </div>
      )}

      {/* ── Pending file chips ────────────────────────────────────────────── */}
      {pendingFiles.length > 0 && (
        <div
          className="shrink-0 flex flex-wrap gap-1 px-2 py-1 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {pendingFiles.map((f, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              <FileText size={8} />
              {f.name}
              <button
                onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                className="hover:text-red-400"
              >
                <X size={8} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Messages (scrollable, fills remaining height) ─────────────────── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-2 py-2 flex flex-col gap-2"
        style={{ background: 'var(--bg-body)' }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center select-none">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
              Chat with your team
            </p>
            <p className="text-[10px] max-w-[240px]" style={{ color: 'var(--text-muted)' }}>
              Select an agent above or type{' '}
              <code
                style={{
                  fontFamily: 'monospace',
                  background: 'var(--bg-muted)',
                  padding: '0 3px',
                  borderRadius: 3,
                }}
              >
                @Name
              </code>{' '}
              to target them
            </p>
            <div className="flex flex-wrap gap-1 justify-center max-w-[280px]">
              {agents.map((a) => {
                const ac = PW_SPRITE_ACCENT[a.characterSprite];
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-opacity hover:opacity-80"
                    style={{
                      background: ac.bg,
                      color: ac.text,
                      border: `1px solid ${ac.ring}`,
                    }}
                  >
                    @{a.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <PwMessageBubble
            key={msg.id}
            msg={msg}
            isStreaming={msg.id === streamingMsgId}
            agents={agents}
            onRunCode={onRunCode}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ── @mention autocomplete ─────────────────────────────────────────── */}
      {mentionQuery !== null && mentionMatches.length > 0 && (
        <div
          className="mx-2 mb-1 rounded-lg overflow-hidden border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {mentionMatches.map((a, i) => {
            const ac = PW_SPRITE_ACCENT[a.characterSprite];
            return (
              <button
                key={a.id}
                onClick={() => insertMention(a.name)}
                className="w-full flex items-center gap-2 px-2 py-1 text-left transition-colors"
                style={{
                  background: i === mentionIndex ? 'var(--bg-body)' : 'transparent',
                  borderBottom:
                    i < mentionMatches.length - 1 ? '1px solid var(--border)' : undefined,
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{ background: ac.bg, color: ac.text }}
                >
                  {a.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-main)' }}>
                  {a.name}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {a.role}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col gap-1 px-2 py-2 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="flex items-end gap-1.5">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownChat}
            placeholder={`Ask ${agents.find((a) => a.id === selectedAgentId)?.name ?? 'agent'} or @mention…`}
            rows={2}
            className="flex-1 resize-none rounded-lg px-2 py-1.5 text-[11px] leading-relaxed outline-none"
            style={{
              background: 'var(--bg-body)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".ts,.tsx,.js,.jsx,.json,.log,.txt,.md,.css,.html,.yaml,.yml,.py,.png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{
              background: 'var(--bg-body)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
            title="Attach file"
          >
            <Paperclip size={11} />
          </button>
          {streamingMsgId ? (
            <button
              onClick={handleStop}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#374151', color: '#fff' }}
              title="Stop"
            >
              <Square size={10} />
            </button>
          ) : (
            <button
              onClick={() => void handleSend()}
              disabled={!inputText.trim() && pendingFiles.length === 0}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 transition-opacity"
              style={{ background: '#1a3a8f', color: '#fff' }}
              title="Send (Enter)"
            >
              <Send size={11} />
            </button>
          )}
        </div>
        <p className="text-[8px] text-center" style={{ color: 'var(--text-muted)' }}>
          {anyTyping
            ? `${activeTypingAgents.map((id) => agents.find((a) => a.id === id)?.name ?? id).join(', ')} typing…`
            : 'Enter · Shift+Enter for newline · @ to mention'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlaywrightDashboard() {
  // ── Global settings + chat context ─────────────────────────────────────────
  const { settings, appendMessage, appendChunk, updateMessage, agents: allAgents } = useSettings();

  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterKey>('active');
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [config, setConfig] = useState<PlaywrightConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<PlaywrightConfig | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configTab, setConfigTab] = useState<'config' | 'editor'>('config');
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({});
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({});
  const [hoveredTest, setHoveredTest] = useState<string | null>(null);
  const [artifactModal, setArtifactModal] = useState<ArtifactModalState | null>(null);
  // ── Real-data states ────────────────────────────────────────────────────────
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [runLog, setRunLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [availableSpecs, setAvailableSpecs] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<Set<string>>(new Set());
  const [specPickerOpen, setSpecPickerOpen] = useState(false);
  const specPickerRef = useRef<HTMLDivElement>(null);

  // Close spec picker when clicking outside
  useEffect(() => {
    if (!specPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (specPickerRef.current && !specPickerRef.current.contains(e.target as Node))
        setSpecPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [specPickerOpen]);
  // ── Multi-run history — always sourced from SQLite via /api/playwright/history ──
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [browsersOk, setBrowsersOk] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('pw_setup_banner_dismissed') === '1',
  );

  // ── Derived counts ──────────────────────────────────────────────────────────
  const allTests = useMemo(() => suites.flatMap((s) => s.tests), [suites]);
  const counts = useMemo(
    () => ({
      total: allTests.length,
      passed: allTests.filter((t) => t.status === 'passed').length,
      failed: allTests.filter((t) => t.status === 'failed').length,
      skipped: allTests.filter((t) => t.status === 'skipped').length,
      pending: allTests.filter((t) => t.status === 'pending').length,
      flaky: allTests.filter((t) => (t.retries ?? 0) > 0 && t.status === 'passed').length,
    }),
    [allTests],
  );

  // ── Live run counts — parsed from SSE stdout during an active run ──────────
  // Playwright's list reporter emits "  ✓  1 › …" for pass and "  ✗  2 › …"
  // for fail.  We count Unicode check/cross marks so the stat cards stay live
  // during Phase 1 without needing per-test SSE events from the server.
  const liveRunCounts = useMemo(() => {
    if (!running || runLog.length === 0) return null;
    let passed = 0,
      failed = 0;
    for (const line of runLog) {
      if (/^\s+[✓✔]\s/.test(line)) passed++;
      else if (/^\s+[✗✘×]\s/.test(line)) failed++;
    }
    const totalLine = runLog.find((l) => /running \d+ test/i.test(l));
    const parsed = totalLine ? parseInt(totalLine.match(/running (\d+)/i)?.[1] ?? '0', 10) : 0;
    const total = Math.max(parsed, passed + failed);
    return { passed, failed, total, running: Math.max(0, total - passed - failed) };
  }, [running, runLog]);
  const totalDuration = useMemo(() => allTests.reduce((a, t) => a + t.duration, 0), [allTests]);
  const passRate = useMemo(() => {
    const denominator = counts.total - counts.skipped - counts.pending;
    return denominator > 0 ? Math.round((counts.passed / denominator) * 100) : 0;
  }, [counts]);

  // ── Changed settings count (vs defaults) ───────────────────────────────────
  const changedCount = useMemo(() => {
    const d = DEFAULT_CONFIG;
    let n = 0;
    if (config.baseUrl !== d.baseUrl) n++;
    if (config.testDir !== d.testDir) n++;
    if (config.outputDir !== d.outputDir) n++;
    if (config.timeout !== d.timeout) n++;
    if (config.retries !== d.retries) n++;
    if (config.workers !== d.workers) n++;
    if (config.fullyParallel !== d.fullyParallel) n++;
    if (config.forbidOnly !== d.forbidOnly) n++;
    if (config.headed !== d.headed) n++;
    if (config.browsers.chromium !== d.browsers.chromium) n++;
    if (config.browsers.firefox !== d.browsers.firefox) n++;
    if (config.browsers.webkit !== d.browsers.webkit) n++;
    if (config.screenshot !== d.screenshot) n++;
    if (config.video !== d.video) n++;
    if (config.trace !== d.trace) n++;
    if (config.reporter !== d.reporter) n++;
    return n;
  }, [config]);

  // ── localStorage: load on mount ────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          config: PlaywrightConfig;
          savedAt: string;
        };
        setConfig(parsed.config);
        setSavedConfig(parsed.config);
        setLastSavedAt(parsed.savedAt);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // ── isSaved: true when current config matches what's persisted ──────────────
  const isSaved = useMemo(
    () => savedConfig !== null && JSON.stringify(config) === JSON.stringify(savedConfig),
    [config, savedConfig],
  );

  // ── saveConfig ──────────────────────────────────────────────────────────────
  const saveConfig = useCallback(() => {
    const savedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, savedAt }));
    setSavedConfig(config);
    setLastSavedAt(savedAt);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [config]);

  // ── Fetch results from server (latest or a specific archived run) ───────────
  // Bug-Fix 1: when loading an archived run, the server now returns the original
  // stdout in `runLog` so we can hydrate the log panel instead of leaving it blank.
  const fetchResults = useCallback(async (runId?: string) => {
    setIsLoading(true);
    try {
      const url = runId
        ? `${API_BASE}/api/playwright/results/${runId}`
        : `${API_BASE}/api/playwright/results`;
      const res = await fetch(url);
      if (res.status === 404) {
        setServerOnline(true);
        setHasResults(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        suites: TestSuite[];
        runAt: string;
        runLog?: string[];
      };
      setSuites(data.suites);
      setHasResults(true);
      setServerOnline(true);
      setLastRunAt(data.runAt ?? null);
      setSelectedRunId(runId ?? null);
      setExpandedSuites(Object.fromEntries(data.suites.map((s) => [s.id, true])));
      setRunLog(runId && Array.isArray(data.runLog) ? data.runLog : []);
    } catch {
      setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSpecs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/playwright/specs`);
      if (!res.ok) return;
      const data = (await res.json()) as { specs: string[] };
      setAvailableSpecs(data.specs);
    } catch {
      // ignore — server may be offline
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/playwright/history`, { method: 'DELETE' });
      setRunHistory([]);
      setSelectedRunId(null);
      // Reload the latest pw-results.json (not a specific archived run)
      fetchResults();
    } catch {
      /* ignore network errors */
    }
  }, [fetchResults]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/playwright/history`);
      if (!res.ok) return;
      const data = (await res.json()) as { runs: RunRecord[] };
      setRunHistory(data.runs);
    } catch {
      // ignore — server may be offline
    }
  }, []);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchResults();
    fetchSpecs();
    fetchHistory();
  }, [fetchResults, fetchSpecs, fetchHistory]);

  // ── Auto-poll when server is offline — reconnects every 5 s ────────────────
  useEffect(() => {
    if (serverOnline !== false) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/playwright/specs`);
        if (res.ok) {
          setServerOnline(true);
          fetchResults();
          fetchSpecs();
          fetchHistory();
        }
      } catch {
        /* still offline */
      }
    }, 5_000);
    return () => clearInterval(id);
  }, [serverOnline, fetchResults, fetchSpecs, fetchHistory]);

  // ── Tick "now" every 60 s for relative "last updated" display ───────────────
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Browser-binary check ────────────────────────────────────────────────────
  useEffect(() => {
    if (!serverOnline) return;
    fetch(`${API_BASE}/api/playwright/browser-check`)
      .then((r) => r.json())
      .then((d: { ok: boolean }) => setBrowsersOk(d.ok))
      .catch(() => setBrowsersOk(null));
  }, [serverOnline]);

  // ── Slowest tests (top 3) ───────────────────────────────────────────────────
  const slowestTests = useMemo(
    () =>
      [...allTests]
        .filter((t) => t.duration > 0)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 3),
    [allTests],
  );

  // ── Filtered suites ─────────────────────────────────────────────────────────
  const filteredSuites = useMemo(
    () =>
      suites
        .map((s) => ({
          ...s,
          tests: s.tests.filter((t) => {
            const matchesTab =
              activeTab === 'all'
                ? true
                : activeTab === 'active'
                  ? t.status === 'passed' || t.status === 'failed'
                  : t.status === activeTab;
            const matchesSearch =
              !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
          }),
        }))
        .filter((s) => s.tests.length > 0),
    [suites, activeTab, searchQuery],
  );

  // ── Core SSE runner (shared by runTests + runSingleSpec) ───────────────────
  // After Bug-Fix 2: the server now emits Phase 2 `summary_*` events after
  // `[DONE]` so the Edi M AI summary is delivered into the chat panel for every
  // run, not just agent-generated dynamic runs.  We mirror the parser from
  // `runDynamicTest` below to handle these events uniformly.
  const runWithSSE = useCallback(
    async (body: RunRequest) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10-minute hard limit
      setRunning(true);
      setShowLog(true);
      setRunLog([]);
      setExpandedErrors({});
      setSearchQuery('');
      setActiveView('dashboard');
      setSuites((prev) =>
        prev.map((s) => ({
          ...s,
          tests: s.tests.map((t) => ({
            ...t,
            status: 'pending' as Status,
            duration: 0,
          })),
        })),
      );
      setExpandedSuites((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, true])));

      // Phase 2 (AI summary) tracking — same protocol used by runDynamicTest
      let summaryMsgId: string | null = null;
      let inSummaryPhase = false;

      try {
        // Inject AI credentials so the server can stream the Edi M summary.
        // The user's caller already provides spec/specs/config; we merge in creds.
        const bodyWithCreds = {
          ...body,
          apiKey: settings.geminiApiKey,
          model: settings.defaultModel,
          provider: settings.provider,
          ollamaBaseUrl: settings.ollamaBaseUrl,
          ollamaModel: settings.ollamaModel,
          agentName: 'Dashboard',
        };
        const response = await fetch(`${API_BASE}/api/playwright/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyWithCreds),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error(`Server ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() ?? '';
          for (const line of parts) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6);

            // First try to parse as a structured event object
            let evt: SummaryEvent | Record<string, unknown> | null = null;
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object' && 'evt' in parsed) {
                evt = parsed as SummaryEvent | Record<string, unknown>;
              }
            } catch {
              /* not JSON — fall through to plain string */
            }

            if (evt) {
              // ── Phase 2: summary_start / summary_chunk / summary_done ─────────
              if (evt.evt === 'summary_start') {
                inSummaryPhase = true;
                setRunning(false); // tests are done — let the UI relax

                const mgrAgent = allAgents.find((a) => a.id === TEAM_MANAGER_ID);
                const mgrName = mgrAgent?.name ?? 'Edi M';
                const newMsgId = `run-summary-${Date.now()}`;
                summaryMsgId = newMsgId;

                appendMessage({
                  id: newMsgId,
                  role: 'model',
                  content: '',
                  senderName: mgrName,
                  agentId: TEAM_MANAGER_ID,
                  timestamp: Date.now(),
                  type: 'qa_summary',
                });
              } else if (evt.evt === 'summary_chunk' && summaryMsgId) {
                const chunk = typeof evt.text === 'string' ? evt.text : '';
                if (chunk) appendChunk(summaryMsgId, chunk);
              } else if (evt.evt === 'summary_done') {
                if (summaryMsgId && evt.failures) {
                  updateMessage(summaryMsgId, {
                    summaryData: {
                      total: typeof evt.total === 'number' ? evt.total : 0,
                      passed: typeof evt.passed === 'number' ? evt.passed : 0,
                      failed: typeof evt.failed === 'number' ? evt.failed : 0,
                      duration: typeof evt.duration === 'number' ? evt.duration : 0,
                      failures: evt.failures as QASummaryData['failures'],
                    },
                  });
                }
                break outer;
              }
              continue;
            }

            // ── Phase 1: plain stdout log lines ────────────────────────────────
            if (inSummaryPhase) continue; // safety: ignore stray strings after Phase 2
            let msg: string;
            try {
              msg = JSON.parse(raw) as string;
            } catch {
              msg = raw;
            }
            if (msg.startsWith('[DONE]')) {
              // Archive is written server-side BEFORE [DONE] — refresh history
              // immediately so the new run appears in the panel without waiting
              // for Phase 2 AI summary to complete.
              void fetchHistory();
              if (!settings.geminiApiKey && settings.provider === 'gemini') break outer;
              continue;
            }
            setRunLog((prev) => [...prev.slice(-999), msg]);
          }
        }
        await fetchResults();
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setRunLog((prev) => [
            ...prev,
            '[TIMEOUT] Test run exceeded 10 minutes and was cancelled.',
          ]);
        } else {
          setRunLog((prev) => [
            ...prev,
            `[ERROR] ${err instanceof Error ? err.message : String(err)}`,
          ]);
        }
      } finally {
        clearTimeout(timeoutId);
        setRunning(false);
        // Always refresh history — runs even when fetchResults() throws or the
        // AI summary is skipped.  A short delay lets Windows NTFS flush the file.
        await new Promise((r) => setTimeout(r, 200));
        void fetchHistory();
      }
    },
    [fetchResults, fetchHistory, settings, appendMessage, appendChunk, updateMessage, allAgents],
  );

  // ── Run a single spec from editor ─────────────────────────────────────────
  const runSingleSpec = useCallback(
    (spec: string) => {
      runWithSSE({ spec, config });
    },
    [runWithSSE, config],
  );

  // ── Run an agent-generated code block via dynamic test endpoint ────────────
  const runDynamicTest = useCallback(
    async (code: string, agentName?: string) => {
      if (!serverOnline) {
        setShowLog(true);
        setRunLog([
          `[OFFLINE] Server not running — cannot execute dynamic test from ${agentName ?? 'agent'}`,
        ]);
        return;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);
      setRunning(true);
      setShowLog(true);
      setRunLog([`[INFO] Dynamic test from ${agentName ?? 'agent'} — executing…`]);
      setExpandedErrors({});
      setSearchQuery('');
      setActiveView('dashboard');

      // Phase 2 tracking — AI summary streamed into chat
      let summaryMsgId: string | null = null;
      let inSummaryPhase = false;

      try {
        const response = await fetch(`${API_BASE}/api/run-dynamic-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            agentName,
            // AI credentials for post-run summarization
            apiKey: settings.geminiApiKey,
            model: settings.defaultModel,
            provider: settings.provider,
            ollamaBaseUrl: settings.ollamaBaseUrl,
            ollamaModel: settings.ollamaModel,
          }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error(`Server ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() ?? '';
          for (const line of parts) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6);

            // Try parsing as a structured event object first
            let evt: SummaryEvent | Record<string, unknown> | null = null;
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object' && 'evt' in parsed) {
                evt = parsed as SummaryEvent | Record<string, unknown>;
              }
            } catch {
              /* not JSON — plain string */
            }

            if (evt) {
              // ── Phase 2: structured summary events ──────────────────────────
              if (evt.evt === 'summary_start') {
                inSummaryPhase = true;
                setRunning(false); // stop spinner — tests are done

                // Find Edi M agent config for display name / agentId
                const mgrAgent = allAgents.find((a) => a.id === TEAM_MANAGER_ID);
                const mgrName = mgrAgent?.name ?? 'Edi M';
                const newMsgId = `dyn-summary-${Date.now()}`;
                summaryMsgId = newMsgId;

                appendMessage({
                  id: newMsgId,
                  role: 'model',
                  content: '',
                  senderName: mgrName,
                  agentId: TEAM_MANAGER_ID,
                  timestamp: Date.now(),
                  type: 'qa_summary',
                });
              } else if (evt.evt === 'summary_chunk' && summaryMsgId) {
                const chunk = typeof evt.text === 'string' ? evt.text : '';
                if (chunk) appendChunk(summaryMsgId, chunk);
              } else if (evt.evt === 'summary_done') {
                // Attach structured failure data if provided
                if (summaryMsgId && evt.failures) {
                  updateMessage(summaryMsgId, {
                    summaryData: {
                      total: typeof evt.total === 'number' ? evt.total : 0,
                      passed: typeof evt.passed === 'number' ? evt.passed : 0,
                      failed: typeof evt.failed === 'number' ? evt.failed : 0,
                      duration: typeof evt.duration === 'number' ? evt.duration : 0,
                      failures: evt.failures as QASummaryData['failures'],
                    },
                  });
                }
                break outer;
              }
              // skip other evt types
              continue;
            }

            // ── Phase 1: plain string log lines ─────────────────────────────
            if (inSummaryPhase) continue; // ignore stray strings after phase 2 starts
            let msg: string;
            try {
              msg = JSON.parse(raw) as string;
            } catch {
              msg = raw;
            }
            if (msg.startsWith('[DONE]')) {
              // [DONE] signals end of Phase 1 — wait for summary events unless none coming
              // (If AI credentials missing the server may skip summary phase entirely)
              if (!settings.geminiApiKey && settings.provider === 'gemini') break outer;
              // else keep reading for summary_start
              continue;
            }
            setRunLog((prev) => [...prev.slice(-999), msg]);
          }
        }

        await fetchResults();
        await new Promise((r) => setTimeout(r, 120));
        await fetchHistory();
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setRunLog((prev) => [
            ...prev,
            '[TIMEOUT] Dynamic test exceeded 10 minutes and was cancelled.',
          ]);
        } else {
          setRunLog((prev) => [
            ...prev,
            `[ERROR] ${err instanceof Error ? err.message : String(err)}`,
          ]);
        }
      } finally {
        clearTimeout(timeoutId);
        setRunning(false);
      }
    },
    [
      serverOnline,
      fetchResults,
      fetchHistory,
      settings,
      appendMessage,
      appendChunk,
      updateMessage,
      allAgents,
    ],
  );

  // ── Run tests (real SSE when server online, show offline message otherwise) ─
  const runTests = useCallback(async () => {
    if (!serverOnline) {
      setShowLog(true);
      setRunLog([
        '[OFFLINE] Server is not running. Start it with: npm run dev',
        '[OFFLINE] Waiting for server to come online…',
      ]);
      return;
    }

    // ── Real run — delegate to runWithSSE ────────────────────────────────────
    const specList = selectedSpecs.size > 0 ? Array.from(selectedSpecs) : [];
    const body: RunRequest = { config };
    if (specList.length === 1) body.spec = specList[0];
    else if (specList.length > 1) body.specs = specList;
    await runWithSSE(body);
  }, [serverOnline, selectedSpecs, config, runWithSSE]);

  const exportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        ...counts,
        passRate: `${passRate}%`,
        totalDuration: formatMs(totalDuration),
      },
      suites: suites.map((s) => ({
        title: s.title,
        file: s.file,
        tests: s.tests.map((t) => ({
          title: t.title,
          status: t.status,
          duration: formatMs(t.duration),
          retries: t.retries ?? 0,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playwright-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSuite = (id: string) => setExpandedSuites((p) => ({ ...p, [id]: !p[id] }));
  const toggleError = (id: string) => setExpandedErrors((p) => ({ ...p, [id]: !p[id] }));

  function suiteStatus(suite: TestSuite): Status {
    if (suite.tests.some((t) => t.status === 'running')) return 'running';
    if (suite.tests.some((t) => t.status === 'failed')) return 'failed';
    if (suite.tests.every((t) => t.status === 'passed')) return 'passed';
    if (suite.tests.every((t) => t.status === 'skipped' || t.status === 'pending'))
      return 'skipped';
    return 'pending';
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-body)' }}>
      {/* ── Left: pixel-agents canvas sidebar (lg+) ──────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-14 overflow-hidden"
        style={{
          width: 360,
          height: 'calc(100vh - 3.5rem)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <PwOfficePanel
          running={running}
          suites={suites}
          onRunCode={runDynamicTest}
          onRunAll={() => {
            void runTests();
          }}
        />
      </aside>

      {/* ── Right: existing scrollable dashboard content ──────────────────── */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-up">
          {/* ── Header ──────────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--text-main) 0%, #3b82f6 60%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Playwright Dashboard
                </h1>
                {serverOnline === true && hasResults && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(52,199,89,0.10)',
                      color: '#16A34A',
                      border: '1px solid rgba(52,199,89,0.25)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                      style={{ backgroundColor: '#34C759' }}
                    />
                    Live
                  </span>
                )}
                {serverOnline === false && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: '#fef2f2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    Offline
                  </span>
                )}
              </div>
              {/* Subtitle pill-row — cleaner than `·`-separated text and easier to scan */}
              <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[10px]">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <FolderOpen size={9} /> {suites.length} suite
                  {suites.length === 1 ? '' : 's'}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Hash size={9} /> {counts.total} test
                  {counts.total === 1 ? '' : 's'}
                </span>
                {totalDuration > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Clock size={9} /> {formatMs(totalDuration)}
                  </span>
                )}
                {lastRunAt && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ backgroundColor: '#34C759' }}
                    />
                    Last updated:{' '}
                    {(() => {
                      const diffMin = Math.round((now - new Date(lastRunAt).getTime()) / 60_000);
                      if (diffMin < 1) return 'just now';
                      if (diffMin < 60) return `${diffMin} min ago`;
                      const h = Math.round(diffMin / 60);
                      return `${h}h ago`;
                    })()}
                    <button
                      onClick={() => fetchResults()}
                      className="hover:opacity-60 transition-opacity"
                      title="Refresh"
                      aria-label="Refresh results"
                    >
                      <RotateCcw size={9} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                  </span>
                )}
                {isLoading && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.10)',
                      color: '#1a3a8f',
                      border: '1px solid rgba(59,130,246,0.20)',
                    }}
                  >
                    <RotateCcw size={9} className="animate-spin" /> loading…
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View switcher */}
              <div
                className="flex items-center gap-0.5 p-1 rounded-xl border"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                {[
                  {
                    key: 'dashboard' as const,
                    label: 'Dashboard',
                    icon: <LayoutDashboard size={12} />,
                  },
                  {
                    key: 'docs' as const,
                    label: 'Docs',
                    icon: <BookOpen size={12} />,
                  },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={
                      activeView === key
                        ? {
                            backgroundColor: 'var(--bg-body)',
                            color: '#1a3a8f',
                            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                          }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {/* Dashboard actions */}
              {activeView === 'dashboard' && (
                <>
                  {/* Multi-spec picker */}
                  {availableSpecs.length > 0 && (
                    <div className="relative" ref={specPickerRef}>
                      <button
                        onClick={() => setSpecPickerOpen((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                        style={
                          specPickerOpen || selectedSpecs.size > 0
                            ? {
                                borderColor: '#1a3a8f',
                                backgroundColor: 'rgba(37,99,235,0.07)',
                                color: '#1a3a8f',
                              }
                            : {
                                borderColor: 'var(--border)',
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-main)',
                              }
                        }
                      >
                        <CheckSquare size={12} />
                        {selectedSpecs.size === 0
                          ? 'All specs'
                          : `${selectedSpecs.size} spec${selectedSpecs.size > 1 ? 's' : ''}`}
                        <ChevronDown size={11} />
                      </button>
                      {specPickerOpen && (
                        <div
                          className="absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-lg overflow-hidden min-w-[220px]"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--bg-card)',
                          }}
                        >
                          <div
                            className="flex items-center justify-between px-3 py-2 border-b text-[11px]"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <span className="font-bold" style={{ color: 'var(--text-main)' }}>
                              Select specs to run
                            </span>
                            <button
                              onClick={() =>
                                setSelectedSpecs(
                                  selectedSpecs.size === availableSpecs.length
                                    ? new Set()
                                    : new Set(availableSpecs),
                                )
                              }
                              className="font-semibold hover:underline"
                              style={{ color: '#1a3a8f' }}
                            >
                              {selectedSpecs.size === availableSpecs.length ? 'None' : 'All'}
                            </button>
                          </div>
                          {availableSpecs.map((s) => (
                            <label
                              key={s}
                              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-opacity-50"
                              style={{
                                backgroundColor: selectedSpecs.has(s)
                                  ? 'rgba(37,99,235,0.06)'
                                  : undefined,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSpecs.has(s)}
                                onChange={() =>
                                  setSelectedSpecs((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(s)) next.delete(s);
                                    else next.add(s);
                                    return next;
                                  })
                                }
                                className="rounded accent-blue-600"
                              />
                              <span
                                className="text-[11px] font-mono"
                                style={{ color: 'var(--text-main)' }}
                              >
                                {s.replace(/\.spec\.(ts|js)$/, '')}
                                <span className="opacity-40">.spec.ts</span>
                              </span>
                            </label>
                          ))}
                          <div
                            className="px-3 py-2 border-t"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <button
                              onClick={() => setSpecPickerOpen(false)}
                              className="w-full py-1.5 rounded-lg text-xs font-semibold"
                              style={{
                                backgroundColor: '#1a3a8f',
                                color: '#fff',
                              }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Quick grep filter */}
                  <div className="relative flex items-center">
                    <Search
                      size={11}
                      className="absolute left-2.5 pointer-events-none"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      value={config.grep}
                      onChange={(e) => setConfig((c) => ({ ...c, grep: e.target.value }))}
                      placeholder="grep filter…"
                      className="pl-7 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-36"
                      style={{
                        borderColor: config.grep ? '#1a3a8f' : 'var(--border)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                      }}
                      title="Filter tests by title (--grep)"
                    />
                    {config.grep && (
                      <button
                        onClick={() => setConfig((c) => ({ ...c, grep: '' }))}
                        className="absolute right-2 opacity-50 hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={exportReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      color: 'var(--text-muted)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.background = 'var(--bg-card)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Download size={13} /> Export
                  </button>
                  <button
                    onClick={() => fetchResults()}
                    disabled={running || isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                    style={{
                      color: 'var(--text-muted)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.background = 'var(--bg-card)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Reload results from server"
                  >
                    <RotateCcw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh
                  </button>
                  <button
                    onClick={() => setSettingsOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={
                      settingsOpen
                        ? {
                            background: 'rgba(26,58,143,0.08)',
                            color: '#1a3a8f',
                          }
                        : {
                            background: 'transparent',
                            color: 'var(--text-muted)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!settingsOpen) {
                        e.currentTarget.style.color = 'var(--text-main)';
                        e.currentTarget.style.background = 'var(--bg-card)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!settingsOpen) {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    title="Toggle config panel"
                  >
                    <Settings size={13} />
                    Config
                    {changedCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-600 text-white leading-none">
                        {changedCount}
                      </span>
                    )}
                    {settingsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  <button
                    onClick={running ? () => setRunning(false) : runTests}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${running ? 'text-white' : 'text-white'}`}
                    style={
                      running
                        ? {
                            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                            boxShadow:
                              '0 0 0 3px rgba(239,68,68,0.25), 0 2px 8px rgba(239,68,68,0.3)',
                          }
                        : {
                            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                            boxShadow:
                              '0 0 0 3px rgba(59,130,246,0.2), 0 2px 8px rgba(99,102,241,0.3)',
                          }
                    }
                  >
                    {running ? (
                      <>
                        <Square size={14} /> Stop
                      </>
                    ) : (
                      <>
                        <Play size={14} /> Run Tests
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Dashboard view ───────────────────────────────────────────────────── */}
          {activeView === 'dashboard' && (
            <>
              {/* Server offline banner */}
              {serverOnline === false && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl border text-[11px]"
                  style={{
                    background: '#fef2f2',
                    borderColor: '#fecaca',
                    color: '#991b1b',
                  }}
                >
                  <AlertTriangle size={12} className="shrink-0" />
                  <span>
                    <strong>Server offline</strong> — start the Express server (
                    <code className="font-mono">npm run dev</code>) then click Refresh.
                  </span>
                  <button
                    onClick={() => fetchResults()}
                    className="ml-auto shrink-0 font-semibold underline hover:no-underline"
                    style={{ color: '#991b1b' }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* No results yet banner */}
              {serverOnline === true && !hasResults && !running && !isLoading && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl border text-[11px]"
                  style={{
                    background: 'rgba(59,130,246,0.05)',
                    borderColor: '#93c5fd',
                    color: '#1a3a8f',
                  }}
                >
                  <Clock size={12} className="shrink-0" />
                  <span>
                    No test results yet — click <strong>Run Tests</strong> to execute your
                    Playwright suite.
                  </span>
                </div>
              )}

              {/* Browser-not-installed banner */}
              {browsersOk === false && !bannerDismissed && (
                <div
                  className="flex items-start gap-3 px-4 py-3 mb-4 rounded-xl border text-xs"
                  style={{
                    backgroundColor: '#451a03',
                    borderColor: '#92400e',
                    color: '#fde68a',
                  }}
                >
                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{ color: '#E8A728' }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Playwright browsers not installed</p>
                    <p className="mb-1.5" style={{ color: '#fcd34d' }}>
                      Run this once in your terminal, then refresh the page:
                    </p>
                    <code
                      className="block rounded px-2 py-1 font-mono select-all text-[11px]"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        color: '#a5f3fc',
                      }}
                    >
                      npx playwright install chromium
                    </code>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem('pw_setup_banner_dismissed', '1');
                      setBannerDismissed(true);
                    }}
                    className="shrink-0 hover:opacity-70 transition-opacity"
                    style={{ color: '#fde68a' }}
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Historical-run banner */}
              {selectedRunId && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl border text-[11px]"
                  style={{
                    background: 'rgba(59,130,246,0.05)',
                    borderColor: '#93c5fd',
                    color: '#1a3a8f',
                  }}
                >
                  <Clock size={12} className="shrink-0" />
                  <span>
                    <strong>Historical run</strong> — viewing results from{' '}
                    {lastRunAt
                      ? new Date(lastRunAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'a past run'}
                    .
                  </span>
                  <button
                    onClick={() => {
                      fetchResults();
                    }}
                    className="ml-auto shrink-0 font-semibold underline hover:no-underline"
                    style={{ color: '#1a3a8f' }}
                  >
                    Return to latest →
                  </button>
                </div>
              )}

              {/* ── Collapsible config + editor panel ───────────────────── */}
              {settingsOpen && (
                <div
                  className="rounded-2xl overflow-hidden mb-8"
                  style={{
                    boxShadow:
                      '0 2px 12px -4px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.1)',
                  }}
                >
                  {/* Panel header with Config | Editor tabs */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 border-b"
                    style={{
                      borderColor: '#bfdbfe',
                      backgroundColor: 'rgba(37,99,235,0.04)',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {[
                        {
                          id: 'config' as const,
                          icon: <Settings size={12} />,
                          label: 'Config',
                        },
                        {
                          id: 'editor' as const,
                          icon: <PenLine size={12} />,
                          label: 'Editor',
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setConfigTab(tab.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={
                            configTab === tab.id
                              ? {
                                  backgroundColor: 'var(--bg-card)',
                                  color: '#1a3a8f',
                                  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                                }
                              : { color: 'var(--text-muted)' }
                          }
                        >
                          {tab.icon} {tab.label}
                        </button>
                      ))}
                      {configTab === 'config' && changedCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-600 text-white leading-none ml-1">
                          {changedCount} changed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {configTab === 'config' && (
                        <>
                          <button
                            onClick={() => setConfig(DEFAULT_CONFIG)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                          <button
                            onClick={saveConfig}
                            disabled={isSaved}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-60"
                            style={
                              justSaved
                                ? {
                                    backgroundColor: '#34C759',
                                    borderColor: '#34C759',
                                    color: '#fff',
                                  }
                                : isSaved
                                  ? {
                                      backgroundColor: 'var(--bg-card)',
                                      borderColor: 'var(--border)',
                                      color: 'var(--text-muted)',
                                    }
                                  : {
                                      backgroundColor: '#1a3a8f',
                                      borderColor: '#1a3a8f',
                                      color: '#fff',
                                    }
                            }
                          >
                            {justSaved ? (
                              <>
                                <Check size={11} /> Saved!
                              </>
                            ) : isSaved ? (
                              <>
                                <Check size={11} /> Saved
                                {lastSavedAt ? ` · ${lastSavedAt}` : ''}
                              </>
                            ) : (
                              <>
                                <Save size={11} /> Save
                              </>
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="p-1.5 rounded-lg border transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {/* Panel body */}
                  {configTab === 'config' ? (
                    <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                      <SettingsView config={config} onChange={setConfig} />
                    </div>
                  ) : serverOnline === false ? (
                    /* Server offline — don't attempt fetch, show clear instructions */
                    <div
                      className="flex flex-col items-center justify-center gap-3 py-16 px-6"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <Terminal
                        size={28}
                        className="opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                        Server is offline
                      </p>
                      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        The test editor reads and saves files through your local Express server.
                        <br />
                        Start it with{' '}
                        <code
                          className="font-mono px-1 py-0.5 rounded text-[11px]"
                          style={{ backgroundColor: 'var(--bg-body)' }}
                        >
                          npm run dev
                        </code>{' '}
                        then click Retry.
                      </p>
                      <button
                        onClick={() => {
                          fetchSpecs();
                          fetchResults();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--bg-body)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <RefreshCw size={12} /> Retry connection
                      </button>
                    </div>
                  ) : serverOnline === null ? (
                    /* Still connecting */
                    <div
                      className="flex items-center justify-center gap-2 py-16"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Connecting to local server…
                      </span>
                    </div>
                  ) : (
                    <EditorView
                      specs={availableSpecs}
                      onReloadSpecs={fetchSpecs}
                      onRunSpec={runSingleSpec}
                    />
                  )}
                </div>
              )}

              {/* ── 5 KPI stat cards ─────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {((): {
                  label: string;
                  valueStr: string;
                  sub: string;
                  histValues: number[];
                  prevVal: number | null;
                  accent: string;
                  valueColor: string;
                  lowerIsBetter: boolean;
                  isLive?: boolean;
                }[] => {
                  const prevRun = runHistory[1] ?? null;
                  const prevPassRate = prevRun
                    ? (() => {
                        const d = prevRun.total - prevRun.skipped;
                        return d > 0 ? Math.round((prevRun.passed / d) * 100) : 0;
                      })()
                    : null;
                  // Use live counts during an active run so numbers update as tests complete
                  const liveTotal = liveRunCounts?.total ?? 0;
                  const livePassed = liveRunCounts?.passed ?? 0;
                  const liveFailed = liveRunCounts?.failed ?? 0;
                  const liveRate = liveTotal > 0 ? Math.round((livePassed / liveTotal) * 100) : 0;
                  return [
                    {
                      label: 'Total Executions',
                      valueStr: running
                        ? liveTotal > 0
                          ? String(liveTotal)
                          : '…'
                        : counts.total > 0
                          ? String(counts.total)
                          : '—',
                      sub: running
                        ? `${liveRunCounts?.running ?? 0} remaining`
                        : `${suites.length} suite${suites.length === 1 ? '' : 's'}`,
                      histValues: runHistory
                        .slice(0, 8)
                        .reverse()
                        .map((r) => r.total),
                      prevVal: prevRun?.total ?? null,
                      accent: '#6366f1',
                      valueColor: '#6366f1',
                      lowerIsBetter: false,
                      isLive: running,
                    },
                    {
                      label: 'Passed',
                      valueStr: running
                        ? String(livePassed)
                        : counts.total > 0
                          ? String(counts.passed)
                          : '—',
                      sub: running
                        ? liveTotal > 0
                          ? `${Math.round((livePassed / liveTotal) * 100)}%`
                          : '0%'
                        : counts.total > 0
                          ? `${Math.round((counts.passed / counts.total) * 100)}%`
                          : '—',
                      histValues: runHistory
                        .slice(0, 8)
                        .reverse()
                        .map((r) => r.passed),
                      prevVal: prevRun?.passed ?? null,
                      accent: '#34C759',
                      valueColor: '#16A34A',
                      lowerIsBetter: false,
                      isLive: running,
                    },
                    {
                      label: 'Failed',
                      valueStr: running
                        ? String(liveFailed)
                        : counts.total > 0
                          ? String(counts.failed)
                          : '—',
                      sub: running
                        ? liveTotal > 0
                          ? `${Math.round((liveFailed / liveTotal) * 100)}%`
                          : '0%'
                        : counts.total > 0
                          ? `${Math.round((counts.failed / counts.total) * 100)}%`
                          : '—',
                      histValues: runHistory
                        .slice(0, 8)
                        .reverse()
                        .map((r) => r.failed),
                      prevVal: prevRun?.failed ?? null,
                      accent: running
                        ? liveFailed > 0
                          ? '#EF4444'
                          : '#94a3b8'
                        : counts.failed > 0
                          ? '#EF4444'
                          : '#94a3b8',
                      valueColor: running
                        ? liveFailed > 0
                          ? '#DC2626'
                          : 'var(--text-muted)'
                        : counts.failed > 0
                          ? '#DC2626'
                          : 'var(--text-muted)',
                      lowerIsBetter: true,
                      isLive: running,
                    },
                    {
                      label: 'Flaky',
                      valueStr: counts.total > 0 ? String(counts.flaky) : '—',
                      sub:
                        counts.total > 0
                          ? `${Math.round((counts.flaky / counts.total) * 100)}%`
                          : '—',
                      histValues: runHistory
                        .slice(0, 8)
                        .reverse()
                        .map((r) => r.flaky),
                      prevVal: prevRun?.flaky ?? null,
                      accent: counts.flaky > 0 ? '#E8A728' : '#94a3b8',
                      valueColor: counts.flaky > 0 ? '#D97706' : 'var(--text-muted)',
                      lowerIsBetter: true,
                    },
                    {
                      label: 'Success Rate',
                      valueStr: running
                        ? liveTotal > 0
                          ? `${liveRate}%`
                          : '…'
                        : counts.total > 0
                          ? `${passRate}%`
                          : '—',
                      sub: running
                        ? liveRate >= 80
                          ? 'Looking good'
                          : liveRate > 0
                            ? 'Needs attention'
                            : 'Running…'
                        : passRate >= 95
                          ? 'All-green'
                          : passRate >= 80
                            ? 'Mostly passing'
                            : passRate >= 50
                              ? 'Needs attention'
                              : counts.total > 0
                                ? 'Critical'
                                : '—',
                      histValues: runHistory
                        .slice(0, 8)
                        .reverse()
                        .map((r) => {
                          const d = r.total - r.skipped;
                          return d > 0 ? Math.round((r.passed / d) * 100) : 0;
                        }),
                      prevVal: prevPassRate,
                      accent: running
                        ? liveRate >= 80
                          ? '#34C759'
                          : liveRate > 0
                            ? '#E8A728'
                            : '#94a3b8'
                        : passRate >= 80
                          ? '#34C759'
                          : passRate >= 50
                            ? '#E8A728'
                            : counts.total > 0
                              ? '#EF4444'
                              : '#94a3b8',
                      valueColor: running
                        ? liveRate >= 80
                          ? '#16A34A'
                          : liveRate > 0
                            ? '#D97706'
                            : 'var(--text-muted)'
                        : passRate >= 80
                          ? '#16A34A'
                          : passRate >= 50
                            ? '#D97706'
                            : counts.total > 0
                              ? '#DC2626'
                              : 'var(--text-muted)',
                      lowerIsBetter: false,
                      isLive: running,
                    },
                  ];
                })().map(
                  ({
                    label,
                    valueStr,
                    sub,
                    histValues,
                    prevVal,
                    accent,
                    valueColor,
                    lowerIsBetter,
                    isLive,
                  }) => {
                    const currentVal = histValues[histValues.length - 1] ?? null;
                    let trendEl: React.ReactNode = null;
                    if (
                      !isLive &&
                      prevVal !== null &&
                      currentVal !== null &&
                      runHistory.length >= 2
                    ) {
                      const delta = currentVal - prevVal;
                      if (delta !== 0) {
                        const isGood = lowerIsBetter ? delta < 0 : delta > 0;
                        trendEl = (
                          <span
                            className="text-[9px] font-bold"
                            style={{ color: isGood ? '#16A34A' : '#DC2626' }}
                          >
                            {delta > 0 ? '+' : ''}
                            {delta} vs prev
                          </span>
                        );
                      }
                    }
                    return (
                      <div
                        key={label}
                        className="relative overflow-hidden rounded-2xl px-4 py-4 flex flex-col gap-2"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: `1px solid ${isLive ? `${accent}50` : 'var(--border)'}`,
                          boxShadow: isLive
                            ? `0 0 0 1px ${accent}30, 0 1px 4px rgba(0,0,0,0.05)`
                            : '0 1px 4px rgba(0,0,0,0.05)',
                          transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}
                      >
                        {/* Top accent bar — pulses when live */}
                        <div
                          className={`absolute top-0 inset-x-0 h-0.5 rounded-t-2xl${isLive ? ' animate-pulse' : ''}`}
                          style={{ backgroundColor: accent }}
                        />
                        <div className="flex items-center justify-between">
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {label}
                          </p>
                          {isLive && (
                            <span
                              className="w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{ backgroundColor: accent }}
                            />
                          )}
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <p
                              className="text-2xl font-black leading-none"
                              style={{ color: valueColor }}
                            >
                              {valueStr}
                            </p>
                            <p
                              className="text-[10px] mt-1 font-medium"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {sub}
                            </p>
                          </div>
                          <MiniSparkline values={histValues} color={accent} />
                        </div>
                        {trendEl && <div>{trendEl}</div>}
                      </div>
                    );
                  },
                )}
              </div>

              {/* ── Run Health hero ───────────────────────────────────────────── */}
              {(() => {
                const heroTotal = running && liveRunCounts ? liveRunCounts.total : counts.total;
                const heroPassed = running && liveRunCounts ? liveRunCounts.passed : counts.passed;
                const heroFailed = running && liveRunCounts ? liveRunCounts.failed : counts.failed;
                const heroRate =
                  running && liveRunCounts && liveRunCounts.total > 0
                    ? Math.round((liveRunCounts.passed / liveRunCounts.total) * 100)
                    : passRate;
                const heroColor =
                  heroRate >= 80
                    ? '#34C759'
                    : heroRate >= 50
                      ? '#E8A728'
                      : heroTotal > 0
                        ? '#ef4444'
                        : '#6366f1';
                return (
                  <div
                    className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-5 mb-6"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      boxShadow: running
                        ? `0 0 0 1px ${heroColor}40, 0 4px 16px -6px rgba(0,0,0,0.10)`
                        : '0 4px 16px -6px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
                      border: `1px solid ${heroRate >= 80 ? 'rgba(16,185,129,0.18)' : heroRate >= 50 ? 'rgba(251,191,36,0.20)' : heroTotal > 0 ? 'rgba(239,68,68,0.18)' : 'var(--border)'}`,
                      transition: 'box-shadow 0.3s, border-color 0.3s',
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 blur-2xl pointer-events-none"
                      style={{ backgroundColor: heroColor }}
                    />
                    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="var(--border)"
                        strokeWidth="7"
                        fill="none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        fill="none"
                        strokeWidth="7"
                        strokeLinecap="round"
                        stroke={heroColor}
                        strokeDasharray={`${(heroRate / 100) * 201.06} 201.06`}
                        transform="rotate(-90 40 40)"
                        style={{ transition: 'stroke-dasharray 500ms ease, stroke 300ms' }}
                      />
                      {running && (
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
                          strokeWidth="7"
                          stroke={heroColor}
                          strokeDasharray="10 191"
                          strokeDashoffset={`${-(heroRate / 100) * 201.06}`}
                          transform="rotate(-90 40 40)"
                          opacity="0.3"
                          className="animate-spin"
                          style={{ animationDuration: '3s' }}
                        />
                      )}
                      <text
                        x="40"
                        y="44"
                        textAnchor="middle"
                        fontSize="17"
                        fontWeight="800"
                        fill={
                          heroRate >= 80
                            ? '#059669'
                            : heroRate >= 50
                              ? '#d97706'
                              : heroTotal > 0
                                ? '#dc2626'
                                : '#6366f1'
                        }
                      >
                        {heroTotal === 0 && !running ? '—' : `${heroRate}%`}
                      </text>
                      <text
                        x="40"
                        y="56"
                        textAnchor="middle"
                        fontSize="7"
                        fontWeight="600"
                        fill="var(--text-muted)"
                        letterSpacing="0.05em"
                      >
                        {running ? 'LIVE' : 'PASS'}
                      </text>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Run Health
                        </p>
                        {running && (
                          <span
                            className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
                            style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}
                          >
                            ● RUNNING
                          </span>
                        )}
                      </div>
                      <p
                        className="text-base font-black leading-tight mb-2"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {running
                          ? liveRunCounts && liveRunCounts.total > 0
                            ? `${heroPassed} passed · ${heroFailed} failed · ${liveRunCounts.running} remaining`
                            : 'Executing tests…'
                          : heroTotal === 0
                            ? 'No data yet'
                            : heroRate >= 95
                              ? 'All-green'
                              : heroRate >= 80
                                ? 'Mostly passing'
                                : heroRate >= 50
                                  ? 'Needs attention'
                                  : 'Critical failures'}
                      </p>
                      <div
                        className="h-1.5 rounded-full overflow-hidden flex"
                        style={{ backgroundColor: 'var(--bg-muted)' }}
                      >
                        {heroPassed > 0 && (
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(heroPassed / Math.max(heroTotal, 1)) * 100}%`,
                              backgroundColor: '#34C759',
                            }}
                          />
                        )}
                        {heroFailed > 0 && (
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(heroFailed / Math.max(heroTotal, 1)) * 100}%`,
                              backgroundColor: '#EF4444',
                            }}
                          />
                        )}
                        {!running && counts.skipped > 0 && (
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(counts.skipped / Math.max(counts.total, 1)) * 100}%`,
                              backgroundColor: '#E8A728',
                            }}
                          />
                        )}
                        {running && liveRunCounts && liveRunCounts.running > 0 && (
                          <div
                            className="h-full animate-pulse"
                            style={{
                              width: `${(liveRunCounts.running / Math.max(heroTotal, 1)) * 100}%`,
                              backgroundColor: '#6366f1',
                            }}
                          />
                        )}
                      </div>
                      <div
                        className="flex items-center gap-4 mt-1.5 text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-sm inline-block"
                            style={{ backgroundColor: '#34C759' }}
                          />
                          <span className="font-semibold" style={{ color: '#16A34A' }}>
                            {heroPassed}
                          </span>{' '}
                          passed
                        </span>
                        {heroFailed > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-sm inline-block"
                              style={{ backgroundColor: '#EF4444' }}
                            />
                            <span className="font-semibold" style={{ color: '#EF4444' }}>
                              {heroFailed}
                            </span>{' '}
                            failed
                          </span>
                        )}
                        {!running && counts.skipped > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-sm inline-block"
                              style={{ backgroundColor: '#E8A728' }}
                            />
                            <span className="font-semibold" style={{ color: '#D97706' }}>
                              {counts.skipped}
                            </span>{' '}
                            skipped
                          </span>
                        )}
                        {!running && counts.flaky > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-sm inline-block"
                              style={{ backgroundColor: '#E8A728' }}
                            />
                            <span className="font-semibold" style={{ color: '#D97706' }}>
                              {counts.flaky}
                            </span>{' '}
                            flaky
                          </span>
                        )}
                        {running && liveRunCounts && liveRunCounts.running > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-sm inline-block animate-pulse"
                              style={{ backgroundColor: '#6366f1' }}
                            />
                            <span className="font-semibold" style={{ color: '#6366f1' }}>
                              {liveRunCounts.running}
                            </span>{' '}
                            running
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Insights row: Executions Over Time · Top Failed · Failure Reasons ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-start">
                {/* Executions Over Time — HistoryChart owns its card wrapper */}
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Executions Over Time
                  </p>
                  <HistoryChart
                    runs={runHistory}
                    selectedId={selectedRunId}
                    onSelect={(id) => fetchResults(id)}
                  />
                </div>

                {/* Top Failed Tests */}
                <div
                  className="rounded-2xl p-4 flex flex-col"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Top Failed Tests
                  </p>
                  <TopFailedPanel suites={suites} onViewAll={() => setActiveTab('failed')} />
                </div>

                {/* Failure Reasons */}
                <div
                  className="rounded-2xl p-4 flex flex-col"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Failure Reasons
                    </p>
                    <button
                      onClick={() => setActiveTab('failed')}
                      className="text-[10px] font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: '#1a3a8f' }}
                    >
                      View full report →
                    </button>
                  </div>
                  <FailureReasonsChart tests={allTests} />
                </div>
              </div>

              {/* Run log terminal */}
              {showLog && runLog.length > 0 && (
                <div
                  className="mt-4 rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-2.5 border-b"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg-body)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Terminal size={13} style={{ color: '#34C759' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                        Run Output
                      </span>
                      {running && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      <span className="text-[10px]" style={{ color: '#6c7086' }}>
                        {runLog.length} lines
                      </span>
                    </div>
                    <button
                      onClick={() => setShowLog(false)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X size={13} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                  <div
                    className="overflow-auto font-mono text-[10.5px] leading-relaxed px-4 py-3"
                    style={{ backgroundColor: '#1e1e2e', maxHeight: '280px' }}
                  >
                    {runLog.map((line, i) => {
                      const color = /✓|passed|\[PASS\]/i.test(line)
                        ? '#a6e3a1'
                        : /✗|failed|\[FAIL\]|\[ERROR\]/i.test(line)
                          ? '#f38ba8'
                          : /\[FILTER\]|\[INFO\]/i.test(line)
                            ? '#89b4fa'
                            : /\[TIMEOUT\]|\[OFFLINE\]/i.test(line)
                              ? '#fab387'
                              : /skipped|pending/i.test(line)
                                ? '#f9e2af'
                                : '#cdd6f4';
                      return (
                        <div
                          key={i}
                          style={{
                            color,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                          }}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Runs panel */}
              <RunsPanel
                runs={runHistory}
                selectedId={selectedRunId}
                onSelect={(id) => fetchResults(id)}
                onLoadLatest={() => fetchResults()}
                onClearHistory={clearHistory}
                isDemo={false}
              />

              {/* Search + Filter + Mode toggle */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                <div className="relative flex-1 min-w-44">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search tests…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      boxShadow: '0 1px 4px -1px rgba(0,0,0,0.06)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    >
                      <X size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    {
                      key: 'active' as const,
                      label: `Active (${counts.passed + counts.failed})`,
                      activeColor: '#1a3a8f',
                      activeBg: '#1a3a8f',
                    },
                    {
                      key: 'all' as const,
                      label: `All (${counts.total})`,
                      activeColor: '#6366f1',
                      activeBg: '#6366f1',
                    },
                    {
                      key: 'passed' as const,
                      label: `Passed (${counts.passed})`,
                      activeColor: '#059669',
                      activeBg: '#34C759',
                    },
                    {
                      key: 'failed' as const,
                      label: `Failed (${counts.failed})`,
                      activeColor: '#dc2626',
                      activeBg: '#ef4444',
                    },
                    {
                      key: 'skipped' as const,
                      label: `Skipped (${counts.skipped})`,
                      activeColor: '#d97706',
                      activeBg: '#E8A728',
                    },
                  ].map(({ key, label, activeBg }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                      style={
                        activeTab === key
                          ? { background: activeBg, color: '#fff' }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* List / Matrix toggle */}
                <div
                  className="flex items-center gap-0.5 p-0.5 rounded-lg border ml-auto"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  {[
                    {
                      mode: 'list' as const,
                      icon: <List size={12} />,
                      label: 'List',
                    },
                    {
                      mode: 'matrix' as const,
                      icon: <Grid3x3 size={12} />,
                      label: 'Matrix',
                    },
                  ].map(({ mode, icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setDashboardMode(mode)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                      style={
                        dashboardMode === mode
                          ? {
                              backgroundColor: 'var(--bg-body)',
                              color: '#1a3a8f',
                              boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                            }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matrix view */}
              {dashboardMode === 'matrix' && <BrowserMatrixView suites={filteredSuites} />}

              {/* List view — Test suite accordion */}
              {dashboardMode === 'list' && (
                <div className="flex flex-col gap-3">
                  {filteredSuites.map((suite) => {
                    const passed = suite.tests.filter((t) => t.status === 'passed').length;
                    const status = suiteStatus(suite);
                    const isOpen = expandedSuites[suite.id];
                    const suiteDuration = suite.tests.reduce((a, t) => a + t.duration, 0);
                    const maxDuration = Math.max(...suite.tests.map((t) => t.duration), 1);
                    const statusAccent =
                      status === 'passed'
                        ? '#34C759'
                        : status === 'failed'
                          ? '#ef4444'
                          : status === 'running'
                            ? '#3b82f6'
                            : status === 'skipped'
                              ? '#E8A728'
                              : 'var(--border)';

                    return (
                      <div
                        key={suite.id}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          borderLeft: `3px solid ${statusAccent}`,
                          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
                        }}
                      >
                        {/*
                      Sticky header: when a suite is expanded and the user scrolls
                      down through long test lists, the suite header stays pinned
                      below the navbar (h-14 = 3.5rem) so they don't lose context.
                      `backdrop-blur` + the card background keeps it readable while
                      sticky content scrolls behind it.
                    */}
                        <button
                          onClick={() => toggleSuite(suite.id)}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${isOpen ? 'sticky z-[5]' : ''}`}
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            top: isOpen ? '3.5rem' : undefined,
                            backdropFilter: isOpen ? 'saturate(180%) blur(8px)' : undefined,
                            WebkitBackdropFilter: isOpen ? 'saturate(180%) blur(8px)' : undefined,
                            boxShadow: isOpen ? '0 4px 12px -8px rgba(0,0,0,0.18)' : undefined,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = 'var(--bg-body)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'var(--bg-card)')
                          }
                        >
                          <StatusIcon status={status} size={16} />
                          <span className="flex-1 min-w-0">
                            <span
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-main)' }}
                            >
                              {suite.title}
                            </span>
                            <span
                              className="ml-2 text-xs font-mono"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {suite.file}
                            </span>
                          </span>
                          {suiteDuration > 0 && (
                            <span
                              className="text-xs font-mono shrink-0 hidden sm:inline"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {formatMs(suiteDuration)}
                            </span>
                          )}
                          {/* Mini pass rate pill */}
                          <span
                            className="text-[10px] shrink-0 font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                passed === suite.tests.length
                                  ? 'rgba(16,185,129,0.1)'
                                  : passed === 0
                                    ? 'rgba(239,68,68,0.1)'
                                    : 'rgba(251,191,36,0.1)',
                              color:
                                passed === suite.tests.length
                                  ? '#059669'
                                  : passed === 0
                                    ? '#dc2626'
                                    : '#d97706',
                            }}
                          >
                            {passed}/{suite.tests.length}
                          </span>
                          {/* Single chevron, rotates 180° when open — smoother than swapping icons */}
                          <ChevronDown
                            size={15}
                            className="shrink-0"
                            style={{
                              color: 'var(--text-muted)',
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 200ms ease',
                            }}
                          />
                        </button>

                        {isOpen && (
                          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                            {suite.tests.map((test, i) => {
                              const isFailed = test.status === 'failed';
                              const isFlaky = (test.retries ?? 0) > 0 && test.status === 'passed';
                              const showActions =
                                isFailed && (hoveredTest === test.id || expandedErrors[test.id]);
                              const errorOpen = expandedErrors[test.id];
                              const errType =
                                isFailed && test.error ? parseErrorType(test.error) : null;
                              const errStyle = errType ? ERROR_TYPE_STYLES[errType] : null;
                              return (
                                <div
                                  key={test.id}
                                  className={i > 0 ? 'border-t' : ''}
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <div
                                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${isFailed ? 'cursor-pointer' : ''}`}
                                    style={{
                                      backgroundColor:
                                        isFailed && hoveredTest === test.id
                                          ? 'rgba(239,68,68,0.05)'
                                          : undefined,
                                    }}
                                    onMouseEnter={() => isFailed && setHoveredTest(test.id)}
                                    onMouseLeave={() => setHoveredTest(null)}
                                    onClick={() => isFailed && toggleError(test.id)}
                                  >
                                    <StatusIcon status={test.status} />
                                    <span className="flex-1 min-w-0">
                                      <span
                                        className="text-xs block truncate"
                                        style={{ color: 'var(--text-main)' }}
                                      >
                                        {test.title}
                                      </span>
                                      {/* Tags */}
                                      {(test.tags ?? []).length > 0 && (
                                        <span className="flex items-center gap-1 mt-0.5 flex-wrap">
                                          {(test.tags ?? []).map((tag) => (
                                            <span
                                              key={tag}
                                              className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-px rounded border"
                                              style={{
                                                color: 'var(--text-muted)',
                                                borderColor: 'var(--border)',
                                              }}
                                            >
                                              <Tag size={8} />
                                              {tag}
                                            </span>
                                          ))}
                                        </span>
                                      )}
                                    </span>
                                    {/* Error type badge */}
                                    {errType && errStyle && (
                                      <span
                                        className="text-[10px] font-bold px-1.5 py-px rounded shrink-0"
                                        style={{
                                          background: errStyle.bg,
                                          color: errStyle.color,
                                          border: `1px solid ${errStyle.border}`,
                                        }}
                                      >
                                        {errType}
                                      </span>
                                    )}
                                    {/* Flaky badge */}
                                    {isFlaky && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-px rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                        <AlertTriangle size={9} /> FLAKY
                                      </span>
                                    )}
                                    {/* Retry badge (for still-failed tests) */}
                                    {!isFlaky && (test.retries ?? 0) > 0 && (
                                      <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                                        <AlertTriangle size={10} /> {test.retries} retry
                                      </span>
                                    )}
                                    {test.duration > 0 && (
                                      <div
                                        className="w-14 h-1 rounded-full overflow-hidden shrink-0 hidden sm:block"
                                        style={{
                                          backgroundColor: 'var(--border)',
                                        }}
                                      >
                                        <div
                                          className="h-full rounded-full transition-all duration-300"
                                          style={{
                                            width: `${(test.duration / maxDuration) * 100}%`,
                                            backgroundColor:
                                              test.status === 'failed'
                                                ? '#ef4444'
                                                : test.status === 'passed'
                                                  ? '#34C759'
                                                  : '#E8A728',
                                          }}
                                        />
                                      </div>
                                    )}
                                    <span
                                      className="text-xs font-mono shrink-0"
                                      style={{ color: 'var(--text-muted)' }}
                                    >
                                      {formatMs(test.duration)}
                                    </span>
                                    {/* Browser status dots — only visible when multiple browsers ran */}
                                    {test.browserResults && test.browserResults.length > 1 && (
                                      <span
                                        className="flex items-center gap-0.5 shrink-0"
                                        title={test.browserResults
                                          .map((r) => `${r.browser}: ${r.status}`)
                                          .join(' · ')}
                                      >
                                        {test.browserResults.map((r) => (
                                          <span
                                            key={r.browser}
                                            style={{
                                              width: 7,
                                              height: 7,
                                              borderRadius: '50%',
                                              display: 'inline-block',
                                              backgroundColor:
                                                r.status === 'passed'
                                                  ? '#34C759'
                                                  : r.status === 'failed'
                                                    ? '#ef4444'
                                                    : '#E8A728',
                                              opacity: r.status === 'skipped' ? 0.6 : 1,
                                            }}
                                          />
                                        ))}
                                      </span>
                                    )}
                                    <StatusBadge status={test.status} />
                                    {isFailed && (
                                      <ChevronDown
                                        size={13}
                                        className="shrink-0"
                                        style={{
                                          color: 'var(--text-muted)',
                                          transform: errorOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                          transition: 'transform 200ms ease',
                                        }}
                                      />
                                    )}
                                  </div>
                                  {showActions && (
                                    <FailedActions
                                      test={test}
                                      suiteFile={suite.file}
                                      onViewArtifacts={setArtifactModal}
                                    />
                                  )}
                                  {isFailed && errorOpen && test.steps && test.steps.length > 0 && (
                                    <StepTimeline steps={test.steps} />
                                  )}
                                  {isFailed && errorOpen && (
                                    <div
                                      className="mx-4 mb-3 rounded-xl border-l-2 border-red-400 overflow-hidden"
                                      style={{
                                        backgroundColor: 'rgba(239,68,68,0.06)',
                                      }}
                                    >
                                      {/* Error block header — type chip + copy button */}
                                      <div
                                        className="flex items-center gap-2 px-3 py-2 border-b"
                                        style={{
                                          borderColor: 'rgba(239,68,68,0.15)',
                                        }}
                                      >
                                        <XCircle size={11} className="text-red-500 shrink-0" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                                          {errType ?? 'Error'}
                                        </span>
                                        <span className="text-[10px]" style={{ color: '#b91c1c' }}>
                                          · {(test.error ?? '').split('\n')[0].slice(0, 80)}
                                          {(test.error ?? '').length > 80 ? '…' : ''}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard
                                              ?.writeText(test.error ?? '')
                                              .catch(() => {
                                                /* clipboard blocked */
                                              });
                                          }}
                                          className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors shrink-0"
                                          style={{ color: '#b91c1c' }}
                                          onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                              'rgba(239,68,68,0.10)')
                                          }
                                          onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor = 'transparent')
                                          }
                                          title="Copy full error message"
                                        >
                                          <Copy size={10} /> Copy
                                        </button>
                                      </div>
                                      <pre
                                        className="px-3 py-2.5 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words"
                                        style={{
                                          color: '#dc2626',
                                          maxHeight: 260,
                                          overflow: 'auto',
                                        }}
                                      >
                                        {test.error}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredSuites.length === 0 && (
                    <div
                      className="text-center py-16 rounded-2xl"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        background:
                          'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)',
                        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
                      }}
                    >
                      {suites.length === 0 ? (
                        <>
                          <div
                            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                            style={{
                              background: 'rgba(59,130,246,0.08)',
                              border: '1px solid rgba(59,130,246,0.15)',
                            }}
                          >
                            <Play size={24} style={{ color: '#3b82f6', opacity: 0.6 }} />
                          </div>
                          <p
                            className="text-sm font-semibold mb-1.5"
                            style={{ color: 'var(--text-main)' }}
                          >
                            No test results yet
                          </p>
                          <p
                            className="text-xs max-w-xs mx-auto"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {serverOnline === false
                              ? 'Server is offline — start it with: npm run dev'
                              : 'Click Run Tests to execute your Playwright specs.'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                            style={{
                              background: 'rgba(148,163,184,0.08)',
                              border: '1px solid rgba(148,163,184,0.15)',
                            }}
                          >
                            <Search
                              size={22}
                              style={{
                                color: 'var(--text-muted)',
                                opacity: 0.5,
                              }}
                            />
                          </div>
                          <p
                            className="text-sm font-semibold mb-1.5"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {searchQuery
                              ? `No tests match "${searchQuery}"`
                              : 'No tests match this filter'}
                          </p>
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="mt-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                              style={{
                                background: 'rgba(59,130,246,0.1)',
                                color: '#3b82f6',
                              }}
                            >
                              Clear search
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Slowest tests */}
              {slowestTests.length > 0 && !searchQuery && (
                <div
                  className="mt-4 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-3 border-b"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg-body)',
                    }}
                  >
                    <Clock size={13} style={{ color: '#f59e0b' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                      Slowest Tests
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                      }}
                    >
                      top 3
                    </span>
                  </div>
                  <div>
                    {slowestTests.map((test, i) => (
                      <div
                        key={test.id}
                        className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t' : ''}`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span
                          className="text-xs font-bold w-5 shrink-0 text-center"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          #{i + 1}
                        </span>
                        <StatusIcon status={test.status} size={13} />
                        <span
                          className="flex-1 text-xs truncate"
                          style={{ color: 'var(--text-main)' }}
                        >
                          {test.title}
                        </span>
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden shrink-0 hidden sm:block max-w-[160px]"
                          style={{ backgroundColor: 'var(--border)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(test.duration / slowestTests[0].duration) * 100}%`,
                              background: 'linear-gradient(90deg, #E8A728, #D97706)',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-mono font-bold shrink-0"
                          style={{ color: '#d97706' }}
                        >
                          {formatMs(test.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flaky test panel */}
              <FlakyPanel suites={suites} />
            </>
          )}

          {/* ── Docs view ────────────────────────────────────────────────────────── */}
          {activeView === 'docs' && <DocsView />}
        </div>

        {artifactModal && (
          <ArtifactModal state={artifactModal} onClose={() => setArtifactModal(null)} />
        )}
      </div>
    </div>
  );
}
