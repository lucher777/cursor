// 简繁体转换页面逻辑
let converterS2T, converterT2S;

async function initConverters() {
  try {
    // OpenCC init (异步加载词库)
    // 使用opencc-js正确的API初始化转换器
    converterS2T = OpenCC.Converter({ from: 'cn', to: 't' }); // 简体到繁体
    converterT2S = OpenCC.Converter({ from: 't', to: 'cn' }); // 繁体到简体
    // 转换器就绪后启用按钮
    document.getElementById('btn-to-trad').disabled = false;
    document.getElementById('btn-to-simp').disabled = false;
  } catch (error) {
    console.error('OpenCC初始化失败:', error);
    alert('简繁体转换功能加载失败，请刷新页面重试');
  }
}

function setConvertTexts() {
  document.getElementById('convert-title').textContent = t('convert_title') || '简繁体转换';
  document.getElementById('convert-input').placeholder = t('convert_input_placeholder') || '请输入文本';
  document.getElementById('btn-to-trad').textContent = t('btn_to_trad') || '转为繁体';
  document.getElementById('btn-to-simp').textContent = t('btn_to_simp') || '转为简体';
  document.getElementById('convert-output').placeholder = t('convert_output_placeholder') || '输出';
  document.getElementById('convert-desc').textContent = t('convert_desc') || '支持简体与繁体中文的相互转换。';
}

function renderNav() {
  const nav = document.getElementById('nav-links');
  nav.innerHTML = CONFIG.tools.map(tool => `<a href="${tool.route}" class="nav-link">${t(tool.key)}</a>`).join('');
}

function convertToTrad() {
  if (!converterS2T) return;
  const input = document.getElementById('convert-input').value;
  try {
    const result = converterS2T(input);
    document.getElementById('convert-output').value = result;
  } catch (error) {
    console.error('转换失败:', error);
    alert('转换失败，请重试');
  }
}

function convertToSimp() {
  if (!converterT2S) return;
  const input = document.getElementById('convert-input').value;
  try {
    const result = converterT2S(input);
    document.getElementById('convert-output').value = result;
  } catch (error) {
    console.error('转换失败:', error);
    alert('转换失败，请重试');
  }
}

function initConvertPage() {
  initConverters();
  // 文案在语言加载完毕后设置
  renderFooter();

  // 先禁用按钮，待转换器就绪后启用
  document.getElementById('btn-to-trad').disabled = true;
  document.getElementById('btn-to-simp').disabled = true;
  document.getElementById('btn-to-trad').addEventListener('click', convertToTrad);
  document.getElementById('btn-to-simp').addEventListener('click', convertToSimp);
}

document.addEventListener('DOMContentLoaded', initConvertPage);
// 若语言已提前加载则立即设置文案和导航
if (typeof LANG !== 'undefined' && Object.keys(LANG).length) {
  setConvertTexts();
  renderNav();
}
// 刷新文本在语言加载后
window.addEventListener('langLoaded', () => {
  setConvertTexts();
  renderNav();
  renderFooter();
});
