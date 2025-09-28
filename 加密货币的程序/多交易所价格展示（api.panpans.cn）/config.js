import { formatUtils } from './tools.js';

export const CONFIG = {
    // 模板字符串
    TEMPLATES: {
        priceCell: (value, compareValue, link, vol) => {
            const volDisplay = vol ? ` (${formatUtils.formatVolume(vol)})` : '';
    const isHigher = value > compareValue;
    return `
        <a href="${link}" target="_blank" class="${isHigher ? 'price-high' : 'price-low'}">
            $${value}${volDisplay} ${isHigher ? '↑' : '↓'}
        </a>
    `;
}
    },

    // 其他静态配置
    TABLE_COLUMNS: {
        'symbol': 1,
        'price': 2,
        // ...其他列配置
    }
};