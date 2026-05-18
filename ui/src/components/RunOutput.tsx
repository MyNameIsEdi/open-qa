import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

interface Props {
  output: string
  loading: boolean
  error?: string
}

export default function RunOutput({ output, loading, error }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
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
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              {t('common.running')}
            </span>
          ) : error ? (
            <span className="text-coral-500">{t('common.error')}</span>
          ) : (
            <span className="text-sage-600">{t('common.done')}</span>
          )}
        </span>
        {output && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg hover:bg-neutral-100 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {copied ? <CheckIcon sx={{ fontSize: 12 }} /> : <ContentCopyIcon sx={{ fontSize: 12 }} />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}
      </div>
      <pre
        ref={scrollRef}
        className="text-xs font-mono p-3 overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap"
        style={{ color: error ? 'var(--coral-500, #ef4444)' : 'var(--text-main)' }}
      >
        {error || output || (loading ? '' : t('common.no_output'))}
      </pre>
    </div>
  )
}
