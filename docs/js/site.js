/** Mark active nav link for current page */
function initNavigation() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/** Copy text to clipboard with button feedback */
function copyAction(buttonElement, textToCopy) {
  navigator.clipboard.writeText(textToCopy).then(() => {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '✅ Copied!';
    buttonElement.style.background = '#dcfce7';
    buttonElement.style.color = '#166534';

    setTimeout(() => {
      buttonElement.innerHTML = originalText;
      buttonElement.style.background = '';
      buttonElement.style.color = '';
    }, 2000);
  });
}

/**
 * Initialize search filtering for a page's card grid.
 * @param {string} searchInputId
 * @param {string} gridId
 * @param {string} resultCountId
 * @param {string} [categoryFilterClass] - optional category checkbox class
 */
function initCardFilter(
  searchInputId,
  gridId,
  resultCountId,
  categoryFilterClass = 'category-filter',
) {
  const searchInput = document.getElementById(searchInputId);
  const grid = document.getElementById(gridId);
  const resultCount = document.getElementById(resultCountId);
  if (!searchInput || !grid || !resultCount) return;

  const cards = grid.querySelectorAll('.card');
  const categoryFilters = document.querySelectorAll(`.${categoryFilterClass}`);
  const itemLabel = resultCount.dataset.label || 'items';

  function filterCards() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeCategories = Array.from(categoryFilters)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    let visibleCount = 0;

    cards.forEach((card) => {
      const textToSearch = (card.getAttribute('data-search') || '').toLowerCase();
      const category = card.getAttribute('data-category') || '';
      const matchesSearch = !searchTerm || textToSearch.includes(searchTerm);
      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(category);

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    resultCount.textContent = `${visibleCount} ${itemLabel} found`;
  }

  searchInput.addEventListener('input', filterCards);
  categoryFilters.forEach((cb) => cb.addEventListener('change', filterCards));
  filterCards();
}

document.addEventListener('DOMContentLoaded', initNavigation);

/* ── Slide-Over Panel ──────────────────────────────────────────────── */

/**
 * Opens the slide-over detail panel, populating it from the card's data-* attributes.
 * @param {HTMLElement} triggerEl - any element inside (or the) .card element
 */
function openSkillPanel(triggerEl) {
  const card = triggerEl.closest('[data-title]') || triggerEl;
  const title   = card.dataset.title       || 'Details';
  const desc    = card.dataset.description || '';
  const command = card.dataset.command     || '';
  const prompt  = card.dataset.prompt      || '';

  document.getElementById('panelTitle').textContent = title;
  document.getElementById('panelDesc').textContent  = desc;

  const cmdEl      = document.getElementById('panelCommand');
  const cmdSection = document.getElementById('panelCommandSection');
  if (command) {
    cmdEl.textContent      = command;
    cmdSection.style.display = '';
  } else {
    cmdSection.style.display = 'none';
  }

  const codeSection = document.getElementById('panelCodeSection');
  const codeEl      = document.getElementById('panelCode');
  if (prompt) {
    codeEl.textContent        = prompt;
    codeSection.style.display = '';
  } else {
    codeSection.style.display = 'none';
  }

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
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

/* Close panel on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSkillPanel();
});
