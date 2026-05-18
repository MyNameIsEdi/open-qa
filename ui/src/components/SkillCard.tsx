import { useState } from 'react'

export interface SkillDef {
  name: string
  description: string
  status: 'active' | 'planned'
  runCommand: string
  systemPrompt: string
  inputSchema?: object
}

interface Props {
  skill: SkillDef
}

function buildClaudePayload(skill: SkillDef) {
  return JSON.stringify(
    {
      name: skill.name,
      description: skill.description,
      system_prompt: skill.systemPrompt,
      tool_schema: {
        name: skill.name.toLowerCase().replace(/\s+/g, '_'),
        description: skill.description,
        input_schema: skill.inputSchema ?? { type: 'object', properties: {}, required: [] },
      },
      run_command: skill.runCommand,
    },
    null,
    2,
  )
}

export default function SkillCard({ skill }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildClaudePayload(skill))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="group flex flex-col gap-3 p-5 rounded-2xl border bg-white transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-main)' }}>
          {skill.name}
        </h3>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            skill.status === 'active'
              ? 'bg-sage-100 text-sage-700'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          {skill.status === 'active' ? '🟢 Active' : '🟡 Planned'}
        </span>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {skill.description}
      </p>

      <code
        className="block text-xs px-3 py-2 rounded-lg font-mono truncate"
        style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}
      >
        {skill.runCommand}
      </code>

      <button
        onClick={handleCopy}
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 active:scale-95 transition-all duration-150"
      >
        {copied ? <>✅ Copied!</> : <>🤖 Add to Claude</>}
      </button>
    </div>
  )
}
