import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

export interface PromptDef {
  name: string;
  tagline: string;
  systemPrompt: string;
  userPromptTemplate?: string;
}

interface Props {
  prompt: PromptDef;
}

export default function PromptCard({ prompt }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-medium"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
            {prompt.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {prompt.tagline}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 flex items-center gap-0.5 text-xs px-2 py-1 rounded-lg font-medium text-neutral-500 hover:bg-sand-400 transition-colors"
        >
          {expanded ? (
            <>
              <ExpandLessIcon sx={{ fontSize: 14 }} /> {t('prompts.less')}
            </>
          ) : (
            <>
              <ExpandMoreIcon sx={{ fontSize: 14 }} /> {t('prompts.more')}
            </>
          )}
        </button>
      </div>

      {/* Expanded prompt text */}
      {expanded && (
        <div
          className="rounded-xl p-3 overflow-auto max-h-64 text-xs font-mono whitespace-pre-wrap leading-relaxed animate-fade-in"
          style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}
        >
          {prompt.systemPrompt}
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 active:scale-95 transition-all duration-150"
      >
        {copied ? (
          <>
            <CheckIcon sx={{ fontSize: 14 }} /> {t('common.copied')}
          </>
        ) : (
          <>
            <ContentCopyIcon sx={{ fontSize: 14 }} /> {t('prompts.copy_prompt')}
          </>
        )}
      </button>
    </div>
  );
}
