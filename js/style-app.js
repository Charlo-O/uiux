// Configuration
const CONFIG = {
  itemsPerPage: 10,
  lazyLoadRootMargin: '250px'
};

// State
let state = {
  data: [],
  filteredData: [],
  currentPage: 1,
  currentFilterType: 'all',
  currentFilterProject: 'all'
};

const styleMapById = new Map(
  (typeof styleProjectMap !== 'undefined' ? styleProjectMap : []).map(item => [String(item.styleId), item])
);

const projectBySlug = new Map(
  (typeof pinnedProjects !== 'undefined' ? pinnedProjects : []).map(p => [p.slug, p])
);

function getStyleMap(styleId) {
  return styleMapById.get(String(styleId)) || null;
}

function initApp() {
  if (typeof stylesData === 'undefined') {
    console.error('stylesData not loaded');
    return;
  }

  state.data = stylesData;
  state.filteredData = [...stylesData];

  setupFilter();
  renderPage(1);
  setupPagination();
}

function createProjectFitHTML(item) {
  const map = getStyleMap(item.id);
  if (!map) return '';

  const p1 = map.primaryProject;
  const p2 = map.secondaryProject;

  const checklist = (map.optimizationChecklist || [])
    .map(line => `<li>${line}</li>`)
    .join('');

  const blocks = (map.recommendedBlocks || [])
    .map(block => `<li>${block}</li>`)
    .join('');

  return `
    <div class="project-fit-section">
      <div class="section-title">项目落地适配 (Project Fit)</div>
      <p class="project-rationale">${map.projectRationale || ''}</p>

      <div class="project-fit-grid">
        <a class="project-fit-card" href="${p1.url}" target="_blank" rel="noopener noreferrer">
          <div class="project-fit-label">主推荐项目</div>
          <h4>${p1.name}</h4>
          <p>${p1.positioning}</p>
          <div class="project-fit-repo">${p1.repo}</div>
        </a>
        <a class="project-fit-card secondary" href="${p2.url}" target="_blank" rel="noopener noreferrer">
          <div class="project-fit-label">次推荐项目</div>
          <h4>${p2.name}</h4>
          <p>${p2.positioning}</p>
          <div class="project-fit-repo">${p2.repo}</div>
        </a>
      </div>

      <div class="project-guides">
        <div>
          <h5>优化清单</h5>
          <ul>${checklist}</ul>
        </div>
        <div>
          <h5>建议模块</h5>
          <ul>${blocks}</ul>
        </div>
      </div>
    </div>
  `;
}

function createCardHTML(item) {
  let previewHTML = '';
  if (item.preview_url) {
    previewHTML = `
      <div class="preview-container">
        <iframe class="lazy-iframe" data-src="${item.preview_url}" title="${item.category} Preview"></iframe>
      </div>
      <div style="text-align: right;">
        <a href="${item.preview_url}" target="_blank" class="fullscreen-link">在新視窗開啟範例 ↗</a>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="card-header">
        <span class="style-type">${item.type}</span>
        <h2 class="card-title">
          ${item.category}
          <span class="zh-title">${item.category_zh}</span>
        </h2>
        <div class="keywords">${item.keywords}</div>
      </div>

      ${previewHTML}

      <div>
        <div class="section-title">視覺特徵 (Visual Characteristics)</div>
        <div class="content-block">
          <strong>主要顏色:</strong> ${item.visual.primary}<br>
          <strong>次要顏色:</strong> ${item.visual.secondary}<br>
          <strong>特效與動畫:</strong> ${item.visual.effects}
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric">
          <span class="metric-label">效能 (Performance)</span>
          <span class="metric-value">${item.metrics.performance}</span>
        </div>
        <div class="metric">
          <span class="metric-label">無障礙 (Accessibility)</span>
          <span class="metric-value">${item.metrics.accessibility}</span>
        </div>
        <div class="metric">
          <span class="metric-label">深色模式 (Dark Mode)</span>
          <span class="metric-value">${item.metrics.darkMode}</span>
        </div>
        <div class="metric">
          <span class="metric-label">複雜度 (Complexity)</span>
          <span class="metric-value">${item.metrics.complexity}</span>
        </div>
      </div>

      <div class="usage-section">
        <div class="usage-block">
          <h4 class="good-use">✓ 適用於 (Best For)</h4>
          <div class="usage-text">${item.usage.bestFor}</div>
        </div>
        <div class="usage-block">
          <h4 class="bad-use">✗ 不適用於 (Do Not Use For)</h4>
          <div class="usage-text">${item.usage.avoid}</div>
        </div>
      </div>

      ${createProjectFitHTML(item)}

      <div style="margin-top: 1.5rem; font-size: 0.85rem; color: #94a3b8;">
        <strong>框架相容性:</strong> ${item.meta.frameworks} <br>
        <strong>年代/起源:</strong> ${item.meta.era}
      </div>
    </div>
  `;
}

function applyFiltersAndRender() {
  state.filteredData = state.data.filter(item => {
    const typePass = state.currentFilterType === 'all' || item.type === state.currentFilterType;

    if (!typePass) return false;
    if (state.currentFilterProject === 'all') return true;

    const map = getStyleMap(item.id);
    if (!map) return false;

    return (
      map.primaryProject?.slug === state.currentFilterProject ||
      map.secondaryProject?.slug === state.currentFilterProject
    );
  });

  renderPage(1);
}

function setupFilter() {
  const filterContainer = document.getElementById('filter-container');
  if (!filterContainer) return;

  const categoryCounts = {};
  state.data.forEach(item => {
    if (item.type) categoryCounts[item.type] = (categoryCounts[item.type] || 0) + 1;
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'multi-filter-wrap';

  const typeLabel = document.createElement('label');
  typeLabel.className = 'filter-label';
  typeLabel.textContent = '风格分类: ';

  const typeSelect = document.createElement('select');
  typeSelect.className = 'style-filter';
  typeSelect.innerHTML = `<option value="all">全部分類 (${state.data.length})</option>`;
  Object.keys(categoryCounts)
    .sort()
    .forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${cat} (${categoryCounts[cat]})`;
      typeSelect.appendChild(opt);
    });

  typeSelect.addEventListener('change', e => {
    state.currentFilterType = e.target.value;
    applyFiltersAndRender();
  });

  const projectLabel = document.createElement('label');
  projectLabel.className = 'filter-label';
  projectLabel.textContent = '绑定项目: ';

  const projectSelect = document.createElement('select');
  projectSelect.className = 'style-filter';
  projectSelect.innerHTML = '<option value="all">全部项目</option>';

  (typeof pinnedProjects !== 'undefined' ? pinnedProjects : []).forEach(project => {
    const opt = document.createElement('option');
    opt.value = project.slug;
    opt.textContent = `${project.name} (${project.repo})`;
    projectSelect.appendChild(opt);
  });

  projectSelect.addEventListener('change', e => {
    state.currentFilterProject = e.target.value;
    applyFiltersAndRender();
  });

  const left = document.createElement('div');
  left.className = 'filter-control-group';
  left.appendChild(typeLabel);
  left.appendChild(typeSelect);

  const right = document.createElement('div');
  right.className = 'filter-control-group';
  right.appendChild(projectLabel);
  right.appendChild(projectSelect);

  wrapper.appendChild(left);
  wrapper.appendChild(right);

  filterContainer.innerHTML = '';
  filterContainer.appendChild(wrapper);
}

function renderPage(page) {
  state.currentPage = page;

  const start = (page - 1) * CONFIG.itemsPerPage;
  const end = start + CONFIG.itemsPerPage;
  const pageItems = state.filteredData.slice(start, end);

  const grid = document.querySelector('.grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (pageItems.length === 0) {
    grid.innerHTML = '<p style="text-align:center; width:100%; color:#64748b;">沒有找到符合條件的風格。</p>';
    updatePaginationUI();
    return;
  }

  pageItems.forEach(item => {
    grid.insertAdjacentHTML('beforeend', createCardHTML(item));
  });

  observeIframes();
  updatePaginationUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupPagination() {
  let container = document.getElementById('pagination-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pagination-container';
    container.className = 'pagination';
    const grid = document.querySelector('.grid');
    grid.parentNode.insertBefore(container, grid.nextSibling);
  }
}

function updatePaginationUI() {
  const container = document.getElementById('pagination-container');
  if (!container) return;

  const totalPages = Math.ceil(state.filteredData.length / CONFIG.itemsPerPage);

  let html = '';
  if (state.currentPage > 1) {
    html += `<button onclick="renderPage(${state.currentPage - 1})" class="page-btn">上一頁</button>`;
  } else {
    html += '<button disabled class="page-btn disabled">上一頁</button>';
  }

  html += `<span class="page-info">第 ${state.currentPage} 頁 / 共 ${totalPages || 1} 頁</span>`;

  if (state.currentPage < totalPages) {
    html += `<button onclick="renderPage(${state.currentPage + 1})" class="page-btn">下一頁</button>`;
  } else {
    html += '<button disabled class="page-btn disabled">下一頁</button>';
  }

  container.innerHTML = html;
}

window.renderPage = renderPage;

function observeIframes() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          const src = iframe.getAttribute('data-src');
          if (src) {
            iframe.src = src;
            iframe.removeAttribute('data-src');
          }
          obs.unobserve(iframe);
        }
      });
    },
    { rootMargin: CONFIG.lazyLoadRootMargin }
  );

  document.querySelectorAll('iframe.lazy-iframe').forEach(iframe => observer.observe(iframe));
}

document.addEventListener('DOMContentLoaded', initApp);
