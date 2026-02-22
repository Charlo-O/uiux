(function () {
  if (typeof pinnedProjects === 'undefined') return;
  const header = document.querySelector('header');
  const grid = document.querySelector('.grid');
  if (!header || !grid) return;

  const style = document.createElement('style');
  style.textContent = `
    .project-icons-context { max-width: 1400px; margin: 0 auto 1.5rem; }
    .project-icons-context h2 { margin: 0; font-size: 1.35rem; }
    .project-icons-context p { margin: 0.4rem 0 0.9rem; color: #64748b; }
    .project-icons-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem; }
    .project-icons-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.8rem; }
    .project-icons-card h3 { margin: 0; font-size: 1rem; }
    .project-icons-card .repo { display: inline-block; margin-top: 0.2rem; font-size: 0.78rem; color: #2563eb; text-decoration: none; }
    .project-icons-card .hint { margin: 0.35rem 0 0.45rem; font-size: 0.82rem; color: #475569; }
    .icon-token-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .icon-token { font-size: 0.75rem; background: #f1f5f9; border: 1px solid #e2e8f0; color: #334155; border-radius: 999px; padding: 0.16rem 0.45rem; }
  `;
  document.head.appendChild(style);

  const tokenMap = {
    framist: ['image', 'layers', 'wand', 'sparkles', 'sliders', 'palette'],
    meetingai: ['mic', 'calendar', 'clock', 'file-text', 'check-circle', 'users'],
    typefree: ['type', 'keyboard', 'edit', 'book-open', 'save', 'search'],
    'cyber-gu': ['zap', 'cpu', 'shield', 'radio', 'terminal', 'hexagon'],
    video2note: ['video', 'scissors', 'file-output', 'captions', 'timer', 'bar-chart'],
    carbo: ['file-text', 'book-open', 'hash', 'list', 'heading', 'folder-open']
  };

  const cards = pinnedProjects
    .map(p => {
      const tokens = (tokenMap[p.slug] || []).map(t => `<span class="icon-token">${t}</span>`).join('');
      return `
        <article class="project-icons-card">
          <h3>${p.name}</h3>
          <a class="repo" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.repo} ↗</a>
          <p class="hint">建议图标语义：围绕项目核心任务优先布局，减少“图标好看但语义不准”的问题。</p>
          <div class="icon-token-list">${tokens}</div>
        </article>
      `;
    })
    .join('');

  const section = document.createElement('section');
  section.className = 'project-icons-context';
  section.innerHTML = `
    <h2>项目图标语义优化建议</h2>
    <p>根据你的 pinned 项目给出优先图标语义集，方便把图标库从“展示”升级到“可落地设计系统”。</p>
    <div class="project-icons-grid">${cards}</div>
  `;

  grid.parentNode.insertBefore(section, grid);
})();
