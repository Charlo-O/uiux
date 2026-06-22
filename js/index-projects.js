(function () {
  const container = document.getElementById('home-project-grid');
  if (!container) return;

  const projects = typeof pinnedProjects !== 'undefined' ? pinnedProjects : [];
  const maps = typeof styleProjectMap !== 'undefined' ? styleProjectMap : [];
  const styles = typeof stylesData !== 'undefined' ? stylesData : [];
  const styleById = new Map(styles.map(s => [String(s.id), s]));

  function getTopStylesForProject(slug, max = 4) {
    const matched = maps
      .filter(m => m.primaryProject?.slug === slug || m.secondaryProject?.slug === slug)
      .slice(0, max);

    return matched
      .map(m => styleById.get(String(m.styleId)))
      .filter(Boolean);
  }

  container.innerHTML = projects
    .map(project => {
      const topStyles = getTopStylesForProject(project.slug, 4);
      const chips = topStyles
        .map(
          s => `<a class="home-style-chip" href="${s.preview_url}" target="_blank" rel="noopener noreferrer">#${String(
            s.id
          ).padStart(2, '0')} ${s.category}</a>`
        )
        .join('');

      return `
        <article class="home-project-card">
          <div class="home-project-head">
            <h3>${project.name}</h3>
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.repo} ↗</a>
          </div>
          <p class="home-project-positioning">${project.positioning || ''}</p>
          <p class="home-project-desc">${project.description || ''}</p>

          <div class="home-project-row">
            <span class="home-row-label">核心场景</span>
            <div class="home-tags">
              ${(project.scenarios || []).map(t => `<span>${t}</span>`).join('')}
            </div>
          </div>

          <div class="home-project-row">
            <span class="home-row-label">建议风格</span>
            <div class="home-style-chips">${chips}</div>
          </div>
        </article>
      `;
    })
    .join('');
})();
