function renderNav() {
  const nav = document.getElementById('nav-links');
  nav.innerHTML = CONFIG.tools.map(tool => `<a href="${tool.route}" class="nav-link">${t(tool.key)}</a>`).join('');
}

function renderTools() {
  const grid = document.getElementById('tools-grid');
  grid.innerHTML = CONFIG.tools.map(tool => `
    <div class="tool-card" onclick="location.href='${tool.route}'">
      <div class="tool-icon">${tool.icon}</div>
      <div class="tool-title">${t(tool.key)}</div>
    </div>
  `).join('');
}

function renderFooter() {
  document.getElementById('footer-text').textContent = CONFIG.footer[currentLang] || '';
}

function renderAll() {
  renderNav();
  renderTools();
  renderFooter();
}

document.addEventListener('DOMContentLoaded', () => {
  initLangSelect();
  renderAll();
}); 