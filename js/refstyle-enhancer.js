(function () {
  if (typeof styleProjectMap === 'undefined') return;

  const match = window.location.pathname.match(/(\d{2})-[^/]+\.html$/);
  if (!match) return;

  const id = String(Number(match[1]));
  const map = styleProjectMap.find(m => String(m.styleId) === id);
  if (!map) return;

  const panelId = `refx-panel-${id}`;
  const triggerId = `refx-trigger-${id}`;

  const style = document.createElement('style');
  style.textContent = `
    .refx-trigger {
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 9999;
      border: 1px solid rgba(255,255,255,0.25);
      background: rgba(15, 23, 42, 0.72);
      color: #fff;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      backdrop-filter: blur(8px);
      cursor: pointer;
      box-shadow: 0 8px 22px rgba(0,0,0,0.25);
    }

    .refx-panel {
      position: fixed;
      right: 12px;
      bottom: 54px;
      z-index: 9999;
      width: min(360px, calc(100vw - 24px));
      max-height: min(68vh, 520px);
      overflow: auto;
      border-radius: 14px;
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: rgba(15, 23, 42, 0.94);
      color: #e2e8f0;
      padding: 12px 12px 10px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.4);
      display: none;
    }

    .refx-panel.open { display: block; }

    .refx-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
    }

    .refx-sub {
      margin: 6px 0 10px;
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .refx-projects {
      display: grid;
      gap: 8px;
      margin-bottom: 10px;
    }

    .refx-project {
      border: 1px solid rgba(100, 116, 139, 0.5);
      border-radius: 10px;
      padding: 8px;
      background: rgba(30, 41, 59, 0.7);
      font-size: 12px;
      line-height: 1.4;
    }

    .refx-project .tag {
      display: inline-block;
      margin-bottom: 4px;
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 11px;
      color: #0f172a;
      background: #bfdbfe;
      font-weight: 700;
    }

    .refx-project a {
      color: #93c5fd;
      text-decoration: none;
      font-weight: 600;
    }

    .refx-project a:hover { text-decoration: underline; }

    .refx-h {
      margin: 10px 0 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #c7d2fe;
    }

    .refx-list {
      margin: 0;
      padding-left: 18px;
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .refx-list li { margin-bottom: 4px; }

    @media (max-width: 640px) {
      .refx-trigger { bottom: 10px; right: 10px; }
      .refx-panel { right: 10px; bottom: 50px; }
    }
  `;
  document.head.appendChild(style);

  const checklist = (map.optimizationChecklist || []).slice(0, 3);
  const blocks = (map.recommendedBlocks || []).slice(0, 3);

  const panel = document.createElement('aside');
  panel.id = panelId;
  panel.className = 'refx-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <h3 class="refx-title">项目增强建议（不改变风格主体）</h3>
    <p class="refx-sub">${map.projectRationale || ''}</p>

    <div class="refx-projects">
      <div class="refx-project">
        <span class="tag">主项目</span><br/>
        <a href="${map.primaryProject.url}" target="_blank" rel="noopener noreferrer">${map.primaryProject.name}</a>
        <div>${map.primaryProject.positioning || ''}</div>
      </div>
      <div class="refx-project">
        <span class="tag">辅助项目</span><br/>
        <a href="${map.secondaryProject.url}" target="_blank" rel="noopener noreferrer">${map.secondaryProject.name}</a>
        <div>${map.secondaryProject.positioning || ''}</div>
      </div>
    </div>

    <div class="refx-h">页面增强点</div>
    <ul class="refx-list">${checklist.map(i => `<li>${i}</li>`).join('')}</ul>

    <div class="refx-h">建议补充模块</div>
    <ul class="refx-list">${blocks.map(i => `<li>${i}</li>`).join('')}</ul>
  `;

  const trigger = document.createElement('button');
  trigger.id = triggerId;
  trigger.className = 'refx-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-controls', panelId);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.textContent = '项目增强';

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
  }

  trigger.addEventListener('click', () => {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });

  document.body.appendChild(panel);
  document.body.appendChild(trigger);
})();
