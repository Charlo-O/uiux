(function () {
  const projects = typeof pinnedProjects !== 'undefined' ? pinnedProjects : [];
  const styleMap = typeof styleProjectMap !== 'undefined' ? styleProjectMap : [];
  const styles = typeof stylesData !== 'undefined' ? stylesData : [];

  if (!projects.length || !styleMap.length || !styles.length) return;

  const styleById = new Map(styles.map(s => [String(s.id), s]));

  const projectProfiles = {
    meetingai: {
      tagline: '把会议录音直接转成可执行纪要与行动项。',
      audience: '团队协作 / 管理者 / 远程会议场景',
      objective: '缩短“开会→对齐→执行”链路，减少遗漏。',
      highlights: ['AI 实时转写', '结构化会议摘要', '任务项自动提取']
    },
    video2note: {
      tagline: '把长视频快速拆解成图文教程与关键时间点。',
      audience: '内容团队 / 运营 / 培训与教育',
      objective: '把知识型视频转成可复用文档资产。',
      highlights: ['字幕解析与打点', '关键帧自动截取', '图文教程一键生成']
    },
    carbo: {
      tagline: '面向创作者的 Markdown 写作与发布工作台。',
      audience: '开发者 / 写作者 / 内容创作团队',
      objective: '提升写作流畅度与最终发布质量。',
      highlights: ['结构化编辑', '可读性优先排版', '发布前内容校验']
    },
    framist: {
      tagline: '创意工作流中可组合的自动化与素材处理能力。',
      audience: '设计师 / 创意团队 / 实验型产品',
      objective: '把重复设计工作自动化，聚焦创意输出。',
      highlights: ['流程自动化', '素材预处理', '原型快速迭代']
    },
    typefree: {
      tagline: '轻量、专注、高效率的输入与内容处理体验。',
      audience: '高频输入用户 / 轻量工具用户',
      objective: '降低输入阻力，强化专注体验。',
      highlights: ['极简交互', '低认知负担', '高响应效率']
    },
    'cyber-gu': {
      tagline: '赛博美学驱动的实验性互动产品。',
      audience: '年轻用户 / 亚文化社区 / 视觉实验项目',
      objective: '打造高辨识度品牌气质与沉浸式互动。',
      highlights: ['赛博视觉语言', '世界观表达', '高记忆点交互']
    }
  };

  function getPrimaryStyles(projectSlug, limit = 2) {
    const ids = [];
    styleMap.forEach(item => {
      if (item.primaryProject?.slug === projectSlug && !ids.includes(item.styleId)) {
        ids.push(item.styleId);
      }
    });

    return ids.slice(0, limit).map(id => styleById.get(String(id))).filter(Boolean);
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

    const langCount = new Set(projects.map(p => p.primaryLanguage).filter(Boolean)).size;
    const totalRecommendations = styleMap.length;

    el.innerHTML = `
      <div class="metric-card"><strong>${projects.length}</strong><span>真实项目</span></div>
      <div class="metric-card"><strong>${styles.length}</strong><span>可用风格策略</span></div>
      <div class="metric-card"><strong>${totalRecommendations}</strong><span>项目-风格映射</span></div>
      <div class="metric-card"><strong>${langCount}</strong><span>技术栈语言</span></div>
    `;
  }

  function renderProjects() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    grid.innerHTML = projects
      .map(project => {
        const profile = projectProfiles[project.slug] || {
          tagline: project.positioning || '',
          audience: '项目目标用户',
          objective: '项目价值目标',
          highlights: project.scenarios || []
        };

        const styleChips = getPrimaryStyles(project.slug, 3)
          .map(styleLinkChip)
          .join('');

        const highlights = (profile.highlights || [])
          .map(item => `<li>${item}</li>`)
          .join('');

        return `
          <article class="project-card">
            <div class="project-top">
              <h3>${project.name}</h3>
              <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.repo} ↗</a>
            </div>
            <p class="project-tagline">${profile.tagline}</p>
            <p class="project-detail"><strong>目标用户：</strong>${profile.audience}</p>
            <p class="project-detail"><strong>业务目标：</strong>${profile.objective}</p>
            <ul class="project-list">${highlights}</ul>
            <div class="project-style-links">${styleChips}</div>
          </article>
        `;
      })
      .join('');
  }

  function renderCases() {
    const grid = document.getElementById('case-grid');
    if (!grid) return;

    const cards = [];

    projects.forEach(project => {
      const topStyles = getPrimaryStyles(project.slug, 2);
      topStyles.forEach(style => {
        cards.push({ project, style });
      });
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
              <p class="case-meta">${project.positioning || ''}</p>
              <div class="case-links">
                <a href="${project.url}" target="_blank" rel="noopener noreferrer">项目仓库</a>
                <a href="${style.preview_url}" target="_blank" rel="noopener noreferrer">风格案例</a>
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

    // 按项目提取一条最关键的 checklist，形成可执行任务
    const cards = projects.map(project => {
      const related = styleMap.find(m => m.primaryProject?.slug === project.slug) || styleMap.find(m => m.secondaryProject?.slug === project.slug);
      const checklist = related?.optimizationChecklist || [];
      const top = checklist.slice(0, 4).map(item => `<li>${item}</li>`).join('');

      return `
        <article class="exec-card">
          <h3>${project.name} · 页面改版优先项</h3>
          <ul>${top}</ul>
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
