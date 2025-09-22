// IP查询页面逻辑
function setIpTexts() {
  document.getElementById('ip-title-text').textContent = t('ip_title') || 'IP地址查询';
  document.getElementById('ip-input').placeholder = t('ip_input_placeholder') || '请输入IP地址';
  document.getElementById('ip-query-btn').textContent = t('ip_query_btn') || '查询';
  document.getElementById('ip-desc').textContent = t('ip_desc') || '查询IP地址的详细信息';
}

function renderNav() {
  const nav = document.getElementById('nav-links');
  nav.innerHTML = CONFIG.tools.map(tool => `<a href="${tool.route}" class="nav-link">${t(tool.key)}</a>`).join('');
}

function renderIpInfo(data) {
  if (!data.success) {
    document.getElementById('ip-value').textContent = '查询失败';
    document.getElementById('ip-isp').textContent = '';
    document.getElementById('ip-brief-info').innerHTML = `<span class='ip-badge ip-badge-secondary'>${data.message || '无法获取信息'}</span>`;
    return;
  }
  
  const ipData = data.data;
  document.getElementById('ip-value').textContent = ipData.ip || '-';
  document.getElementById('ip-isp').textContent = ipData.org ? `运营商: ${ipData.org}` : '';
  
  // 位置分组
  let badges1 = '';
  if (ipData.country_name) badges1 += `<span class='ip-badge'><span class='icon'>🌏</span>${ipData.country_name}</span>`;
  if (ipData.region) badges1 += `<span class='ip-badge'><span class='icon'>🏞️</span>${ipData.region}</span>`;
  if (ipData.city) badges1 += `<span class='ip-badge'><span class='icon'>🏙️</span>${ipData.city}</span>`;
  
  // 时区/坐标分组
  let badges2 = '';
  if (ipData.timezone) badges2 += `<span class='ip-badge'><span class='icon'>⏰</span>${ipData.timezone}</span>`;
  if (ipData.latitude && ipData.longitude) badges2 += `<span class='ip-badge'><span class='icon'>📍</span>${ipData.latitude}, ${ipData.longitude}</span>`;
  
  // ASN/网络分组
  let badges3 = '';
  if (ipData.asn) badges3 += `<span class='ip-badge'><span class='icon'>📡</span>${ipData.asn}</span>`;
  if (ipData.org) badges3 += `<span class='ip-badge'><span class='icon'>🏢</span>${ipData.org}</span>`;
  
  document.getElementById('ip-brief-info').innerHTML =
    `<div class='ip-badge-group'>${badges1}</div>` +
    (badges2 ? `<div class='ip-badge-group'>${badges2}</div>` : '') +
    (badges3 ? `<div class='ip-badge-group'>${badges3}</div>` : '');
}

function showLoading() {
  document.getElementById('ip-value').textContent = '查询中...';
  document.getElementById('ip-isp').textContent = '';
  document.getElementById('ip-brief-info').textContent = '';
}

function queryIp(ip) {
  showLoading();
  
  // 使用新的API
  const apiUrl = ip ? 
    `http://127.0.0.1:3001/proxy/ip-info-cn?ip=${ip}` : 
    `http://127.0.0.1:3001/proxy/ip-info-cn`;
  
  fetch(apiUrl)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP错误! 状态: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      renderIpInfo(data);
    })
    .catch(error => {
      console.error('IP查询错误:', error);
      document.getElementById('ip-value').textContent = '查询失败';
      document.getElementById('ip-brief-info').innerHTML = `<span class='ip-badge ip-badge-secondary'>网络错误，请检查网络连接或稍后重试</span>`;
    });
}

// 验证IP地址格式
function isValidIP(ip) {
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const ipv6CompressedRegex = /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
}

document.addEventListener('DOMContentLoaded', () => {
  setIpTexts();
  renderNav();
  
  // 页面加载时立即自动查询访问者的IP地址
  console.log('开始自动查询访问者IP地址及代理信息...');
  queryIp();

  // 查询按钮点击事件
  document.getElementById('ip-query-btn').onclick = () => {
    const ip = document.getElementById('ip-input').value.trim();
    
    // 如果输入了IP地址，验证格式
    if (ip && !isValidIP(ip)) {
      alert('IP地址格式不正确，请输入有效的IPv4或IPv6地址');
      return;
    }
    
    queryIp(ip);
  };
  
  // 支持回车键查询
  document.getElementById('ip-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('ip-query-btn').click();
    }
  });

  // 多语言切换时刷新文本
  window.renderAll = function() {
    setIpTexts();
    renderNav();
    // 保持当前IP信息不变，不重新查询
  };
});