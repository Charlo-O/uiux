(function () {
  if (typeof styleProjectMap === 'undefined') return;

  const mapById = new Map(styleProjectMap.map(m => [String(m.styleId).padStart(2, '0'), m]));
  const cards = Array.from(document.querySelectorAll('article.card'));
  if (!cards.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .gallery-project-chip-wrap { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
    .gallery-project-chip { font-size: 11px; color: #8ec5ff; border: 1px solid #355070; border-radius: 999px; padding: 2px 8px; }
  `;
  document.head.appendChild(style);

  cards.forEach(card => {
    const nameEl = card.querySelector('.name');
    if (!nameEl) return;
    const m = nameEl.textContent.trim().match(/^(\d{2})\./);
    if (!m) return;

    const id = m[1];
    const map = mapById.get(id);
    if (!map) return;

    const wrap = document.createElement('div');
    wrap.className = 'gallery-project-chip-wrap';
    wrap.innerHTML = `
      <span class="gallery-project-chip">${map.primaryProject.name}</span>
      <span class="gallery-project-chip">${map.secondaryProject.name}</span>
    `;

    const body = card.querySelector('.body');
    body.appendChild(wrap);
  });
})();
