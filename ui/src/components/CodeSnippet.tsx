import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

interface Props {
  code: string
  language?: string
}

export default function CodeSnippet({ code, language }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {language && (
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {language}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg hover:bg-sand-400 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {copied ? <CheckIcon sx={{ fontSize: 12 }} /> : <ContentCopyIcon sx={{ fontSize: 12 }} />}
          {copied ? t('common.copied') : t('common.copy')}
        </button>
      </div>
      <pre className="text-xs font-mono p-3 overflow-auto leading-relaxed" style={{ color: 'var(--text-main)' }}>
        {code}
      </pre>
    </div>
  )
}
