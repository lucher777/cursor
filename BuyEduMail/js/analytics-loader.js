// 统计代码加载器
// 负责从config中读取统计代码配置并应用到页面

class AnalyticsLoader {
    constructor() {
        this.config = null;
        this.scripts = [];
        this.isEnabled = false;
    }

    // 初始化统计代码加载器
    async init() {
        try {
            await this.loadConfig();
            this.loadAnalyticsSettings();
            this.applyScripts();
        } catch (error) {
            console.error('统计代码加载器初始化失败:', error);
        }
    }

    // 加载配置
    async loadConfig() {
        try {
            // 优先从localStorage加载配置
            const savedConfig = localStorage.getItem('buyedu_config');
            if (savedConfig) {
                this.config = JSON.parse(savedConfig);
                console.log('从localStorage加载统计配置成功');
                return;
            }

            // 如果localStorage没有配置，从文件加载
            const response = await fetch('data/config.json');
            this.config = await response.json();
            console.log('从文件加载统计配置成功');
        } catch (error) {
            console.error('加载统计配置失败:', error);
            this.config = { analytics: { enabled: false, scripts: [] } };
        }
    }

    // 加载统计设置
    loadAnalyticsSettings() {
        if (!this.config || !this.config.analytics) {
            this.isEnabled = false;
            this.scripts = [];
            return;
        }

        this.isEnabled = this.config.analytics.enabled || false;
        this.scripts = this.config.analytics.scripts || [];

        console.log('统计设置加载完成:', {
            enabled: this.isEnabled,
            scriptCount: this.scripts.length
        });
    }

    // 应用统计脚本
    applyScripts() {
        if (!this.isEnabled) {
            console.log('统计代码总开关已禁用，跳过脚本应用');
            return;
        }

        if (this.scripts.length === 0) {
            console.log('没有配置统计脚本');
            return;
        }

        // 按位置分组脚本
        const headScripts = this.scripts.filter(s => s.enabled && s.position === 'head');
        const bodyStartScripts = this.scripts.filter(s => s.enabled && s.position === 'body-start');
        const bodyEndScripts = this.scripts.filter(s => s.enabled && s.position === 'body-end');

        // 应用头部脚本
        this.applyScriptsByPosition(headScripts, 'head');
        
        // 应用页面体开始脚本
        this.applyScriptsByPosition(bodyStartScripts, 'body-start');
        
        // 应用页面体结束脚本
        this.applyScriptsByPosition(bodyEndScripts, 'body-end');

        console.log(`统计脚本应用完成: 头部${headScripts.length}个, 体开始${bodyStartScripts.length}个, 体结束${bodyEndScripts.length}个`);
    }

    // 按位置应用脚本
    applyScriptsByPosition(scripts, position) {
        if (scripts.length === 0) return;

        scripts.forEach((script, index) => {
            try {
                this.applySingleScript(script, position, index);
            } catch (error) {
                console.error(`应用脚本失败 [${script.name}]:`, error);
            }
        });
    }

    // 应用单个脚本
    applySingleScript(script, position, index) {
        const scriptId = `analytics_${script.id}_${position}_${index}`;
        
        // 检查脚本是否已经存在
        if (document.getElementById(scriptId)) {
            console.log(`脚本 ${script.name} 已存在，跳过重复应用`);
            return;
        }

        // 创建脚本元素
        const scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.setAttribute('data-analytics-script', script.name);
        scriptElement.setAttribute('data-analytics-type', script.type);
        scriptElement.setAttribute('data-analytics-position', position);

        // 设置脚本内容
        if (script.code.includes('<script>')) {
            // 如果代码包含script标签，提取内容
            const codeContent = script.code.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '$1');
            scriptElement.textContent = codeContent;
        } else {
            // 直接使用代码内容
            scriptElement.textContent = script.code;
        }

        // 根据位置插入脚本
        switch (position) {
            case 'head':
                document.head.appendChild(scriptElement);
                break;
            case 'body-start':
                if (document.body) {
                    document.body.insertBefore(scriptElement, document.body.firstChild);
                } else {
                    // 如果body还不存在，等待DOM加载完成
                    document.addEventListener('DOMContentLoaded', () => {
                        document.body.insertBefore(scriptElement, document.body.firstChild);
                    });
                }
                break;
            case 'body-end':
                if (document.body) {
                    document.body.appendChild(scriptElement);
                } else {
                    // 如果body还不存在，等待DOM加载完成
                    document.addEventListener('DOMContentLoaded', () => {
                        document.body.appendChild(scriptElement);
                    });
                }
                break;
        }

        console.log(`脚本 ${script.name} 已应用到 ${position} 位置`);
    }

    // 重新加载统计代码（用于配置更新后）
    async reload() {
        console.log('重新加载统计代码...');
        
        // 移除现有的统计脚本
        this.removeExistingScripts();
        
        // 重新初始化
        await this.init();
    }

    // 移除现有的统计脚本
    removeExistingScripts() {
        const existingScripts = document.querySelectorAll('[data-analytics-script]');
        existingScripts.forEach(script => {
            script.remove();
        });
        console.log(`已移除 ${existingScripts.length} 个现有统计脚本`);
    }

    // 获取当前统计状态
    getStatus() {
        return {
            enabled: this.isEnabled,
            scriptCount: this.scripts.length,
            enabledScriptCount: this.scripts.filter(s => s.enabled).length,
            config: this.config?.analytics || null
        };
    }
}

// 创建全局实例
window.analyticsLoader = new AnalyticsLoader();

// 页面加载时自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analyticsLoader.init();
    });
} else {
    // 如果DOM已经加载完成，直接初始化
    window.analyticsLoader.init();
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsLoader;
} 