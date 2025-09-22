// 全局变量
let productsData = [];
let configData = {};
let currentEditId = null;

// 商品类型图标映射（与main.js共享）
const productTypeIcons = {
    '网域邮箱': { icon: 'fas fa-envelope', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    '软件授权': { icon: 'fas fa-key', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    '云存储': { icon: 'fas fa-cloud', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    '开发工具': { icon: 'fas fa-code', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    '教育服务': { icon: 'fas fa-graduation-cap', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    '企业服务': { icon: 'fas fa-building', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    '网络服务': { icon: 'fas fa-network-wired', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    '安全服务': { icon: 'fas fa-shield-alt', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    '默认': { icon: 'fas fa-star', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
};

// 获取商品图标
function getProductIcon(product) {
    // 首先尝试根据商品类型获取图标
    const typeIcon = productTypeIcons[product.type] || productTypeIcons['默认'];
    
    // 如果商品名称包含特定关键词，使用特殊图标
    if (product.name.includes('Github') || product.name.includes('GitHub')) {
        return { icon: 'fab fa-github', gradient: 'linear-gradient(135deg, #333 0%, #666 100%)' };
    }
    if (product.name.includes('Jetbrains')) {
        return { icon: 'fas fa-rocket', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' };
    }
    if (product.name.includes('OneDrive')) {
        return { icon: 'fas fa-cloud', gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)' };
    }
    if (product.name.includes('Microsoft') || product.name.includes('Office')) {
        return { icon: 'fab fa-microsoft', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0078d4 100%)' };
    }
    if (product.name.includes('Google') || product.name.includes('Gmail')) {
        return { icon: 'fab fa-google', gradient: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' };
    }
    if (product.name.includes('腾讯')) {
        return { icon: 'fab fa-tencent-weibo', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    }
    if (product.name.includes('网易')) {
        return { icon: 'fas fa-globe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' };
    }
    if (product.name.includes('大学') || product.name.includes('学院')) {
        return { icon: 'fas fa-university', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' };
    }
    
    return typeIcon;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员身份验证
    if (!checkAdminAuth()) {
        window.location.href = 'access.html';
        return;
    }
    
    loadAdminData();
    
    // 添加数据同步按钮事件监听
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'syncDataBtn') {
            syncDataFromFile();
        }
    });
});

// 加载管理员数据
async function loadAdminData() {
    try {
        // 优先从localStorage加载数据，如果没有则从文件加载
        await loadDataFromStorage();
        
        // 更新统计信息
        updateStats();
        
        // 渲染商品表格
        renderProductsTable();
        
        // 加载配置表单
        console.log('准备加载配置表单，configData:', configData);
        loadConfigForm();
        
        // 加载分类数据
        loadCategories();
        
        // 更新网站名称
        updateSiteName();
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('数据加载失败，请刷新页面重试');
    }
}

// 从存储中加载数据
async function loadDataFromStorage() {
    try {
        // 分别加载配置和商品数据
        await loadConfigData();
        await loadProductsData();
    } catch (error) {
        console.error('加载数据失败:', error);
        // 如果都失败了，使用默认数据
        productsData = [];
        configData = {
            siteName: "BuyEdu",
            siteDescription: "专业的学生邮箱和数字产品销售平台",
            adminPassword: "admin123",
            currency: "¥",
            categories: ["优惠", "腾讯", "论客", "网易", "无限别名"],
            contactInfo: {
                email: "support@buyedu.org",
                qq: "123456789"
            }
        };
        saveToLocalStorage();
        showError('使用默认数据，请检查JSON文件格式');
    }
}

// 加载配置数据
async function loadConfigData() {
    try {
        // 尝试从localStorage加载配置
        const savedConfig = localStorage.getItem('buyedu_config');
        
        if (savedConfig) {
            try {
                configData = JSON.parse(savedConfig);
                console.log('从localStorage加载配置成功:', configData);
                
                // 检查配置数据是否有效（至少要有siteName）
                if (!configData.siteName) {
                    console.log('localStorage中的配置数据无效，重新从文件加载');
                    throw new Error('配置数据无效');
                }
            } catch (parseError) {
                console.error('解析localStorage配置失败:', parseError);
                // 清除无效的localStorage数据
                localStorage.removeItem('buyedu_config');
                // 从文件重新加载
                await loadConfigFromFile();
            }
        } else {
            // 从config.json文件加载配置
            await loadConfigFromFile();
        }
    } catch (error) {
        console.error('加载配置失败:', error);
        throw error;
    }
}

// 从文件加载配置
async function loadConfigFromFile() {
    console.log('从config.json文件加载配置...');
    try {
        const configResponse = await fetch('data/config.json');
        if (!configResponse.ok) {
            throw new Error(`HTTP错误: ${configResponse.status} ${configResponse.statusText}`);
        }
        configData = await configResponse.json();
        
        // 保存配置到localStorage
        localStorage.setItem('buyedu_config', JSON.stringify(configData));
        console.log('配置已从JSON文件加载并保存到本地数据库:', configData);
    } catch (error) {
        console.error('从文件加载配置失败:', error);
        throw new Error('无法加载配置文件。请确保data/config.json存在且通过HTTP服务器访问。');
    }
}

// 加载商品数据
async function loadProductsData() {
    try {
        // 始终从products.json文件加载商品数据
        console.log('从products.json文件加载商品数据...');
        const productsResponse = await fetch('data/products.json');
        if (!productsResponse.ok) {
            throw new Error(`HTTP错误: ${productsResponse.status} ${productsResponse.statusText}`);
        }
        productsData = await productsResponse.json();
        console.log('商品数据已从JSON文件加载成功，共', productsData.length, '个商品');
    } catch (error) {
        console.error('加载商品数据失败:', error);
        throw new Error('无法加载商品数据。请确保data/products.json存在且通过HTTP服务器访问。');
    }
}

// 更新统计信息
function updateStats() {
    const totalProducts = productsData.length;
    const totalStock = productsData.reduce((sum, product) => sum + product.stock, 0);
    
    // 获取所有唯一的分类
    const allCategories = [...new Set(productsData.map(product => product.categoryName))];
    console.log('后台发现的商品分类:', allCategories);
    
    // 计算各分类的商品数量
    const categoryCounts = {};
    productsData.forEach(product => {
        const category = product.categoryName || '未分类';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // 获取统计卡片容器
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    // 清空现有统计卡片
    statsGrid.innerHTML = '';
    
    // 添加商品总数卡片（始终显示）
    if (totalProducts > 0) {
        statsGrid.innerHTML += `
            <div class="stat-card">
                <div id="totalProducts" class="stat-number">${totalProducts}</div>
                <div class="stat-label">商品总数</div>
            </div>
        `;
    }
    
    // 添加总库存卡片（始终显示）
    if (totalStock > 0) {
        statsGrid.innerHTML += `
            <div class="stat-card">
                <div id="totalStock" class="stat-number">${totalStock}</div>
                <div class="stat-label">总库存</div>
            </div>
        `;
    }
    
    // 只为有数据的分类添加统计卡片
    Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count > 0) {
            statsGrid.innerHTML += `
                <div class="stat-card">
                    <div id="${category}Count" class="stat-number">${count}</div>
                    <div class="stat-label">${category}商品</div>
                </div>
            `;
        }
    });
}

// 显示选项卡
function showTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // 激活当前选项卡
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // 根据选项卡类型执行不同的初始化
    switch(tabName) {
        case 'add-product':
            resetProductForm();
            break;
        case 'config':
            // 重新加载配置数据
            loadConfigData().then(() => {
                loadConfigForm();
            }).catch(error => {
                console.error('加载配置失败:', error);
                showError('加载配置失败，请刷新页面重试');
            });
            break;
        case 'categories':
            // 重新加载分类数据
            loadConfigData().then(() => {
                loadCategories();
            }).catch(error => {
                console.error('加载分类失败:', error);
                showError('加载分类失败，请刷新页面重试');
            });
            break;
        case 'scripts':
            // 加载JS脚本管理
            loadScripts();
            break;
    }
}

// 获取分类样式
function getCategoryStyle(category) {
    switch(category) {
        case '优惠':
            return 'background: #e8f5e8; color: #2e7d32;';
        case '腾讯':
            return 'background: #e3f2fd; color: #1976d2;';
        case '论客':
            return 'background: #fff3e0; color: #f57c00;';
        case '网易':
            return 'background: #e8eaf6; color: #3f51b5;';
        case '无限别名':
            return 'background: #f3e5f5; color: #7b1fa2;';
        default:
            return 'background: #f5f5f5; color: #666;';
    }
}

// 渲染商品表格
function renderProductsTable() {
    const container = document.getElementById('productsTableContainer');
    
    if (productsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>暂无商品</h3>
                <p>点击"添加商品"按钮创建第一个商品</p>
            </div>
        `;
        return;
    }
    
    let tableHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th><input type="checkbox" id="selectAll" onchange="toggleSelectAll()"></th>
                    <th>ID</th>
                    <th>商品名称</th>
                    <th>类型</th>
                    <th>分类</th>
                    <th>库存</th>
                    <th>价格</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    productsData.forEach(product => {
        const productIcon = getProductIcon(product);
        tableHTML += `
            <tr>
                <td><input type="checkbox" class="product-checkbox" value="${product.id}"></td>
                <td>${product.id}</td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="product-icon" style="width: 30px; height: 30px; background: ${productIcon.gradient}; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
                            <i class="${productIcon.icon}"></i>
                        </div>
                        ${product.name}
                    </div>
                </td>
                <td><span class="type-badge">${product.type}</span></td>
                <td>
                    <span class="badge" style="padding: 4px 8px; border-radius: 12px; font-size: 12px; ${getCategoryStyle(product.categoryName)}">${product.categoryName}</span>
                </td>
                <td><strong style="color: #28a745;">${product.stock}</strong></td>
                <td><strong style="color: #dc3545;">¥${product.price.toFixed(2)}</strong></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-edit" onclick="editProduct(${product.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id}).catch(console.error)" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// 搜索商品
function searchAdminProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderProductsTable();
        return;
    }
    
    const filteredProducts = productsData.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.type.toLowerCase().includes(searchTerm) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(searchTerm))
    );
    
    // 临时替换productsData来渲染搜索结果
    const originalData = productsData;
    productsData = filteredProducts;
    renderProductsTable();
    productsData = originalData;
}

// 重置商品表单
function resetProductForm() {
    document.getElementById('formTitle').textContent = '添加商品';
    document.getElementById('productForm').reset();
    document.getElementById('productType').value = '网域邮箱';
    document.getElementById('originalPrice').value = 0;
    currentEditId = null;
}

// 获取分类ID
function getCategoryId(categoryName) {
    const categoryMap = {
        '优惠': 1,
        '腾讯': 2,
        '论客': 3,
        '网易': 4,
        '无限别名': 5
    };
    return categoryMap[categoryName] || 1;
}

// 批量处理功能
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function getSelectedProducts() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
}

function selectAllProducts() {
    const selectAll = document.getElementById('selectAll');
    selectAll.checked = true;
    toggleSelectAll();
}

async function batchUpdateStock() {
    const selectedIds = getSelectedProducts();
    if (selectedIds.length === 0) {
        showError('请先选择要修改的商品');
        return;
    }
    
    const newStock = prompt(`请输入新的库存数量（将应用到 ${selectedIds.length} 个商品）：`);
    if (newStock === null || newStock === '') return;
    
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
        showError('请输入有效的库存数量');
        return;
    }
    
    // 更新选中的商品库存
    selectedIds.forEach(id => {
        const product = productsData.find(p => p.id === id);
        if (product) {
            product.stock = stockValue;
        }
    });
    
    // 保存到文件
    await saveProductsToFile();
    
    // 重新渲染表格
    renderProductsTable();
    
    // 更新统计信息
    updateStats();
    
    showSuccess(`成功更新 ${selectedIds.length} 个商品的库存为 ${stockValue}`);
}

async function batchUpdatePrice() {
    const selectedIds = getSelectedProducts();
    if (selectedIds.length === 0) {
        showError('请先选择要修改的商品');
        return;
    }
    
    const newPrice = prompt(`请输入新的价格（将应用到 ${selectedIds.length} 个商品）：`);
    if (newPrice === null || newPrice === '') return;
    
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue < 0) {
        showError('请输入有效的价格');
        return;
    }
    
    // 更新选中的商品价格
    selectedIds.forEach(id => {
        const product = productsData.find(p => p.id === id);
        if (product) {
            product.price = priceValue;
        }
    });
    
    // 保存到文件
    await saveProductsToFile();
    
    // 重新渲染表格
    renderProductsTable();
    
    showSuccess(`成功更新 ${selectedIds.length} 个商品的价格为 ¥${priceValue.toFixed(2)}`);
}

async function batchDeleteProducts() {
    const selectedIds = getSelectedProducts();
    if (selectedIds.length === 0) {
        showError('请先选择要删除的商品');
        return;
    }
    
    const confirmDelete = confirm(`确定要删除选中的 ${selectedIds.length} 个商品吗？此操作不可撤销！`);
    if (!confirmDelete) return;
    
    // 删除选中的商品
    productsData = productsData.filter(product => !selectedIds.includes(product.id));
    
    // 保存到文件
    await saveProductsToFile();
    
    // 重新渲染表格
    renderProductsTable();
    
    // 更新统计信息
    updateStats();
    
    showSuccess(`成功删除 ${selectedIds.length} 个商品`);
}

// 保存商品数据到文件
async function saveProductsToFile() {
    try {
        // 使用服务器API保存数据
        const response = await fetch('/save-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productsData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        showSuccess(result.message || '商品数据保存成功');
    } catch (error) {
        console.error('保存商品数据失败:', error);
        
        // 如果服务器API不可用，回退到下载方式
        try {
            const dataStr = JSON.stringify(productsData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            downloadLink.download = 'products.json';
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(downloadLink.href);
            
            showSuccess('服务器不可用，商品数据已导出为products.json文件，请手动替换data/products.json文件');
        } catch (downloadError) {
            showError('保存失败，请重试');
        }
    }
}

// 数据同步功能
async function syncDataFromFile() {
    try {
        showSuccess('正在同步数据...');
        
        // 重新从文件加载数据
        await loadProductsData();
        
        // 重新渲染表格
        renderProductsTable();
        
        // 更新统计信息
        updateStats();
        
        showSuccess('数据同步成功！');
    } catch (error) {
        console.error('数据同步失败:', error);
        showError('数据同步失败，请检查网络连接或刷新页面重试');
    }
}

// 编辑商品
function editProduct(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    currentEditId = productId;
    document.getElementById('formTitle').textContent = '编辑商品';
    
    // 填充表单
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productType').value = product.type || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productPrice').value = product.price || 0;
            document.getElementById('productCategory').value = product.categoryName || '优惠';
    document.getElementById('originalPrice').value = product.originalPrice || 0;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productFeatures').value = product.features || '';
    document.getElementById('loginUrl').value = product.loginUrl || '';
    document.getElementById('accountFormat').value = product.accountFormat || '';
    document.getElementById('productNotes').value = product.notes || '';
    
    // 切换到添加商品选项卡
    showTab('add-product');
    document.querySelector('[onclick="showTab(\'add-product\')"]').classList.add('active');
}

// 保存商品
async function saveProduct() {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    
    // 验证必填字段
    const name = formData.get('name').trim();
    const type = formData.get('type').trim();
    const stock = parseInt(formData.get('stock'));
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    
    if (!name || !type || isNaN(stock) || isNaN(price) || stock < 0 || price < 0) {
        showError('请填写所有必填字段，且数值必须为非负数');
        return;
    }
    
    const productData = {
        name: name,
        type: type,
        stock: stock,
        price: price,
        originalPrice: parseFloat(formData.get('originalPrice')) || 0,
        description: formData.get('description').trim(),
        features: formData.get('features').trim(),
        loginUrl: formData.get('loginUrl').trim(),
        accountFormat: formData.get('accountFormat').trim(),
        notes: formData.get('notes').trim(),
        categoryName: category,
        category: getCategoryId(category),
        icon: name.substring(0, 2) + '-logo.png'
    };
    
    if (currentEditId) {
        // 编辑现有商品
        const index = productsData.findIndex(p => p.id === currentEditId);
        if (index !== -1) {
            productData.id = currentEditId;
            productsData[index] = productData;
            showSuccess('商品更新成功');
        }
    } else {
        // 添加新商品
        const maxId = productsData.length > 0 ? Math.max(...productsData.map(p => p.id)) : 0;
        productData.id = maxId + 1;
        productsData.push(productData);
        showSuccess('商品添加成功');
    }
    
    // 保存到products.json文件
    await saveProductsToFile();
    
    // 更新界面
    updateStats();
    renderProductsTable();
    
    // 切换回商品管理选项卡
    showTab('products');
    document.querySelector('[onclick="showTab(\'products\')"]').classList.add('active');
    resetProductForm();
}

// 删除商品
async function deleteProduct(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`确定要删除商品"${product.name}"吗？此操作不可撤销。`)) {
        productsData = productsData.filter(p => p.id !== productId);
        
        // 保存商品数据到文件
        await saveProductsToFile();
        
        showSuccess('商品删除成功');
        updateStats();
        renderProductsTable();
    }
}

// 取消编辑
function cancelEdit() {
    resetProductForm();
    showTab('products');
    document.querySelector('[onclick="showTab(\'products\')"]').classList.add('active');
}

// 加载配置表单
function loadConfigForm() {
    // 清除旧的隐藏字段
    ['alipayQrCodeData', 'wechatQrCodeData', 'usdtQrCodeData', 'trxQrCodeData'].forEach(id => {
        const oldInput = document.getElementById(id);
        if (oldInput) {
            oldInput.remove();
        }
    });

    // 清除旧的预览图片
    ['alipayQrCodePreview', 'wechatQrCodePreview', 'usdtQrCodePreview', 'trxQrCodePreview'].forEach(id => {
        const preview = document.getElementById(id);
        if (preview) {
            preview.innerHTML = '';
        }
    });

    // 基本配置
    console.log('设置网站名称:', configData.siteName);
    const siteNameInput = document.getElementById('siteNameInput');
    if (siteNameInput) {
        siteNameInput.value = configData.siteName || '';
        console.log('网站名称输入框值已设置为:', siteNameInput.value);
    } else {
        console.error('找不到网站名称输入框元素');
    }
    
    document.getElementById('siteDescription').value = configData.siteDescription || '';
    document.getElementById('buyRedirectUrl').value = configData.buyRedirectUrl || '';
    document.getElementById('adminPassword').value = configData.adminPassword || '';
    document.getElementById('currency').value = configData.currency || '¥';
    
    // 联系方式
    document.getElementById('contactEmail').value = configData.contactInfo?.email || '';
    document.getElementById('contactQQ').value = configData.contactInfo?.qq || '';
    
    // 加载收款方式配置
    document.getElementById('usdtAddress').value = configData.usdtAddress || '';
    document.getElementById('trxAddress').value = configData.trxAddress || '';
    
    // 加载已选择的付款方式
    const paymentMethodsConfig = configData.paymentMethods || [];
    const enabledMethods = new Set();
    
    // 从对象数组中提取启用的支付方式
    paymentMethodsConfig.forEach(method => {
        if (method.enabled) {
            const nameToCode = {
                '支付宝': 'alipay',
                '微信支付': 'wechat',
                '微信': 'wechat', 
                'USDT': 'usdt',
                'TRX': 'trx'
            };
            const code = nameToCode[method.name] || method.name.toLowerCase();
            enabledMethods.add(code);
        }
    });
    
    document.querySelectorAll('input[name="paymentMethods"]').forEach(checkbox => {
        checkbox.checked = enabledMethods.has(checkbox.value);
    });
    
    // 加载收款码URL和预览
    const qrCodes = [
        { id: 'alipay', name: '支付宝' },
        { id: 'wechat', name: '微信' },
        { id: 'usdt', name: 'USDT' },
        { id: 'trx', name: 'TRX' }
    ];
    
    qrCodes.forEach(({ id, name }) => {
        const qrCodeUrl = configData[`${id}QrCode`];
        if (qrCodeUrl) {
            // 填入URL到输入框
            document.getElementById(`${id}QrCode`).value = qrCodeUrl;
            
            // 显示预览
            document.getElementById(`${id}QrCodePreview`).innerHTML = 
                `<img src="${qrCodeUrl}" alt="${name}收款码预览" onerror="this.style.display='none'; this.nextSibling.style.display='block';" onload="this.style.display='block'; this.nextSibling.style.display='none';"><p style="color: red; display: none;">图片加载失败，请检查链接是否正确</p>`;
            
            // 创建隐藏字段
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = `${id}QrCodeData`;
            input.value = qrCodeUrl;
            document.getElementById('configForm').appendChild(input);
        }
    });
    
    console.log('配置表单加载完成:', configData);
}

// 处理二维码URL输入
function handleQrCodeUrlInput(input, type) {
    const url = input.value.trim();
    if (url) {
        // 验证URL格式
        try {
            new URL(url);
            // 显示预览
            const previewDiv = document.getElementById(`${type}QrCodePreview`);
            previewDiv.innerHTML = `<img src="${url}" alt="${type}收款码预览" onerror="this.style.display='none'; this.nextSibling.style.display='block';" onload="this.style.display='block'; this.nextSibling.style.display='none';"><p style="color: red; display: none;">图片加载失败，请检查链接是否正确</p>`;
            
            // 保存URL数据到隐藏字段
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = `${type}QrCodeData`;
            hiddenInput.value = url;
            
            const existingInput = document.getElementById(`${type}QrCodeData`);
            if (existingInput) {
                existingInput.remove();
            }
            document.getElementById('configForm').appendChild(hiddenInput);
        } catch (error) {
            // URL格式不正确
            const previewDiv = document.getElementById(`${type}QrCodePreview`);
            previewDiv.innerHTML = `<p style="color: red;">请输入有效的图片链接</p>`;
        }
    } else {
        // 清空预览
        const previewDiv = document.getElementById(`${type}QrCodePreview`);
        previewDiv.innerHTML = '';
        
        // 移除隐藏字段
        const existingInput = document.getElementById(`${type}QrCodeData`);
        if (existingInput) {
            existingInput.remove();
        }
    }
}

// 保持向后兼容性的旧函数名
function handleQrCodeUpload(input, type) {
    handleQrCodeUrlInput(input, type);
}

// 保存配置
async function saveConfig() {
    const form = document.getElementById('configForm');
    const formData = new FormData(form);
    
    // 更新配置数据
    configData.siteName = formData.get('siteName').trim();
    configData.siteDescription = formData.get('siteDescription').trim();
    configData.buyRedirectUrl = formData.get('buyRedirectUrl').trim();
    configData.adminPassword = formData.get('adminPassword').trim();
    configData.currency = formData.get('currency').trim();
    
    if (!configData.contactInfo) {
        configData.contactInfo = {};
    }
    configData.contactInfo.email = formData.get('contactEmail').trim();
    configData.contactInfo.qq = formData.get('contactQQ').trim();
    
    // 添加收款方式配置
    configData.usdtAddress = document.getElementById('usdtAddress').value.trim();
    configData.trxAddress = document.getElementById('trxAddress').value.trim();
    
    // 获取收款码URL
    configData.alipayQrCode = document.getElementById('alipayQrCode').value.trim();
    configData.wechatPayQrCode = document.getElementById('wechatQrCode').value.trim();
    configData.usdtQrCode = document.getElementById('usdtQrCode').value.trim();
    configData.trxQrCode = document.getElementById('trxQrCode').value.trim();
    
    // 保存选择的付款方式
    const selectedMethodCodes = [];
    document.querySelectorAll('input[name="paymentMethods"]:checked').forEach(checkbox => {
        selectedMethodCodes.push(checkbox.value);
    });
    
    // 将代码转换为对象数组格式
    const codeToName = {
        'alipay': '支付宝',
        'wechat': '微信支付',
        'usdt': 'USDT',
        'trx': 'TRX'
    };
    
    const paymentMethodsArray = [
        { name: '支付宝', enabled: selectedMethodCodes.includes('alipay') },
        { name: '微信支付', enabled: selectedMethodCodes.includes('wechat') },
        { name: 'USDT', enabled: selectedMethodCodes.includes('usdt') },
        { name: 'TRX', enabled: selectedMethodCodes.includes('trx') }
    ];
    
    configData.paymentMethods = paymentMethodsArray;
    
    try {
        // 只保存配置到localStorage
        saveConfigToLocalStorage();
        
        // 显示保存成功信息
        showSuccess('配置保存成功');
        
        console.log('配置已保存到本地数据库:', configData);
        
    } catch (error) {
        console.error('保存配置失败:', error);
        showError('保存配置失败，请重试!');
    }
}

// 导出系统配置到config.json
function exportConfig() {
    try {
        // 添加导出时间和版本信息
        const configWithMeta = {
            ...configData,
            exportTime: new Date().toISOString(),
            version: "1.0"
        };
        
        // 创建下载链接
        const dataStr = JSON.stringify(configWithMeta, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.json';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccess('系统配置导出成功');
        
    } catch (error) {
        console.error('导出配置失败:', error);
        showError('导出配置失败');
    }
}

// 导出商品数据到products.json
function exportProducts() {
    try {
        // 创建下载链接
        const dataStr = JSON.stringify(productsData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.json';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccess('商品数据导出成功');
        
    } catch (error) {
        console.error('导出商品数据失败:', error);
        showError('导出商品数据失败');
    }
}

// 导出所有数据（保持向后兼容）
function exportAllData() {
    try {
        // 创建包含所有数据的对象
        const exportData = {
            config: configData,
            products: productsData,
            exportTime: new Date().toISOString(),
            version: "1.0"
        };
        
        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `buyedu-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccess('所有数据导出成功');
        
    } catch (error) {
        console.error('导出数据失败:', error);
        showError('导出数据失败');
    }
}

// 导入数据
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (importedData.config && importedData.products) {
                    configData = importedData.config;
                    productsData = importedData.products;
                    
                    // 保存到localStorage
                    saveToLocalStorage();
                    
                    // 重新加载界面
                    loadConfigForm();
                    loadCategories();
                    updateStats();
                    renderProductsTable();
                    
                    showSuccess('数据导入成功');
                } else {
                    showError('导入文件格式不正确');
                }
                
            } catch (error) {
                console.error('导入数据失败:', error);
                showError('导入数据失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// 保存到本地存储（模拟数据库）
function saveToLocalStorage() {
    localStorage.setItem('buyedu_products', JSON.stringify(productsData));
    localStorage.setItem('buyedu_config', JSON.stringify(configData));
}

// 只保存配置数据
function saveConfigToLocalStorage() {
    localStorage.setItem('buyedu_config', JSON.stringify(configData));
}

// 只保存商品数据
function saveProductsToLocalStorage() {
    localStorage.setItem('buyedu_products', JSON.stringify(productsData));
}



// 检查管理员身份验证
function checkAdminAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    const savedPassword = localStorage.getItem('adminSavedPassword');
    
    if (!isAuthenticated || !savedPassword) {
        return false;
    }
    
    // 这里可以添加更复杂的验证逻辑，比如检查token过期时间等
    return true;
}

// 退出登录
function logout() {
    if (confirm('确定要退出系统管理面板吗？')) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminSavedPassword');
        window.location.href = 'access.html';
    }
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

// 显示成功信息
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

// 本地数据清除功能已移除，项目使用文件存储

// 重新加载配置数据
async function reloadConfigData() {
    if (confirm('确定要重新从config.json文件加载配置吗？这将覆盖本地缓存的配置数据。')) {
        try {
            // 清除localStorage中的配置缓存
            localStorage.removeItem('buyedu_config');
            
            // 重新加载配置
            await loadConfigData();
            
            // 重新加载配置表单
            loadConfigForm();
            
            // 重新加载分类
            loadCategories();
            
            showSuccess('配置数据重新加载成功');
        } catch (error) {
            console.error('重新加载配置失败:', error);
            showError('重新加载配置失败，请检查config.json文件');
        }
    }
}

// ===================
// 分类管理功能
// ===================

let categoriesData = [];
let currentEditCategoryId = null;

// 加载分类数据
function loadCategories() {
    // 始终使用config.json中的分类，确保与前端显示一致
    categoriesData = configData.categories || ['优惠', '腾讯', '论客', '网易', '无限别名'];
    renderCategoriesTable();
}

// 渲染分类表格
function renderCategoriesTable() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    if (categoriesData.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tags"></i><p>暂无分类</p></div>';
        return;
    }
    
    let html = '';
    categoriesData.forEach((category, index) => {
        if (typeof category === 'string') {
            // 兼容旧格式
            html += `
                <div class="category-item">
                    <div class="category-info">
                        <h4>${category}</h4>
                        <p>默认分类</p>
                    </div>
                    <div class="category-actions">
                        <button class="btn-edit" onclick="editCategory(${index})">编辑</button>
                        <button class="btn-delete" onclick="deleteCategory(${index})">删除</button>
                    </div>
                </div>
            `;
        } else {
            // 新格式
            html += `
                <div class="category-item">
                    <div class="category-info">
                        <h4>${category.name}</h4>
                        <p>${category.description || '无描述'}</p>
                    </div>
                    <div class="category-actions">
                        <button class="btn-edit" onclick="editCategory(${index})">编辑</button>
                        <button class="btn-delete" onclick="deleteCategory(${index})">删除</button>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// 显示添加分类表单
function showAddCategoryForm() {
    currentEditCategoryId = null;
    document.getElementById('categoryFormTitle').textContent = '添加分类';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryFormContainer').style.display = 'block';
    document.getElementById('categoryName').focus();
}

// 编辑分类
function editCategory(index) {
    currentEditCategoryId = index;
    const category = categoriesData[index];
    
    document.getElementById('categoryFormTitle').textContent = '编辑分类';
    
    if (typeof category === 'string') {
        document.getElementById('categoryName').value = category;
        document.getElementById('categoryDescription').value = '';
        document.getElementById('categoryOrder').value = index;
    } else {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryOrder').value = category.order || index;
    }
    
    document.getElementById('categoryFormContainer').style.display = 'block';
    document.getElementById('categoryName').focus();
}

// 保存分类
function saveCategory() {
    const name = document.getElementById('categoryName').value.trim();
    const description = document.getElementById('categoryDescription').value.trim();
    const order = parseInt(document.getElementById('categoryOrder').value) || 0;
    
    if (!name) {
        alert('请输入分类名称');
        return;
    }
    
    // 检查分类名称是否重复
    const existingIndex = categoriesData.findIndex((cat, index) => {
        const catName = typeof cat === 'string' ? cat : cat.name;
        return catName === name && index !== currentEditCategoryId;
    });
    
    if (existingIndex !== -1) {
        alert('分类名称已存在');
        return;
    }
    
    const categoryData = {
        name: name,
        description: description,
        order: order
    };
    
    if (currentEditCategoryId !== null) {
        // 编辑现有分类
        categoriesData[currentEditCategoryId] = categoryData;
        showSuccess('分类更新成功');
    } else {
        // 添加新分类
        categoriesData.push(categoryData);
        showSuccess('分类添加成功');
    }
    
    // 更新配置数据
    configData.categories = categoriesData;
    
    // 重新渲染
    renderCategoriesTable();
    cancelCategoryForm();
    
    // 保存配置数据到本地数据库
    saveConfigToLocalStorage();
}

// 删除分类
function deleteCategory(index) {
    const category = categoriesData[index];
    const categoryName = typeof category === 'string' ? category : category.name;
    
    if (confirm(`确定要删除分类"${categoryName}"吗？`)) {
        categoriesData.splice(index, 1);
        configData.categories = categoriesData;
        renderCategoriesTable();
        
        // 保存配置数据到本地数据库
        saveConfigToLocalStorage();
        
        showSuccess('分类删除成功');
    }
}

// 取消分类表单
function cancelCategoryForm() {
    document.getElementById('categoryFormContainer').style.display = 'none';
    document.getElementById('categoryForm').reset();
    currentEditCategoryId = null;
}

// 搜索分类
function searchCategories() {
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderCategoriesTable();
        return;
    }
    
    const filteredCategories = categoriesData.filter(category => {
        const name = typeof category === 'string' ? category : category.name;
        const description = typeof category === 'string' ? '' : (category.description || '');
        return name.toLowerCase().includes(searchTerm) || description.toLowerCase().includes(searchTerm);
    });
    
    // 临时渲染搜索结果
    const originalData = categoriesData;
    categoriesData = filteredCategories;
    renderCategoriesTable();
    categoriesData = originalData;
}

// 更新网站名称
function updateSiteName() {
    const siteName = configData.siteName || 'BuyEdu';
    const siteDescription = configData.siteDescription || '专业的学生邮箱和数字产品销售平台';
    
    // 更新页面标题
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = `系统管理面板 - ${siteName}`;
    }
    
    // 更新导航栏中的网站名称
    const siteNameElement = document.getElementById('siteName');
    if (siteNameElement) {
        siteNameElement.textContent = siteName;
    }
}

// ================================
// JS脚本管理功能
// ================================

// 脚本模板
const scriptTemplates = {
    baidu: {
        name: '百度统计',
        type: 'analytics',
        code: `<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?你的统计代码";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>`
    },
    google: {
        name: 'Google Analytics',
        type: 'analytics',
        code: `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`
    },
    cnzz: {
        name: 'CNZZ统计',
        type: 'analytics',
        code: `<script type="text/javascript">
var cnzz_protocol = (("https:" == document.location.protocol) ? "https://" : "http://");
document.write(unescape("%3Cspan id='cnzz_stat_icon_你的站点ID'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s13.cnzz.com/z_stat.php%3Fid%3D你的站点ID' type='text/javascript'%3E%3C/script%3E"));
</script>`
    },
    custom: {
        name: '自定义功能',
        type: 'custom',
        code: `<script>
// 页面加载完成事件
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面已加载完成');
    // 在这里添加你的自定义代码
});

// 页面离开事件
window.addEventListener('beforeunload', function() {
    // 页面离开时的处理
});
</script>`
    }
};

// 加载脚本列表
function loadScripts() {
    const scripts = getScripts();
    const container = document.getElementById('scriptsContainer');
    
    // 添加全局开关
    const globalSwitch = `
        <div class="global-analytics-switch" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #333;">统计代码总开关</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">控制所有统计脚本的启用状态</p>
                </div>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="globalAnalyticsSwitch" ${configData.analytics?.enabled ? 'checked' : ''} onchange="toggleGlobalAnalytics()">
                    <span style="font-weight: 600; color: #2c5aa0;">${configData.analytics?.enabled ? '已启用' : '已禁用'}</span>
                </label>
            </div>
        </div>
    `;
    
    if (scripts.length === 0) {
        container.innerHTML = globalSwitch + `
            <div class="no-scripts">
                <i class="fas fa-code"></i>
                <p>暂无自定义脚本</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = globalSwitch + scripts.map(script => `
        <div class="script-item ${script.enabled ? '' : 'disabled'}">
            <div class="script-header">
                <span class="script-name">${script.name}</span>
                <span class="script-type">${getScriptTypeText(script.type)}</span>
            </div>
            <div class="script-info">
                <small>位置: ${getPositionText(script.position)} | 添加时间: ${new Date(script.createTime).toLocaleString()}</small>
            </div>
            <div class="script-actions">
                <button class="btn-toggle ${script.enabled ? '' : 'disabled'}" onclick="toggleScript('${script.id}')">
                    ${script.enabled ? '禁用' : '启用'}
                </button>
                <button class="btn-edit" onclick="editScript('${script.id}')">编辑</button>
                <button class="btn-delete" onclick="deleteScript('${script.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 获取脚本类型文本
function getScriptTypeText(type) {
    const types = {
        custom: '自定义',
        analytics: '统计分析',
        tracking: '访问跟踪',
        chat: '在线客服',
        seo: 'SEO优化'
    };
    return types[type] || '自定义';
}

// 获取位置文本
function getPositionText(position) {
    const positions = {
        head: '页面头部',
        'body-start': '页面体开始',
        'body-end': '页面体结束'
    };
    return positions[position] || '页面头部';
}

// 获取脚本列表
function getScripts() {
    // 从config中获取脚本列表
    return configData.analytics?.scripts || [];
}

// 保存脚本列表
function saveScripts(scripts) {
    // 确保analytics配置存在
    if (!configData.analytics) {
        configData.analytics = {
            enabled: false,
            scripts: []
        };
    }
    
    // 更新脚本列表
    configData.analytics.scripts = scripts;
    
    // 保存到localStorage
    saveConfigToLocalStorage();
    
    console.log('统计脚本已保存到配置中:', scripts);
}

// 添加脚本
function addScript(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const script = {
        id: 'script_' + Date.now(),
        name: formData.get('scriptName') || document.getElementById('scriptName').value,
        type: document.getElementById('scriptType').value,
        position: document.getElementById('scriptPosition').value,
        code: document.getElementById('scriptCode').value,
        enabled: document.getElementById('scriptEnabled').checked,
        createTime: Date.now()
    };
    
    if (!script.name.trim()) {
        alert('请输入脚本名称');
        return;
    }
    
    if (!script.code.trim()) {
        alert('请输入脚本代码');
        return;
    }
    
    const scripts = getScripts();
    scripts.push(script);
    saveScripts(scripts);
    
    loadScripts();
    resetScriptForm();
    showSuccess('脚本添加成功！');
}

// 重置脚本表单
function resetScriptForm() {
    document.getElementById('scriptForm').reset();
    document.getElementById('scriptEnabled').checked = true;
}

// 显示脚本模板
function showScriptTemplates() {
    const templateDiv = document.getElementById('scriptTemplates');
    templateDiv.style.display = templateDiv.style.display === 'none' ? 'block' : 'none';
}

// 使用模板
function useTemplate(templateKey) {
    const template = scriptTemplates[templateKey];
    if (template) {
        document.getElementById('scriptName').value = template.name;
        document.getElementById('scriptType').value = template.type;
        document.getElementById('scriptCode').value = template.code;
    }
}

// 更新脚本模板（类型选择改变时）
function updateScriptTemplate() {
    const type = document.getElementById('scriptType').value;
    const codeTextarea = document.getElementById('scriptCode');
    
    if (!codeTextarea.value.trim()) {
        switch(type) {
            case 'analytics':
                codeTextarea.placeholder = '例如：Google Analytics、百度统计等统计代码';
                break;
            case 'tracking':
                codeTextarea.placeholder = '例如：用户行为跟踪、页面访问记录等代码';
                break;
            case 'chat':
                codeTextarea.placeholder = '例如：在线客服插件、聊天工具等代码';
                break;
            case 'seo':
                codeTextarea.placeholder = '例如：结构化数据、Meta标签优化等代码';
                break;
            default:
                codeTextarea.placeholder = '请输入或粘贴JavaScript代码...';
        }
    }
}

// 切换脚本状态
function toggleScript(scriptId) {
    const scripts = getScripts();
    const script = scripts.find(s => s.id === scriptId);
    
    if (script) {
        script.enabled = !script.enabled;
        saveScripts(scripts);
        loadScripts();
        showSuccess(`脚本已${script.enabled ? '启用' : '禁用'}`);
    }
}

// 编辑脚本
function editScript(scriptId) {
    const scripts = getScripts();
    const script = scripts.find(s => s.id === scriptId);
    
    if (script) {
        document.getElementById('scriptName').value = script.name;
        document.getElementById('scriptType').value = script.type;
        document.getElementById('scriptPosition').value = script.position;
        document.getElementById('scriptCode').value = script.code;
        document.getElementById('scriptEnabled').checked = script.enabled;
        
        // 修改表单提交行为为更新而不是添加
        const form = document.getElementById('scriptForm');
        form.onsubmit = function(event) {
            event.preventDefault();
            updateScript(scriptId);
        };
        
        // 更改按钮文本
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> 更新脚本';
        
        showSuccess('脚本信息已加载到表单，修改后点击"更新脚本"');
    }
}

// 更新脚本
function updateScript(scriptId) {
    const scripts = getScripts();
    const scriptIndex = scripts.findIndex(s => s.id === scriptId);
    
    if (scriptIndex !== -1) {
        scripts[scriptIndex] = {
            ...scripts[scriptIndex],
            name: document.getElementById('scriptName').value,
            type: document.getElementById('scriptType').value,
            position: document.getElementById('scriptPosition').value,
            code: document.getElementById('scriptCode').value,
            enabled: document.getElementById('scriptEnabled').checked,
            updateTime: Date.now()
        };
        
        saveScripts(scripts);
        loadScripts();
        resetScriptForm();
        
        // 恢复表单的添加功能
        const form = document.getElementById('scriptForm');
        form.onsubmit = addScript;
        
        // 恢复按钮文本
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> 添加脚本';
        
        showSuccess('脚本更新成功！');
    }
}

// 删除脚本
function deleteScript(scriptId) {
    if (confirm('确定要删除这个脚本吗？此操作不可撤销。')) {
        const scripts = getScripts();
        const filteredScripts = scripts.filter(s => s.id !== scriptId);
        saveScripts(filteredScripts);
        loadScripts();
        showSuccess('脚本删除成功！');
    }
}

// 切换全局统计开关
function toggleGlobalAnalytics() {
    const isEnabled = document.getElementById('globalAnalyticsSwitch').checked;
    
    // 确保analytics配置存在
    if (!configData.analytics) {
        configData.analytics = {
            enabled: false,
            scripts: []
        };
    }
    
    // 更新全局开关状态
    configData.analytics.enabled = isEnabled;
    
    // 保存到localStorage
    saveConfigToLocalStorage();
    
    // 更新显示文本
    const statusText = document.querySelector('#globalAnalyticsSwitch + span');
    if (statusText) {
        statusText.textContent = isEnabled ? '已启用' : '已禁用';
    }
    
    showSuccess(`统计代码总开关已${isEnabled ? '启用' : '禁用'}`);
    
    console.log('全局统计开关状态已更新:', isEnabled);
}