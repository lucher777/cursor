// 全局变量
let productsData = [];
let configData = {};

// 商品类型图标映射
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

// 分类图标映射
const categoryIcons = {
    '优惠': { icon: 'fas fa-tags', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    '腾讯': { icon: 'fab fa-tencent-weibo', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    '论客': { icon: 'fas fa-comments', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    '网易': { icon: 'fas fa-globe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    '无限别名': { icon: 'fas fa-infinity', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
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
    loadData();
    
    // 监听搜索框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
});

// 加载数据
async function loadData() {
    try {

        
        // 检查是否通过HTTP服务器访问
        if (window.location.protocol === 'file:') {
            throw new Error('检测到您正在使用file://协议访问页面。请使用HTTP服务器（如VS Code Live Server等）来运行此项目。');
        }
        
        // 加载商品数据

        const productsResponse = await fetch('data/products.json');
        if (!productsResponse.ok) {
            throw new Error(`加载商品数据失败: ${productsResponse.status} ${productsResponse.statusText}`);
        }
        productsData = await productsResponse.json();

        
        // 加载配置数据

        const configResponse = await fetch('data/config.json');
        if (!configResponse.ok) {
            throw new Error(`加载配置数据失败: ${configResponse.status} ${configResponse.statusText}`);
        }
        configData = await configResponse.json();

        
        // 设置网站名称
        updateSiteName();
        
        // 数据加载完成
        
        // 渲染商品
        renderProducts();

        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('数据加载失败: ' + error.message);
        
        // 在页面上显示错误信息
        const categoriesContainer = document.getElementById('productCategories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <h3>数据加载失败</h3>
                    <p>${error.message}</p>
                    <p>请确保通过HTTP服务器访问此页面，而不是直接打开HTML文件。</p>
                    <p>您可以：</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>使用VS Code Live Server扩展</li>
                        <li>使用其他HTTP服务器</li>
                    </ul>
                    <p>然后访问：http://localhost:8000</p>
                </div>
            `;
        }
    }
}

// 渲染商品列表
function renderProducts() {

    
    // 检查数据是否加载
    if (!productsData || productsData.length === 0) {
        console.error('商品数据未加载或为空');
        showError('商品数据未加载，请刷新页面重试');
        return;
    }
    
    // 获取所有唯一的分类
    const allCategories = [...new Set(productsData.map(product => product.categoryName))];

    
    // 如果有配置数据，使用配置中的分类顺序，否则使用数据中发现的分类
    const categoriesToShow = configData && configData.categories ? configData.categories : allCategories;

    
    // 清空现有的分类容器
    const categoriesContainer = document.getElementById('productCategories');
    if (!categoriesContainer) {
        console.error('找不到productCategories容器');
        showError('页面结构错误：找不到商品分类容器');
        return;
    }
    categoriesContainer.innerHTML = '';
    
    // 为每个分类创建区域
    categoriesToShow.forEach(category => {
        const categoryProducts = productsData.filter(product => product.categoryName === category);
        
        if (categoryProducts.length > 0) {
            createCategorySection(category, categoryProducts);
    
        }
    });
    

}

// 创建分类区域
function createCategorySection(categoryName, products) {
    const categoriesContainer = document.getElementById('productCategories');
    
    // 生成安全的ID（避免中文字符问题）
    const safeId = `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 获取分类图标
    const categoryIcon = categoryIcons[categoryName] || categoryIcons['默认'];
    
    // 创建分类区域的HTML结构
    const sectionHTML = `
        <section class="products-section">
            <h2 class="section-title">
                <i class="${categoryIcon.icon}" style="background: ${categoryIcon.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"></i> ${categoryName}
            </h2>
            <div class="products-table">
                <div class="table-header">
                    <div class="col-logo">商品名称</div>
                    <div class="col-type">类型</div>
                    <div class="col-stock">库存</div>
                    <div class="col-price">价格</div>
                    <div class="col-action">操作</div>
                </div>
                <div id="${safeId}" class="table-body">
                    <!-- 商品将通过JavaScript动态加载 -->
                </div>
            </div>
        </section>
    `;
    
    // 添加到容器中
    categoriesContainer.insertAdjacentHTML('beforeend', sectionHTML);
    
    // 渲染该分类的商品
    renderProductCategory(safeId, products);
}

// 渲染商品分类
function renderProductCategory(containerId, products) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<div class="no-products">暂无商品</div>';
        return;
    }
    
    products.forEach(product => {
        const productRow = createProductRow(product);
        container.appendChild(productRow);
    });
}

// 创建商品行
function createProductRow(product) {
    const row = document.createElement('div');
    row.className = 'product-row';
    
    // 获取商品图标
    const productIcon = getProductIcon(product);
    
    row.innerHTML = `
        <div class="product-info">
            <div class="product-icon" style="background: ${productIcon.gradient}">
                <i class="${productIcon.icon}"></i>
            </div>
            <div class="product-name" onclick="showProductDetail(${product.id})">${product.name}</div>
        </div>
        <div class="type-badge"><i class="fas fa-bolt"></i>自动发货</div>
        <div class="stock-count">${product.stock}</div>
        <div class="price">${configData.currency}${product.price.toFixed(2)}</div>
        <div>
            <button class="buy-btn" onclick="goToBuyPage(${product.id})">购买</button>
        </div>
    `;
    
    return row;
}

// 直接跳转到购买页面
function goToBuyPage(productId) {
    window.open(`buy.html?product=${productId}`, '_blank');
}

// 显示商品详情
function showProductDetail(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    // 获取商品图标
    const productIcon = getProductIcon(product);
    
    modalContent.innerHTML = `
        <div class="product-detail">
            <h2>
                <div class="product-icon" style="background: ${productIcon.gradient}">
                    <i class="${productIcon.icon}"></i>
                </div>
                ${product.name}
            </h2>
            
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>商品类型</strong>
                    ${product.type}
                </div>
                <div class="detail-item">
                    <strong>库存数量</strong>
                    ${product.stock} 件
                </div>
                <div class="detail-item">
                    <strong>商品价格</strong>
                    ${configData.currency}${product.price.toFixed(2)}
                </div>
                <div class="detail-item">
                    <strong>商品分类</strong>
                    ${product.category}
                </div>
            </div>
            
            ${product.description ? `
                <div class="product-description">
                    <strong>商品描述：</strong>
                    <p>${product.description}</p>
                    ${product.features ? `<p><strong>功能特性：</strong>${product.features}</p>` : ''}
                    ${product.loginUrl ? `<p><strong>登录地址：</strong><a href="${product.loginUrl}" target="_blank">${product.loginUrl}</a></p>` : ''}
                    ${product.accountFormat ? `<p><strong>账号格式：</strong>${product.accountFormat}</p>` : ''}
                    ${product.notes ? `<p><strong>注意事项：</strong>${product.notes}</p>` : ''}
                </div>
            ` : ''}
            
            ${getPaymentMethodsHTML()}
            
            <div class="buy-section">
                <h3>立即购买</h3>
                <div class="price-display">${configData.currency}${product.price.toFixed(2)}</div>
                <div class="buy-form">
                    <input type="email" class="email-input" placeholder="请收卡邮箱账号" id="buyerEmail">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="changeQuantity(-1)">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}" id="quantity">
                        <button onclick="changeQuantity(1)">+</button>
                    </div>
                    <button class="final-buy-btn" onclick="buyProduct(${product.id})">
                        <i class="fas fa-shopping-cart"></i> 提交订单
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 修改数量
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    const maxValue = parseInt(quantityInput.max);
    const newValue = Math.max(1, Math.min(maxValue, currentValue + delta));
    quantityInput.value = newValue;
}

// 购买商品
function buyProduct(productId) {
    const email = document.getElementById('buyerEmail').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!email) {
        alert('请输入邮箱地址');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址');
        return;
    }
    
    if (quantity < 1) {
        alert('购买数量不能少于1');
        return;
    }
    
    const product = productsData.find(p => p.id === productId);
    if (quantity > product.stock) {
        alert('库存不足');
        return;
    }
    
    // 跳转到购买页面
    const buyUrl = configData.buyRedirectUrl + '?product=' + productId + '&email=' + encodeURIComponent(email) + '&quantity=' + quantity;
    window.open(buyUrl, '_blank');
    
    closeModal();
}

// 邮箱验证
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 搜索商品
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderProducts();
        return;
    }
    
    const filteredProducts = productsData.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.type.toLowerCase().includes(searchTerm)
    );
    

    
    // 获取所有分类
    const categoriesToShow = configData && configData.categories ? configData.categories : [...new Set(productsData.map(product => product.categoryName))];
    
    // 清空现有的分类容器
    const categoriesContainer = document.getElementById('productCategories');
    categoriesContainer.innerHTML = '';
    
    // 按分类分组显示搜索结果
    categoriesToShow.forEach(category => {
        const categoryProducts = filteredProducts.filter(product => product.categoryName === category);
        
        if (categoryProducts.length > 0) {
            createCategorySection(category, categoryProducts);
        }
    });
    
    // 如果没有找到任何商品，显示提示信息
    if (filteredProducts.length === 0) {
        categoriesContainer.innerHTML = '<div class="no-products" style="text-align: center; padding: 40px; color: #666;">未找到相关商品</div>';
    }
}



// 关闭模态框
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// 显示在线客服
function showOnlineService() {
    // 跳转到 Telegram 联系客服
    window.open('https://t.me/buymailbot1', '_blank');
}

// 显示咨询订单
function showConsultOrder() {
    // 跳转到咨询订单页面
    window.location.href = 'order-inquiry.html';
}

// 显示管理员登录
function showAdminLogin() {
    // 直接跳转到系统访问页面
    window.location.href = 'access.html';
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    
    if (event.target === productModal) {
        closeModal();
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
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
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
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

// 更新网站名称
function updateSiteName() {
    const siteName = configData.siteName || 'BuyEdu';
    const siteDescription = configData.siteDescription || '专业的学生邮箱和数字产品销售平台';
    
    // 更新页面标题
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = `${siteName} - ${siteDescription}`;
    }
    
    // 更新导航栏中的网站名称
    const siteNameElement = document.getElementById('siteName');
    if (siteNameElement) {
        siteNameElement.textContent = siteName;
    }
}

// 生成收款方式HTML
function getPaymentMethodsHTML() {
    const paymentMethodsConfig = configData.paymentMethods || [];
    
    // 提取启用的支付方式
    const enabledMethods = paymentMethodsConfig
        .filter(method => method.enabled)
        .map(method => {
            // 将中文名称映射为代码
            const nameToCode = {
                '支付宝': 'alipay',
                '微信支付': 'wechat', 
                '微信': 'wechat',
                'USDT': 'usdt',
                'TRX': 'trx'
            };
            return nameToCode[method.name] || method.name.toLowerCase();
        });
    
    if (!enabledMethods || enabledMethods.length === 0) {
        return '';
    }
    
    let html = `
        <div class="payment-methods-section">
            <h3>选择支付方式</h3>
            <div class="payment-methods">
    `;
    
    const methodIcons = {
        alipay: { icon: 'fab fa-alipay', color: '#1677ff', name: '支付宝' },
        wechat: { icon: 'fab fa-weixin', color: '#07c160', name: '微信支付' },
        usdt: { icon: 'fab fa-bitcoin', color: '#f7931a', name: 'USDT' },
        trx: { icon: 'fas fa-coins', color: '#ff0013', name: 'TRX' }
    };
    
    // 每两个支付方式创建一行
    for (let i = 0; i < enabledMethods.length; i += 2) {
        html += '<div class="payment-methods-row">';
        
        // 第一个支付方式
        const method1 = enabledMethods[i];
        const methodInfo1 = methodIcons[method1];
        if (methodInfo1) {
            html += `
                <div class="payment-method" onclick="selectPaymentMethod('${method1}')" data-method="${method1}">
                    <i class="${methodInfo1.icon}" style="color: ${methodInfo1.color};"></i>
                    <span>${methodInfo1.name}</span>
                </div>
            `;
        }
        
        // 第二个支付方式（如果存在）
        if (i + 1 < enabledMethods.length) {
            const method2 = enabledMethods[i + 1];
            const methodInfo2 = methodIcons[method2];
            if (methodInfo2) {
                html += `
                    <div class="payment-method" onclick="selectPaymentMethod('${method2}')" data-method="${method2}">
                        <i class="${methodInfo2.icon}" style="color: ${methodInfo2.color};"></i>
                        <span>${methodInfo2.name}</span>
                    </div>
                `;
            }
        } else {
            // 如果只有奇数个支付方式，添加一个空的单元格
            html += '<div class="payment-method" style="visibility: hidden;"></div>';
        }
        
        html += '</div>';
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// 选择支付方式
function selectPaymentMethod(method) {
    // 移除所有支付方式的选中状态
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 添加选中状态到当前选择的支付方式
    const selectedMethod = document.querySelector(`.payment-method[data-method="${method}"]`);
    if (selectedMethod) {
        selectedMethod.classList.add('selected');
    }
    
    // 保存选择的支付方式到localStorage
    localStorage.setItem('selectedPaymentMethod', method);
}