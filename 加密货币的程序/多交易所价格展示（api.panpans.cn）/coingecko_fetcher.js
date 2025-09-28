// 基础配置
const COINGECKO_API = {
    baseUrl: 'https://api.coingecko.com/api/v3',
    getMarkets: (params) => `${COINGECKO_API.baseUrl}/coins/markets?${new URLSearchParams(params)}`
};

// 数据库配置
const DB_NAME = 'CryptoDataDB';
const DB_VERSION = 1;
const STORE_NAME = 'coinsData';
let db;

// 数据存储
let top7500CoinsData = [];
let currentRequestCount = 1;
const DATA_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;
// const MAX_REQUESTS = 30;
const MAX_REQUESTS = 68;


// 初始化数据库
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}


// 获取7500数据 从api
let fetch7500TimeoutId;

async function fetch7500Data() {
    const statusElement = document.getElementById('fetch-status');
    try {
        statusElement.textContent = `正在请求第${currentRequestCount}页数据(7500)...`;
        const response = await fetch(COINGECKO_API.getMarkets({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 250,
            page: currentRequestCount,
            sparkline: 'false'
        }));
        
        if (!response.ok) throw new Error(`请求失败: ${response.status}`);
        
        const pageData = await response.json();
        statusElement.textContent = `第${currentRequestCount}页数据获取成功，准备存入数据库...`;
        top7500CoinsData = [...top7500CoinsData, ...pageData];
        await save7500Data();
        statusElement.textContent = `第${currentRequestCount}页数据已存入数据库`;
        
        // 如果还有下一页，20秒后继续请求
        if (currentRequestCount < MAX_REQUESTS) {
            currentRequestCount++;
            fetch7500TimeoutId = setTimeout(fetch7500Data, 20000); // 20秒间隔
        } else {
            statusElement.textContent = 'top7500数据获取完成';
        }
        return pageData;
    } catch (error) {
        console.error('获取7500数据出错:', error);
        statusElement.textContent = `第${currentRequestCount}页数据请求失败: ${error.message}`;
        return [];
    }
}


// 添加取消函数
function cancelDataFetching() {
    if (fetch7500TimeoutId) {
        clearTimeout(fetch7500TimeoutId);
        fetch7500TimeoutId = null;
    }
}

// 保存7500数据
async function save7500Data() {
    const statusElement = document.getElementById('save-status');
    const expirationDate = new Date(Date.now() + DATA_EXPIRATION_TIME);
    const dataToSave = {
        id: 'top7500Coins',
        data: top7500CoinsData.slice(0, MAX_REQUESTS * 250),
        expiration: expirationDate.getTime()
    };
    console.log(dataToSave,'dataTOSave')

    try {
        statusElement.textContent = '正在保存7500数据到数据库...';
        await initDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(dataToSave);
        statusElement.textContent = '7500数据保存成功';
    } catch (error) {
        console.error('保存7500数据失败:', error);
        statusElement.textContent = '7500数据保存失败';
    }
}


async function startFetching() {
    const statusElement = document.getElementById('fetch-status');
    const storageStatusElement = document.getElementById('storage-status');

    try {
        // 检查数据库状态
        await initDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        // 检查数据集
        const top7500Data = await new Promise(resolve => {
            store.get('top7500Coins').onsuccess = e => resolve(e.target.result)
        });

        const now = new Date().getTime();
        const has7500 = top7500Data && now < top7500Data.expiration;

        if (!has7500) {
            statusElement.textContent = '开始采集top7500数据...';
            await fetch7500Data();
            statusElement.textContent = 'top7500数据采集完成';
        } else {
            statusElement.textContent = '本地已有完整数据';
            storageStatusElement.textContent = '数据已是最新';
        }
        
        // 更新存储状态显示
        await updateDBStatus();
    } catch (error) {
        console.error('获取数据时出错:', error);
        statusElement.textContent = '获取数据失败: ' + error.message;
    }
}


async function deleteDB() {
    try {
        await initDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        return new Promise((resolve) => {
            request.onsuccess = async (event) => {
                const items = event.target.result;
                const modal = document.getElementById('deleteModal');
                const form = document.getElementById('deleteForm');
                
                // 清空表单
                form.innerHTML = '';
                
                // 添加选项
                items.forEach(item => {
                    const label = document.createElement('label');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'deleteItems';
                    checkbox.value = item.id;
                    
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(item.id));
                    form.appendChild(label);
                });
                
                // 显示弹窗
                modal.style.display = 'flex';
                
                // 设置按钮事件
                document.getElementById('cancelDelete').onclick = () => {
                    modal.style.display = 'none';
                    resolve(false);
                };
                
                document.getElementById('confirmDelete').onclick = async () => {
                    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
                    const selectedItems = Array.from(checkboxes).map(cb => cb.value);
                    
                    if (selectedItems.length > 0) {
                        const deleteTransaction = db.transaction(STORE_NAME, 'readwrite');
                        const deleteStore = deleteTransaction.objectStore(STORE_NAME);
                        
                        await Promise.all(selectedItems.map(id => {
                            return new Promise((resolveDelete) => {
                                const deleteRequest = deleteStore.delete(id);
                                deleteRequest.onsuccess = () => resolveDelete(true);
                                deleteRequest.onerror = () => resolveDelete(false);
                            });
                        }));
                        
                        modal.style.display = 'none';
                        resolve(true);
                    } else {
                        alert('请至少选择一项要删除的数据');
                    }
                };
            };
        });
    } catch (error) {
        console.error('删除数据时出错:', error);
        return false;
    }
}

async function updateDBStatus() {
    try {
        await initDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = async (event) => {
            const items = event.target.result;
            const content = document.getElementById('dbStatusContent');
            
            content.innerHTML = '';
            
            if (items.length === 0) {
                content.innerHTML = '<div class="status-card">数据库中没有数据</div>';
            } else {
                const grid = document.createElement('div');
                grid.className = 'status-grid';
                
                for (const item of items) {
                    const card = document.createElement('div');
                    const now = new Date();
                    const expirationDate = new Date(item.expiration);
                    const isExpired = now > expirationDate;
                    
                    const timeLeft = expirationDate - now;
                    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const dataSize = (JSON.stringify(item.data).length / 1024).toFixed(1);
                    
                    card.className = `status-card ${isExpired ? 'status-expired' : 'status-valid'}`;
                    card.innerHTML = `
                        <div class="status-card-title">${item.id}</div>
                        <div class="status-detail">
                            <span class="status-label">数量</span>
                            <span class="status-value">${item.data.length}</span>
                        </div>
                        <div class="status-detail">
                            <span class="status-label">大小</span>
                            <span class="status-value">${dataSize} KB</span>
                        </div>
                        <div class="status-detail">
                            <span class="status-label">过期</span>
                            <span class="status-value">${expirationDate.toLocaleDateString()}</span>
                        </div>
                        <div class="status-detail">
                            <span class="status-label">剩余</span>
                            <span class="status-value">${isExpired ? '已过期' : `${daysLeft}d ${hoursLeft}h`}</span>
                        </div>
                    `;
                    grid.appendChild(card);
                }
                content.appendChild(grid);
            }
        };
    } catch (error) {
        console.error('获取数据库状态时出错:', error);
        document.getElementById('dbStatusContent').innerHTML = 
            '<div class="status-card status-expired">获取状态失败</div>';
    }
}

// 从本地数据库获取top7500数据
async function get7500DataFromDB() {
    try {
        await initDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        return new Promise((resolve) => {
            const request = store.get('top7500Coins');
            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result && new Date().getTime() < result.expiration) {
                    resolve(result.data);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    } catch (error) {
        console.error('获取7500数据失败:', error);
        return null;
    }
}

// 从本地数据库获取top20000数据


// 导出方法
export { 
    initDB,
    deleteDB,
    startFetching,
    updateDBStatus,
    get7500DataFromDB,  // 添加新方法到导出列表
};

