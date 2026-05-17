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
