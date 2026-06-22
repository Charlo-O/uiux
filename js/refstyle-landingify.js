(function () {
  if (
    typeof styleProjectMap === 'undefined' ||
    typeof projectRealContent === 'undefined' ||
    typeof stylesData === 'undefined'
  ) {
    return;
  }

  const pageMatch = window.location.pathname.match(/(\d{2})-[^/]+\.html$/);
  if (!pageMatch) return;

  const styleId = String(Number(pageMatch[1]));
  const map = styleProjectMap.find(m => String(m.styleId) === styleId);
  const style = stylesData.find(s => String(s.id) === styleId);
  if (!map || !style) return;

  const project =
    projectRealContent.find(p => p.slug === map.primaryProject?.slug) ||
    projectRealContent.find(p => p.slug === map.secondaryProject?.slug);
  if (!project) return;

  const pageSignature = `landingify-${styleId}`;
  if (document.body.dataset.landingified === pageSignature) return;
  document.body.dataset.landingified = pageSignature;

  const features = (project.features || []).slice(0, 6);
  const featureTitles = features.map(f => {
    const t = f.replace(/[：:，,].*$/, '').trim();
    return t.length > 28 ? t.slice(0, 28) + '…' : t;
  });

  function setText(el, text) {
    if (!el || !text) return;
    el.textContent = text;
  }

  function findLeadParagraph(h1) {
    if (!h1) return null;
    const sec = h1.closest('section,div') || document.body;
    const ps = Array.from(sec.querySelectorAll('p'));
    return ps.find(p => p.textContent.trim().length > 0) || null;
  }

  // 1) Title / Nav / Hero
  document.title = `${project.name} · ${style.category} Landing`;

  const nav = document.querySelector('nav');
  if (nav) {
    const spans = Array.from(nav.querySelectorAll('span'));
    if (spans[0]) setText(spans[0], `#${String(style.id).padStart(2, '0')} ${project.name}`);
    if (spans[1]) setText(spans[1], style.type || 'Landing');

    const back = nav.querySelector('a');
    if (back) {
      back.setAttribute('href', '../index.html');
      if (/back/i.test(back.textContent)) back.textContent = '← Back';
    }
  }

  let h1 = document.querySelector('h1');
  if (!h1) {
    h1 = Array.from(document.querySelectorAll('h2, h3')).find(
      h => !h.closest('nav') && !h.closest('footer') && !h.closest('.refx-panel')
    ) || null;
  }
  if (h1) {
    setText(h1, project.name);
    h1.setAttribute('data-landing-hero', '1');
  }

  const leadP = findLeadParagraph(h1);
  if (leadP) setText(leadP, project.summary || project.description || '');

  // 2) Convert early feature blocks into real feature copy
  const headings = Array.from(document.querySelectorAll('h2, h3, h4')).filter(h => {
    if (h.closest('nav') || h.closest('footer') || h.closest('.refx-panel')) return false;
    if (h.getAttribute('data-landing-hero') === '1') return false;
    const txt = h.textContent.trim();
    if (!txt) return false;
    return true;
  });

  let fi = 0;
  for (const h of headings) {
    if (fi >= featureTitles.length) break;
    const oldText = h.textContent.trim().toLowerCase();
    // 保留“Best For / Characteristics”等风格信息区，不覆盖
    if (
      oldText.includes('best for') ||
      oldText.includes('characteristics') ||
      oldText.includes('color palette') ||
      oldText.includes('components')
    ) {
      continue;
    }

    h.textContent = featureTitles[fi];

    const parent = h.parentElement;
    if (parent) {
      const p = Array.from(parent.querySelectorAll('p')).find(x => x.textContent.trim().length > 0);
      if (p) p.textContent = features[fi];
    }
    fi += 1;
  }

  // 3) Replace first two unordered lists with project-grounded items
  const lists = Array.from(document.querySelectorAll('ul')).filter(
    ul => !ul.closest('nav') && !ul.closest('.refx-panel')
  );

  const listPayloadA = features.slice(0, 5);
  const listPayloadB = [
    `技术栈：${(project.techStack || []).join(' / ') || project.primaryLanguage || 'N/A'}`,
    `项目状态：${project.status === 'active' ? '持续活跃' : project.status === 'stable' ? '稳定维护' : '维护模式'}`,
    `仓库数据：⭐ ${project.stars || 0} · Fork ${project.forks || 0}`,
    ...(map.recommendedBlocks || []).slice(0, 2)
  ];

  [listPayloadA, listPayloadB].forEach((payload, idx) => {
    const ul = lists[idx];
    if (!ul || !payload.length) return;
    ul.innerHTML = payload.map(item => `<li>${item}</li>`).join('');
  });

  // 4) Update primary CTA links/buttons where possible
  const clickable = Array.from(document.querySelectorAll('a, button')).filter(el => {
    if (el.closest('nav') || el.closest('footer') || el.closest('.refx-panel')) return false;
    const txt = el.textContent.trim();
    return txt.length > 0;
  });

  let ctaSet = 0;
  for (const el of clickable) {
    if (ctaSet === 0) {
      el.textContent = `查看 ${project.name} 仓库`;
      if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', project.url);
      ctaSet++;
    } else if (ctaSet === 1) {
      el.textContent = '查看 README 与完整说明';
      if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', `${project.url}#readme`);
      ctaSet++;
    } else {
      break;
    }
  }

  // 5) Add a concise project landing block (style-first, content-enriched)
  if (!document.getElementById('ref-landing-bridge')) {
    const bridge = document.createElement('section');
    bridge.id = 'ref-landing-bridge';
    bridge.innerHTML = `
      <div class="ref-landing-bridge-inner">
        <div class="ref-landing-badge">${style.category} · ${style.category_zh}</div>
        <h2>这是「${project.name}」的 ${style.category} 风格落地页</h2>
        <p>${project.description || project.summary || ''}</p>
        <div class="ref-landing-meta">
          <span>⭐ ${project.stars || 0}</span>
          <span>Fork ${project.forks || 0}</span>
          <span>${(project.techStack || []).slice(0, 3).join(' / ') || project.primaryLanguage || ''}</span>
        </div>
      </div>
    `;

    const st = document.createElement('style');
    st.textContent = `
      #ref-landing-bridge {
        margin: 32px auto;
        width: min(1100px, calc(100% - 24px));
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.22);
        background: rgba(15,23,42,0.28);
        backdrop-filter: blur(10px);
      }
      .ref-landing-bridge-inner { padding: 18px 16px; color: #e2e8f0; }
      .ref-landing-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 12px;
        border: 1px solid rgba(255,255,255,0.26);
        margin-bottom: 8px;
      }
      #ref-landing-bridge h2 { margin: 0 0 6px; font-size: 22px; line-height: 1.3; }
      #ref-landing-bridge p { margin: 0; font-size: 14px; opacity: 0.95; line-height: 1.6; }
      .ref-landing-meta { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
      .ref-landing-meta span {
        display: inline-block;
        font-size: 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 2px 9px;
      }
    `;
    document.head.appendChild(st);

    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(bridge, footer);
    } else {
      document.body.appendChild(bridge);
    }
  }
})();
