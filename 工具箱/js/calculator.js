// 多语言标题
function setCalcTexts() {
  document.getElementById('calc-title-text').textContent = t('tool_calculator') || '计算器';
}

function renderNav() {
  const nav = document.getElementById('nav-links');
  nav.innerHTML = CONFIG.tools.map(tool => `<a href="${tool.route}" class="nav-link">${t(tool.key)}</a>`).join('');
}

const buttons = [
  // 第一行
  { label: 'π', val: 'pi', class: 'science' },
  { label: 'e', val: 'e', class: 'science' },
  { label: '|x|', val: 'abs', class: 'science' },
  { label: '1/x', val: 'inv', class: 'science' },
  { label: '!', val: 'fact', class: 'science' },
  // 第二行
  { label: 'ln', val: 'ln', class: 'science' },
  { label: 'log', val: 'log', class: 'science' },
  { label: 'asin', val: 'asin', class: 'science' },
  { label: 'acos', val: 'acos', class: 'science' },
  { label: 'atan', val: 'atan', class: 'science' },
  // 第三行
  { label: '清空', val: 'C', class: 'danger' },
  { label: '(', val: '(', class: 'op' },
  { label: ')', val: ')', class: 'op' },
  { label: '/', val: '/', class: 'op' },
  { label: '√', val: 'sqrt', class: 'op' },
  // 第四行
  { label: '7', val: '7' },
  { label: '8', val: '8' },
  { label: '9', val: '9' },
  { label: 'x', val: '*', class: 'op' },
  { label: '^', val: 'pow', class: 'op' },
  // 第五行
  { label: '4', val: '4' },
  { label: '5', val: '5' },
  { label: '6', val: '6' },
  { label: '-', val: '-', class: 'op' },
  { label: 'sin', val: 'sin', class: 'science' },
  // 第六行
  { label: '1', val: '1' },
  { label: '2', val: '2' },
  { label: '3', val: '3' },
  { label: '+', val: '+', class: 'op' },
  { label: 'cos', val: 'cos', class: 'science' },
  // 第七行
  { label: '0', val: '0' },
  { label: '.', val: '.' },
  { label: '删除', val: 'back', class: 'danger' },
  { label: '=', val: '=', class: 'op' },
  { label: 'tan', val: 'tan', class: 'science' }
];

let expr = '';
let lastAns = '';

function renderButtons() {
  const btns = buttons.map(btn => `<button class="calc-btn${btn.class ? ' ' + btn.class : ''}" data-val="${btn.val}">${btn.label}</button>`).join('');
  document.getElementById('calc-buttons').innerHTML = btns;
}

function updateScreen(val) {
  document.getElementById('calc-screen').textContent = val;
}

function calcEval(raw) {
  let s = raw.replace(/÷/g, '/').replace(/×/g, '*');
  s = s.replace(/π/g, Math.PI).replace(/e/g, Math.E);
  s = s.replace(/√/g, 'sqrt');
  // 替换科学函数
  s = s.replace(/sin/g, 'Math.sin');
  s = s.replace(/cos/g, 'Math.cos');
  s = s.replace(/tan/g, 'Math.tan');
  s = s.replace(/asin/g, 'Math.asin');
  s = s.replace(/acos/g, 'Math.acos');
  s = s.replace(/atan/g, 'Math.atan');
  s = s.replace(/ln/g, 'Math.log');
  s = s.replace(/log/g, 'Math.log10');
  s = s.replace(/sqrt/g, 'Math.sqrt');
  s = s.replace(/abs/g, 'Math.abs');
  s = s.replace(/inv/g, '1/');
  // 幂
  s = s.replace(/(\d+(?:\.\d+)?)\^([\d.]+)/g, 'Math.pow($1,$2)');
  // 阶乘
  s = s.replace(/(\d+)!/g, (m, n) => fact(Number(n)));
  // 允许上一次答案
  s = s.replace(/Ans/g, lastAns || '0');
  return eval(s);
}
function fact(n) {
  if (n < 0) return NaN;
  if (n === 0) return 1;
  let r = 1;
  for (let i = 1; i <= n; i++) r *= i;
  return r;
}

function handleBtn(val) {
  if (val === 'C') {
    expr = '';
    updateScreen('0');
    return;
  }
  if (val === 'back') {
    expr = expr.slice(0, -1);
    updateScreen(expr || '0');
    return;
  }
  if (val === '=') {
    try {
      let res = calcEval(expr);
      if (typeof res === 'number' && !isNaN(res)) {
        lastAns = res;
        updateScreen(res);
        expr = '' + res;
      } else {
        updateScreen('错误');
      }
    } catch {
      updateScreen('错误');
    }
    return;
  }
  if (val === 'sqrt') {
    expr += 'sqrt(';
    updateScreen(expr);
    return;
  }
  if (val === 'pow') {
    expr += '^';
    updateScreen(expr);
    return;
  }
  if (val === 'pi') {
    expr += 'π';
    updateScreen(expr);
    return;
  }
  if (val === 'e') {
    expr += 'e';
    updateScreen(expr);
    return;
  }
  if (["sin","cos","tan","ln","log","asin","acos","atan","abs"].includes(val)) {
    expr += val + '(';
    updateScreen(expr);
    return;
  }
  if (val === 'inv') {
    expr += 'inv('; // 1/(
    updateScreen(expr);
    return;
  }
  if (val === 'fact') {
    expr += '!';
    updateScreen(expr);
    return;
  }
  expr += val;
  updateScreen(expr);
}

document.addEventListener('DOMContentLoaded', () => {
  setCalcTexts();
  renderNav();
  renderButtons();
  updateScreen('0');
  document.getElementById('calc-buttons').onclick = e => {
    if (e.target.classList.contains('calc-btn')) {
      handleBtn(e.target.getAttribute('data-val'));
    }
  };
  // 键盘支持
  document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') handleBtn(e.key);
    if (e.key === '.') handleBtn('.');
    if (e.key === '+') handleBtn('+');
    if (e.key === '-') handleBtn('-');
    if (e.key === '*' || e.key === 'x') handleBtn('*');
    if (e.key === '/' || e.key === '÷') handleBtn('/');
    if (e.key === 'Enter' || e.key === '=') handleBtn('=');
    if (e.key === 'Backspace') handleBtn('back');
    if (e.key === 'Delete') handleBtn('C');
    if (e.key === '(') handleBtn('(');
    if (e.key === ')') handleBtn(')');
  });
  // 多语言切换时刷新
  window.renderAll = function() {
    setCalcTexts();
    renderNav();
  };
}); 