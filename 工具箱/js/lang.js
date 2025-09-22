// 多语言支持
let LANG = {};
let currentLang = 'zh'; // 强制使用中文

function loadLang(lang, cb) {
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      LANG = data;
      currentLang = lang;
      localStorage.setItem('lang', lang);
      if (cb) cb();
      // 通知其他脚本语言已加载
      window.dispatchEvent(new Event('langLoaded'));
    });
}

function t(key) {
  return LANG[key] || key;
}

function initLangSelect() {
  // 语言切换功能已隐藏，不需要初始化
}

// 初始化语言（默认中文）
loadLang('zh', () => {
  if (typeof renderAll === 'function') renderAll();
}); 