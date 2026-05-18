import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import GitHubIcon from '@mui/icons-material/GitHub'
import AgentCard, { AgentDef } from '../components/AgentCard'

const CATEGORIES = ['locator', 'triage', 'architecture', 'datagen', 'a11y', 'other']

const EMPTY: AgentDef & { category: string; github: string } = {
  name: '',
  description: '',
  category: 'locator',
  status: 'active',
  systemPrompt: '',
  runCommand: '',
  github: '',
}

function buildIssueUrl(f: typeof EMPTY): string {
  const title = `Agent Submission: ${f.name || 'Untitled'}`

  const snippet = `{
  name: '${f.name}',
  category: '${f.category}',
  description: '${f.description}',
  status: '${f.status}',
  runCommand: '${f.runCommand || 'npx tsx src/agents/my-agent.ts'}',
  systemPrompt: \`${f.systemPrompt}\`,
}`

  const body = `## Agent Submission

**Name:** ${f.name || '—'}
**Category:** ${f.category}
**Status:** ${f.status}${f.github ? `\n**Submitted by:** @${f.github}` : ''}

### Description
${f.description || '—'}

### System Prompt
\`\`\`
${f.systemPrompt || '—'}
\`\`\`

### Run Command
\`\`\`
${f.runCommand || '—'}
\`\`\`

### AgentsPage.tsx snippet (copy-paste ready)
\`\`\`typescript
${snippet}
\`\`\`
`

  const params = new URLSearchParams({
    title,
    body,
    labels: 'agent-submission',
  })
  return `https://github.com/MyNameIsEdi/intelligent-testing-toolkit/issues/new?${params.toString()}`
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
      {children}
    </label>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5">{children}</div>
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors focus:border-primary-400'
const inputStyle = {
  backgroundColor: 'var(--bg-card)',
  borderColor: 'var(--border)',
  color: 'var(--text-main)',
}

export default function SubmitAgentPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY)

  const set = (key: keyof typeof EMPTY, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const previewAgent: AgentDef = {
    name: form.name || 'Agent Name',
    description: form.description || 'Your agent description will appear here…',
    status: form.status as 'active' | 'planned',
    runCommand: form.runCommand || 'npx tsx src/agents/my-agent.ts',
    systemPrompt: form.systemPrompt || '(system prompt)',
  }

  const canSubmit = form.name.trim() && form.description.trim() && form.systemPrompt.trim()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-main)' }}>
          {t('submit.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('submit.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* ── Form ── */}
        <div
          className="flex flex-col gap-5 p-6 rounded-2xl border"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <Field>
            <Label>{t('submit.field_name')} *</Label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="e.g. Visual Regression Checker"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </Field>

          <Field>
            <Label>{t('submit.field_tagline')} *</Label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="One-line description shown on the card"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field>
              <Label>{t('submit.field_category')}</Label>
              <select
                className={inputCls}
                style={inputStyle}
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <Label>{t('submit.field_status')}</Label>
              <div className="flex items-center gap-4 h-10">
                {(['active', 'planned'] as const).map(s => (
                  <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--text-main)' }}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => set('status', s)}
                      className="accent-primary-600"
                    />
                    {s === 'active' ? t('submit.status_active') : t('submit.status_planned')}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <Field>
            <Label>{t('submit.field_system_prompt')} *</Label>
            <textarea
              className={`${inputCls} resize-y`}
              style={{ ...inputStyle, minHeight: '10rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}
              placeholder="You are a senior QA engineer. Given..."
              value={form.systemPrompt}
              onChange={e => set('systemPrompt', e.target.value)}
            />
          </Field>

          <Field>
            <Label>{t('submit.field_run_command')}</Label>
            <input
              className={inputCls}
              style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}
              placeholder="npx tsx src/agents/my-agent.ts"
              value={form.runCommand}
              onChange={e => set('runCommand', e.target.value)}
            />
          </Field>

          <Field>
            <Label>{t('submit.field_github')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
              <input
                className={`${inputCls} pl-7`}
                style={inputStyle}
                placeholder="yourhandle"
                value={form.github}
                onChange={e => set('github', e.target.value)}
              />
            </div>
          </Field>

          <a
            href={canSubmit ? buildIssueUrl(form) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => { if (!canSubmit) e.preventDefault() }}
            className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${
              canSubmit
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft'
                : 'opacity-40 cursor-not-allowed bg-primary-600 text-white'
            }`}
          >
            <GitHubIcon sx={{ fontSize: 18 }} />
            {t('submit.submit_btn')}
          </a>

          {!canSubmit && (
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Fill in Name, Tagline, and System Prompt to continue.
            </p>
          )}
        </div>

        {/* ── Live Preview ── */}
        <div className="lg:sticky lg:top-20">
          <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {t('submit.preview_title')}
          </p>
          <AgentCard agent={previewAgent} />
          <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
            This is how your agent will appear on the Agents page.
          </p>
        </div>
      </div>
    </div>
  )
}
