// 默认导航数据
let navItems = [
  {
    id: 1,
    title: "不同交易所收益计算器",
    url: "https://bz.panpans.cn",
    logo: "GH"
  },
  {
    id: 2,
    title: "三角套利组合",
    url: "https://3j.panpans.cn/",
    logo: "G"
  },
  {
    id: 3,
    title: "多交易所价格展示",
    url: "https://api.panpans.cn/",
    logo: "SO"
  },
  {
    id: 4,
    title: "C2C多币种计算器",
    url: "https://otc.panpans.cn/",
    logo: "C2C"
  },,
  {
    id: 5,
    title: "mai.panpans.cn",
    url: "https://mai.panpans.cn/",
    logo: "mai"
  },,
  {
    id: 6,
    title: "citespace",
    url: "https://citespace.panpans.cn/",
    logo: "CT"
  },,
  {
    id: 7,
    title: "论文",
    url: "https://paper.panpans.cn/",
    logo: "PR"
  }
];

// 当前编辑的项目ID
let currentEditId = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
  loadNavData();
  renderNavGrid();
  setupEventListeners();
});

// 从localStorage加载数据
function loadNavData() {
  const savedData = localStorage.getItem('navItems');
  if (savedData) {
    navItems = JSON.parse(savedData);
  }
}

// 保存数据到localStorage
function saveNavData() {
  localStorage.setItem('navItems', JSON.stringify(navItems));
}

// 渲染导航网格
function renderNavGrid() {
  const gridContainer = document.getElementById('navGrid');
  
  // 清空现有内容
  gridContainer.innerHTML = '';
  
  // 创建导航卡片
  navItems.forEach(item => {
    const card = createNavCard(item);
    gridContainer.appendChild(card);
  });
  
  // 添加"添加新站点"卡片
  const addCard = createAddCard();
  gridContainer.appendChild(addCard);
}

// 创建导航卡片
function createNavCard(item) {
  const card = document.createElement('div');
  card.className = 'nav-card';
  card.dataset.id = item.id;
  
  card.innerHTML = `
    <div class="nav-logo">${item.logo}</div>
    <h3 class="nav-title">${item.title}</h3>
    <p class="nav-url">${item.url}</p>
    <button class="edit-btn">编辑</button>
  `;
  
  // 添加点击事件跳转链接
  card.addEventListener('click', function(e) {
    if (!e.target.classList.contains('edit-btn')) {
      window.open(item.url, '_blank');
    }
  });
  
  // 添加编辑按钮事件
  const editBtn = card.querySelector('.edit-btn');
  editBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    openEditModal(item.id);
  });
  
  return card;
}

// 创建添加卡片
function createAddCard() {
  const card = document.createElement('div');
  card.className = 'nav-card add-card';
  
  card.innerHTML = `
    <div class="nav-logo">+</div>
    <h3 class="nav-title">添加新站点</h3>
  `;
  
  card.addEventListener('click', function() {
    openEditModal(null);
  });
  
  return card;
}

// 设置事件监听器
function setupEventListeners() {
  // 模态框关闭按钮
  document.getElementById('closeModal').addEventListener('click', closeModal);
  
  // 表单提交
  document.getElementById('navForm').addEventListener('submit', handleFormSubmit);
  
  // 删除按钮
  document.getElementById('deleteBtn').addEventListener('click', deleteNavItem);
  
  // 点击模态框外部关闭
  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
  
  // 搜索功能
  document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// 打开编辑模态框
function openEditModal(id) {
  currentEditId = id;
  
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const deleteBtn = document.getElementById('deleteBtn');
  
  if (id === null) {
    // 添加新模式
    title.textContent = '添加新站点';
    document.getElementById('title').value = '';
    document.getElementById('url').value = '';
    document.getElementById('logo').value = '';
    deleteBtn.style.display = 'none';
  } else {
    // 编辑模式
    title.textContent = '编辑站点';
    const item = navItems.find(item => item.id === id);
    if (item) {
      document.getElementById('title').value = item.title;
      document.getElementById('url').value = item.url;
      document.getElementById('logo').value = item.logo;
    }
    deleteBtn.style.display = 'block';
  }
  
  modal.classList.add('show');
}

// 关闭模态框
function closeModal() {
  document.getElementById('modal').classList.remove('show');
  document.getElementById('navForm').reset();
  currentEditId = null;
}

// 处理表单提交
function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value.trim();
  const url = document.getElementById('url').value.trim();
  const logo = document.getElementById('logo').value.trim();
  
  if (!title || !url) {
    alert('请填写标题和URL');
    return;
  }
  
  // 验证URL格式
  let formattedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    formattedUrl = 'https://' + url;
  }
  
  if (currentEditId === null) {
    // 添加新项目
    const newItem = {
      id: Date.now(), // 使用时间戳作为唯一ID
      title: title,
      url: formattedUrl,
      logo: logo || title.charAt(0).toUpperCase()
    };
    
    navItems.push(newItem);
  } else {
    // 更新现有项目
    const index = navItems.findIndex(item => item.id === currentEditId);
    if (index !== -1) {
      navItems[index].title = title;
      navItems[index].url = formattedUrl;
      navItems[index].logo = logo || title.charAt(0).toUpperCase();
    }
  }
  
  // 保存并重新渲染
  saveNavData();
  renderNavGrid();
  closeModal();
}

// 删除导航项
function deleteNavItem() {
  if (currentEditId === null) return;
  
  if (confirm('确定要删除这个导航项吗？')) {
    navItems = navItems.filter(item => item.id !== currentEditId);
    saveNavData();
    renderNavGrid();
    closeModal();
  }
}

// 处理搜索
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.nav-card:not(.add-card)');
  
  cards.forEach(card => {
    const title = card.querySelector('.nav-title').textContent.toLowerCase();
    const url = card.querySelector('.nav-url').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || url.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}