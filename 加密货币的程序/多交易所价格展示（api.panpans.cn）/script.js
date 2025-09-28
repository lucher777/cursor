import { loadData, findSamePairs } from './api.js';
import { formatUtils } from './tools.js';
import { CONFIG } from './config.js';
import {
    DEFAULT_SORT_ORDERS,
    PANEL_CONFIG,
    EXCHANGES,
    TEMPLATES,
} from './staticData.js';
import FILTER_MANAGER from './filterManager.js';
import { get7500DataFromDB } from './coingecko_fetcher.js';

// 初始化应用状态
const appState = {
    ...CONFIG.DEFAULT_APP_STATE,
    ...JSON.parse(sessionStorage.getItem('appState'))
};

let EXSHOPS = [
    { data: [], hasMatchedLocalDB: false },
    { data: [], hasMatchedLocalDB: false },
    { data: [], hasMatchedLocalDB: false }
];
// 初始化面板映射
const PANEL_MAP = Object.fromEntries(
    Object.entries(PANEL_CONFIG).map(([id, config]) => {
        const base = id <= 2 ? {
            title: document.querySelector(config.titleSelector),
            count: document.querySelector(config.countSelector),
            rows: document.querySelector(config.rowsSelector),
            data: []
        } : {
            searchInput: document.getElementById(config.searchId),
            rows: document.getElementById(config.rowsId),
            data: []
        };
        return [id, base];
    })
);

// 存储打开的窗口句柄
let openedWindows = [];
// 修改后的函数：打开或关闭所有链接
function toggleAllLinks(button, price1Link, price2Link, link1, link2) {
    if (button.textContent === '全开') {
        // 打开链接
        openedWindows.push(window.open(price1Link, '_blank'));
        openedWindows.push(window.open(price2Link, '_blank'));
        openedWindows.push(window.open(link1, '_blank'));
        openedWindows.push(window.open(link2, '_blank'));

        // 更改按钮文字和背景颜色
        button.textContent = '全关';
        button.style.backgroundColor = '#f44336'; // 红色背景
    } else {
        // 关闭所有打开的窗口
        openedWindows.forEach(window => {
            if (!window.closed) {
                window.close();
            }
        });
        openedWindows = [];

        // 更改按钮文字和背景颜色
        button.textContent = '全开';
        button.style.backgroundColor = ''; // 恢复默认背景颜色，可根据 CSS 样式调整
    }
}

const sortOrders = DEFAULT_SORT_ORDERS;

// 核心功能：生成符号单元格的 HTML 代码
const template = {
    symbolCell(symbol, icon) {
        return `
            <div class="flex items-center space-x-2">
                <div style="${icon ? `background-image:url('${icon}')` : 'background-color:#e0e0e0'};
                    width:20px;height:20px;border-radius:50%;background-size:contain;">
                </div>
                <span>${symbol}</span>
            </div>
        `;
    },
    // 核心功能：生成价格单元格的 HTML 代码
    priceCell(value, compareValue, link, vol, exchange) {
        const isHigher = value > compareValue;
        const volDisplay = vol && vol !== 0 ? `<span class="vol-display">${formatUtils.formatVolume(vol)}</span>` : '';
        return `
            <a href="${link}" target="_blank" class="${isHigher ? 'price-high' : 'price-low'}" data-exchange="${exchange}">
                $${value} ${isHigher ? '↑' : '↓'}
            </a>
            ${volDisplay}
        `;
    }
};


// 提取匹配本地数据库的功能到新函数：将本地数据库数据与传入数据合并
async function enrichDataWithLocalDB(panelId, data) {
    const localData = await get7500DataFromDB();
    let enrichedData = data;

    if (localData) {
        enrichedData = data.map(item => {
            const matchedCoin = localData.find(coin => coin.symbol.toUpperCase() === item.symbol.toUpperCase());

            return {
                ...item,
                market_cap_rank: matchedCoin?.market_cap_rank || '-',
                icon: matchedCoin?.image || null
            };
        });
    }

    EXSHOPS[panelId - 1].data = enrichedData;
    EXSHOPS[panelId - 1].hasMatchedLocalDB = true;

    return enrichedData;
}

// 更新面板3：当交易所1和交易所2都有数据时，查找相同交易对并显示对比结果
async function updatePanel3(skipLocalFilter = false) {
    if (EXSHOPS[0].data.length > 0 && EXSHOPS[1].data.length > 0) {
        let filteredPairs = await findSamePairs(EXSHOPS[0].data, EXSHOPS[1].data);
        if (!skipLocalFilter) {
            const localFilters = FILTER_MANAGER.getFilters();
            const exchange1 = filteredPairs[0]?.exchange1 || '';
            const exchange2 = filteredPairs[0]?.exchange2 || '';
            filteredPairs = filteredPairs.filter(pair => {
                const filter1 = localFilters[exchange1] || [];
                const filter2 = localFilters[exchange2] || [];
                return !filter1.includes(pair.symbol) && !filter2.includes(pair.symbol);
            });
        }
        EXSHOPS[2].data = filteredPairs;
        displayComparison(filteredPairs);
    }
}

// 更新面板1和面板2：更新指定面板的数据并在页面上显示
async function updatePanel(exchange, panelId, data) {
    if (panelId === 1) {
        EXSHOPS[0].data = data;
    } else if (panelId === 2) {
        EXSHOPS[1].data = data;
    }

    let countElement, rowsElement;
    if (panelId === 1) {
        countElement = document.querySelector('[data-panel="1"] .exchange-count span');
        rowsElement = document.querySelector('[data-panel="1"] .exchange-rows');
    } else if (panelId === 2) {
        countElement = document.querySelector('[data-panel="2"] .exchange-count span');
        rowsElement = document.querySelector('[data-panel="2"] .exchange-rows');
    }

    if (countElement && panelId <= 2) {
        countElement.textContent = `交易对数量: ${data.length}`;
    }

    if (!data || data.length === 0) {
        if (rowsElement) {
            rowsElement.innerHTML = TEMPLATES.emptyState();
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const row = document.createElement('tr');
        const price = formatUtils.removeTrailingZeros(item.price);

        row.innerHTML = `
            <td>${template.symbolCell(item.symbol, null)}</td>
            <td><a href="${item.priceLink}" target="_blank">$${price}</a></td>
            <td style="width:25%">${formatUtils.formatVolume(item.vol24h)}</td>
            <td style="width:20%">${item.market_cap_rank || '-'}</td
            
        `;

        fragment.appendChild(row);
    });

    if (rowsElement) {
        rowsElement.innerHTML = '';
        rowsElement.appendChild(fragment);
    }

    const enrichedData = await enrichDataWithLocalDB(panelId, data);

    const newFragment = document.createDocumentFragment();

    enrichedData.forEach(item => {
        const row = document.createElement('tr');
        const price = formatUtils.removeTrailingZeros(item.price);
        const rank = item.market_cap_rank || '-';

        row.innerHTML = `
            <td>${template.symbolCell(item.symbol, item.icon)}</td>
            <td><a href="${item.priceLink}" target="_blank">$${price}</a></td>
            <td style="width:12%" class="volume-cell">${formatUtils.formatVolume(item.vol24h)}</td>
            <td style="width:10%">${rank}</td>
        `;

        newFragment.appendChild(row);
    });

    if (rowsElement) {
        rowsElement.innerHTML = '';
        rowsElement.appendChild(newFragment);
    }
}

// 切换排序方向：切换指定面板和列的排序顺序，并调用排序函数和更新排序图标
function toggleSort(panelId, column) {
    const currentOrder = sortOrders[panelId][column];
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    sortOrders[panelId][column] = newOrder;
    sortTable(panelId, column, newOrder);


}

// 排序表格：对指定面板的表格按指定列和方向进行排序
function sortTable(panelId, column, direction) {

    const panel = document.querySelector(`[data-panel="${panelId}"]`);
    const tbody = panel.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // 定义转换函数
    function convertVolume(value) {
        if (value.includes('亿')) {
            return parseFloat(value.replace(/[^\d.-]/g, '')) * 1e8;
        } else if (value.includes('万')) {
            return parseFloat(value.replace(/[^\d.-]/g, '')) * 1e4;
        } else {
            return parseFloat(value.replace(/[^\d.-]/g, ''));
        }
    }

    rows.sort((a, b) => {
        const aValue = a.querySelector(`td:nth-child(${formatUtils.getColumnIndex(column)})`).textContent;
        const bValue = b.querySelector(`td:nth-child(${formatUtils.getColumnIndex(column)})`).textContent;
        const aHasDash = aValue.includes('-');
        const bHasDash = bValue.includes('-');
        if (aHasDash && !bHasDash) {
            return 1;
        } else if (!aHasDash && bHasDash) {
            return -1;
        } else if (aHasDash && bHasDash) {
            return 0;
        }

        let aNum, bNum;
        if (column === '24VOL') {
            aNum = convertVolume(aValue);
            bNum = convertVolume(bValue);
        } else if (column === 'market_cap_rank') {
            aNum = aValue === '-' ? -1 : parseInt(aValue);
            bNum = bValue === '-' ? -1 : parseInt(bValue);
        } else {
            aNum = parseFloat(aValue.replace(/[^\d.-]/g, ''));
            bNum = parseFloat(bValue.replace(/[^\d.-]/g, ''));
        }

        if (isNaN(aNum) && isNaN(bNum)) {
            return aValue.localeCompare(bValue) * (direction === 'asc' ? 1 : -1);
        } else if (isNaN(aNum)) {
            return 1 * (direction === 'asc' ? 1 : -1);
        } else if (isNaN(bNum)) {
            return -1 * (direction === 'asc' ? 1 : -1);
        }
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}




// 显示对比结果 面板3：过滤、排序并显示两个交易所的相同交易对对比结果
function displayComparison(pairs) {
    const rows = pairs.map(pair => {
        return `
            <tr>
                <td>${template.symbolCell(pair.symbol)}</td>
                <td>${template.priceCell(pair.price1, pair.price2, pair.link1, pair.vol24h_1, pair.exchange1)}</td>
                <td>${template.priceCell(pair.price2, pair.price1, pair.link2, pair.vol24h_2, pair.exchange2)}</td>
            </tr>
        `;
    }).join('');
    if (!Array.isArray(pairs)) {
        const rowsElement = document.getElementById('same-pairs-row');
        if (rowsElement) {
            rowsElement.innerHTML = TEMPLATES.emptyState();
        }
        const countElement = document.getElementById('same-pairs-count');
        if (countElement) {
            countElement.textContent = '交易对数量: 0';
        }
        return;
    }



    // 过滤掉本地
    const localFilters = FILTER_MANAGER.getFilters();
    // 添加空值校验
    const exchange1 = pairs && pairs.length > 0 ? pairs[0].exchange1 : '';
    const exchange2 = pairs && pairs.length > 0 ? pairs[0].exchange2 : '';

    // 仅使用面板3的本地数据
    const filteredPairs = EXSHOPS[2].data.filter(pair => {
        const filter1 = localFilters[exchange1] || [];
        const filter2 = localFilters[exchange2] || [];
        return !filter1.includes(pair.symbol) && !filter2.includes(pair.symbol);
    }).filter(pair => parseFloat(pair.diff) < 100);
    const sortedPairs = [...filteredPairs].sort((a, b) => {
        const diffA = parseFloat(a.diff);
        const diffB = parseFloat(b.diff);
        const isRedA = diffA >= 3;
        const isRedB = diffB >= 3;

        if (isRedA && !isRedB) {
            return -1;
        } else if (!isRedA && isRedB) {
            return 1;
        } else {
            return diffB - diffA;
        }
    });

    // 显示对比结果面板3的代码
    const rowsElement = document.getElementById('same-pairs-row');
    const countElement = document.getElementById('same-pairs-count');

    if (rowsElement) {
        rowsElement.innerHTML = sortedPairs.length > 0
            ? sortedPairs.map(pair => {
                const cleanPrice1 = formatUtils.removeTrailingZeros(pair.price1);
                const cleanPrice2 = formatUtils.removeTrailingZeros(pair.price2);
                const price1Class = pair.price1 > pair.price2 ? 'text-red-500' : 'text-green-500';
                const price2Class = pair.price1 > pair.price2 ? 'text-green-500' : 'text-red-500';
                const arrow1 = pair.price1 > pair.price2 ? '↑' : '↓';
                const arrow2 = pair.price1 > pair.price2 ? '↓' : '↑';
                const extraText1 = pair.price1 > pair.price2 ? '充' : '提';
                const extraText2 = pair.price1 > pair.price2 ? '提' : '充';
                const link1 = extraText1 === '提' ? pair.withdraw1 : pair.deposit1;
                const link2 = extraText2 === '提' ? pair.withdraw2 : pair.deposit2;
                const tooltip1 = extraText1 === '提' ? `从 ${pair.exchange1} 提取 ${pair.symbol}` : `向 ${pair.exchange1} 充值 ${pair.symbol}`;
                const tooltip2 = extraText2 === '提' ? `从 ${pair.exchange2} 提取 ${pair.symbol}` : `向 ${pair.exchange2} 充值 ${pair.symbol}`;
                const diffPercent = parseFloat(pair.diff);
                const backgroundColor = diffPercent >= 3 ? 'rgba(255, 0, 0, 1)' : `rgba(255, ${255 - (diffPercent / 3 * 255)}, ${255 - (diffPercent / 3 * 255)}, 1)`;
                const vol24h_1 = formatUtils.formatVolume(pair.vol24h_1) || 0;
                const vol24h_2 = formatUtils.formatVolume(pair.vol24h_2) || 0;

                return `
                    <tr>
                        <td>${template.symbolCell(pair.symbol, pair.icon)}</td>
                        <td>
                            <a href="${pair.price1Link}" target="_blank" class="${price1Class} price1RightMenu ${pair.symbol} ${pair.exchange1}" data-symbol="${pair.symbol}" data-exchange="${pair.exchange1}">
                                $${cleanPrice1} ${arrow1}
                                <a href="${link1}" target="_blank" class="${price1Class} underline-hover" title="${tooltip1}" style="padding: 5px;">${extraText1}</a>
                            <span class="vol-num">${vol24h_1}</span>

                            </a>
                        </td>
                        <td>
                            <a href="${pair.price2Link}" target="_blank" class="${price2Class} price2RightMenu ${pair.symbol} ${pair.exchange2}" data-symbol="${pair.symbol}" data-exchange="${pair.exchange2}">
                                $${cleanPrice2} ${arrow2}
                                <a href="${link2}" target="_blank" class="${price2Class} underline-hover" title="${tooltip2}" style="padding: 5px;">${extraText2}</a>

                            <span class="vol-num">${vol24h_2}</span>
                                <div class="custom-confirm" style="display:none;"></div>

                            </a>
                        </td>
                        <td data-diff="${pair.diff}" class="diff-cell" style="background-color: ${backgroundColor}; color: #003366;">${pair.diff}%</td>
                        <td>${pair.rank || '-'}</td>
           <td><button class="full-open-btn" onclick="toggleAllLinks(this, '${pair.price1Link}', '${pair.price2Link}', '${link1}', '${link2}')">全开</button></td>
                    </tr>
                `;
            }).join('')
            : TEMPLATES.emptyState();
    }



    setTimeout(() => {
        rightMenu();
        console.log('rightMenu');
    }, 2000);

    if (countElement) {
        countElement.textContent = `交易对数量: ${sortedPairs.length}`;
    }
}
// 监听交易所选择变化的函数：当交易所选择变化时，加载对应交易所的数据并更新面板
async function changeHandler(panelId, ex, e) {
    const panel = PANEL_MAP[panelId];
    const statusElement = document.getElementById('fetch-status');
    const index = panelId - 1;

    EXSHOPS[index].data = [];
    panel.data = [];
    panel.rows.innerHTML = TEMPLATES.emptyState();

    if (e.target.value) {
        statusElement.textContent = `正在加载 ${ex.name} 的数据...`;
        panel.rows.innerHTML = TEMPLATES.loadingState();

        try {
            const data = await loadData(e.target.value);
            statusElement.textContent = `已成功加载 ${ex.name} 的数据，正在更新面板...`;
            EXSHOPS[index].data = data;
            await updatePanel(null, panelId, data);

            if (EXSHOPS[0].data.length > 0 && EXSHOPS[1].data.length > 0) {
                statusElement.textContent = `正在对比两个交易所的相同交易对...`;
                updatePanel3();
                statusElement.textContent = `面板更新完成`;
            }
        } catch (error) {
            panel.rows.innerHTML = '<tr><td colspan="4" class="text-center text-red-500">加载失败，请重试</td></tr>';
            statusElement.textContent = `加载 ${ex.name} 的数据时出错: ${error.message}`;
        }
    } else {
        panel.rows.innerHTML = TEMPLATES.emptyState();
        statusElement.textContent = `已取消选择交易所`;
    }
}

// 初始化函数：初始化交易所单选框、搜索功能，并添加事件监听器和移除监听器的逻辑
function init() {
    ['exchange1', 'exchange2'].forEach((name, index) => {
        const panelId = index + 1;
        const container = document.querySelector(`[data-panel="${panelId}"] .exchange-radios div`);
        const template = document.getElementById('exchange-radio-template');

        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }

        Object.values(EXCHANGES).forEach(ex => {
            const clone = template.content.cloneNode(true);
            const input = clone.querySelector('input');
            const span = clone.querySelector('span');

            input.value = ex.id;
            input.name = name;
            span.textContent = ex.name;

            input.addEventListener('change', (e) => changeHandler(panelId, ex, e));
            if (!input.__eventHandlers) {
                input.__eventHandlers = [];
            }
            input.__eventHandlers.push({ type: 'change', handler: (e) => changeHandler(panelId, ex, e) });
            container.appendChild(clone);
        });
    });

    [3].forEach(panelId => {
        PANEL_MAP[panelId].searchInput.addEventListener('input', e => {
            const query = e.target.value.toLowerCase();
            const filtered = EXSHOPS[2].data.filter(item =>
                item.symbol.toLowerCase().includes(query)
            );

            displayComparison(filtered)
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');

        const searchBtnHandler = () => searchCoin();
        const searchInputHandler = (e) => {
            if (e.key === 'Enter') searchCoin();
        };

        searchBtn.addEventListener('click', searchBtnHandler);
        searchInput.addEventListener('keypress', searchInputHandler);

        if (!searchBtn.__eventHandlers) {
            searchBtn.__eventHandlers = [];
        }
        searchBtn.__eventHandlers.push({ type: 'click', handler: searchBtnHandler });

        if (!searchInput.__eventHandlers) {
            searchInput.__eventHandlers = [];
        }
        searchInput.__eventHandlers.push({ type: 'keypress', handler: searchInputHandler });
    });

    window.addEventListener('beforeunload', () => {
        const allInputs = document.querySelectorAll('input');
        allInputs.forEach(input => {
            if (input.__eventHandlers) {
                input.__eventHandlers.forEach(({ type, handler }) => {
                    input.removeEventListener(type, handler);
                });
                input.__eventHandlers = [];
            }
        });

        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');

        if (searchBtn && searchBtn.__eventHandlers) {
            searchBtn.__eventHandlers.forEach(({ type, handler }) => {
                searchBtn.removeEventListener(type, handler);
            });
            searchBtn.__eventHandlers = [];
        }

        if (searchInput && searchInput.__eventHandlers) {
            searchInput.__eventHandlers.forEach(({ type, handler }) => {
                searchInput.removeEventListener(type, handler);
            });
            searchInput.__eventHandlers = [];
        }
    });





    document.querySelectorAll('.priceRightMenu').forEach(element => {
    element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const symbol = this.dataset.symbol;
        const exchange = this.dataset.exchange;
        showCustomConfirm(symbol, exchange, e.clientX, e.clientY);
    });
});
}

function rightMenu() {
    document.querySelectorAll('.price1RightMenu, .price2RightMenu').forEach(element => {
        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            const symbol = this.dataset.symbol;
            const exchange = this.dataset.exchange;
            console.log('rightMenu', symbol, exchange,this.dataset);
            showCustomConfirm(symbol, exchange, e.clientX, e.clientY);
        });
    });
}



// 搜索币种：根据输入框内容搜索币种并显示结果
async function searchCoin() {
    const input = document.getElementById('search-input');
    const result = document.getElementById('search-result');
    const content = document.getElementById('search-result-content');
    const term = input.value.trim().toLowerCase();

    if (!term) {
        result.style.display = 'none';
        return;
    }

    try {
        // 设置搜索结果区域的最大高度和溢出滚动
        result.style.maxHeight = '300px';
        result.style.overflowY = 'auto';
        // 设置搜索结果区域为相对定位
        result.style.position = 'absolute';

        // 从数据库获取数据
        // 将原20000数据源替换为7500数据源
        const allCoins = await get7500DataFromDB();
        const filteredCoins = allCoins.filter(coin =>
            coin.symbol.toLowerCase().includes(term)
        );
        // <span>$ ${price}</span>

        if (filteredCoins.length === 0) {
            content.innerHTML = '<p class="text-center text-red-500">未找到匹配的币种</p>';
        } else {
            const html = filteredCoins.map(coin => {
                const symbol = coin.symbol.toUpperCase();
                const price = formatUtils.formatVolume(coin.current_price);
                return `
                    <div class="p-2 border-b border-gray-300">
                        <div class="flex items-center space-x-2">
                            ${template.symbolCell(symbol, coin.image)}
                        </div>
                        <div class="mt-1 text-sm text-gray-600">
                            排名:<i style="color:blue;">${coin.market_cap_rank || '-'}</i>&nbsp;&nbsp;&nbsp;&nbsp;
                            价格:<i style="color:blue">${price || '-'}</i>
                        </div>
                    </div>
                `;
            }).join('');
            content.innerHTML = html;
        }

        result.style.display = 'block';
    } catch (error) {
        content.innerHTML = `<p class="text-center text-red-500">搜索出错: ${error.message}</p>`;
        result.style.display = 'block';
    }
}

// 关闭搜索结果：隐藏搜索结果区域
export function closeSearchResult() {
    document.getElementById('search-result').style.display = 'none';
}

// 刷新面板 1 和面板 2 的数据
export async function refreshPanels() {
    const panel1Radio = document.querySelector('input[name="exchange1"]:checked');
    const panel2Radio = document.querySelector('input[name="exchange2"]:checked');
    const statusElement = document.getElementById('fetch-status');

    if (!panel1Radio && !panel2Radio) {
        statusElement.textContent = '还未选择交易所，请先选择交易所。';
        return;
    }

    if (panel1Radio) {
        const panelId = 1;
        const ex = EXCHANGES[panel1Radio.value];
        statusElement.textContent = `正在刷新交易所 1 (${ex.name}) 的数据...`;
        try {
            const data = await loadData(panel1Radio.value);
            await updatePanel(null, panelId, data);
            statusElement.textContent = `交易所 1 (${ex.name}) 的数据刷新完成。`;
        } catch (error) {
            statusElement.textContent = `刷新交易所 1 (${ex.name}) 的数据时出错: ${error.message}`;
        }
    }

    if (panel2Radio) {
        const panelId = 2;
        const ex = EXCHANGES[panel2Radio.value];
        statusElement.textContent = `正在刷新交易所 2 (${ex.name}) 的数据...`;
        try {
            const data = await loadData(panel2Radio.value);
            await updatePanel(null, panelId, data);
            statusElement.textContent = `交易所 2 (${ex.name}) 的数据刷新完成。`;
        } catch (error) {
            statusElement.textContent = `刷新交易所 2 (${ex.name}) 的数据时出错: ${error.message}`;
        }
    }

    // 如果两个面板都有数据，刷新面板 3
    if (panel1Radio && panel2Radio) {
        statusElement.textContent = `正在对比两个交易所的相同交易对...`;
        updatePanel3();
        statusElement.textContent = `面板更新完成`;
    }
}



// 在文件底部添加以下导出
export {
    init,               // 初始化函数
    updatePanel,       // 面板更新函数
    displayComparison, // 对比结果显示函数
    searchCoin,       // 搜索币种函数
    toggleSort,
    toggleAllLinks
}

// 假设这是 price1RightMenu 和 price2RightMenu 元素
const price1RightMenuElement = document.getElementById('price1RightMenu');
const price2RightMenuElement = document.getElementById('price2RightMenu');



// 为 price1RightMenu 和 price2RightMenu 添加右键事件监听器
if (price1RightMenuElement) {
    price1RightMenuElement.addEventListener('contextmenu', rightMenu);
}
if (price2RightMenuElement) {
    price2RightMenuElement.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const symbol = this.dataset.symbol;
    const exchange = this.dataset.exchange;
    showCustomConfirm(symbol, exchange, e.clientX, e.clientY);
});
}

// 添加自定义确认弹窗函数
export function showCustomConfirm(symbol, exchange, x, y) {
    // 先关闭已存在的弹窗
    document.querySelectorAll('.custom-confirm').forEach(el => el.remove());

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.3);
        z-index: 9998;
    `;

    const container = document.createElement('div');
    container.className = 'custom-confirm';
    container.innerHTML = `
        <div class="confirm-box" style="position:fixed;z-index:9999;left:50%;top:20px;transform:translateX(-50%);background:#f8f9fa;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:12px;padding:24px;min-width:360px;width:90%;max-width:420px;">
            <p class="confirm-text" style="margin-bottom:20px;font-size:18px;font-weight:500;color:#1a1a1a;">
                <span class="confirm-symbol" style="color:#1890ff;font-weight:600;">${symbol}</span>
                加入
                <span class="confirm-exchange" style="color:#52c41a;font-weight:600;">${exchange}</span>
                过滤列表
            </p>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button class="confirm-btn" style="padding:8px 24px;background:#1890ff;color:#fff;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;">确定</button>
                <button class="cancel-btn" style="padding:8px 24px;background:#fff;color:#666;border:1px solid #d9d9d9;border-radius:6px;cursor:pointer;transition:all 0.3s;">取消</button>
            </div>
        </div>
    `;

    // 点击遮罩层关闭
    const handleClickOutside = (e) => {
        if (!container.contains(e.target)) {
            overlay.remove();
            container.remove();
            document.removeEventListener('click', handleClickOutside);
            document.body.classList.remove('modal-open');
        }
    };

    document.addEventListener('click', handleClickOutside);
    document.body.classList.add('modal-open');
    document.body.appendChild(overlay);

    container.querySelector('.confirm-btn').onclick = () => {
        FILTER_MANAGER.addFilter(exchange, symbol);
        container.remove();
        overlay.remove();
        refreshPanels();
    };

    container.querySelector('.cancel-btn').onclick = () => {
        container.remove();
        overlay.remove();
    };
    document.body.appendChild(container);
}

// 修改搜索输入框ID匹配
const sameSearchInput = document.getElementById('same-pairs-search');

// 添加交易所选择验证
function validateExchanges() {
  const exchange1 = document.querySelector('input[name="exchange1"]:checked');
  const exchange2 = document.querySelector('input[name="exchange2"]:checked');
  return exchange1 && exchange2;
}

// 更新搜索事件监听
sameSearchInput.addEventListener('input', async () => {
        const searchValue = sameSearchInput.value.trim().toUpperCase();
        if (!searchValue) {
            await updatePanel3();
            return;
        }
        const filteredData = EXSHOPS[2].data.filter(pair => pair.symbol.includes(searchValue));
        EXSHOPS[2].data = filteredData;
        displayComparison(filteredData);
  if (!validateExchanges()) {
    EXSHOPS[2].data = [];
    document.getElementById('same-pairs-row').innerHTML = 
      '<tr><td colspan="5" class="text-center text-gray-500">请先选择两个交易所</td></tr>';
    return;
  }

console.log('sameSearchInput', sameSearchInput);


});

// ... existing code ...
