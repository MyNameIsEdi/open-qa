import { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import RunOutput from './RunOutput'

export interface AgentDef {
  name: string
  description: string
  status: 'active' | 'planned'
  runCommand: string
  systemPrompt: string
  toolSchema?: object
  runId?: string
}

interface Props {
  agent: AgentDef
}

function buildClaudePayload(agent: AgentDef) {
  return JSON.stringify(
    {
      name: agent.name,
      description: agent.description,
      system_prompt: agent.systemPrompt,
      tool_schema: agent.toolSchema ?? {
        name: agent.name.toLowerCase().replace(/\s+/g, '_'),
        description: agent.description,
        input_schema: { type: 'object', properties: {}, required: [] },
      },
      run_command: agent.runCommand,
    },
    null,
    2,
  )
}

export default function AgentCard({ agent }: Props) {
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [runError, setRunError] = useState('')
  const [showOutput, setShowOutput] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildClaudePayload(agent))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = async () => {
    if (!agent.runId) return
    setRunning(true)
    setOutput('')
    setRunError('')
    setShowOutput(true)

    try {
      const res = await fetch(`/api/run/${agent.runId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setRunError(data.error || data.stderr || 'Unknown error')
      } else {
        setOutput(data.output || '(no output)')
      }
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div
      className="group flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-main)' }}>
          {agent.name}
        </h3>
        {agent.status === 'active' ? (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">
            <CheckCircleIcon sx={{ fontSize: 12 }} />
            Active
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
            <ScheduleIcon sx={{ fontSize: 12 }} />
            Planned
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {agent.description}
      </p>

      {/* Run command */}
      <code
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-mono truncate"
        style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}
      >
        <ContentCopyIcon sx={{ fontSize: 11, opacity: 0.5, flexShrink: 0 }} />
        {agent.runCommand}
      </code>

      {/* Output panel */}
      {showOutput && (
        <RunOutput output={output} loading={running} error={runError} />
      )}

      {/* Action buttons */}
      <div className="mt-auto flex gap-2">
        {agent.runId && (
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-sage-50 text-sage-700 hover:bg-sage-100 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PlayArrowOutlinedIcon sx={{ fontSize: 14 }} />
            {running ? 'Running…' : 'Run'}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 active:scale-95 transition-all duration-150"
        >
          {copied ? (
            <>
              <CheckIcon sx={{ fontSize: 14 }} />
              Copied!
            </>
          ) : (
            <>
              <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              Add to Claude
            </>
          )}
        </button>
      </div>
    </div>
  )
}
