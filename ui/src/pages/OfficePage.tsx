/**
 * OfficePage — QA Office hub with Edi M multi-agent orchestration.
 *
 * Architecture:
 *   ┌──────────────┬──────────────────────┐
 *   │  Office Map  │     Chat (flex-1)     │
 *   │  + Roster    │  Delegation chain     │
 *   │  w-72        │  QA Summary cards     │
 *   └──────────────┴──────────────────────┘
 *
 * Orchestration flow:
 *   1. Untagged messages → routed to Edi M (Team Manager)
 *   2. Edi M responds with @mentions → auto-dispatch those agents
 *   3. After /api/run-dynamic-test: server streams AI summary → shown as Edi M card
 *   4. Dashboard commands [CMD:...] in AI responses → applied to dashboard state
 */
import {
  useCallback, useEffect, useRef, useState,
  type ChangeEvent, type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Bot, ChevronDown, CheckCircle2, XCircle,
  Eraser, ExternalLink, FileText, Paperclip,
  Send, Settings, Square, X, Copy, Check, PlayCircle,
  ArrowRight, Users, Zap,
} from 'lucide-react'

import { OfficeCanvas }  from '../office/components/OfficeCanvas'
import { OfficeState }   from '../office/engine/officeState'
import { loadDefaultLayout, loadOfficeAssets } from '../office/assetLoader'
import { useSettings, TEAM_MANAGER_ID }   from '../context/SettingsContext'
import type {
  AgentConfig, AgentStatus, Attachment, Message,
} from '../context/SettingsContext'
import type { SpriteType } from '../context/SettingsContext'
import type { OfficeLayout } from '../office/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const DESK_ROUTES: Record<string, string> = {
  'desk-1': '/agents',
  'desk-2': '/generate',
  'desk-3': '/playground',
  'desk-4': '/prompts',
  'desk-5': '/playwright',
  'desk-6': '/agents',
  'desk-7': '/office',
}

const API_BASE = 'http://localhost:3001'

const TEXT_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'json', 'log', 'txt', 'md',
  'css', 'html', 'xml', 'yaml', 'yml', 'sh', 'py', 'java', 'cs',
])

const SPRITE_ACCENT: Record<SpriteType, { bg: string; ring: string; text: string; bar: string }> = {
  tester:  { bg: '#0d2a1a', ring: '#166534', text: '#4ade80', bar: '#22c55e' },
  dev:     { bg: '#0f1f3d', ring: '#1d4ed8', text: '#60a5fa', bar: '#3b82f6' },
  analyst: { bg: '#1e0a40', ring: '#7c3aed', text: '#c084fc', bar: '#a855f7' },
  devops:  { bg: '#2a0e02', ring: '#c2410c', text: '#fb923c', bar: '#f97316' },
  manager: { bg: '#2a1200', ring: '#d97706', text: '#fbbf24', bar: '#f59e0b' },
}

const MANAGER_ACCENT = SPRITE_ACCENT['manager']

// ─── OfficeState singleton ────────────────────────────────────────────────────

let _officeState: OfficeState | null = null
function agentNumId(idx: number) { return idx + 1 }

// ─── Markdown renderer ────────────────────────────────────────────────────────

function MarkdownContent({
  text,
  onApplyFix,
  isSummary = false,
}: {
  text:        string
  onApplyFix?: (code: string) => void
  isSummary?:  boolean
}) {
  const [copied,   setCopied]  = useState<number | null>(null)
  const [applying, setApplying] = useState<number | null>(null)

  const copyCode = useCallback((code: string, idx: number) => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(idx); setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g)

  return (
    <div className="text-[13px] leading-relaxed">
      {parts.map((part, i) => {
        const fm = /^```([\w]*)\n([\s\S]*?)```$/.exec(part)
        if (fm) {
          const lang = fm[1] || 'text'
          const code = fm[2].trimEnd()
          const isRunnable = isSummary && /^(typescript|ts|javascript|js)$/i.test(lang) && !!onApplyFix
          return (
            <div key={i} className="relative my-2 rounded-lg overflow-hidden"
              style={{ background: '#0d1117', border: '1px solid #30363d' }}>
              <div className="flex items-center justify-between px-3 py-1.5"
                style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
                <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: '#8b949e' }}>{lang}</span>
                <div className="flex items-center gap-1.5">
                  {isRunnable && (
                    <button
                      onClick={() => {
                        setApplying(i)
                        onApplyFix(code)
                        setTimeout(() => setApplying(null), 3000)
                      }}
                      disabled={applying === i}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-all font-semibold"
                      style={{
                        color:      applying === i ? '#58a6ff' : '#3fb950',
                        background: applying === i ? 'rgba(88,166,255,0.12)' : 'rgba(63,185,80,0.1)',
                        border:     `1px solid ${applying === i ? 'rgba(88,166,255,0.3)' : 'rgba(63,185,80,0.3)'}`,
                      }}>
                      {applying === i
                        ? <><Zap size={9} className="animate-spin" /> Running…</>
                        : <><PlayCircle size={9} /> Apply Fix</>
                      }
                    </button>
                  )}
                  <button onClick={() => copyCode(code, i)}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors"
                    style={{
                      color:      copied === i ? '#3fb950' : '#8b949e',
                      background: copied === i ? 'rgba(63,185,80,0.1)' : 'transparent',
                    }}>
                    {copied === i ? <><Check size={9} /> Copied</> : <><Copy size={9} /> Copy</>}
                  </button>
                </div>
              </div>
              <pre className="px-4 py-3 overflow-x-auto font-mono text-[12px]"
                style={{ color: '#e6edf3', margin: 0 }}>
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        const lines = part.split('\n')
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const segments = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
              return (
                <span key={li}>
                  {segments.map((seg, si) => {
                    if (/^`[^`]+`$/.test(seg))
                      return <code key={si} className="px-1 py-0.5 rounded text-[12px] font-mono"
                        style={{ background: 'rgba(110,118,129,0.2)', color: '#f0883e' }}>{seg.slice(1,-1)}</code>
                    if (/^\*\*[^*]+\*\*$/.test(seg))
                      return <strong key={si} style={{ color: '#e6edf3' }}>{seg.slice(2,-2)}</strong>
                    if (/^\*[^*]+\*$/.test(seg))
                      return <em key={si}>{seg.slice(1,-1)}</em>
                    if (/^#{1,3} /.test(seg)) {
                      const level = (seg.match(/^(#+)/)?.[1].length ?? 1) as 1|2|3
                      const headingText = seg.replace(/^#+\s/, '')
                      const sizes: Record<1|2|3,string> = {
                        1: 'text-sm font-black mt-3 mb-1',
                        2: 'text-xs font-bold mt-2',
                        3: 'text-xs font-semibold mt-1',
                      }
                      return <span key={si} className={`block ${sizes[level]}`}
                        style={{ color: '#e6edf3' }}>{headingText}</span>
                    }
                    return <span key={si}>{seg}</span>
                  })}
                  {li < lines.length - 1 && <br />}
                </span>
              )
            })}
          </span>
        )
      })}
    </div>
  )
}

// ─── Delegation badge ─────────────────────────────────────────────────────────

function DelegationChain({
  delegationTo,
  agents,
}: {
  delegationTo: string[]
  agents:       AgentConfig[]
}) {
  if (delegationTo.length === 0) return null
  return (
    <div className="mt-2.5 rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(42,18,0,0.6)' }}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5"
        style={{ borderBottom: '1px solid rgba(217,119,6,0.2)', background: 'rgba(217,119,6,0.08)' }}>
        <Users size={10} style={{ color: '#fbbf24' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#fbbf24' }}>
          Delegating to
        </span>
      </div>
      <div className="flex flex-col">
        {delegationTo.map((name, i) => {
          const agent  = agents.find(a => a.name === name)
          const accent = agent ? SPRITE_ACCENT[agent.characterSprite] : SPRITE_ACCENT.dev
          return (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
              <ArrowRight size={9} style={{ color: '#d97706' }} />
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
                style={{ background: accent.bg, color: accent.text, border: `1px solid ${accent.ring}` }}>
                {name.slice(0,2).toUpperCase()}
              </div>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-main)' }}>{name}</span>
              {agent && <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{agent.role}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── QA Summary card header ───────────────────────────────────────────────────

function QASummaryHeader({ summaryData }: { summaryData?: Message['summaryData'] }) {
  if (!summaryData) return null
  const { total, passed, failed, duration } = summaryData
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  return (
    <div className="mb-3 rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(42,18,0,0.4)' }}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(217,119,6,0.2)', background: 'rgba(217,119,6,0.1)' }}>
        <span className="text-[11px] font-black" style={{ color: '#fbbf24' }}>📊 Executive QA Summary</span>
        <span className="ml-auto text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
          {(duration / 1000).toFixed(1)}s
        </span>
      </div>
      {/* Stats row */}
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#4ade80' }}>
          <CheckCircle2 size={11} /> {passed} passed
        </span>
        {failed > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#f87171' }}>
            <XCircle size={11} /> {failed} failed
          </span>
        )}
        <span className="text-[10px] font-mono ml-auto px-1.5 py-0.5 rounded-full font-bold"
          style={{
            background: passRate >= 90 ? 'rgba(74,222,128,0.15)' : passRate >= 70 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
            color:      passRate >= 90 ? '#4ade80' : passRate >= 70 ? '#fbbf24' : '#f87171',
          }}>
          {passRate}%
        </span>
      </div>
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isStreaming,
  agents,
  onApplyFix,
}: {
  msg:         Message
  isStreaming: boolean
  agents:      AgentConfig[]
  onApplyFix?: (code: string) => void
}) {
  const isUser   = msg.role === 'user'
  const agent    = msg.agentId ? agents.find(a => a.id === msg.agentId) : null
  const accent   = agent ? SPRITE_ACCENT[agent.characterSprite] : null
  const isMgr    = msg.agentId === TEAM_MANAGER_ID
  const isSummary = msg.type === 'qa_summary'

  const avatarBg   = isUser ? '#1e3a5f'          : (accent?.bg   ?? '#0f2a1a')
  const avatarRing = isUser ? '#1d4ed8'          : (accent?.ring ?? '#166534')
  const avatarText = isUser ? '#93c5fd'          : (accent?.text ?? '#4ade80')
  const initials   = isUser ? 'U'                : (msg.senderName?.slice(0,2).toUpperCase() ?? 'AI')

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mb-0.5"
        style={{
          background:  avatarBg,
          color:       avatarText,
          border:      `1.5px solid ${avatarRing}`,
          boxShadow:   isMgr ? `0 0 0 2px ${MANAGER_ACCENT.ring}50, 0 0 8px ${MANAGER_ACCENT.ring}30` : `0 0 0 2px ${avatarRing}20`,
        }}
      >
        {initials}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-0.5 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {msg.senderName}
          </span>
          {isMgr && (
            <span className="text-[8px] font-bold px-1 py-px rounded"
              style={{ background: 'rgba(217,119,6,0.15)', color: '#d97706', border: '1px solid rgba(217,119,6,0.3)' }}>
              MANAGER
            </span>
          )}
          {isSummary && (
            <span className="text-[8px] font-bold px-1 py-px rounded"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
              QA SUMMARY
            </span>
          )}
          <span className="text-[9px] font-normal opacity-50" style={{ color: 'var(--text-muted)' }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div
          className="rounded-2xl px-3.5 py-2.5 w-full"
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #1e3a5f 0%, #1a3050 100%)'
              : isSummary
                ? 'linear-gradient(135deg, rgba(42,18,0,0.95) 0%, rgba(30,12,0,0.95) 100%)'
                : isMgr
                  ? 'linear-gradient(135deg, rgba(42,18,0,0.8) 0%, var(--bg-card) 60%)'
                  : 'var(--bg-card)',
            border:    `1px solid ${isUser ? '#1e4080' : isSummary ? 'rgba(217,119,6,0.4)' : isMgr ? 'rgba(217,119,6,0.25)' : 'var(--border)'}`,
            color:     'var(--text-main)',
            wordBreak: 'break-word',
          }}
        >
          {/* File attachment chips */}
          {msg.attachments?.filter(a => !a.type.startsWith('image/')).map((att, i) => (
            <span key={i} className="inline-flex items-center gap-1 mr-1 mb-2 px-2 py-0.5 rounded text-[10px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <FileText size={9} />{att.name}
            </span>
          ))}

          {/* Image attachments */}
          {msg.attachments?.filter(a => a.type.startsWith('image/')).map((att, i) => (
            <img key={i} src={att.content} alt={att.name}
              className="max-w-xs rounded-lg mb-2 block"
              style={{ border: '1px solid var(--border)', maxHeight: 200, objectFit: 'cover' }} />
          ))}

          {/* QA Summary header stats */}
          {isSummary && msg.summaryData && <QASummaryHeader summaryData={msg.summaryData} />}

          {/* Message content */}
          {isUser
            ? <span className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</span>
            : msg.content
              ? <MarkdownContent text={msg.content} onApplyFix={onApplyFix} isSummary={isSummary} />
              : (
                <span className="flex gap-0.5 items-center py-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: accent?.bar ?? '#4ade80',
                        animation: `bounce 0.8s infinite ${i*0.15}s`,
                      }} />
                  ))}
                </span>
              )
          }

          {/* Streaming cursor */}
          {isStreaming && msg.content && (
            <span className="inline-block w-2 h-[14px] ml-0.5 animate-pulse rounded-sm align-middle"
              style={{ background: accent?.bar ?? '#4ade80', verticalAlign: 'middle' }} />
          )}

          {/* Delegation chain (for delegation-type messages from Edi M) */}
          {msg.type === 'delegation' && msg.delegationTo && msg.delegationTo.length > 0 && (
            <DelegationChain delegationTo={msg.delegationTo} agents={agents} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Chat empty state ─────────────────────────────────────────────────────────

function ChatEmptyState({ agents }: { agents: AgentConfig[] }) {
  const manager = agents.find(a => a.id === TEAM_MANAGER_ID)
  const others  = agents.filter(a => a.id !== TEAM_MANAGER_ID)
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8 select-none">
      {/* Manager card */}
      {manager && (
        <div className="rounded-2xl p-4 text-center max-w-xs"
          style={{ background: 'rgba(42,18,0,0.5)', border: '1px solid rgba(217,119,6,0.3)' }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold"
            style={{ background: MANAGER_ACCENT.bg, color: MANAGER_ACCENT.text, border: `2px solid ${MANAGER_ACCENT.ring}` }}>
            {manager.name.slice(0,2).toUpperCase()}
          </div>
          <p className="text-xs font-bold" style={{ color: '#fbbf24' }}>Edi M · Team Manager</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Just send a message — I'll route it to the right specialist.
          </p>
        </div>
      )}
      <p className="text-[10px] max-w-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Or tag a specialist directly with <code className="font-mono text-[11px]"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-main)', padding: '0 3px', borderRadius: 3 }}>@Name</code>
      </p>
      {others.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center max-w-xs">
          {others.map(a => {
            const accent = SPRITE_ACCENT[a.characterSprite]
            return (
              <span key={a.id} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
                style={{ background: accent.bg, color: accent.text, border: `1px solid ${accent.ring}` }}>
                @{a.name}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: AgentStatus | 'typing' }) {
  const map: Record<AgentStatus | 'typing', string> = {
    idle:    'bg-emerald-400',
    working: 'bg-blue-400 animate-pulse',
    waiting: 'bg-amber-400',
    error:   'bg-red-400',
    typing:  'bg-blue-400 animate-bounce',
  }
  return <span className={`w-2 h-2 rounded-full shrink-0 ${map[status]}`} />
}

function StatusLabel({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, { label: string; color: string }> = {
    idle:    { label: 'Idle',    color: '#4ade80' },
    working: { label: 'Working', color: '#60a5fa' },
    waiting: { label: 'Waiting', color: '#fbbf24' },
    error:   { label: 'Error',   color: '#f87171' },
  }
  const { label, color } = map[status]
  return <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
}

// ─── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent, idx, isTyping, status, isManager, onMention, onNavigate,
}: {
  agent:      AgentConfig
  idx:        number
  isTyping:   boolean
  status:     AgentStatus
  isManager?: boolean
  onMention:  () => void
  onNavigate: () => void
}) {
  const accent    = SPRITE_ACCENT[agent.characterSprite]
  const effective = isTyping ? 'working' : status

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow"
      style={{
        background: 'var(--bg-body)',
        border:     `1px solid ${isManager ? 'rgba(217,119,6,0.4)' : 'var(--border)'}`,
        borderLeft: `3px solid ${accent.bar}`,
        boxShadow:  isManager ? `0 0 0 1px rgba(217,119,6,0.15)` : undefined,
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: accent.bg, color: accent.text, border: `1.5px solid ${accent.ring}` }}>
          {agent.name.slice(0,2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>
              {agent.name}
            </span>
            {isManager && (
              <span className="text-[7px] font-bold px-1 py-px rounded shrink-0"
                style={{ background: 'rgba(217,119,6,0.15)', color: '#d97706' }}>
                MGR
              </span>
            )}
            <span className="text-[9px] tabular-nums opacity-40" style={{ color: 'var(--text-muted)' }}>
              #{agentNumId(idx)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusDot status={effective} />
            <StatusLabel status={effective} />
          </div>
        </div>
      </div>

      <div className="px-3 pb-2 flex items-center gap-1">
        <Bot size={10} style={{ color: 'var(--text-muted)' }} />
        <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{agent.role}</span>
      </div>

      <div className="flex border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onMention}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors hover:opacity-80"
          style={{ color: accent.text, background: accent.bg }}>
          @ Mention
        </button>
        <button onClick={onNavigate}
          className="px-3 flex items-center justify-center transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}
          title="Open tool page">
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfficePage() {
  const navigate = useNavigate()
  const {
    agents, agentStatuses, activeTypingAgents, settings, messages,
    setAgentStatus, appendMessage, appendChunk, updateMessage, clearHistory,
    setActiveTyping, removeActiveTyping, updateSettings,
  } = useSettings()

  // ── Canvas ──────────────────────────────────────────────────────────────────
  const panRef = useRef({ x: 0, y: 0 })
  const [assetsReady, setAssetsReady] = useState(false)
  const [loadError,   setLoadError]   = useState<string | null>(null)

  useEffect(() => {
    if (!_officeState) _officeState = new OfficeState()
    const os = _officeState
    Promise.all([loadOfficeAssets(), loadDefaultLayout()])
      .then(([, rawLayout]) => {
        if (rawLayout) os.rebuildFromLayout(rawLayout as OfficeLayout)
        const savedSeats = (() => {
          try {
            const raw = localStorage.getItem('open_qa_agent_seats')
            return raw
              ? JSON.parse(raw) as Record<number, { palette: number; hueShift: number; seatId: string | null }>
              : {}
          } catch { return {} as Record<number, { palette: number; hueShift: number; seatId: string | null }> }
        })()
        agents.forEach((agent, idx) => {
          const numId = agentNumId(idx)
          if (!os.characters.has(numId)) {
            const saved = savedSeats[numId]
            os.addAgent(numId, saved?.palette, saved?.hueShift, saved?.seatId ?? undefined, true)
          }
          os.setAgentActive(numId,
            agentStatuses[agent.id] === 'working' || activeTypingAgents.includes(agent.id),
          )
        })
        setAssetsReady(true)
      })
      .catch(err => { setLoadError(String(err)); setAssetsReady(true) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!_officeState) return
    agents.forEach((agent, idx) => {
      const isActive = agentStatuses[agent.id] === 'working' || activeTypingAgents.includes(agent.id)
      _officeState!.setAgentActive(agentNumId(idx), isActive)
    })
  }, [agents, agentStatuses, activeTypingAgents])

  const handleAgentClick = (charId: number) => {
    const agent = agents[charId - 1]
    if (!agent) return
    const route = DESK_ROUTES[agent.deskId]
    if (route) navigate(route)
  }

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [inputText,       setInputText]       = useState('')
  const [pendingFiles,    setPendingFiles]     = useState<Attachment[]>([])
  const [mentionQuery,    setMentionQuery]     = useState<string | null>(null)
  const [mentionIndex,    setMentionIndex]     = useState(0)
  const [streamingMsgId,  setStreamingMsgId]   = useState<string | null>(null)
  const [errorBanner,     setErrorBanner]      = useState<string | null>(null)

  const chatEndRef   = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef     = useRef<AbortController | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMsgId])

  // ── @-mention autocomplete ──────────────────────────────────────────────────

  const mentionMatches = mentionQuery !== null
    ? agents.filter(a =>
        a.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
    : []

  const insertMention = useCallback((agentName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const pos   = textarea.selectionStart
    const text  = inputText
    const atIdx = text.lastIndexOf('@', pos - 1)
    if (atIdx === -1) return
    const next = `${text.slice(0, atIdx)}@${agentName} ${text.slice(pos)}`
    setInputText(next)
    setMentionQuery(null)
    requestAnimationFrame(() => {
      const newPos = atIdx + agentName.length + 2
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    })
  }, [inputText])

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputText(val)
    const atMatch = /@([\w ]*)$/.exec(val.slice(0, e.target.selectionStart))
    if (atMatch) { setMentionQuery(atMatch[1]); setMentionIndex(0) }
    else setMentionQuery(null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i+1) % mentionMatches.length); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => (i-1+mentionMatches.length) % mentionMatches.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionMatches[mentionIndex].name); return }
      if (e.key === 'Escape')    { setMentionQuery(null); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() }
  }

  // ── File attachment ─────────────────────────────────────────────────────────

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    files.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => setPendingFiles(prev => [...prev, { name: file.name, type: file.type, content: reader.result as string }])
        reader.readAsDataURL(file)
      } else if (TEXT_EXTENSIONS.has(ext)) {
        const reader = new FileReader()
        reader.onload = () => {
          const text    = reader.result as string
          const inlined = `[File: ${file.name}]\n\`\`\`\n${text}\n\`\`\``
          setInputText(prev => prev ? `${prev}\n\n${inlined}` : inlined)
          setPendingFiles(prev => [...prev, { name: file.name, type: 'text/plain', content: text }])
        }
        reader.readAsText(file)
      }
    })
    e.target.value = ''
  }

  // ── Parse @-mentions ────────────────────────────────────────────────────────

  const parseTaggedAgents = useCallback((text: string) => {
    const names   = [...text.matchAll(/@([\w]+(?:\s[\w]+)*)/g)].map(m => m[1].trim())
    const matched = names
      .map(name => agents.find(a => a.name.toLowerCase() === name.toLowerCase()))
      .filter((a): a is AgentConfig => a !== undefined)
    return [...new Map(matched.map(a => [a.id, a])).values()]
  }, [agents])

  // ── Core SSE call for a single agent target ─────────────────────────────────

  const callAgent = useCallback(async (
    targets:    AgentConfig[],
    userText:   string,
    imageAtts:  Attachment[],
    priorMsgs:  Array<{ role: 'user' | 'model'; content: string }>,
    signal:     AbortSignal,
    onChunk:    (id: string, chunk: string) => void,
    onDone:     (id: string) => void,
    onError:    (id: string, err: string) => void,
    msgId:      string,
  ) => {
    const isOllama = settings.provider === 'ollama'
    const resp = await fetch(`${API_BASE}/api/qa-agent`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${settings.geminiApiKey}`,
      },
      body: JSON.stringify({
        message:          userText,
        history:          priorMsgs,
        agentIds:         targets.map(a => a.id),
        agents:           agents.map(a => ({ id: a.id, name: a.name, systemPrompt: a.systemPrompt })),
        imageAttachments: isOllama ? [] : imageAtts.map(a => ({ name: a.name, type: a.type, content: a.content })),
        model:            isOllama ? settings.ollamaModel : settings.defaultModel,
        provider:         settings.provider,
        ollamaBaseUrl:    settings.ollamaBaseUrl,
      }),
      signal,
    })

    if (!resp.ok || !resp.body) {
      const d = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` })) as { error?: string }
      onError(msgId, d.error ?? 'Unknown error')
      return
    }

    const reader  = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer    = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const payload = JSON.parse(raw) as { chunk?: string; done?: boolean; error?: string }
          if (payload.error) { onError(msgId, payload.error); return }
          if (payload.chunk) onChunk(msgId, payload.chunk)
          if (payload.done) { onDone(msgId); return }
        } catch { /* malformed */ }
      }
    }
  }, [agents, settings])

  // ── Auto-dispatch delegated sub-agents ─────────────────────────────────────

  const dispatchDelegations = useCallback(async (
    delegatedAgents: AgentConfig[],
    originalText:    string,
    managerNote:     string,
    imageAtts:       Attachment[],
    signal:          AbortSignal,
  ) => {
    const priorMsgs = messages.map(m => ({ role: m.role, content: m.content }))

    for (const agent of delegatedAgents) {
      if (signal.aborted) break

      setAgentStatus(agent.id, 'working')
      setActiveTyping([agent.id])

      const msgId   = crypto.randomUUID()
      const delMsg: Message = {
        id:         msgId,
        role:       'model',
        content:    '',
        senderName: agent.name,
        agentId:    agent.id,
        timestamp:  Date.now(),
      }
      appendMessage(delMsg)
      setStreamingMsgId(msgId)

      const delegationContext =
        `Edi M (Team Manager) has delegated this task to you.\n\n` +
        `**Manager's note:** ${managerNote}\n\n` +
        `**Original user request:** ${originalText}`

      try {
        await callAgent(
          [agent],
          delegationContext,
          imageAtts,
          priorMsgs,
          signal,
          (id, chunk) => appendChunk(id, chunk),
          (id) => {
            void id
            setAgentStatus(agent.id, 'idle')
            removeActiveTyping(agent.id)
            setStreamingMsgId(null)
          },
          (_id, err) => {
            appendChunk(msgId, `\n\n[Error: ${err}]`)
            setAgentStatus(agent.id, 'error')
            removeActiveTyping(agent.id)
            setStreamingMsgId(null)
          },
          msgId,
        )
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') break
        appendChunk(msgId, `\n\n[Error: ${err instanceof Error ? err.message : String(err)}]`)
        setAgentStatus(agent.id, 'error')
        removeActiveTyping(agent.id)
        setStreamingMsgId(null)
      }
    }
  }, [
    messages, agents, settings,
    appendMessage, appendChunk,
    setAgentStatus, setActiveTyping, removeActiveTyping, callAgent,
  ])

  // ── Send message ────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text && pendingFiles.length === 0) return
    if (streamingMsgId) return

    if (settings.provider === 'gemini' && !settings.geminiApiKey.trim()) {
      navigate('/settings')
      return
    }

    setMentionQuery(null)
    setErrorBanner(null)

    const imageAtts = pendingFiles.filter(f => f.type.startsWith('image/'))
    const allAtts   = pendingFiles

    const userMsg: Message = {
      id:          crypto.randomUUID(),
      role:        'user',
      content:     text,
      senderName:  'User',
      timestamp:   Date.now(),
      attachments: allAtts.length > 0 ? allAtts : undefined,
    }
    appendMessage(userMsg)
    setInputText('')
    setPendingFiles([])

    // ── Slash command interception ─────────────────────────────────────────────
    const slashMatch = /^@([\w][\w ]*?)\s+\/([\w-]+)/i.exec(text.trim())
    if (slashMatch) {
      const [, mentionedName, command] = slashMatch
      const cmdAgent = agents.find(a => a.name.toLowerCase() === mentionedName.toLowerCase().trim())
      if (cmdAgent && ['run', 'run-all', 'fix-failures'].includes(command.toLowerCase())) {
        setAgentStatus(cmdAgent.id, 'working')
        const cmdMsg: Message = {
          id:         crypto.randomUUID(),
          role:       'model',
          content:    `▶ Command \`/${command}\` acknowledged. Navigating to Playwright Dashboard to execute the test suite.`,
          senderName: cmdAgent.name,
          agentId:    cmdAgent.id,
          timestamp:  Date.now(),
        }
        appendMessage(cmdMsg)
        setTimeout(() => { setAgentStatus(cmdAgent.id, 'idle'); navigate('/playwright') }, 1500)
        return
      }
    }

    // ── Determine routing: tagged agents → them; otherwise Edi M ──────────────
    const tagged  = parseTaggedAgents(text)
    const manager = agents.find(a => a.id === TEAM_MANAGER_ID)

    // Route to tagged agents directly, OR fall back to Edi M as orchestrator
    const primaryTargets = tagged.length > 0
      ? tagged
      : (manager ? [manager] : agents.length > 0 ? [agents[0]] : [])

    if (primaryTargets.length === 0) return

    const isManagerRoute = primaryTargets.length === 1 && primaryTargets[0].id === TEAM_MANAGER_ID

    setActiveTyping(primaryTargets.map(a => a.id))
    primaryTargets.forEach(a => setAgentStatus(a.id, 'working'))

    const modelMsgId = crypto.randomUUID()
    const respondentName = primaryTargets.length === 1
      ? primaryTargets[0].name
      : primaryTargets.map(a => a.name).join(' + ')

    const modelMsg: Message = {
      id:         modelMsgId,
      role:       'model',
      content:    '',
      senderName: respondentName,
      agentId:    primaryTargets.length === 1 ? primaryTargets[0].id : undefined,
      timestamp:  Date.now(),
    }
    appendMessage(modelMsg)
    setStreamingMsgId(modelMsgId)

    const priorMessages = messages.map(m => ({ role: m.role, content: m.content }))

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Accumulate content for delegation detection after Edi M's response
    let accContent = ''

    try {
      await callAgent(
        primaryTargets,
        text,
        imageAtts,
        priorMessages,
        controller.signal,
        (id, chunk) => { appendChunk(id, chunk); accContent += chunk },
        async (id) => {
          void id
          primaryTargets.forEach(a => { setAgentStatus(a.id, 'idle'); removeActiveTyping(a.id) })
          setStreamingMsgId(null)

          // ── Post-Edi M: detect delegation targets and auto-dispatch ──────────
          if (isManagerRoute && accContent) {
            const delegated = parseTaggedAgents(accContent)
            // Filter out self-references to Edi M
            const subAgents = delegated.filter(a => a.id !== TEAM_MANAGER_ID)
            if (subAgents.length > 0) {
              // Annotate Edi M's message as a delegation notice
              updateMessage(modelMsgId, {
                type:          'delegation',
                delegationTo:  subAgents.map(a => a.name),
              })
              // Small pause so the user sees Edi M's response first
              await new Promise(r => setTimeout(r, 600))
              await dispatchDelegations(
                subAgents, text, accContent, imageAtts, controller.signal,
              )
            }
          }
        },
        (_id, err) => {
          appendChunk(modelMsgId, `\n\n[Error: ${err}]`)
          primaryTargets.forEach(a => setAgentStatus(a.id, 'error'))
          setActiveTyping([])
          setStreamingMsgId(null)
        },
        modelMsgId,
      )
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Network error'
      appendChunk(modelMsgId, `\n\n[Error: ${msg}]`)
      primaryTargets.forEach(a => setAgentStatus(a.id, 'error'))
      setActiveTyping([])
      setStreamingMsgId(null)
    }
  }, [
    inputText, pendingFiles, streamingMsgId, settings, agents, messages,
    navigate, appendMessage, appendChunk, updateMessage, parseTaggedAgents,
    setActiveTyping, setAgentStatus, removeActiveTyping,
    callAgent, dispatchDelegations,
  ])

  // ── Apply Fix from summary cards ────────────────────────────────────────────

  const handleApplyFix = useCallback((code: string) => {
    // Navigate to Playwright dashboard with code pre-loaded via localStorage
    try {
      localStorage.setItem('open_qa_pending_fix_code', code)
    } catch { /* quota */ }
    navigate('/playwright')
  }, [navigate])

  const handleStop = () => {
    abortRef.current?.abort()
    setStreamingMsgId(null)
    setActiveTyping([])
    agents.forEach(a => { if (activeTypingAgents.includes(a.id)) setAgentStatus(a.id, 'idle') })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const anyTyping   = activeTypingAgents.length > 0
  const typingNames = activeTypingAgents.map(id => agents.find(a => a.id === id)?.name ?? id).join(', ')

  return (
    <div className="flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 3.5rem)', background: 'var(--bg-body)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-4 h-10 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base leading-none shrink-0">🏢</span>
          <div className="min-w-0">
            <span className="text-sm font-bold leading-none" style={{ color: 'var(--text-main)' }}>QA Office</span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {agents.length} agents · Edi M orchestrating
            </span>
            {anyTyping && (
              <span className="ml-2 text-[10px] text-blue-400 animate-pulse truncate">
                · {typingNames} typing…
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Provider toggle */}
          <div className="flex items-center rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)', fontSize: 10 }}>
            {(['gemini', 'ollama'] as const).map(p => (
              <button key={p} onClick={() => updateSettings({ provider: p })}
                className="px-2.5 py-1 font-semibold transition-colors"
                style={{
                  background: settings.provider === p ? (p === 'gemini' ? '#1d4ed8' : '#065f46') : 'transparent',
                  color:      settings.provider === p ? '#fff' : 'var(--text-muted)',
                }}>
                {p === 'gemini' ? '✨ Gemini' : '🦙 Ollama'}
              </button>
            ))}
          </div>

          {settings.provider === 'gemini' && !settings.geminiApiKey && (
            <button onClick={() => navigate('/settings')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80"
              style={{ background: '#451a03', color: '#fbbf24', border: '1px solid #92400e' }}>
              <AlertTriangle size={10} />API Key
            </button>
          )}
          {loadError && (
            <button onClick={() => setErrorBanner(p => p ? null : loadError)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
              style={{ background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d' }}>
              <XCircle size={10} />warn
            </button>
          )}
          <button onClick={clearHistory}
            className="p-1.5 rounded-lg hover:text-red-400 transition-colors"
            style={{ color: 'var(--text-muted)' }} title="Clear conversation">
            <Eraser size={13} />
          </button>
          <button onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }} title="Settings">
            <Settings size={13} />
          </button>
        </div>
      </header>

      {/* Asset error banner */}
      {errorBanner && (
        <div className="flex-none flex items-center gap-2 px-4 py-1.5 text-[11px]"
          style={{ background: '#2d0a0a', borderBottom: '1px solid #7f1d1d', color: '#fca5a5' }}>
          <XCircle size={11} className="shrink-0" />
          <span className="flex-1">{errorBanner}</span>
          <button onClick={() => setErrorBanner(null)} style={{ color: '#f87171' }}><X size={12} /></button>
        </div>
      )}

      {/* ── 2-column body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ════════════ LEFT: Office map + Roster ════════════ */}
        <aside className="flex flex-col w-80 shrink-0 overflow-hidden"
          style={{ borderRight: '1px solid var(--border)' }}>

          {/* Canvas strip label */}
          <div className="flex-none flex items-center gap-2 px-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', height: 30 }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              Floor 1 · {agents.length} desks
            </span>
            <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)' }}>Click → tool</span>
          </div>

          {/* Canvas */}
          <div className="w-full shrink-0 relative overflow-hidden" style={{ aspectRatio: '20/11', background: '#1a1a2e' }}>
            {!assetsReady && (
              <div className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: '#1a1a2e' }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>Loading…</span>
                </div>
              </div>
            )}
            {_officeState && (
              <OfficeCanvas
                officeState={_officeState}
                onAgentClick={handleAgentClick}
                zoom={1} onZoomChange={() => {}}
                panRef={panRef} locked
              />
            )}
          </div>

          {/* Status legend */}
          <div className="flex-none flex items-center gap-3 px-3 py-1.5 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            {([
              ['bg-emerald-400', 'Idle'],
              ['bg-blue-400 animate-pulse', 'Working'],
              ['bg-amber-400', 'Waiting'],
              ['bg-red-400', 'Error'],
            ] as const).map(([cls, label]) => (
              <span key={label} className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cls}`} />{label}
              </span>
            ))}
          </div>

          {/* Roster header */}
          <div className="flex-none flex items-center justify-between px-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', height: 28 }}>
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Team</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>{agents.length}</span>
          </div>

          {/* Agent roster */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
            style={{ background: 'var(--bg-body)' }}>
            {agents.map((agent, idx) => {
              const status: AgentStatus = agentStatuses[agent.id] ?? 'idle'
              const isTyping  = activeTypingAgents.includes(agent.id)
              const deskRoute = DESK_ROUTES[agent.deskId] ?? '/'
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  idx={idx}
                  isTyping={isTyping}
                  status={status}
                  isManager={agent.id === TEAM_MANAGER_ID}
                  onMention={() => {
                    setInputText(prev => `${prev}@${agent.name} `.trimStart())
                    textareaRef.current?.focus()
                  }}
                  onNavigate={() => navigate(deskRoute)}
                />
              )
            })}
            <p className="text-[9px] text-center mt-1 pb-1" style={{ color: 'var(--text-muted)' }}>
              No @mention → Edi M routes automatically
            </p>
          </div>
        </aside>

        {/* ════════════ RIGHT: Chat ════════════ */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
          style={{ background: 'var(--bg-card)' }}>

          {/* Chat sub-header */}
          <div className="flex-none flex items-center justify-between px-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', height: 36 }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-bold" style={{ color: 'var(--text-main)' }}>QA Chat</span>
              <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                {messages.length}
              </span>
              {anyTyping && (
                <span className="flex items-center gap-1.5 text-[10px] text-blue-400 truncate">
                  <span className="flex gap-0.5 shrink-0">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1 h-1 rounded-full bg-blue-400"
                        style={{ animation: `bounce 0.8s infinite ${i*0.15}s` }} />
                    ))}
                  </span>
                  <span className="truncate">{typingNames}</span>
                </span>
              )}
            </div>
            {settings.provider === 'ollama' && settings.ollamaModel && (
              <span className="text-[9px] font-medium shrink-0" style={{ color: '#4ade80' }}>
                🦙 {settings.ollamaModel}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0"
            style={{ background: 'var(--bg-body)' }}>
            {messages.length === 0
              ? <ChatEmptyState agents={agents} />
              : messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isStreaming={streamingMsgId === msg.id}
                    agents={agents}
                    onApplyFix={handleApplyFix}
                  />
                ))
            }
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-none px-4 pb-4 pt-3 relative shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>

            {/* Pending file chips */}
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {f.type.startsWith('image/')
                      ? <img src={f.content} alt={f.name} className="w-4 h-4 rounded object-cover" />
                      : <FileText size={11} />}
                    <span className="max-w-[120px] truncate">{f.name}</span>
                    <button onClick={() => setPendingFiles(prev => prev.filter((_,j) => j !== i))}
                      className="hover:text-red-400 transition-colors ml-0.5">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* @-mention dropdown */}
            {mentionQuery !== null && mentionMatches.length > 0 && (
              <div className="absolute bottom-full left-4 mb-2 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'var(--bg-card)',
                  border:     '1px solid var(--border)',
                  boxShadow:  '0 8px 32px rgba(0,0,0,0.25)',
                  minWidth:   220,
                }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Tag an agent</span>
                </div>
                {mentionMatches.map((agent, i) => {
                  const accent = SPRITE_ACCENT[agent.characterSprite]
                  return (
                    <button key={agent.id} onClick={() => insertMention(agent.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{
                        background: i === mentionIndex ? accent.bg : 'transparent',
                        borderLeft: `2px solid ${i === mentionIndex ? accent.bar : 'transparent'}`,
                      }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ background: accent.bg, color: accent.text, border: `1px solid ${accent.ring}` }}>
                        {agent.name.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{agent.name}</span>
                          {agent.id === TEAM_MANAGER_ID && (
                            <span className="text-[7px] font-bold px-1 rounded"
                              style={{ background: 'rgba(217,119,6,0.2)', color: '#d97706' }}>MGR</span>
                          )}
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{agent.role}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2">
              <button onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl hover:opacity-70 transition-opacity shrink-0"
                style={{ color: 'var(--text-muted)' }} title="Attach file">
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept=".ts,.tsx,.js,.jsx,.json,.log,.txt,.md,.css,.html,.yaml,.yml,.py,.sh,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFileSelect} />

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask Edi M or @mention a specialist… (${settings.provider === 'ollama' ? settings.ollamaModel || 'Ollama' : settings.defaultModel})`}
                  rows={1}
                  className="w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--bg-body)',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-main)',
                    minHeight:  42,
                    maxHeight:  160,
                    lineHeight: '1.5',
                  }}
                  onInput={e => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
                  }}
                />
              </div>

              {streamingMsgId ? (
                <button onClick={handleStop}
                  className="p-2.5 rounded-xl shrink-0 hover:opacity-80 transition-opacity"
                  style={{ background: '#7f1d1d', color: '#fca5a5' }} title="Stop">
                  <Square size={16} />
                </button>
              ) : (
                <button onClick={() => void handleSend()}
                  disabled={!inputText.trim() && pendingFiles.length === 0}
                  className="p-2.5 rounded-xl shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: 'var(--primary)', color: '#fff' }} title="Send (Enter)">
                  <Send size={16} />
                </button>
              )}
            </div>

            <p className="text-[10px] mt-1.5 px-0.5" style={{ color: 'var(--text-muted)' }}>
              Enter to send · Shift+Enter for newline · <span style={{ color: '#d97706' }}>Edi M routes automatically</span> · <span style={{ color: 'var(--primary)' }}>@Name</span> to target directly
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
