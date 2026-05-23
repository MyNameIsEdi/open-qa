/**
 * SettingsPage — full config UI for QA Office.
 *
 * Sections:
 *   1. AI Provider       — toggle between Google Gemini and local Ollama
 *   2. Agent Configuration — dynamic agent list with inline editing
 *   3. Office Layout preview (desk IDs)
 */
import { useState } from 'react';
import {
  KeyRound,
  Bot,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  LayoutDashboard,
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
} from 'lucide-react';
import { useSettings, DEFAULT_AGENTS, DEFAULT_LAYOUT } from '../context/SettingsContext';
import type { AgentConfig, SpriteType } from '../context/SettingsContext';

const API_BASE = 'http://localhost:3001';

// ─── Constants ────────────────────────────────────────────────────────────────

const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (fast, recommended)' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (latest preview)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (stable)' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (powerful, slower)' },
  { value: 'gemini-2.0-flash-thinking-exp', label: 'Gemini 2.0 Flash Thinking (exp)' },
];

const POPULAR_OLLAMA_MODELS = [
  'llama3.2',
  'llama3.1',
  'llama3',
  'mistral',
  'mixtral',
  'codellama',
  'deepseek-coder',
  'deepseek-r1',
  'phi3',
  'qwen2.5-coder',
  'gemma2',
  'nomic-embed-text',
];

const SPRITE_OPTIONS: { value: SpriteType; label: string; emoji: string }[] = [
  { value: 'dev', label: 'Developer', emoji: '🔵' },
  { value: 'tester', label: 'Tester', emoji: '🟣' },
  { value: 'analyst', label: 'Analyst', emoji: '🟡' },
  { value: 'devops', label: 'DevOps', emoji: '⚫' },
  { value: 'manager', label: 'Manager', emoji: '🟤' },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.08)' }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
      >
        <span style={{ color: '#3b82f6' }}>{icon}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
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
      className="flex flex-col sm:flex-row sm:items-start gap-3 py-3 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="sm:w-48 shrink-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
          {label}
        </p>
        {desc && (
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
            {desc}
          </p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Ollama status badge ──────────────────────────────────────────────────────

type OllamaStatus = 'idle' | 'testing' | 'ok' | 'fail';

function OllamaStatusBadge({ status, version }: { status: OllamaStatus; version?: string }) {
  if (status === 'idle') return null;
  if (status === 'testing')
    return (
      <span className="flex items-center gap-1 text-[11px] text-blue-400">
        <RefreshCw size={11} className="animate-spin" />
        Testing…
      </span>
    );
  if (status === 'ok')
    return (
      <span className="flex items-center gap-1 text-[11px] text-emerald-500">
        <Wifi size={11} />
        {version ? `Connected · v${version}` : 'Connected'}
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[11px] text-red-400">
      <WifiOff size={11} />
      Not reachable
    </span>
  );
}

// ─── Agent editor card ────────────────────────────────────────────────────────

function AgentEditor({
  agent,
  deskIds,
  onChange,
  onRemove,
}: {
  agent: AgentConfig;
  deskIds: string[];
  onChange: (patch: Partial<AgentConfig>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  const inputCls =
    'w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400';
  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-body)',
    color: 'var(--text-main)',
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-body)' }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-opacity hover:opacity-80"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-base leading-none">
          {SPRITE_OPTIONS.find((s) => s.value === agent.characterSprite)?.emoji ?? '🤖'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>
            {agent.name || '(unnamed agent)'}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {agent.role || 'No role'} · {agent.deskId || 'no desk'}
          </p>
        </div>
        {open ? (
          <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[11px] font-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Name
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className={inputCls}
                style={inputStyle}
                placeholder="Agent name"
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Role
              </label>
              <input
                type="text"
                value={agent.role}
                onChange={(e) => onChange({ role: e.target.value })}
                className={inputCls}
                style={inputStyle}
                placeholder="E.g. E2E Automation"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[11px] font-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Character Sprite
              </label>
              <select
                value={agent.characterSprite}
                onChange={(e) => onChange({ characterSprite: e.target.value as SpriteType })}
                className={inputCls}
                style={inputStyle}
              >
                {SPRITE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.emoji} {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Assigned Desk
              </label>
              <select
                value={agent.deskId}
                onChange={(e) => onChange({ deskId: e.target.value })}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">— unassigned —</option>
                {deskIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              System Prompt
              <span className="ml-1 font-normal opacity-60">(instructions sent to the AI)</span>
            </label>
            <textarea
              value={agent.systemPrompt}
              onChange={(e) => onChange({ systemPrompt: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
              style={{ ...inputStyle, minHeight: 90, lineHeight: 1.6 }}
              placeholder="You are an expert QA engineer..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={12} />
              Remove agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    agents,
    updateAgent,
    addAgent,
    removeAgent,
    setAgents,
    layout,
    updateLayout,
  } = useSettings();

  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('idle');
  const [ollamaVersion, setOllamaVersion] = useState<string | undefined>();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const deskIds = layout.desks.map((d) => d.id);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm('Reset all agents and layout to defaults? Your API key is kept.')) return;
    setAgents(DEFAULT_AGENTS);
    updateLayout(DEFAULT_LAYOUT);
  };

  const handleAddAgent = () => {
    addAgent({
      id: `agent-${Date.now()}`,
      name: 'New Agent',
      role: 'QA Engineer',
      systemPrompt:
        'You are a senior QA engineer. Analyse the input and provide clear, actionable insights.',
      characterSprite: 'tester',
      deskId: '',
    });
  };

  const testOllamaConnection = async () => {
    setOllamaStatus('testing');
    setOllamaVersion(undefined);
    try {
      const url = encodeURIComponent(settings.ollamaBaseUrl || 'http://localhost:11434');
      const r = await fetch(`${API_BASE}/api/ollama/test?baseUrl=${url}`);
      const d = (await r.json()) as { ok: boolean; version?: string; detail?: string };
      setOllamaStatus(d.ok ? 'ok' : 'fail');
      if (d.ok) setOllamaVersion(d.version);
    } catch {
      setOllamaStatus('fail');
    }
  };

  const fetchOllamaModels = async () => {
    setLoadingModels(true);
    try {
      const url = encodeURIComponent(settings.ollamaBaseUrl || 'http://localhost:11434');
      const r = await fetch(`${API_BASE}/api/ollama/models?baseUrl=${url}`);
      const d = (await r.json()) as { models: string[] };
      setAvailableModels(d.models ?? []);
    } catch {
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-body)',
    color: 'var(--text-main)',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
          Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Configure your AI provider, API keys, and QA agent personalities. Changes save
          automatically to localStorage.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── AI Provider ─────────────────────────────────────────────────── */}
        <SectionCard icon={<KeyRound size={14} />} title="AI Provider">
          {/* Provider toggle */}
          <div
            className="flex gap-2 p-1 rounded-xl mb-5"
            style={{ background: 'var(--bg-body)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => updateSettings({ provider: 'gemini' })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={
                settings.provider === 'gemini'
                  ? {
                      background: '#1e40af',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(30,64,175,0.4)',
                    }
                  : { color: 'var(--text-muted)' }
              }
            >
              ✨ Google Gemini
            </button>
            <button
              onClick={() => updateSettings({ provider: 'ollama' })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={
                settings.provider === 'ollama'
                  ? {
                      background: '#065f46',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(6,95,70,0.4)',
                    }
                  : { color: 'var(--text-muted)' }
              }
            >
              🦙 Local Ollama
            </button>
          </div>

          {/* ── Gemini fields ──────────────────────────────────────────────── */}
          {settings.provider === 'gemini' && (
            <>
              <Field
                label="Gemini API Key"
                desc="Your Google AI Studio key. Never sent anywhere except your own Gemini calls."
              >
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.geminiApiKey}
                    onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="AIza…"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    onClick={() => setShowKey((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-muted)' }}
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {settings.geminiApiKey ? (
                  <p className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-500">
                    <Check size={11} />
                    Key present — {settings.geminiApiKey.length} characters
                  </p>
                ) : (
                  <p
                    className="flex items-center gap-1.5 mt-1.5 text-[11px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <AlertTriangle size={11} />
                    Get a free key at{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400"
                    >
                      aistudio.google.com
                    </a>
                  </p>
                )}
              </Field>

              <Field label="Gemini Model" desc="Used when running agents from the Office chat.">
                <select
                  value={settings.defaultModel}
                  onChange={(e) => updateSettings({ defaultModel: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                >
                  {GEMINI_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {/* ── Ollama fields ──────────────────────────────────────────────── */}
          {settings.provider === 'ollama' && (
            <>
              {/* Info box */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl mb-4 text-[12px]"
                style={{
                  background: 'rgba(6,95,70,0.1)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  color: 'var(--text-main)',
                }}
              >
                <Server size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-400">
                    Local Ollama — 100% private, no API key needed
                  </p>
                  <p className="mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Install from{' '}
                    <a
                      href="https://ollama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400"
                    >
                      ollama.com
                    </a>
                    , then run{' '}
                    <code
                      className="px-1 py-0.5 rounded font-mono text-[11px]"
                      style={{ background: 'var(--bg-muted)' }}
                    >
                      ollama pull llama3.2
                    </code>{' '}
                    and{' '}
                    <code
                      className="px-1 py-0.5 rounded font-mono text-[11px]"
                      style={{ background: 'var(--bg-muted)' }}
                    >
                      ollama serve
                    </code>
                    . Image attachments are not supported with Ollama (text only).
                  </p>
                </div>
              </div>

              <Field
                label="Ollama Base URL"
                desc="The address where your Ollama server is listening."
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.ollamaBaseUrl}
                    onChange={(e) => {
                      updateSettings({ ollamaBaseUrl: e.target.value });
                      setOllamaStatus('idle');
                    }}
                    className={`${inputCls} flex-1`}
                    style={inputStyle}
                    placeholder="http://localhost:11434"
                    spellCheck={false}
                  />
                  <button
                    onClick={testOllamaConnection}
                    disabled={ollamaStatus === 'testing'}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 shrink-0"
                    style={{
                      background: 'rgba(59,130,246,0.1)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}
                  >
                    {ollamaStatus === 'testing' ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </button>
                </div>
                <div className="mt-1.5">
                  <OllamaStatusBadge status={ollamaStatus} version={ollamaVersion} />
                </div>
              </Field>

              <Field
                label="Ollama Model"
                desc="The model to use for chat. Pull models with: ollama pull <name>"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="ollama-models-list"
                    value={settings.ollamaModel}
                    onChange={(e) => updateSettings({ ollamaModel: e.target.value })}
                    className={`${inputCls} flex-1`}
                    style={inputStyle}
                    placeholder="llama3.2"
                    spellCheck={false}
                  />
                  <button
                    onClick={fetchOllamaModels}
                    disabled={loadingModels}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 shrink-0 flex items-center gap-1.5"
                    style={{
                      background: 'rgba(59,130,246,0.1)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}
                    title="Fetch installed models from Ollama"
                  >
                    {loadingModels ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    {availableModels.length > 0
                      ? `${availableModels.length} found`
                      : 'Fetch models'}
                  </button>
                </div>
                <datalist id="ollama-models-list">
                  {(availableModels.length > 0 ? availableModels : POPULAR_OLLAMA_MODELS).map(
                    (m) => (
                      <option key={m} value={m} />
                    ),
                  )}
                </datalist>
                {availableModels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {availableModels.map((m) => (
                      <button
                        key={m}
                        onClick={() => updateSettings({ ollamaModel: m })}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono transition-all"
                        style={
                          settings.ollamaModel === m
                            ? {
                                background: '#065f46',
                                color: '#6ee7b7',
                                border: '1px solid #059669',
                              }
                            : {
                                background: 'var(--bg-muted)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                              }
                        }
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                {availableModels.length === 0 && (
                  <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Click "Fetch models" to see what's installed, or type a model name manually.
                  </p>
                )}
              </Field>
            </>
          )}
        </SectionCard>

        {/* ── Agent Configuration ────────────────────────────────────────────── */}
        <SectionCard icon={<Bot size={14} />} title="Agent Configuration">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {agents.length} agent{agents.length !== 1 ? 's' : ''} configured · expand to edit
              system prompts, roles, and desk assignments.
            </p>
            <button
              onClick={handleAddAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}
            >
              <Plus size={12} />
              Add Agent
            </button>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => (
              <AgentEditor
                key={agent.id}
                agent={agent}
                deskIds={deskIds}
                onChange={(patch) => updateAgent(agent.id, patch)}
                onRemove={() => removeAgent(agent.id)}
              />
            ))}
            {agents.length === 0 && (
              <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
                No agents. Add one above or reset to defaults.
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Office Layout ──────────────────────────────────────────────────── */}
        <SectionCard icon={<LayoutDashboard size={14} />} title="Office Layout">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Current layout: {layout.cols}×{layout.rows} grid · {layout.desks.length} desks
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {layout.desks.map((desk) => {
              const occupant = agents.find((a) => a.deskId === desk.id);
              return (
                <div
                  key={desk.id}
                  className="flex flex-col gap-1 p-3 rounded-xl text-[11px]"
                  style={{
                    backgroundColor: occupant ? 'rgba(59,130,246,0.08)' : 'var(--bg-body)',
                    border: `1px solid ${occupant ? '#1e40af' : 'var(--border)'}`,
                  }}
                >
                  <span className="font-bold font-mono" style={{ color: 'var(--text-main)' }}>
                    {desk.id}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{desk.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    col {desk.x}, row {desk.y}
                  </span>
                  {occupant ? (
                    <span className="text-blue-400 font-medium">👤 {occupant.name}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>— vacant —</span>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Actions ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            Reset agents &amp; layout to defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              backgroundColor: saved ? '#065f46' : '#1e40af',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(30,64,175,0.3)',
            }}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? 'Saved ✓' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
