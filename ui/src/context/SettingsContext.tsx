/**
 * SettingsContext — global config + chat state for QA Office.
 *
 * Persisted to localStorage under 'open_qa_settings_v1':
 *   • GlobalSettings (API key, model, provider)
 *   • AgentConfig[]
 *   • OfficeLayout
 *   • Message[] (history — capped at 200 msgs)
 *
 * Runtime-only (not persisted):
 *   • agentStatuses
 *   • activeTypingAgents
 */
import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from 'react'

// ─── Public constants ──────────────────────────────────────────────────────────

/** The permanent Team Manager agent ID — used to route untagged messages */
export const TEAM_MANAGER_ID = 'agent-manager'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error'
export type SpriteType  = 'dev' | 'tester' | 'analyst' | 'devops' | 'manager'

/** Extended message type for orchestration events */
export type MessageType = 'chat' | 'delegation' | 'qa_summary'

export interface Attachment {
  name:    string   // original filename
  type:    string   // MIME type
  content: string   // Base64 (images) or raw text
}

/** A single test failure extracted from Playwright results for the summary card */
export interface QAFailure {
  testTitle:  string
  suiteName:  string
  error:      string
  errorType:  'Timeout' | 'Assertion' | 'Locator' | 'Network' | 'Error'
  suggestion: string
  fixCode?:   string
}

/** Structured post-run summary attached to a qa_summary Message */
export interface QASummaryData {
  total:    number
  passed:   number
  failed:   number
  duration: number
  failures: QAFailure[]
}

/** One step in a multi-agent delegation chain */
export interface DelegationStep {
  agentId:   string
  agentName: string
  status:    'pending' | 'active' | 'done' | 'error'
  msgId?:    string   // message ID produced by this agent
}

export interface Message {
  id:              string
  role:            'user' | 'model'
  content:         string
  senderName:      string
  agentId?:        string
  timestamp:       number
  attachments?:    Attachment[]
  /** Optional: marks orchestration-specific messages */
  type?:           MessageType
  /** For type:'delegation' — the agents Edi M is delegating to */
  delegationTo?:   string[]
  /** For type:'qa_summary' — structured failure data from Playwright */
  summaryData?:    QASummaryData
}

export interface AgentConfig {
  id:              string
  name:            string
  role:            string
  systemPrompt:    string
  characterSprite: SpriteType
  deskId:          string
  /** Marks the team manager — cannot be deleted from roster */
  isManager?:      boolean
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
  geminiApiKey:  string
  defaultModel:  string
  provider:      'gemini' | 'ollama'
  ollamaBaseUrl: string
  ollamaModel:   string
}

// ─── Context value ────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings:           GlobalSettings
  agents:             AgentConfig[]
  layout:             OfficeLayout
  agentStatuses:      Record<string, AgentStatus>
  activeTypingAgents: string[]
  messages:           Message[]
  // Config
  updateSettings:   (patch: Partial<GlobalSettings>) => void
  setAgents:        (agents: AgentConfig[]) => void
  updateAgent:      (id: string, patch: Partial<AgentConfig>) => void
  addAgent:         (agent: AgentConfig) => void
  removeAgent:      (id: string) => void
  setAgentStatus:   (id: string, status: AgentStatus) => void
  updateLayout:     (patch: Partial<OfficeLayout>) => void
  // Chat
  appendMessage:       (msg: Message) => void
  appendChunk:         (msgId: string, chunk: string) => void
  updateMessage:       (msgId: string, patch: Partial<Omit<Message, 'id'>>) => void
  clearHistory:        () => void
  setActiveTyping:     (agentIds: string[]) => void
  removeActiveTyping:  (agentId: string) => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_LAYOUT: OfficeLayout = {
  rows:  8,
  cols:  12,
  desks: [
    { id: 'desk-1', x: 1,  y: 1, label: 'E2E Station'   },
    { id: 'desk-2', x: 4,  y: 1, label: 'Architecture'  },
    { id: 'desk-3', x: 7,  y: 1, label: 'Triage Hub'    },
    { id: 'desk-4', x: 2,  y: 5, label: 'A11y Lab'      },
    { id: 'desk-5', x: 6,  y: 5, label: 'CI Pipeline'   },
    { id: 'desk-6', x: 10, y: 3, label: 'Healer Lab'    },
    { id: 'desk-7', x: 5,  y: 3, label: 'Manager Hub'   },  // Edi M
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
      '(1) Ask for the failing test line, error message, and DOM snapshot. ' +
      '(2) Strip noise (scripts, styles, SVGs); focus on role, aria-label, data-testid. ' +
      '(3) Rank 3+ candidate locators by resilience: ' +
      'getByTestId > getByRole+name > getByLabel > getByPlaceholder > getByText > CSS/XPath. ' +
      '(4) Output a Markdown table with rank, TypeScript code, confidence, and caveats. ' +
      '(5) Flag risks: strict-mode violations, Shadow DOM, dynamic text. ' +
      '(6) Recommend adding data-testid attributes to prevent future breakage.',
  },
  {
    id:              TEAM_MANAGER_ID,
    name:            'Edi M',
    role:            'Team Manager',
    characterSprite: 'manager',
    deskId:          'desk-7',
    isManager:       true,
    systemPrompt:
      'You are Edi M, Team Manager and QA Orchestrator. ' +
      'You lead a specialist QA team with these members:\n' +
      '• @E2E Tester — Playwright test scripts, end-to-end flows\n' +
      '• @POM Architect — Page Object Model class generation\n' +
      '• @Bug Triager — failure analysis, structured bug reports\n' +
      '• @A11y Expert — WCAG 2.1 AA accessibility audits\n' +
      '• @CI Engineer — GitHub Actions pipelines, Docker, sharding\n' +
      '• @Locator Healer — self-healing broken selectors\n\n' +
      'When you receive a task:\n' +
      '1. Analyse the intent and decide which specialist(s) to involve.\n' +
      '2. State your delegation plan clearly, using @Name to tag them exactly.\n' +
      '3. Provide a brief rationale for each delegation choice.\n' +
      '4. Keep your own response concise — your job is routing, not doing.\n\n' +
      'If the user greets you or asks a general question, answer directly without delegating. ' +
      'If execution commands appear (like /run-all), acknowledge them and confirm the action. ' +
      'Always maintain a professional, decisive tone.',
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
const MAX_MSG_STORED = 200

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

    // Merge: keep stored agents/desks, append newly added defaults
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
    const safeMessages = state.messages.slice(-MAX_MSG_STORED).map(m => ({
      ...m,
      attachments: m.attachments?.filter(a => !a.type.startsWith('image/')),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, messages: safeMessages }))
  } catch {
    // quota exceeded — ignore
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
    // Prevent deleting the team manager
    if (id === TEAM_MANAGER_ID) return
    setAgentsState(prev => prev.filter(a => a.id !== id))
  }, [])

  const setAgentStatus = useCallback((id: string, status: AgentStatus) => {
    setAgentStatuses(prev => ({ ...prev, [id]: status }))
  }, [])

  const updateLayout = useCallback((patch: Partial<OfficeLayout>) => {
    setLayout(prev => ({ ...prev, ...patch }))
  }, [])

  // ── Chat setters ────────────────────────────────────────────────────────────

  const appendMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const appendChunk = useCallback((msgId: string, chunk: string) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, content: m.content + chunk } : m),
    )
  }, [])

  /** Patch any field (except id) on an existing message */
  const updateMessage = useCallback((msgId: string, patch: Partial<Omit<Message, 'id'>>) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, ...patch } : m),
    )
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  const setActiveTyping = useCallback((agentIds: string[]) => {
    setActiveTypingAgentsState(agentIds)
  }, [])

  const removeActiveTyping = useCallback((agentId: string) => {
    setActiveTypingAgentsState(prev => prev.filter(id => id !== agentId))
  }, [])

  return (
    <SettingsContext.Provider value={{
      settings, agents, layout,
      agentStatuses, activeTypingAgents, messages,
      updateSettings, setAgents, updateAgent, addAgent, removeAgent,
      setAgentStatus, updateLayout,
      appendMessage, appendChunk, updateMessage, clearHistory,
      setActiveTyping, removeActiveTyping,
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
