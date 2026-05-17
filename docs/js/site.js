/* ══════════════════════════════════════════════════════════════════
   Intelligent Testing Toolkit — site.js
   Modules: navigation, card filtering, slide-over panel, i18n (EN/HE),
            context-aware Claude / Cursor copy buttons, docs TOC
   ══════════════════════════════════════════════════════════════════ */

/* ── i18n Dictionary ────────────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    /* Smart buttons */
    add_to_claude:    'Add to Claude',
    btn_copy_cursor:  'Copy for Cursor',
    toast_title:      'Added to Claude!',
    toast_success:    "Ready to paste into Claude's Tool Library.",
    toast_cursor:     'Copied for Cursor!',
    toast_cursor_msg: 'Paste this into your .cursorrules file.',

    /* Nav */
    nav_home:    'Home',
    nav_agents:  'Agents',
    nav_skills:  'Skills',
    nav_prompts: 'Prompts',
    nav_docs:    'Docs',

    /* index.html — Hero */
    hero_title:    'AI-Powered QA Arsenal',
    hero_subtitle: 'Production-oriented Playwright + Claude toolkit for self-healing tests, edge-case data generation, and automated bug triage. Clone, run in MOCK mode, ship faster.',
    hero_cta_github: 'View on GitHub',
    hero_cta_browse: 'Browse Agents',

    /* index.html — Banner */
    banner_text: 'First time here? Run npm install && npm test — no API key required.',
    banner_link: 'Getting Started',

    /* index.html — Sections */
    section_started:          'Getting Started (< 5 minutes)',
    section_started_desc:     'All demos run in MOCK mode by default — no ANTHROPIC_API_KEY needed.',
    section_started_optional: 'Optional: set ANTHROPIC_API_KEY in .env to use Claude 3.5 Sonnet live.',
    section_overview:         'Repository Overview',
    section_marketplace:      'Live Marketplace',
    section_marketplace_desc: 'Browse the full catalog across dedicated pages — search, filter, and copy run commands instantly.',

    /* index.html — Feature cards */
    feature_agents_title: 'Autonomous Agents',
    feature_agents_desc:  'Self-healing locators and automated triage scripts that reason over DOM and stack traces.',
    feature_agents_link:  'Explore Agents →',
    feature_skills_title: 'Testing Skills',
    feature_skills_desc:  'Edge-case generators and utilities that plug into your existing Playwright suites.',
    feature_skills_link:  'Explore Skills →',
    feature_prompts_title: 'System Prompts',
    feature_prompts_desc:  'Copy-paste personas for Claude, Cursor, and ChatGPT — test plans, data gen, IDE rules.',
    feature_prompts_link:  'Explore Prompts →',

    /* index.html — Marketplace buttons */
    marketplace_agents:  'Agents (6)',
    marketplace_skills:  'Skills (5)',
    marketplace_prompts: 'Prompts (6)',

    /* Page headers */
    agents_title:    'Autonomous Agents',
    agents_subtitle: 'Independent scripts that analyze DOM context, recover from failures, intercept network traffic, and triage CI logs automatically.',
    skills_title:    'Testing Skills & Data Gen',
    skills_subtitle: 'Utility generators and helpers for API fuzzing, load testing, log mining, and security boundary testing.',
    prompts_title:   'System Prompts Library',
    prompts_subtitle:'Curated personas for Claude, Cursor, and ChatGPT — click any card to view the full prompt and copy it instantly.',
    docs_title:      'Documentation',
    docs_subtitle:   'Complete reference for installation, architecture, Mock vs Real LLM mode, and all toolkit capabilities.',

    /* Search placeholders */
    search_agents:  'Search agents...',
    search_skills:  'Search skills...',
    search_prompts: 'Search prompts...',

    /* Sidebar filters */
    filter_status:        'Status',
    filter_active_label:  'Active',
    filter_planned_label: 'Planned',

    /* Badges */
    badge_active:  'Active',
    badge_popular: 'Popular',
    badge_planned: 'Planned',

    /* Card elements */
    creator:          'Creator: toolkit-ai',
    btn_copy_command: 'Copy Run Command',
    btn_copy_ref:     'Copy Reference',
    btn_view_prompt:  'View Full Prompt',

    /* Panel labels */
    panel_how:          'How it works',
    panel_command:      'CLI Run Command',
    panel_prompt_label: 'System Prompt / Instructions',
    panel_copy:         'Copy',

    /* Result counts */
    label_agents:  'agents',
    label_skills:  'skills',
    label_prompts: 'prompts',

    /* Clipboard feedback */
    copied: 'Copied!',
  },

  he: {
    /* Smart buttons */
    add_to_claude:    'הוסף ל-Claude',
    btn_copy_cursor:  'העתק ל-Cursor',
    toast_title:      '!נוסף ל-Claude',
    toast_success:    '.מוכן להדבקה בספריית הכלים של Claude',
    toast_cursor:     '!הועתק ל-Cursor',
    toast_cursor_msg: '.הדבק בקובץ ה-.cursorrules שלך',

    /* Nav */
    nav_home:    'בית',
    nav_agents:  'סוכנים',
    nav_skills:  'כלים',
    nav_prompts: 'פרומפטים',
    nav_docs:    'תיעוד',

    /* index.html — Hero */
    hero_title:    'ארסנל QA מבוסס בינה מלאכותית',
    hero_subtitle: 'כלי Playwright + Claude לסביבת ייצור — בדיקות מתקנות עצמית, יצירת נתוני קצה, וסיווג באגים אוטומטי. שכפל, הרץ במצב MOCK, שלח מהר יותר.',
    hero_cta_github: 'צפה ב-GitHub',
    hero_cta_browse: 'עיין בסוכנים',

    /* index.html — Banner */
    banner_text: 'פעם ראשונה? הרץ npm install && npm test — ללא מפתח API.',
    banner_link: 'מדריך התחלה',

    /* index.html — Sections */
    section_started:          'התחלה מהירה (פחות מ-5 דקות)',
    section_started_desc:     'כל ההדגמות רצות במצב MOCK כברירת מחדל — לא נדרש ANTHROPIC_API_KEY.',
    section_started_optional: 'אופציונלי: הגדר ANTHROPIC_API_KEY בקובץ .env לשימוש ב-Claude Sonnet.',
    section_overview:         'סקירת המאגר',
    section_marketplace:      'שוק חי',
    section_marketplace_desc: 'עיין בקטלוג המלא — חפש, סנן, והעתק פקודות הפעלה מיידית.',

    /* index.html — Feature cards */
    feature_agents_title: 'סוכנים אוטונומיים',
    feature_agents_desc:  'סקריפטים מתקנים עצמית ותסריטים לסיווג שמנתחים DOM ו-stack traces.',
    feature_agents_link:  'עיין בסוכנים ←',
    feature_skills_title: 'כלי בדיקה',
    feature_skills_desc:  'מחוללי מקרי קצה וכלי עזר שמתחברים לסוויטות Playwright הקיימות.',
    feature_skills_link:  'עיין בכלים ←',
    feature_prompts_title: 'פרומפטים למערכת',
    feature_prompts_desc:  'פרסונות מוכנות לשימוש עם Claude, Cursor ו-ChatGPT — תכניות בדיקה, יצירת נתונים וחוקי IDE.',
    feature_prompts_link:  'עיין בפרומפטים ←',

    /* index.html — Marketplace buttons */
    marketplace_agents:  'סוכנים (6)',
    marketplace_skills:  'כלים (5)',
    marketplace_prompts: 'פרומפטים (6)',

    /* Page headers */
    agents_title:    'סוכנים אוטונומיים',
    agents_subtitle: 'סקריפטים עצמאיים שמנתחים הקשר DOM, מתאוששים מכשלים, מיירטים תעבורת רשת, ומסווגים לוגים של CI אוטומטית.',
    skills_title:    'כלי בדיקה ויצירת נתונים',
    skills_subtitle: 'מחוללים וכלי עזר לאיתור פגמים ב-API, בדיקות עומס, חיפוש בלוגים ובדיקות אבטחה.',
    prompts_title:   'ספריית פרומפטים',
    prompts_subtitle:'פרסונות לשימוש עם Claude, Cursor ו-ChatGPT — לחץ על כרטיס לצפייה בפרומפט המלא.',
    docs_title:      'תיעוד',
    docs_subtitle:   'מדריך מלא להתקנה, ארכיטקטורה ויכולות הכלי.',

    /* Search placeholders */
    search_agents:  'חיפוש סוכנים...',
    search_skills:  'חיפוש כלים...',
    search_prompts: 'חיפוש פרומפטים...',

    /* Sidebar filters */
    filter_status:        'סטטוס',
    filter_active_label:  'פעיל',
    filter_planned_label: 'מתוכנן',

    /* Badges */
    badge_active:  'פעיל',
    badge_popular: 'פופולרי',
    badge_planned: 'מתוכנן',

    /* Card elements */
    creator:          'יוצר: toolkit-ai',
    btn_copy_command: 'העתק פקודה',
    btn_copy_ref:     'העתק הפניה',
    btn_view_prompt:  'צפה בפרומפט',

    /* Panel labels */
    panel_how:          'כיצד זה עובד',
    panel_command:      'פקודת הפעלה',
    panel_prompt_label: 'פרומפט מערכת / הוראות',
    panel_copy:         'העתק',

    /* Result counts */
    label_agents:  'סוכנים',
    label_skills:  'כלים',
    label_prompts: 'פרומפטים',

    /* Clipboard feedback */
    copied: 'הועתק!',
  },
};

/* ── i18n Core ──────────────────────────────────────────────────── */
let currentLang = localStorage.getItem('itt-lang') || 'en';

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key] !== undefined)
    ? TRANSLATIONS[currentLang][key]
    : (TRANSLATIONS.en[key] || key);
}

function applyLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('itt-lang', lang);

  const html = document.documentElement;
  html.lang = lang;
  html.dir  = lang === 'he' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = TRANSLATIONS[lang][key] !== undefined
      ? TRANSLATIONS[lang][key]
      : TRANSLATIONS.en[key];
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.dataset.i18nPh;
    const val = TRANSLATIONS[lang][key] !== undefined
      ? TRANSLATIONS[lang][key]
      : TRANSLATIONS.en[key];
    if (val !== undefined) el.placeholder = val;
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  refreshResultCount();
}

function initLanguage() {
  applyLanguage(currentLang);
}

/* ── Navigation ─────────────────────────────────────────────────── */
function initNavigation() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Clipboard Helper ───────────────────────────────────────────── */
function copyAction(buttonElement, textToCopy) {
  navigator.clipboard.writeText(textToCopy).then(() => {
    const textEl = buttonElement.querySelector('[data-i18n]') || buttonElement;
    const orig   = textEl.textContent;
    const origBg = buttonElement.style.background;

    textEl.textContent = t('copied');
    buttonElement.style.background = '#dcfce7';

    setTimeout(() => {
      textEl.textContent = orig;
      buttonElement.style.background = origBg;
    }, 2000);
  }).catch((err) => console.error('copyAction failed:', err));
}

/* ── Result Count Helper ────────────────────────────────────────── */
function formatResultCount(n, labelKey) {
  const label = t(labelKey) || labelKey;
  return currentLang === 'he'
    ? `נמצאו ${n} ${label}`
    : `${n} ${label} found`;
}

function refreshResultCount() {
  const resultEl = document.getElementById('resultCount');
  const grid     = document.getElementById('skillsGrid');
  if (!resultEl || !grid) return;

  const labelKey = resultEl.dataset.i18nLabel || '';
  const visible  = [...grid.querySelectorAll('.card')]
    .filter(c => c.style.display !== 'none').length;

  resultEl.textContent = formatResultCount(visible, labelKey);
}

/* ── Card Filtering ─────────────────────────────────────────────── */
function initCardFilter(searchInputId, gridId, resultCountId) {
  const searchInput = document.getElementById(searchInputId);
  const grid        = document.getElementById(gridId);
  const resultCount = document.getElementById(resultCountId);
  if (!searchInput || !grid || !resultCount) return;

  const cards    = grid.querySelectorAll('.card');
  const labelKey = resultCount.dataset.i18nLabel || '';

  function filterCards() {
    const term = searchInput.value.toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const match = !term || (card.dataset.search || '').toLowerCase().includes(term);
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });
    resultCount.textContent = formatResultCount(visible, labelKey);
  }

  searchInput.addEventListener('input', filterCards);
  filterCards();
}

/* ── Context-Aware Smart Buttons ────────────────────────────────── */

/** Clipboard fallback for file:// or non-secure contexts. */
function clipboardFallback(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  Object.assign(ta.style, { position: 'fixed', top: '0', left: '0', opacity: '0' });
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); onSuccess(); }
  catch (e) { console.error('Clipboard fallback failed:', e); }
  document.body.removeChild(ta);
}

/**
 * Attaches click listeners to all .btn-add-claude, .btn-copy-cursor,
 * and .btn-add-claude-panel elements. Reads system prompt from the
 * nearest [data-title] ancestor (or _panelCard for panel buttons).
 * No inline onclick handlers required.
 */
function initClaudeButtons() {
  document.querySelectorAll('.btn-add-claude, .btn-copy-cursor, .btn-add-claude-panel').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card    = btn.closest('[data-title]') || _panelCard;
      const prompt  = (card ? card.dataset.prompt : '') || btn.dataset.prompt || '';
      const isCursor = btn.classList.contains('btn-copy-cursor');

      if (!prompt) return;

      const onSuccess = () => {
        const textEl = btn.querySelector('[data-i18n]') || btn;
        const orig   = textEl.textContent;
        textEl.textContent = t('copied');
        setTimeout(() => { textEl.textContent = orig; }, 2000);

        if (isCursor) {
          showToast(t('toast_cursor'), t('toast_cursor_msg'), 'code');
        } else {
          showToast(t('toast_title'), t('toast_success'), 'smart_toy');
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prompt).then(onSuccess).catch((err) => {
          console.error('Clipboard API failed, using fallback:', err);
          clipboardFallback(prompt, onSuccess);
        });
      } else {
        clipboardFallback(prompt, onSuccess);
      }
    });
  });
}

/**
 * Shows a floating toast notification with a Material icon.
 * @param {string} title     - Bold heading text
 * @param {string} message   - Supporting text
 * @param {string} iconName  - Material Symbols icon name
 */
function showToast(title, message, iconName = 'smart_toy') {
  const existing = document.getElementById('claudeToast');
  if (existing) {
    existing.classList.remove('toast-visible');
    setTimeout(() => existing.remove(), 300);
  }

  const toast = document.createElement('div');
  toast.id = 'claudeToast';
  toast.className = 'claude-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <span class="toast-icon material-symbols-outlined" aria-hidden="true">${iconName}</span>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
    <button class="toast-close" onclick="document.getElementById('claudeToast').remove()" aria-label="Dismiss">
      <span class="material-symbols-outlined" style="font-size:1rem">close</span>
    </button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-visible')));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 400);
  }, 4500);
}

/* ── Legacy helper — kept for panel compatibility ───────────────── */
function toToolName(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '_').substring(0, 64);
}

/* ── Slide-Over Panel ───────────────────────────────────────────── */
let _panelCard = null;

function openSkillPanel(triggerEl) {
  const card = triggerEl.closest ? triggerEl.closest('[data-title]') || triggerEl : triggerEl;
  _panelCard = card;

  document.getElementById('panelTitle').textContent = card.dataset.title       || '';
  document.getElementById('panelDesc').textContent  = card.dataset.description || '';

  const command    = card.dataset.command || '';
  const cmdSection = document.getElementById('panelCommandSection');
  if (command) {
    document.getElementById('panelCommand').textContent = command;
    cmdSection.style.display = '';
  } else {
    cmdSection.style.display = 'none';
  }

  const prompt      = card.dataset.prompt || '';
  const codeSection = document.getElementById('panelCodeSection');
  if (prompt) {
    document.getElementById('panelCode').textContent = prompt;
    codeSection.style.display = '';
  } else {
    codeSection.style.display = 'none';
  }

  document.querySelectorAll('#slidePanel [data-i18n]').forEach((el) => {
    const val = TRANSLATIONS[currentLang][el.dataset.i18n];
    if (val !== undefined) el.textContent = val;
  });

  document.getElementById('panelOverlay').classList.add('open');
  document.getElementById('slidePanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('panelClose').focus();
}

function closeSkillPanel() {
  document.getElementById('panelOverlay').classList.remove('open');
  document.getElementById('slidePanel').classList.remove('open');
  document.body.style.overflow = '';
}

function copyPanelCommand() {
  const text = document.getElementById('panelCommand').textContent.trim();
  const btn  = document.getElementById('panelCopyBtn');
  navigator.clipboard.writeText(text).then(() => {
    const textEl = btn.querySelector('[data-i18n]') || btn;
    const orig   = textEl.textContent;
    textEl.textContent = t('copied');
    setTimeout(() => { textEl.textContent = orig; }, 2000);
  }).catch(err => console.error(err));
}

/* ── Docs TOC active-link tracking ─────────────────────────────── */
function initDocsTOC() {
  const links    = document.querySelectorAll('.docs-toc a[href^="#"]');
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if (!links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('toc-active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}

/** Copies a docs code block. btn is the copy button element. */
function copyCode(btn) {
  const pre  = btn.closest('.code-wrap').querySelector('pre');
  const text = pre ? pre.textContent : '';
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:.85rem">check</span> Copied!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  }).catch(err => clipboardFallback(text, () => {}));
}

/* ── Global keyboard handler ────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSkillPanel();
});

/* ── Boot ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguage();
  initClaudeButtons();
  initDocsTOC();
});
