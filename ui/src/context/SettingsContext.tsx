/**
 * SettingsContext — global config + chat state for QA Office.
 *
 * Persisted to localStorage under 'open_qa_settings_v1':
 *   • GlobalSettings (API key, model)
 *   • AgentConfig[]
 *   • OfficeLayout
 *   • Message[] (conversation history — capped at 200 msgs)
 *
 * Runtime-only (not persisted):
 *   • agentStatuses
 *   • activeTypingAgents
 */
import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error'
export type SpriteType  = 'dev' | 'tester' | 'analyst' | 'devops' | 'manager'

export interface Attachment {
  name:    string   // original filename
  type:    string   // MIME type (e.g. "image/png", "text/plain")
  content: string   // Base64 (images) or raw text
}

export interface Message {
  id:           string
  role:         'user' | 'model'
  content:      string
  senderName:   string          // "User" | agent.name
  agentId?:     string          // undefined for user messages
  timestamp:    number
  attachments?: Attachment[]
}

export interface AgentConfig {
  id:              string
  name:            string
  role:            string
  systemPrompt:    string
  characterSprite: SpriteType
  deskId:          string
}

export interface DeskConfig {
  id:    string
  x:     number
  y:     number
  label: string
}

export interface OfficeLayout {
  rows:  number
  cols:  number
  desks: DeskConfig[]
}

export interface GlobalSettings {
  geminiApiKey:   string
  defaultModel:   string
  /** Which AI backend to use in the Office chat */
  provider:       'gemini' | 'ollama'
  /** Base URL for the local Ollama server (default http://localhost:11434) */
  ollamaBaseUrl:  string
  /** Model name to use with Ollama (e.g. llama3.2, mistral, codellama) */
  ollamaModel:    string
}

// ─── Context value interface ──────────────────────────────────────────────────

interface SettingsContextValue {
  // Config
  settings:       GlobalSettings
  agents:         AgentConfig[]
  layout:         OfficeLayout
  // Runtime statuses
  agentStatuses:      Record<string, AgentStatus>
  activeTypingAgents: string[]   // agent IDs currently streaming a response
  // Conversation
  messages:           Message[]
  // Setters
  updateSettings: (patch: Partial<GlobalSettings>) => void
  setAgents:      (agents: AgentConfig[]) => void
  updateAgent:    (id: string, patch: Partial<AgentConfig>) => void
  addAgent:       (agent: AgentConfig) => void
  removeAgent:    (id: string) => void
  setAgentStatus: (id: string, status: AgentStatus) => void
  updateLayout:   (patch: Partial<OfficeLayout>) => void
  // Chat
  appendMessage:        (msg: Message) => void
  appendChunk:          (msgId: string, chunk: string) => void
  clearHistory:         () => void
  setActiveTyping:      (agentIds: string[]) => void
  removeActiveTyping:   (agentId: string) => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_LAYOUT: OfficeLayout = {
  rows:  8,
  cols:  12,
  desks: [
    { id: 'desk-1', x: 1,  y: 1, label: 'E2E Station'  },
    { id: 'desk-2', x: 4,  y: 1, label: 'Architecture' },
    { id: 'desk-3', x: 7,  y: 1, label: 'Triage Hub'   },
    { id: 'desk-4', x: 2,  y: 5, label: 'A11y Lab'     },
    { id: 'desk-5', x: 6,  y: 5, label: 'CI Pipeline'  },
    { id: 'desk-6', x: 10, y: 3, label: 'Healer Lab'   },
  ],
}

export const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id:              'agent-e2e',
    name:            'E2E Tester',
    role:            'E2E Automation',
    characterSprite: 'tester',
    deskId:          'desk-1',
    systemPrompt:
      'You are an expert Playwright E2E test automation engineer. ' +
      'Always write tests in TypeScript using Playwright best practices. ' +
      'Use Page Object Models, getByRole/getByLabel locators, and clear assertions. ' +
      'Wrap every test in a describe block and add JSDoc comments.',
  },
  {
    id:              'agent-pom',
    name:            'POM Architect',
    role:            'Architecture',
    characterSprite: 'dev',
    deskId:          'desk-2',
    systemPrompt:
      'You are a Playwright Page Object Model architect. ' +
      'Given an HTML DOM snapshot, generate a clean TypeScript POM class with ' +
      'typed locators (using getByRole, getByLabel, getByTestId), async action methods, ' +
      'and JSDoc comments. Export the class and a factory function.',
  },
  {
    id:              'agent-triage',
    name:            'Bug Triager',
    role:            'QA Analysis',
    characterSprite: 'analyst',
    deskId:          'desk-3',
    systemPrompt:
      'You are an elite QA engineer specialising in bug triage. ' +
      'Analyse error logs and produce structured Markdown bug reports: ' +
      'Title, Severity (P0-P3), Summary, Root Cause, Steps to Reproduce, ' +
      'Expected vs Actual, Environment. Be concise and actionable.',
  },
  {
    id:              'agent-a11y',
    name:            'A11y Expert',
    role:            'Accessibility',
    characterSprite: 'manager',
    deskId:          'desk-4',
    systemPrompt:
      'You are a WCAG 2.1 AA accessibility expert. ' +
      'Analyse page DOM and screenshots for accessibility violations. ' +
      'Produce a prioritised report with violation descriptions, affected elements, ' +
      'and specific code-level fixes. Group findings by WCAG criterion.',
  },
  {
    id:              'agent-devops',
    name:            'CI Engineer',
    role:            'DevOps / CI',
    characterSprite: 'devops',
    deskId:          'desk-5',
    systemPrompt:
      'You are a CI/CD engineer specialising in Playwright test infrastructure. ' +
      'Help configure GitHub Actions pipelines with sharding, Docker environments, ' +
      'parallelism strategies, and artefact upload. Output complete YAML configs.',
  },
  {
    id:              'agent-healer',
    name:            'Locator Healer',
    role:            'Self-Healing',
    characterSprite: 'tester',
    deskId:          'desk-6',
    systemPrompt:
      'You are a Playwright self-healing locator specialist. ' +
      'When a test locator breaks due to UI changes: ' +
      '(1) Ask for the failing test line, error message, and DOM snapshot (page.content() or accessibility tree). ' +
      '(2) Strip noise (scripts, styles, SVGs); focus on role, aria-label, data-testid, name, type, placeholder. ' +
      '(3) Rank 3+ candidate locators by resilience: ' +
      'getByTestId > getByRole+name > getByLabel > getByPlaceholder > getByText > CSS/XPath. ' +
      '(4) Output a Markdown table with rank, ready-to-paste TypeScript code, confidence, and caveats. ' +
      '(5) Flag risks: strict-mode violations, Shadow DOM, dynamic text, custom testIdAttribute. ' +
      '(6) Recommend adding data-testid attributes to prevent future breakage.',
  },
]

const DEFAULT_SETTINGS: GlobalSettings = {
  geminiApiKey:  '',
  defaultModel:  'gemini-2.0-flash',
  provider:      'gemini',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel:   'llama3.2',
}

const STORAGE_KEY    = 'open_qa_settings_v1'
const MAX_MSG_STORED = 200   // cap history size in localStorage

// ─── Persistence ──────────────────────────────────────────────────────────────

interface PersistedState {
  settings: GlobalSettings
  agents:   AgentConfig[]
  layout:   OfficeLayout
  messages: Message[]
}

function loadFromStorage(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { settings: DEFAULT_SETTINGS, agents: DEFAULT_AGENTS, layout: DEFAULT_LAYOUT, messages: [] }
    const parsed = JSON.parse(raw) as Partial<PersistedState>

    // Merge: keep stored agents/desks, append any new defaults not yet present.
    // This ensures existing users automatically receive newly added agents/desks
    // on next page load without losing their own customisations.
    const storedAgents = parsed.agents?.length ? parsed.agents : null
    const mergedAgents = storedAgents
      ? [
          ...storedAgents,
          ...DEFAULT_AGENTS.filter(da => !storedAgents.find(a => a.id === da.id)),
        ]
      : DEFAULT_AGENTS

    const storedLayout = parsed.layout?.desks ? parsed.layout : null
    const mergedLayout: OfficeLayout = storedLayout
      ? {
          ...storedLayout,
          desks: [
            ...storedLayout.desks,
            ...DEFAULT_LAYOUT.desks.filter(dd => !storedLayout.desks.find(d => d.id === dd.id)),
          ],
        }
      : DEFAULT_LAYOUT

    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      agents:   mergedAgents,
      layout:   mergedLayout,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    }
  } catch {
    return { settings: DEFAULT_SETTINGS, agents: DEFAULT_AGENTS, layout: DEFAULT_LAYOUT, messages: [] }
  }
}

function saveToStorage(state: PersistedState) {
  try {
    // Trim attachments from stored messages to avoid quota issues
    const safeMessages = state.messages.slice(-MAX_MSG_STORED).map(m => ({
      ...m,
      // Keep text attachments; drop large image Base64 blobs
      attachments: m.attachments?.filter(a => !a.type.startsWith('image/')),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, messages: safeMessages }))
  } catch {
    // quota exceeded — silently ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const stored = loadFromStorage()

  const [settings,      setSettings]      = useState<GlobalSettings>(stored.settings)
  const [agents,        setAgentsState]   = useState<AgentConfig[]>(stored.agents)
  const [layout,        setLayout]        = useState<OfficeLayout>(stored.layout)
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({})
  const [messages,      setMessages]      = useState<Message[]>(stored.messages)
  const [activeTypingAgents, setActiveTypingAgentsState] = useState<string[]>([])

  // Persist whenever persisted state changes
  useEffect(() => {
    saveToStorage({ settings, agents, layout, messages })
  }, [settings, agents, layout, messages])

  // ── Config setters ──────────────────────────────────────────────────────────

  const updateSettings = useCallback((patch: Partial<GlobalSettings>) => {
    setSettings(s => ({ ...s, ...patch }))
  }, [])

  const setAgents = useCallback((newAgents: AgentConfig[]) => {
    setAgentsState(newAgents)
  }, [])

  const updateAgent = useCallback((id: string, patch: Partial<AgentConfig>) => {
    setAgentsState(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  }, [])

  const addAgent = useCallback((agent: AgentConfig) => {
    setAgentsState(prev => [...prev, agent])
  }, [])

  const removeAgent = useCallback((id: string) => {
    setAgentsState(prev => prev.filter(a => a.id !== id))
  }, [])

  const setAgentStatus = useCallback((id: string, status: AgentStatus) => {
    setAgentStatuses(prev => ({ ...prev, [id]: status }))
  }, [])

  const updateLayout = useCallback((patch: Partial<OfficeLayout>) => {
    setLayout(prev => ({ ...prev, ...patch }))
  }, [])

  // ── Chat setters ────────────────────────────────────────────────────────────

  /** Add a complete message (user or empty model placeholder) */
  const appendMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg])
  }, [])

  /** Append a streaming text chunk to an existing message by id */
  const appendChunk = useCallback((msgId: string, chunk: string) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, content: m.content + chunk } : m),
    )
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  /** Mark a set of agents as currently typing (replaces the whole list) */
  const setActiveTyping = useCallback((agentIds: string[]) => {
    setActiveTypingAgentsState(agentIds)
  }, [])

  /** Remove one agent from the active-typing list when their stream ends */
  const removeActiveTyping = useCallback((agentId: string) => {
    setActiveTypingAgentsState(prev => prev.filter(id => id !== agentId))
  }, [])

  return (
    <SettingsContext.Provider value={{
      settings, agents, layout,
      agentStatuses, activeTypingAgents, messages,
      updateSettings, setAgents, updateAgent, addAgent, removeAgent,
      setAgentStatus, updateLayout,
      appendMessage, appendChunk, clearHistory, setActiveTyping, removeActiveTyping,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
