/**
 * OfficePage — QA Office hub (redesigned).
 *
 * Layout: full-viewport-height, 3-column app shell
 *   ┌──────────────┬──────────────────────┬───────────────┐
 *   │  Office Map  │     Chat (flex-1)     │  Agent Roster │
 *   │  Fixed view  │  full-height scroll   │   w-52 xl+    │
 *   │  lg+ only    │                       │               │
 *   └──────────────┴──────────────────────┴───────────────┘
 *
 * Features
 * ─────────
 * • Real pixel-agents OfficeCanvas — locked (no pan/zoom), fills left column
 * • Multi-turn Gemini chat with full history, SSE streaming, @-mention autocomplete
 * • File attachments — text inlined, images sent as Base64 vision
 * • Lightweight Markdown renderer with copy-able code blocks
 * • Sprite-type accent colours per agent card (tester/dev/analyst/devops/manager)
 * • CSS-variable theming — works in both light and dark mode
 */
import {
  useCallback, useEffect, useRef, useState,
  type ChangeEvent, type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Bot, ChevronDown,
  Eraser, ExternalLink, FileText, Paperclip,
  Send, Settings, Square, X, XCircle,
} from 'lucide-react'

import { OfficeCanvas }  from '../office/components/OfficeCanvas'
import { OfficeState }   from '../office/engine/officeState'
import { loadDefaultLayout, loadOfficeAssets } from '../office/assetLoader'
import { useSettings }   from '../context/SettingsContext'
import type { AgentConfig, AgentStatus, Attachment, Message } from '../context/SettingsContext'
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
}

const API_BASE = 'http://localhost:3001'

const TEXT_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'json', 'log', 'txt', 'md',
  'css', 'html', 'xml', 'yaml', 'yml', 'sh', 'py', 'java', 'cs',
])

/** Per-sprite-type accent palette — used for agent avatars and card accents */
const SPRITE_ACCENT: Record<SpriteType, { bg: string; ring: string; text: string; bar: string }> = {
  tester:  { bg: '#0d2a1a', ring: '#166534', text: '#4ade80', bar: '#22c55e' },
  dev:     { bg: '#0f1f3d', ring: '#1d4ed8', text: '#60a5fa', bar: '#3b82f6' },
  analyst: { bg: '#1e0a40', ring: '#7c3aed', text: '#c084fc', bar: '#a855f7' },
  devops:  { bg: '#2a0e02', ring: '#c2410c', text: '#fb923c', bar: '#f97316' },
  manager: { bg: '#2a1200', ring: '#d97706', text: '#fbbf24', bar: '#f59e0b' },
}

// ─── OfficeState singleton ────────────────────────────────────────────────────

let _officeState: OfficeState | null = null
function agentNumId(idx: number) { return idx + 1 }

// ─── Lightweight Markdown renderer ───────────────────────────────────────────

function MarkdownContent({ text }: { text: string }) {
  const [copied, setCopied] = useState<number | null>(null)

  const copyCode = useCallback((code: string, idx: number) => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(idx)
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g)

  return (
    <div className="text-[13px] leading-relaxed">
      {parts.map((part, i) => {
        const fenceMatch = /^```([\w]*)\n([\s\S]*?)```$/.exec(part)
        if (fenceMatch) {
          const lang = fenceMatch[1] || 'text'
          const code = fenceMatch[2].trimEnd()
          return (
            <div key={i} className="relative my-2 rounded-lg overflow-hidden"
              style={{ background: '#0d1117', border: '1px solid #30363d' }}>
              <div className="flex items-center justify-between px-3 py-1.5"
                style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
                <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: '#8b949e' }}>{lang}</span>
                <button onClick={() => copyCode(code, i)}
                  className="text-[10px] px-2 py-0.5 rounded transition-colors"
                  style={{
                    color:      copied === i ? '#3fb950' : '#8b949e',
                    background: copied === i ? 'rgba(63,185,80,0.1)' : 'transparent',
                  }}>
                  {copied === i ? '✓ Copied' : 'Copy'}
                </button>
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
                      return (
                        <code key={si} className="px-1 py-0.5 rounded text-[12px] font-mono"
                          style={{ background: 'rgba(110,118,129,0.2)', color: '#f0883e' }}>
                          {seg.slice(1, -1)}
                        </code>
                      )
                    if (/^\*\*[^*]+\*\*$/.test(seg))
                      return <strong key={si} style={{ color: '#e6edf3' }}>{seg.slice(2, -2)}</strong>
                    if (/^\*[^*]+\*$/.test(seg))
                      return <em key={si}>{seg.slice(1, -1)}</em>
                    if (/^#{1,3} /.test(seg)) {
                      const level = (seg.match(/^(#+)/)?.[1].length ?? 1) as 1 | 2 | 3
                      const headingText = seg.replace(/^#+\s/, '')
                      const sizes: Record<1 | 2 | 3, string> = { 1: 'text-sm font-bold mt-3', 2: 'text-xs font-bold mt-2', 3: 'text-xs font-semibold mt-1' }
                      return <span key={si} className={`block ${sizes[level]}`} style={{ color: '#e6edf3' }}>{headingText}</span>
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

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isStreaming, agents }: {
  msg:         Message
  isStreaming: boolean
  agents:      AgentConfig[]
}) {
  const isUser  = msg.role === 'user'
  const agent   = msg.agentId ? agents.find(a => a.id === msg.agentId) : null
  const accent  = agent ? SPRITE_ACCENT[agent.characterSprite] : null

  const avatarBg   = isUser  ? '#1e3a5f'         : (accent?.bg   ?? '#0f2a1a')
  const avatarRing = isUser  ? '#1d4ed8'         : (accent?.ring ?? '#166534')
  const avatarText = isUser  ? '#93c5fd'         : (accent?.text ?? '#4ade80')
  const initials   = isUser  ? 'U'               : (msg.senderName?.slice(0, 2).toUpperCase() ?? 'AI')

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mb-0.5"
        style={{ background: avatarBg, color: avatarText, border: `1.5px solid ${avatarRing}`, boxShadow: `0 0 0 2px ${avatarRing}20` }}
      >
        {initials}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-0.5 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-medium px-1" style={{ color: 'var(--text-muted)' }}>
          {msg.senderName}
          <span className="ml-1.5 font-normal opacity-60">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </span>

        <div
          className="rounded-2xl px-3.5 py-2.5"
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #1e3a5f 0%, #1a3050 100%)'
              : 'var(--bg-card)',
            border:    `1px solid ${isUser ? '#1e4080' : 'var(--border)'}`,
            color:     'var(--text-main)',
            wordBreak: 'break-word',
          }}
        >
          {/* Text attachment chips */}
          {msg.attachments && msg.attachments.filter(a => !a.type.startsWith('image/')).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {msg.attachments.filter(a => !a.type.startsWith('image/')).map((att, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  <FileText size={9} />
                  {att.name}
                </span>
              ))}
            </div>
          )}

          {/* Image attachments */}
          {msg.attachments?.filter(a => a.type.startsWith('image/')).map((att, i) => (
            <img key={i} src={att.content} alt={att.name}
              className="max-w-xs rounded-lg mb-2 block"
              style={{ border: '1px solid var(--border)', maxHeight: 200, objectFit: 'cover' }} />
          ))}

          {isUser
            ? <span className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</span>
            : <MarkdownContent text={msg.content} />
          }

          {isStreaming && (
            <span className="inline-block w-2 h-[14px] ml-0.5 animate-pulse rounded-sm align-middle"
              style={{ background: accent?.bar ?? '#4ade80', verticalAlign: 'middle' }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Chat empty state ─────────────────────────────────────────────────────────

function ChatEmptyState({ agents }: { agents: AgentConfig[] }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-10 select-none">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
        💬
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Start a conversation</p>
        <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Type <code className="px-1 py-0.5 rounded font-mono text-[11px]"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-main)' }}>@AgentName</code> to target a specific agent, or just type to reach all agents.
        </p>
      </div>
      {agents.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
          {agents.map(a => {
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
  return (
    <span className="text-[10px] font-semibold" style={{ color }}>
      {label}
    </span>
  )
}

// ─── Agent card (roster) ──────────────────────────────────────────────────────

function AgentCard({
  agent, idx, isTyping, status, onMention, onNavigate,
}: {
  agent:      AgentConfig
  idx:        number
  isTyping:   boolean
  status:     AgentStatus
  onMention:  () => void
  onNavigate: () => void
}) {
  const accent    = SPRITE_ACCENT[agent.characterSprite]
  const effective = isTyping ? 'working' : status

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow"
      style={{
        background:  'var(--bg-body)',
        border:      `1px solid var(--border)`,
        borderLeft:  `3px solid ${accent.bar}`,
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: accent.bg, color: accent.text, border: `1.5px solid ${accent.ring}` }}
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>
              {agent.name}
            </span>
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

      {/* Role chip */}
      <div className="px-3 pb-2 flex items-center gap-1">
        <Bot size={10} style={{ color: 'var(--text-muted)' }} />
        <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{agent.role}</span>
      </div>

      {/* Actions */}
      <div className="flex border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onMention}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors hover:opacity-80"
          style={{ color: accent.text, background: accent.bg }}>
          @ Mention
        </button>
        <button
          onClick={onNavigate}
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
    setAgentStatus, appendMessage, appendChunk, clearHistory,
    setActiveTyping, removeActiveTyping, updateSettings,
  } = useSettings()

  // ── Canvas (locked — no pan, no zoom controls) ──────────────────────────────
  const panRef = useRef({ x: 0, y: 0 })   // stays at 0,0 (centered map view)
  const [assetsReady, setAssetsReady] = useState(false)
  const [loadError,  setLoadError]    = useState<string | null>(null)

  useEffect(() => {
    if (!_officeState) _officeState = new OfficeState()
    const os = _officeState
    Promise.all([loadOfficeAssets(), loadDefaultLayout()])
      .then(([, rawLayout]) => {
        if (rawLayout) os.rebuildFromLayout(rawLayout as OfficeLayout)
        const savedSeats = (() => {
          try {
            const raw = localStorage.getItem('open_qa_agent_seats')
            return raw ? JSON.parse(raw) as Record<number, { palette: number; hueShift: number; seatId: string | null }> : {}
          } catch { return {} as Record<number, { palette: number; hueShift: number; seatId: string | null }> }
        })()
        agents.forEach((agent, idx) => {
          const numId = agentNumId(idx)
          if (!os.characters.has(numId)) {
            const saved = savedSeats[numId]
            os.addAgent(numId, saved?.palette, saved?.hueShift, saved?.seatId ?? undefined, true)
          }
          os.setAgentActive(numId, agentStatuses[agent.id] === 'working' || activeTypingAgents.includes(agent.id))
        })
        setAssetsReady(true)
      })
      .catch(err => { setLoadError(String(err)); setAssetsReady(true) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!_officeState) return
    agents.forEach((agent, idx) => {
      const isActive =
        agentStatuses[agent.id] === 'working' ||
        activeTypingAgents.includes(agent.id)
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
    const before = text.slice(0, atIdx)
    const after  = text.slice(pos)
    const next   = `${before}@${agentName} ${after}`
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
    const cursor      = e.target.selectionStart
    const textToCursor = val.slice(0, cursor)
    const atMatch     = /@([\w ]*)$/.exec(textToCursor)
    if (atMatch) {
      setMentionQuery(atMatch[1])
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % mentionMatches.length); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => (i - 1 + mentionMatches.length) % mentionMatches.length); return }
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
      const ext     = file.name.split('.').pop()?.toLowerCase() ?? ''
      const isImage = file.type.startsWith('image/')
      if (isImage) {
        const reader = new FileReader()
        reader.onload = () => {
          setPendingFiles(prev => [...prev, { name: file.name, type: file.type, content: reader.result as string }])
        }
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
      .filter((a): a is typeof agents[number] => a !== undefined)
    return [...new Map(matched.map(a => [a.id, a])).values()]
  }, [agents])

  // ── Send message ────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text && pendingFiles.length === 0) return

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

    const tagged  = parseTaggedAgents(text)
    const targets = tagged.length > 0 ? tagged : (agents.length > 0 ? [agents[0]] : [])
    if (targets.length === 0) return

    setActiveTyping(targets.map(a => a.id))
    targets.forEach(a => setAgentStatus(a.id, 'working'))

    const modelMsgId     = crypto.randomUUID()
    const respondentName = targets.length === 1
      ? targets[0].name
      : targets.map(a => a.name).join(' + ')

    const modelMsg: Message = {
      id:         modelMsgId,
      role:       'model',
      content:    '',
      senderName: respondentName,
      agentId:    targets.length === 1 ? targets[0].id : undefined,
      timestamp:  Date.now(),
    }
    appendMessage(modelMsg)
    setStreamingMsgId(modelMsgId)

    const priorMessages = messages.map(m => ({ role: m.role, content: m.content }))

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const isOllama = settings.provider === 'ollama'
      const body = {
        message:          text,
        history:          priorMessages,
        agentIds:         targets.map(a => a.id),
        agents:           agents.map(a => ({ id: a.id, name: a.name, systemPrompt: a.systemPrompt })),
        imageAttachments: isOllama ? [] : imageAtts.map(att => ({ name: att.name, type: att.type, content: att.content })),
        model:            isOllama ? settings.ollamaModel : settings.defaultModel,
        provider:         settings.provider,
        ollamaBaseUrl:    settings.ollamaBaseUrl,
      }

      const resp = await fetch(`${API_BASE}/api/qa-agent`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${settings.geminiApiKey}`,  // empty string for Ollama — server ignores it
        },
        body:   JSON.stringify(body),
        signal: controller.signal,
      })

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` })) as { error?: string }
        appendChunk(modelMsgId, `\n\n[Error: ${errData.error ?? 'Unknown error'}]`)
        targets.forEach(a => setAgentStatus(a.id, 'error'))
        setActiveTyping([])
        setStreamingMsgId(null)
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
            if (payload.error) {
              appendChunk(modelMsgId, `\n\n[Error: ${payload.error}]`)
              targets.forEach(a => setAgentStatus(a.id, 'error'))
              setActiveTyping([])
              setStreamingMsgId(null)
              return
            }
            if (payload.chunk)  appendChunk(modelMsgId, payload.chunk)
            if (payload.done) {
              targets.forEach(a => { setAgentStatus(a.id, 'idle'); removeActiveTyping(a.id) })
              setStreamingMsgId(null)
              return
            }
          } catch { /* malformed line */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Network error'
      appendChunk(modelMsgId, `\n\n[Error: ${msg}]`)
      targets.forEach(a => setAgentStatus(a.id, 'error'))
      setActiveTyping([])
      setStreamingMsgId(null)
    }
  }, [
    inputText, pendingFiles, settings, agents, messages,
    navigate, appendMessage, appendChunk, parseTaggedAgents,
    setActiveTyping, setAgentStatus, removeActiveTyping,
  ])

  const handleStop = () => {
    abortRef.current?.abort()
    setStreamingMsgId(null)
    setActiveTyping([])
    agents.forEach(a => {
      if (activeTypingAgents.includes(a.id)) setAgentStatus(a.id, 'idle')
    })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const anyTyping   = activeTypingAgents.length > 0
  const typingNames = activeTypingAgents
    .map(id => agents.find(a => a.id === id)?.name ?? id)
    .join(', ')

  return (
    <div className="flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 3.5rem)', background: 'var(--bg-body)' }}>

      {/* ── Compact header ────────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-4 h-10 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        {/* Left: title + status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base leading-none shrink-0">🏢</span>
          <div className="min-w-0">
            <span className="text-sm font-bold leading-none" style={{ color: 'var(--text-main)' }}>QA Office</span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {agents.length} agents
            </span>
            {anyTyping && (
              <span className="ml-2 text-[10px] text-blue-400 animate-pulse truncate">
                · {typingNames} typing…
              </span>
            )}
          </div>
        </div>

        {/* Right: provider toggle + actions */}
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
                }}
                title={p === 'gemini' ? 'Google Gemini' : 'Local Ollama'}>
                {p === 'gemini' ? '✨ Gemini' : '🦙 Ollama'}
              </button>
            ))}
          </div>
          {/* Missing key warnings */}
          {settings.provider === 'gemini' && !settings.geminiApiKey && (
            <button onClick={() => navigate('/settings')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: '#451a03', color: '#fbbf24', border: '1px solid #92400e' }}>
              <AlertTriangle size={10} />API Key
            </button>
          )}
          {settings.provider === 'ollama' && !settings.ollamaModel.trim() && (
            <span className="text-[9px] font-medium" style={{ color: '#fbbf24' }}>Set model in Settings</span>
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

      {/* ── 2-column body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ════════════════ LEFT: Office map + Agent roster ════════════════ */}
        <aside className="flex flex-col w-72 shrink-0 overflow-hidden"
          style={{ borderRight: '1px solid var(--border)' }}>

          {/* Canvas label strip */}
          <div className="flex-none flex items-center gap-2 px-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', height: 30 }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              Floor 1 · {agents.length} desks
            </span>
            <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)' }}>
              Click agent → chat
            </span>
          </div>

          {/* Canvas — fixed height so full 12×8 grid is always visible */}
          <div className="shrink-0 relative overflow-hidden" style={{ height: 190, background: '#1a1a2e' }}>
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
                zoom={1}
                onZoomChange={() => {}}
                panRef={panRef}
                locked
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

          {/* Agent roster — fills remaining height, scrollable */}
          <div className="flex-none flex items-center justify-between px-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', height: 28 }}>
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Agents</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>{agents.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
            style={{ background: 'var(--bg-body)' }}>
            {agents.map((agent, idx) => {
              const status: AgentStatus = agentStatuses[agent.id] ?? 'idle'
              const isTyping            = activeTypingAgents.includes(agent.id)
              const deskRoute           = DESK_ROUTES[agent.deskId] ?? '/'
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  idx={idx}
                  isTyping={isTyping}
                  status={status}
                  onMention={() => {
                    setInputText(prev => `${prev}@${agent.name} `.trimStart())
                    textareaRef.current?.focus()
                  }}
                  onNavigate={() => navigate(deskRoute)}
                />
              )
            })}
            <p className="text-[9px] text-center mt-1 pb-1" style={{ color: 'var(--text-muted)' }}>
              @ to mention · multi-agent: <em>@A @B</em>
            </p>
          </div>
        </aside>

        {/* ════════════════ RIGHT: Chat ════════════════ */}
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
                        style={{ animation: 'bounce 0.8s infinite', animationDelay: `${i*0.15}s` }} />
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
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Tag an agent
                  </span>
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
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{agent.name}</span>
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
                  placeholder={`Message your team… @ to tag · ${settings.provider === 'ollama' ? settings.ollamaModel || 'Ollama' : settings.defaultModel}`}
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
              Enter to send · Shift+Enter for newline · <span style={{ color: 'var(--primary)' }}>@Name</span> to target an agent
            </p>
          </div>
        </section>

      </div>{/* end 2-column */}
    </div>
  )
}

