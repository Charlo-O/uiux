(function () {
  if (typeof styleProjectMap === 'undefined') return;

  const match = window.location.pathname.match(/(\d{2})-[^/]+\.html$/);
  if (!match) return;

  const id = String(Number(match[1]));
  const map = styleProjectMap.find(m => String(m.styleId) === id);
  if (!map) return;

  const style = document.createElement('style');
  style.textContent = `
    .ref-project-wrap { padding: 56px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .ref-project-inner { max-width: 1120px; margin: 0 auto; }
    .ref-project-title { font-size: 24px; margin: 0 0 8px; color: #0f172a; }
    .ref-project-sub { margin: 0 0 18px; color: #475569; line-height: 1.6; }
    .ref-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; margin-bottom: 16px; }
    .ref-project-card { background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; text-decoration: none; color: #0f172a; }
    .ref-project-card:hover { border-color: #2563eb; }
    .ref-project-card .tag { display: inline-block; font-size: 11px; color: #1d4ed8; background: #dbeafe; border-radius: 999px; padding: 2px 8px; margin-bottom: 6px; }
    .ref-project-card h4 { margin: 0 0 5px; font-size: 16px; }
    .ref-project-card p { margin: 0; color: #475569; font-size: 13px; }
    .ref-project-list-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ref-project-list-wrap h5 { margin: 0 0 8px; font-size: 13px; color: #1e3a8a; letter-spacing: .04em; text-transform: uppercase; }
    .ref-project-list-wrap ul { margin: 0; padding-left: 18px; color: #334155; font-size: 14px; line-height: 1.55; }
    .ref-project-list-wrap li { margin-bottom: 5px; }
    @media (max-width: 860px) {
      .ref-project-grid, .ref-project-list-wrap { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  const checklist = (map.optimizationChecklist || []).map(i => `<li>${i}</li>`).join('');
  const blocks = (map.recommendedBlocks || []).map(i => `<li>${i}</li>`).join('');

  const section = document.createElement('section');
  section.className = 'ref-project-wrap';
  section.innerHTML = `
    <div class="ref-project-inner">
      <h3 class="ref-project-title">项目落地优化建议（UIUX Pro Max）</h3>
      <p class="ref-project-sub">${map.projectRationale || ''}</p>
      <div class="ref-project-grid">
        <a class="ref-project-card" href="${map.primaryProject.url}" target="_blank" rel="noopener noreferrer">
          <span class="tag">主推荐项目</span>
          <h4>${map.primaryProject.name}</h4>
          <p>${map.primaryProject.positioning}</p>
        </a>
        <a class="ref-project-card" href="${map.secondaryProject.url}" target="_blank" rel="noopener noreferrer">
          <span class="tag">次推荐项目</span>
          <h4>${map.secondaryProject.name}</h4>
          <p>${map.secondaryProject.positioning}</p>
        </a>
      </div>
      <div class="ref-project-list-wrap">
        <div>
          <h5>详细优化清单</h5>
          <ul>${checklist}</ul>
        </div>
        <div>
          <h5>建议模块结构</h5>
          <ul>${blocks}</ul>
        </div>
      </div>
    </div>
  `;

  const footer = document.querySelector('footer');
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(section, footer);
  } else {
    document.body.appendChild(section);
  }
})();
