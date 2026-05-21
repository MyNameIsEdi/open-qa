import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

interface Props {
  code: string;
  language?: string;
}

export default function CodeSnippet({ code, language }: Props) {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }

    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const copyLabel =
    copyStatus === 'copied'
      ? t('common.copied')
      : copyStatus === 'failed'
        ? t('common.copy_failed')
        : t('common.copy');

  return (
    // dir="ltr" — code is always left-to-right regardless of document language
    <div
      dir="ltr"
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
          className="ms-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg hover:bg-sand-400 transition-colors"
          style={{
            color: copyStatus === 'failed' ? 'var(--coral-500, #ef4444)' : 'var(--text-muted)',
          }}
        >
          {copyStatus === 'copied' ? (
            <CheckIcon sx={{ fontSize: 12 }} />
          ) : copyStatus === 'failed' ? (
            <ErrorOutlinedIcon sx={{ fontSize: 12 }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: 12 }} />
          )}
          {copyLabel}
        </button>
      </div>
      <pre
        className="text-xs font-mono p-3 overflow-auto leading-relaxed"
        style={{ color: 'var(--text-main)' }}
      >
        {code}
      </pre>
    </div>
  );
}
