// 时间工具页面逻辑
function setTimeTexts() {
  document.getElementById('time-title-text').textContent = t('time_title') || '当前时间';
  document.getElementById('time-desc').textContent = t('time_desc') || '显示本地时间、日期和农历信息。';
}

function renderNav() {
  const nav = document.getElementById('nav-links');
  nav.innerHTML = CONFIG.tools.map(tool => `<a href="${tool.route}" class="nav-link">${t(tool.key)}</a>`).join('');
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const weekday = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][date.getDay()];
  const weekOfYear = Math.ceil(((date - new Date(date.getFullYear(),0,1)) / 86400000 + new Date(date.getFullYear(),0,1).getDay()+1) / 7);
  return `${y}年${m}月${d}日  ${weekday} ，第${weekOfYear}周`;
}

function formatLunar(date) {
  try {
    const lunarStr = new Intl.DateTimeFormat('zh-u-ca-chinese', { year:'numeric', month:'long', day:'numeric' }).format(date);
    // 去掉前缀“农历”
    return lunarStr.replace(/^农历/, '').replace('年闰', '年 闰');
  } catch(e) {
    return '';
  }
}

function updateTime() {
  const now = new Date();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  document.getElementById('time-value').textContent = `${hh}:${mm}:${ss}`;
  document.getElementById('time-date').textContent = formatDate(now);
  const lunar = formatLunar(now);
  document.getElementById('time-lunar').textContent = lunar ? `农历 ${lunar}` : '';
}

function initTimePage(){
  setTimeTexts();
  renderNav();
  renderFooter();
  updateTime();
  setInterval(updateTime, 1000);
}

document.addEventListener('DOMContentLoaded', initTimePage);
// 当语言加载完毕后，刷新文本和导航
window.addEventListener('langLoaded', () => {
  setTimeTexts();
  renderNav();
  renderFooter();
});