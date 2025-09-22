// 单位换算逻辑

// 长度单位换算系数（以米为基准）
const LENGTH_UNITS = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  µm: 0.000001,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  fur: 201.168,
  dm: 0.1,
  li: 500, // 里 = 500米
  zhang: 3.333333, // 丈 = 10/3米
  chi: 0.333333, // 尺 = 1/3米
  cun: 0.033333, // 寸 = 1/30米
  fen: 0.003333, // 分 = 1/300米
  li_small: 0.000333 // 厘 = 1/3000米
};

// 重量单位换算系数（以公斤为基准）
const WEIGHT_UNITS = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  oz: 0.0283495231,
  ton: 1000,
  shijin: 0.5, // 市斤 = 0.5公斤
  dan: 50, // 担 = 50公斤
  liang: 0.05, // 两 = 0.05公斤
  qian: 0.005, // 钱 = 0.005公斤
  troy_lb: 0.3732417216, // 金衡磅
  troy_oz: 0.0311034768, // 金衡盎司
  dwt: 0.00155517384, // 英钱
  troy_grain: 0.00006479891, // 金衡格令
  long_ton: 1016.0469088, // 英制长吨
  short_ton: 907.18474, // 美制短吨
  cwt_uk: 50.80234544, // 英担
  cwt_us: 45.359237, // 美担
  stone: 6.35029318, // 英石
  dram: 0.0017718451953125 // 打兰
};

// 面积单位换算系数（以平方公里为基准）
const AREA_UNITS = {
  km2: 1,
  ha: 0.01, // 公顷 = 0.01平方公里
  mu: 0.000666667, // 市亩 = 1/1500平方公里
  m2: 0.000001, // 平方米 = 0.000001平方公里
  dm2: 0.00000001, // 平方分米
  cm2: 0.0000000001, // 平方厘米
  mm2: 0.000000000001, // 平方毫米
  sq_mi: 2.58999, // 平方英里
  acre: 0.004047, // 英亩
  sq_rd: 0.0000253, // 平方竿
  sq_yd: 0.000000836, // 平方码
  sq_ft: 0.0000000929, // 平方英尺
  sq_in: 0.000000000645 // 平方英寸
};

// 体积单位换算系数（以立方米为基准）
const VOLUME_UNITS = {
  m3: 1,
  hl: 0.1, // 公石 = 0.1立方米
  dal: 0.01, // 十升 = 0.01立方米
  l: 0.001, // 升 = 0.001立方米
  dl: 0.0001, // 分升
  cl: 0.00001, // 厘升
  ml: 0.000001, // 毫升
  mm3: 0.000000001, // 立方毫米
  barrel: 0.158987, // 桶
  bu: 0.035239, // 蒲式耳
  pk: 0.00881, // 配克
  qt: 0.000946, // 夸脱
  pt: 0.000473, // 品脱
  gal: 0.003785 // 加仑
};

// 压力单位换算系数（以bar为基准）
const PRESSURE_UNITS = {
  bar: 1,
  kpa: 100,
  hpa: 1000,
  mbar: 1000,
  pa: 100000,
  atm: 0.986923,
  torr: 750.062,
  mmHg: 750.062,
  lbf_ft2: 2088.543,
  lbf_in2: 14.5038,
  inHg: 29.53,
  kgf_cm2: 1.01972,
  kgf_m2: 10197.2,
  mmH2O: 10197.2
};

// 功率单位换算系数（以瓦特W为基准）
const POWER_UNITS = {
  w: 1,
  kw: 0.001,
  hp: 0.00135962,
  ps: 0.00135962,
  kgm_s: 0.101972,
  kcal_s: 0.000238846,
  btu_s: 0.000947817,
  ft_lb_s: 0.737562,
  j: 1,
  nm_s: 1
};

function renderNav() {
  const nav = document.getElementById('nav-links');
  nav.innerHTML = CONFIG.tools.map(tool => `<a href="${tool.route}" class="nav-link">${t(tool.key)}</a>`).join('');
}

// 单位类型导航切换
function initUnitNav() {
  const navItems = document.querySelectorAll('.unit-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // 移除所有active类
      navItems.forEach(nav => nav.classList.remove('active'));
      // 添加active类到当前项
      item.classList.add('active');
      
      // 隐藏所有内容
      document.querySelectorAll('.unit-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // 显示对应内容
      const type = item.getAttribute('data-type');
      const content = document.getElementById(type);
      if (content) {
        content.classList.add('active');
      }
    });
  });
}

// 更新单位值
function updateUnitValues(category, changedUnit, value) {
  const inputs = document.querySelectorAll(`[data-category="${category}"]`);
  let units;
  switch(category) {
    case 'length':
      units = LENGTH_UNITS;
      break;
    case 'weight':
      units = WEIGHT_UNITS;
      break;
    case 'area':
      units = AREA_UNITS;
      break;
    case 'volume':
      units = VOLUME_UNITS;
      break;
    case 'pressure': units = PRESSURE_UNITS; break;
    case 'power': units = POWER_UNITS; break;
    default:
      return;
  }
  
  const baseValue = value * units[changedUnit];
  
  inputs.forEach(input => {
    if (input.getAttribute('data-unit') !== changedUnit) {
      const unit = input.getAttribute('data-unit');
      const factor = units[unit];
      const newValue = baseValue / factor;
      // 格式化数值，去除末尾的0
      let formattedValue = newValue.toFixed(6);
      formattedValue = formattedValue.replace(/\.?0+$/, '');
      if (formattedValue === '') formattedValue = '0';
      input.value = formattedValue;
    }
  });
}

// 初始化单位输入事件
function initUnitInputs() {
  const inputs = document.querySelectorAll('.unit-input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        const category = e.target.getAttribute('data-category');
        const unit = e.target.getAttribute('data-unit');
        updateUnitValues(category, unit, value);
      }
    });
  });
}

// 重置长度单位
function resetLength() {
  const inputs = document.querySelectorAll('[data-category="length"]');
  inputs.forEach(input => {
    const unit = input.getAttribute('data-unit');
    const factor = LENGTH_UNITS[unit];
    let formattedValue = (1 / factor).toFixed(6);
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (formattedValue === '') formattedValue = '0';
    input.value = formattedValue;
  });
}

// 重置重量单位
function resetWeight() {
  const inputs = document.querySelectorAll('[data-category="weight"]');
  inputs.forEach(input => {
    const unit = input.getAttribute('data-unit');
    const factor = WEIGHT_UNITS[unit];
    let formattedValue = (1 / factor).toFixed(6);
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (formattedValue === '') formattedValue = '0';
    input.value = formattedValue;
  });
}

// 重置面积单位
function resetArea() {
  const inputs = document.querySelectorAll('[data-category="area"]');
  inputs.forEach(input => {
    const unit = input.getAttribute('data-unit');
    const factor = AREA_UNITS[unit];
    let formattedValue = (1 / factor).toFixed(6);
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (formattedValue === '') formattedValue = '0';
    input.value = formattedValue;
  });
}

// 重置体积单位
function resetVolume() {
  const inputs = document.querySelectorAll('[data-category="volume"]');
  inputs.forEach(input => {
    const unit = input.getAttribute('data-unit');
    const factor = VOLUME_UNITS[unit];
    let formattedValue = (1 / factor).toFixed(6);
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (formattedValue === '') formattedValue = '0';
    input.value = formattedValue;
  });
}

// 重置压力单位
function resetPressure() {
  const inputs = document.querySelectorAll('[data-category="pressure"]');
  inputs.forEach(input => {
    const unit = input.getAttribute('data-unit');
    const factor = PRESSURE_UNITS[unit];
    let formattedValue = (1 / factor).toFixed(6);
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (formattedValue === '') formattedValue = '0';
    input.value = formattedValue;
  });
}

// 重置功率单位
function resetPower() {
  const inputs = document.querySelectorAll('[data-category="power"]');
  inputs.forEach(input => {
    const unit = input.getAttribute('data-unit');
    const factor = POWER_UNITS[unit];
    let formattedValue = (1 / factor).toFixed(6);
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (formattedValue === '') formattedValue = '0';
    input.value = formattedValue;
  });
}

function renderAll() {
  renderNav();
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  initUnitNav();
  initUnitInputs();
  
  // 多语言切换时刷新
  window.renderAll = renderAll;
}); 