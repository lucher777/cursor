import { loadData } from './api.js';
import { formatUtils } from './tools.js';
import { DEFAULT_SORT_ORDERS, PANEL_CONFIG, EXCHANGES, TEMPLATES } from './staticData.js';

// 常量声明 --------------------------------------------------
const DOM_SELECTORS = {
  PANEL1: '.exchange-panel1',
  PANEL2: '.exchange-panel2',
  ARBITRAGE_COUNTS: ['#arbitrage1-count', '#arbitrage-count'],
  CONTAINERS: ['#exchang-4panel-container', '#exchang-1panel-container']
};

const PANEL_STATES = Array.from({ length: 2 }, () => ({
  data: [],
  hasMatchedLocalDB: false
}));

// DOM 元素引用 --------------------------------------------------
let panels = [null, null];

// 工具方法 -----------------------------------------------------
const domUtils = {
  clearContent: () => {
    document.querySelectorAll([...DOM_SELECTORS.ARBITRAGE_COUNTS, ...DOM_SELECTORS.CONTAINERS].join(','))
      .forEach(el => el.textContent = '');
  },

  setLoading: (panel, state) => panel?.classList.toggle('loading', state),

  updateStatus: (text) => {
    document.getElementById('fetch-status').textContent = text;
  }
};

// 模板引擎 -----------------------------------------------------
const templateEngine = {
  symbolCell: ({symbol, icon}) => `
    <div class="flex items-center space-x-2">
      <div style="${icon ? `background-image:url('${icon}')` : 'background-color:#e0e0e0'};
        width:20px;height:20px;border-radius:50%;background-size:contain;">
      </div>
      <span>${symbol}</span>
    </div>`,

  priceCell: ({value, compareValue, link, vol}) => `
    <a href="${link}" target="_blank" class="${value > compareValue ? 'price-high' : 'price-low'}">
      $${value} ${value > compareValue ? '↑' : '↓'}
      ${vol ? `<span class="vol-display">${formatUtils.formatVolume(vol)}</span>` : ''}
    </a>`,

  tableRow: (cells) => `<tr>${cells.join('')}</tr>`
};

// 面板管理 -----------------------------------------------------
const panelManager = {
  initPanels: () => {
    panels = [document.querySelector(DOM_SELECTORS.PANEL1), document.querySelector(DOM_SELECTORS.PANEL2)];
    return Object.fromEntries(
      Object.entries(PANEL_CONFIG).map(([id, config]) => [
        id,
        id <= 2 ? {
          title: document.querySelector(config.titleSelector),
          count: document.querySelector(config.countSelector),
          rows: document.querySelector(config.rowsSelector),
          data: []
        } : {
          searchInput: document.getElementById(config.searchId),
          rows: document.getElementById(config.rowsId),
          data: []
        }
      ])
    );
  },

  updateSinglePanel: async (panelId, data) => {
    const panel = PANEL_MAP[panelId];
    PANEL_STATES[panelId - 1].data = data;
    
    domUtils.setLoading(panels[panelId - 1], true);
    panel.count.textContent = `交易对数量: ${data.length}`;

    const rowsHTML = data.map(item => templateEngine.tableRow([
      `<td>${templateEngine.symbolCell(item)}</td>`,
      `<td><a href="${item.priceLink}" target="_blank">
        $${formatUtils.removeTrailingZeros(item.price)}
      </a></td>`
    ])).join('');

    panel.rows.innerHTML = rowsHTML;
    domUtils.setLoading(panels[panelId - 1], false);

    if (panelId === 1) {
        setTimeout(() => comparisonRenderer.displayComparison4(data), 100);
    }
  },

  handleSort: (panelId, column) => {
    const currentOrder = DEFAULT_SORT_ORDERS[panelId][column];
    DEFAULT_SORT_ORDERS[panelId][column] = currentOrder === 'asc' ? 'desc' : 'asc';
    panelManager.sortTable(panelId, column, DEFAULT_SORT_ORDERS[panelId][column]);
  },

  sortTable: (panelId, column, direction) => {
    const tbody = PANEL_MAP[panelId].rows.querySelector('tbody');
    const sortedRows = [...tbody.rows].sort((a, b) => {
      const aVal = parseFloat(a.cells[column].dataset.value) || 0;
      const bVal = parseFloat(b.cells[column].dataset.value) || 0;
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    tbody.replaceChildren(...sortedRows);
  }
};

// 核心业务逻辑 -------------------------------------------------
const comparisonRenderer = {
  displayComparison4: (pairs) => {
    domUtils.setLoading(panels[1], true);
    
    const combinations = formatUtils.findTriangularArbitrageOpportunities(pairs, true)
      .filter(c => Math.abs(c.paths.path1?.return || 0) >= formatUtils.MIN_RETURN);

    document.getElementById('arbitrage-count').textContent = 
      `当前套利组合：${combinations.length}个`;

    const container = document.getElementById('exchang-4panel-container');
    container.innerHTML = combinations.length ? 
      combinations.map(comparisonRenderer.generateCombinationRow).join('') : 
      TEMPLATES.emptyState();

    domUtils.setLoading(panels[1], false);
  },

  generateCombinationRow: (c, i) => {
    const tradingSteps = c.list.map(t => t?.symbolLink ? `
      <td class="trading-step">
        <div class="pair-symbol">
          <a href="${t.symbolLink}" target="_blank">${t.symbol}</a>
          <span>（${t.price || '-'}）</span>
        </div>
      </td>` : '').join('');

    const paths = Object.entries(c.paths).map(([key, value]) => value?.key ? `
      <td class="arbitrage-path">
        <div class="path-container">${value.key}</div>
      </td>
      <td class="profit-cell" data-value="${value.return}">
        <div class="profit-value">${(value.return * 100).toFixed(4)}%</div>
      </td>` : '').join('');

    return templateEngine.tableRow([
      `<td class="row-index">${i + 1}</td>`,
      tradingSteps,
      paths,
      `<td class="action-cell">
        <div class="full-open-btn" 
             onclick="toggleAllLinks(this)"
             data-links="${c.list.map(t => t.symbolLink).join(',')}"
             data-state="closed">
          全开
        </div>
      </td>`
    ]);
  }
};

// 事件处理 -----------------------------------------------------
const eventHandlers = {
  createRadioHandler: (panelId) => async (e) => {
    const ex = EXCHANGES[e.target.value];
    domUtils.clearContent();
    panels.forEach(p => domUtils.setLoading(p, true));

    try {
      domUtils.updateStatus(`正在加载 ${ex.name} 数据...`);
      const data = await loadData(e.target.value);
      await panelManager.updateSinglePanel(panelId, data);
      domUtils.updateStatus(`面板更新完成`);
    } catch (error) {
      PANEL_MAP[panelId].rows.innerHTML = TEMPLATES.errorState();
      domUtils.updateStatus(`加载失败: ${error.message}`);
    }
  },

  handleRefresh: async () => {
    domUtils.clearContent();
    panels.forEach(p => domUtils.setLoading(p, true));

    const tasks = [1, 2].map(panelId => {
      const radio = document.querySelector(`input[name="exchange${panelId}"]:checked`);
      if (!radio) return null;

      const ex = EXCHANGES[radio.value];
      return async () => {
        try {
          domUtils.updateStatus(`正在刷新交易所${panelId} (${ex.name}) 数据...`);
          const data = await loadData(radio.value);
          await panelManager.updateSinglePanel(panelId, data);
          domUtils.updateStatus(`交易所${panelId} (${ex.name}) 刷新完成`);
        } catch (error) {
          domUtils.updateStatus(`刷新失败: ${error.message}`);
        }
      };
    }).filter(Boolean);

    await Promise.all(tasks.map(task => task()));
  }
};

// 初始化 -------------------------------------------------------
const PANEL_MAP = panelManager.initPanels();

function init() {
  // 交易所单选框初始化
  [1, 2].forEach(panelId => {
    const container = document.querySelector(`[data-panel="${panelId}"] .exchange-radios div`);
    const fragment = document.createDocumentFragment();

    Object.values(EXCHANGES).forEach(ex => {
      const radioTemplate = document.getElementById('exchange-radio-template').content.cloneNode(true);
      const [input, span] = radioTemplate.querySelectorAll('input, span');
      input.name = `exchange${panelId}`;
      input.value = ex.id;
      span.textContent = ex.name;
      input.addEventListener('change', eventHandlers.createRadioHandler(panelId));
      fragment.appendChild(radioTemplate);
    });

    container?.appendChild(fragment);
  });

  // 排序事件绑定
  document.querySelectorAll('.arbitrage-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const [panelId, column] = th.dataset.sort.split('-');
      panelManager.handleSort(parseInt(panelId), column);
    });
  });
}

// ...（前面代码保持不变）...

// 在模块顶层直接定义函数（保持原有实现）
let openedWindows = [];
function toggleAllLinks(button) {
  const links = button.dataset.links.split(',');
  const isOpen = button.dataset.state === 'open';

  // 关闭所有窗口
  if (isOpen) {
    openedWindows.filter(w => !w.closed).forEach(w => w.close());
    openedWindows = [];
    button.dataset.state = 'closed';
    button.textContent = '全开';
    button.classList.remove('red-bg');
  }
  // 打开新窗口
  else {
    openedWindows = links.map(link => window.open(link, '_blank')).filter(w => w);
    button.dataset.state = 'open';
    button.textContent = '全关';
    button.classList.add('red-bg');
  }
}

// 创建导出接口的中间变量
const updatePanel = panelManager.updateSinglePanel;
const toggleSort = panelManager.handleSort;
const refreshPanels = eventHandlers.handleRefresh;

// 导出接口 -----------------------------------------------------
export {
  init,
  updatePanel,
  toggleSort,
  toggleAllLinks,
  refreshPanels
};