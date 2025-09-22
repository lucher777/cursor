// 工具箱全局配置
const CONFIG = {
  tools: [
    { id: 'ip', icon: '🌐', route: 'ip.html', key: 'tool_ip' },
    { id: 'calculator', icon: '🧮', route: 'calculator.html', key: 'tool_calculator' },
    { id: 'unit', icon: '📏', route: 'unit.html', key: 'tool_unit' },
    { id: 'time', icon: '⏰', route: 'time.html', key: 'tool_time' },
    { id: 'convert', icon: '🔄', route: 'convert.html', key: 'tool_convert' },
    // 可继续添加更多工具
  ],
  languages: [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' }
  ],
  defaultLang: 'zh',
  theme: {
    primary: '#3bb78f',
    secondary: '#0bab64',
    cardBg: '#fff',
    cardShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderRadius: '16px'
  },
  footer: {
    zh: '©2024 工具箱 | 保留所有权利',
    en: '©2024 Toolbox | All rights reserved.'
  }
}; 