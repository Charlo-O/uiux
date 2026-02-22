(function () {
  const pinned = typeof pinnedProjects !== 'undefined' ? pinnedProjects : [];
  const real = typeof projectRealContent !== 'undefined' ? projectRealContent : [];
  const styleMap = typeof styleProjectMap !== 'undefined' ? styleProjectMap : [];
  const styles = typeof stylesData !== 'undefined' ? stylesData : [];

  if (!real.length || !styleMap.length || !styles.length) return;

  const styleById = new Map(styles.map(s => [String(s.id), s]));
  const realBySlug = new Map(real.map(p => [p.slug, p]));

  // 保持与 pinned 顺序一致；若缺失则补到后面
  const orderedProjects = [];
  const used = new Set();
  pinned.forEach(p => {
    const rp = realBySlug.get(p.slug);
    if (rp) {
      orderedProjects.push({ ...p, ...rp });
      used.add(p.slug);
    }
  });
  real.forEach(rp => {
    if (!used.has(rp.slug)) orderedProjects.push(rp);
  });

  function formatDate(iso) {
    if (!iso) return '未知';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function statusText(status) {
    if (status === 'active') return '持续活跃';
    if (status === 'stable') return '稳定维护';
    if (status === 'maintenance') return '维护模式';
    return '状态未知';
  }

  function getPrimaryStyles(projectSlug, limit = 3) {
    const ids = [];
    styleMap.forEach(item => {
      if (item.primaryProject?.slug === projectSlug && !ids.includes(item.styleId)) {
        ids.push(item.styleId);
      }
    });
    return ids.slice(0, limit).map(id => styleById.get(String(id))).filter(Boolean);
  }

  function getRelatedStyleMap(projectSlug) {
    return (
      styleMap.find(m => m.primaryProject?.slug === projectSlug) ||
      styleMap.find(m => m.secondaryProject?.slug === projectSlug) ||
      null
    );
  }

  function styleLinkChip(style) {
    const label = `#${String(style.id).padStart(2, '0')} ${style.category}`;
    return `<a href="${style.preview_url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  function getImageForStyle(style) {
    if (!style?.preview_url) return '';
    const base = style.preview_url.split('/').pop().replace('.html', '');
    return `reference-images/${base}.png`;
  }

  function renderMetrics() {
    const el = document.getElementById('hero-metrics');
    if (!el) return;

    const totalStars = orderedProjects.reduce((acc, p) => acc + (p.stars || 0), 0);
    const langCount = new Set(
      orderedProjects.flatMap(p => (p.techStack || []).slice(0, 3)).filter(Boolean)
    ).size;

    el.innerHTML = `
      <div class="metric-card"><strong>${orderedProjects.length}</strong><span>真实项目（来自 GitHub）</span></div>
      <div class="metric-card"><strong>${totalStars}</strong><span>累计 Stars</span></div>
      <div class="metric-card"><strong>${styles.length}</strong><span>可适配设计风格</span></div>
      <div class="metric-card"><strong>${langCount}</strong><span>覆盖技术栈</span></div>
    `;
  }

  function renderProjects() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    grid.innerHTML = orderedProjects
      .map(project => {
        const topStyles = getPrimaryStyles(project.slug, 3).map(styleLinkChip).join('');
        const features = (project.features || []).slice(0, 4).map(f => `<li>${f}</li>`).join('');
        const stack = (project.techStack || [])
          .slice(0, 4)
          .map(t => `<span class="project-tech-chip">${t}</span>`)
          .join('');

        return `
          <article class="project-card">
            <div class="project-top">
              <h3>${project.name}</h3>
              <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.repo} ↗</a>
            </div>

            <p class="project-tagline">${project.summary || project.description || '暂无项目摘要'}</p>
            <p class="project-detail"><strong>项目描述：</strong>${project.description || '（仓库未填写描述）'}</p>
            <p class="project-detail"><strong>状态：</strong>${statusText(project.status)} · 最近更新 ${formatDate(project.updatedAt)}</p>
            <p class="project-detail"><strong>数据：</strong>⭐ ${project.stars || 0} · Fork ${project.forks || 0}</p>

            <div class="project-tech-row">${stack}</div>

            <ul class="project-list">${features}</ul>

            <div class="project-style-links">${topStyles}</div>
          </article>
        `;
      })
      .join('');
  }

  function renderCases() {
    const grid = document.getElementById('case-grid');
    if (!grid) return;

    const cards = [];

    orderedProjects.forEach(project => {
      const topStyles = getPrimaryStyles(project.slug, 2);
      topStyles.forEach(style => cards.push({ project, style }));
    });

    grid.innerHTML = cards
      .slice(0, 12)
      .map(({ project, style }) => {
        const img = getImageForStyle(style);
        return `
          <article class="case-card">
            <img src="${img}" alt="${project.name} - ${style.category}" />
            <div class="case-body">
              <h3 class="case-title">${project.name} × ${style.category}</h3>
              <p class="case-meta">${project.summary || project.description || ''}</p>
              <div class="case-links">
                <a href="${project.url}" target="_blank" rel="noopener noreferrer">项目仓库</a>
                <a href="${style.preview_url}" target="_blank" rel="noopener noreferrer">对应落地风格</a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderExecution() {
    const grid = document.getElementById('execution-grid');
    if (!grid) return;

    const cards = orderedProjects.map(project => {
      const related = getRelatedStyleMap(project.slug);
      const checklist = (related?.optimizationChecklist || []).slice(0, 3);
      const productTasks = (project.features || []).slice(0, 3).map(f => `把「${f}」转成页面可视化模块`);
      const all = [...productTasks, ...checklist].slice(0, 6);
      const list = all.map(item => `<li>${item}</li>`).join('');

      return `
        <article class="exec-card">
          <h3>${project.name} · 实际落地任务</h3>
          <ul>${list}</ul>
        </article>
      `;
    });

    grid.innerHTML = cards.join('');
  }

  renderMetrics();
  renderProjects();
  renderCases();
  renderExecution();
})();
