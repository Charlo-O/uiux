(function () {
  const header = document.querySelector('header');
  if (!header || typeof pinnedProjects === 'undefined' || typeof colorsData === 'undefined') return;

  const tokenMap = {
    framist: ['creative', 'agency', 'portfolio', 'gaming', 'media'],
    meetingai: ['saas', 'dashboard', 'educational', 'healthcare', 'app', 'service'],
    typefree: ['saas', 'micro', 'personal', 'portfolio', 'app'],
    'cyber-gu': ['gaming', 'fintech', 'crypto', 'creative', 'entertainment'],
    video2note: ['analytics', 'dashboard', 'media', 'educational', 'app'],
    carbo: ['portfolio', 'personal', 'service', 'government', 'public', 'saas']
  };

  function matchPalettes(projectSlug) {
    const tokens = tokenMap[projectSlug] || [];

    const scored = colorsData
      .map(item => {
        const hay = `${item.title} ${item.keywords}`.toLowerCase();
        let score = 0;
        tokens.forEach(t => {
          if (hay.includes(t)) score += 2;
        });
        if (hay.includes('dashboard') && (projectSlug === 'video2note' || projectSlug === 'meetingai')) score += 2;
        if (hay.includes('creative') && (projectSlug === 'framist' || projectSlug === 'cyber-gu')) score += 2;
        return { item, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(x => x.item);

    return scored;
  }

  const section = document.createElement('section');
  section.className = 'project-color-context';

  const cards = pinnedProjects
    .map(project => {
      const palettes = matchPalettes(project.slug);
      const paletteChips = palettes
        .map(
          p => `<span class="project-color-chip" title="${p.notes}">#${p.id} ${p.title}</span>`
        )
        .join('');

      return `
        <article class="project-color-card">
          <div class="project-color-head">
            <h3>${project.name}</h3>
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.repo} ↗</a>
          </div>
          <p class="project-color-positioning">${project.positioning || ''}</p>
          <div class="project-color-chip-wrap">${paletteChips || '<span class="project-color-chip">待补充调色板</span>'}</div>
        </article>
      `;
    })
    .join('');

  section.innerHTML = `
    <div class="project-color-title">
      <h2>项目配色落地建议</h2>
      <p>基于你的 pinned 项目语义自动匹配可直接使用的配色方案。</p>
    </div>
    <div class="project-color-grid">${cards}</div>
  `;

  header.insertAdjacentElement('afterend', section);
})();
