/* ══════════════════════════════════════════════════════════════════
   Intelligent Testing Toolkit — site.js
   Modules: navigation, card filtering, slide-over panel, i18n (EN/HE)
   ══════════════════════════════════════════════════════════════════ */

/* ── i18n Dictionary ────────────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    /* Add to Claude */
    add_to_claude:  '🤖 Add to Claude',
    toast_title:    'Added to Claude!',
    toast_success:  "Ready to paste into Claude's Tool Library.",

    /* Nav */
    nav_home:    'Home',
    nav_agents:  'Agents',
    nav_skills:  'Skills',
    nav_prompts: 'Prompts',

    /* index.html — Hero */
    hero_title:    'AI-Powered QA Arsenal',
    hero_subtitle: 'Production-oriented Playwright + Claude toolkit for self-healing tests, edge-case data generation, and automated bug triage. Clone, run in MOCK mode, ship faster.',
    hero_cta_github: 'View on GitHub',
    hero_cta_browse: 'Browse Agents',

    /* index.html — Banner */
    banner_text: '💡 First time here? Run npm install && npm test — no API key required.',
    banner_link: 'Getting Started',

    /* index.html — Sections */
    section_started:          '🚀 Getting Started (< 5 minutes)',
    section_started_desc:     'All demos run in MOCK mode by default — no ANTHROPIC_API_KEY needed.',
    section_started_optional: 'Optional: set ANTHROPIC_API_KEY in .env to use Claude 3.5 Sonnet live.',
    section_overview:         '📂 Repository Overview',
    section_marketplace:      '🛒 Live Marketplace',
    section_marketplace_desc: 'Browse the full catalog across dedicated pages — search, filter, and copy run commands instantly.',

    /* index.html — Feature cards */
    feature_agents_title: '🤖 Autonomous Agents',
    feature_agents_desc:  'Self-healing locators and automated triage scripts that reason over DOM and stack traces.',
    feature_agents_link:  'Explore Agents →',
    feature_skills_title: '🛠️ Testing Skills',
    feature_skills_desc:  'Edge-case generators and utilities that plug into your existing Playwright suites.',
    feature_skills_link:  'Explore Skills →',
    feature_prompts_title: '🧠 System Prompts',
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

    /* Search placeholders */
    search_agents:  'Search agents...',
    search_skills:  'Search skills...',
    search_prompts: 'Search prompts...',

    /* Sidebar filters */
    filter_status:        'Status',
    filter_active_label:  'Active',
    filter_planned_label: 'Planned',

    /* Badges */
    badge_active:  '🟢 Active',
    badge_popular: '🔥 Popular',
    badge_planned: '🟡 Planned',

    /* Card elements */
    creator:          'Creator: toolkit-ai',
    btn_copy_command: '💬 Copy Run Command',
    btn_copy_ref:     '💬 Copy Reference',
    btn_view_prompt:  '📄 View Full Prompt',

    /* Panel labels */
    panel_how:          'How it works',
    panel_command:      'CLI Run Command',
    panel_prompt_label: 'System Prompt / Instructions',
    panel_copy:         '📋 Copy',

    /* Result counts — label only (code formats the full string) */
    label_agents:  'agents',
    label_skills:  'skills',
    label_prompts: 'prompts',

    /* Clipboard feedback */
    copied: '✅ Copied!',
  },

  he: {
    /* Add to Claude */
    add_to_claude:  '🤖 הוסף ל-Claude',
    toast_title:    '!נוסף ל-Claude',
    toast_success:  '.מוכן להדבקה בספריית הכלים של Claude',

    /* Nav */
    nav_home:    'בית',
    nav_agents:  'סוכנים',
    nav_skills:  'כלים',
    nav_prompts: 'פרומפטים',

    /* index.html — Hero */
    hero_title:    'ארסנל QA מבוסס בינה מלאכותית',
    hero_subtitle: 'כלי Playwright + Claude לסביבת ייצור — בדיקות מתקנות עצמית, יצירת נתוני קצה, וסיווג באגים אוטומטי. שכפל, הרץ במצב MOCK, שלח מהר יותר.',
    hero_cta_github: 'צפה ב-GitHub',
    hero_cta_browse: 'עיין בסוכנים',

    /* index.html — Banner */
    banner_text: '💡 פעם ראשונה? הרץ npm install && npm test — ללא מפתח API.',
    banner_link: 'מדריך התחלה',

    /* index.html — Sections */
    section_started:          '🚀 התחלה מהירה (פחות מ-5 דקות)',
    section_started_desc:     'כל ההדגמות רצות במצב MOCK כברירת מחדל — לא נדרש ANTHROPIC_API_KEY.',
    section_started_optional: 'אופציונלי: הגדר ANTHROPIC_API_KEY בקובץ .env לשימוש ב-Claude Sonnet.',
    section_overview:         '📂 סקירת המאגר',
    section_marketplace:      '🛒 שוק חי',
    section_marketplace_desc: 'עיין בקטלוג המלא — חפש, סנן, והעתק פקודות הפעלה מיידית.',

    /* index.html — Feature cards */
    feature_agents_title: '🤖 סוכנים אוטונומיים',
    feature_agents_desc:  'סקריפטים מתקנים עצמית ותסריטים לסיווג שמנתחים DOM ו-stack traces.',
    feature_agents_link:  'עיין בסוכנים ←',
    feature_skills_title: '🛠️ כלי בדיקה',
    feature_skills_desc:  'מחוללי מקרי קצה וכלי עזר שמתחברים לסוויטות Playwright הקיימות.',
    feature_skills_link:  'עיין בכלים ←',
    feature_prompts_title: '🧠 פרומפטים למערכת',
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

    /* Search placeholders */
    search_agents:  'חיפוש סוכנים...',
    search_skills:  'חיפוש כלים...',
    search_prompts: 'חיפוש פרומפטים...',

    /* Sidebar filters */
    filter_status:        'סטטוס',
    filter_active_label:  'פעיל',
    filter_planned_label: 'מתוכנן',

    /* Badges */
    badge_active:  '🟢 פעיל',
    badge_popular: '🔥 פופולרי',
    badge_planned: '🟡 מתוכנן',

    /* Card elements */
    creator:          'יוצר: toolkit-ai',
    btn_copy_command: '💬 העתק פקודה',
    btn_copy_ref:     '💬 העתק הפניה',
    btn_view_prompt:  '📄 צפה בפרומפט',

    /* Panel labels */
    panel_how:          'כיצד זה עובד',
    panel_command:      'פקודת הפעלה',
    panel_prompt_label: 'פרומפט מערכת / הוראות',
    panel_copy:         '📋 העתק',

    /* Result counts */
    label_agents:  'סוכנים',
    label_skills:  'כלים',
    label_prompts: 'פרומפטים',

    /* Clipboard feedback */
    copied: '✅ הועתק!',
  },
};

/* ── i18n Core ──────────────────────────────────────────────────── */
let currentLang = localStorage.getItem('itt-lang') || 'en';

/** Translate a key in the current language, falling back to English. */
function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key] !== undefined)
    ? TRANSLATIONS[currentLang][key]
    : (TRANSLATIONS.en[key] || key);
}

/**
 * Apply a language to the page:
 * - Sets html[lang] and html[dir]
 * - Swaps all [data-i18n] text content
 * - Swaps all [data-i18n-ph] placeholders
 * - Updates lang toggle button active state
 * - Persists to localStorage
 */
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

  /* Re-render result count with correct language */
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
    const originalHTML = buttonElement.innerHTML;
    const originalBg   = buttonElement.style.background;
    const originalColor = buttonElement.style.color;

    buttonElement.innerHTML = t('copied');
    buttonElement.style.background = '#dcfce7';
    buttonElement.style.color = '#166534';

    setTimeout(() => {
      buttonElement.innerHTML = originalHTML;
      buttonElement.style.background = originalBg;
      buttonElement.style.color = originalColor;
    }, 2000);
  });
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
function initCardFilter(
  searchInputId,
  gridId,
  resultCountId,
  categoryFilterClass = 'category-filter',
) {
  const searchInput  = document.getElementById(searchInputId);
  const grid         = document.getElementById(gridId);
  const resultCount  = document.getElementById(resultCountId);
  if (!searchInput || !grid || !resultCount) return;

  const cards          = grid.querySelectorAll('.card');
  const categoryFilters = document.querySelectorAll(`.${categoryFilterClass}`);
  const labelKey       = resultCount.dataset.i18nLabel || resultCount.dataset.label || '';

  function filterCards() {
    const searchTerm     = searchInput.value.toLowerCase();
    const activeCategories = [...categoryFilters]
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    let visible = 0;
    cards.forEach((card) => {
      const text     = (card.dataset.search || '').toLowerCase();
      const category = card.dataset.category || '';
      const matchSearch   = !searchTerm || text.includes(searchTerm);
      const matchCategory = activeCategories.length === 0 || activeCategories.includes(category);

      if (matchSearch && matchCategory) {
        card.style.display = 'flex';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    resultCount.textContent = formatResultCount(visible, labelKey);
  }

  searchInput.addEventListener('input', filterCards);
  categoryFilters.forEach(cb => cb.addEventListener('change', filterCards));
  filterCards();
}

/* ── "Add to Claude" ────────────────────────────────────────────── */

/**
 * Derives a snake_case tool name from a human title.
 * e.g. "Smart Data Gen" → "smart_data_gen"
 */
function toToolName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 64);
}

/**
 * Exports a card's full configuration as Claude-ready JSON and
 * copies it to the clipboard, then shows a toast.
 * @param {HTMLElement} cardEl - the .card element (or any descendant)
 */
function addToClaude(cardEl) {
  const card = cardEl.closest ? cardEl.closest('[data-title]') || cardEl : cardEl;
  const title       = card.dataset.title       || '';
  const description = card.dataset.description || '';
  const command     = card.dataset.command     || '';
  const prompt      = card.dataset.prompt      || '';

  const payload = {
    name: title,
    description: description,
    system_prompt: prompt || null,
    tool_schema: {
      name: toToolName(title),
      description: description,
      input_schema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'The API field, schema, URL, or content to process',
          },
          count: {
            type: 'integer',
            description: 'Number of outputs to generate',
            default: 10,
          },
        },
        required: ['target'],
      },
    },
    run_command: command || null,
  };

  navigator.clipboard
    .writeText(JSON.stringify(payload, null, 2))
    .then(() => showToast(t('toast_title'), t('toast_success')));
}

/** Calls addToClaude using the card currently open in the slide panel. */
function addToClaudeFromPanel() {
  if (_panelCard) addToClaude(_panelCard);
}

/**
 * Shows a floating toast notification.
 * @param {string} title - bold heading
 * @param {string} message - supporting text
 */
function showToast(title, message) {
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
    <span class="toast-icon" aria-hidden="true">🤖</span>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
    <button class="toast-close" onclick="document.getElementById('claudeToast').remove()" aria-label="Dismiss">×</button>
  `;
  document.body.appendChild(toast);

  /* Double rAF ensures the element is painted before transitioning */
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-visible')));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 400);
  }, 4500);
}

/* ── Slide-Over Panel ───────────────────────────────────────────── */

/** Tracks which card is currently shown in the slide panel. */
let _panelCard = null;

function openSkillPanel(triggerEl) {
  const card = triggerEl.closest('[data-title]') || triggerEl;
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

  /* Sync panel label text with current language */
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
    const orig = btn.textContent;
    btn.textContent = t('copied');
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

/* ── Global keyboard handler ────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSkillPanel();
});

/* ── Boot ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguage();
});
