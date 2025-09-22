// 脚本加载器 - 用于在前端页面中加载管理员添加的自定义脚本
(function() {
    'use strict';

    // 获取已启用的脚本
    function getEnabledScripts() {
        try {
            const scripts = localStorage.getItem('buyedu_scripts');
            if (!scripts) return [];
            
            const parsedScripts = JSON.parse(scripts);
            return parsedScripts.filter(script => script.enabled);
        } catch (error) {
            console.warn('加载自定义脚本失败:', error);
            return [];
        }
    }

    // 注入脚本到页面
    function injectScripts() {
        const scripts = getEnabledScripts();
        
        if (scripts.length === 0) {
            return;
        }

        scripts.forEach(script => {
            try {
                // 根据脚本位置决定插入位置
                let targetElement;
                switch (script.position) {
                    case 'head':
                        targetElement = document.head;
                        break;
                    case 'body-start':
                        targetElement = document.body;
                        break;
                    case 'body-end':
                        targetElement = document.body;
                        break;
                    default:
                        targetElement = document.head;
                }

                if (!targetElement) {
                    console.warn('无法找到插入位置:', script.position);
                    return;
                }

                // 创建容器元素
                const container = document.createElement('div');
                container.style.display = 'none';
                container.setAttribute('data-script-id', script.id);
                container.setAttribute('data-script-name', script.name);
                
                // 处理脚本代码
                let code = script.code;
                
                // 如果代码不包含script标签，自动包装
                if (!code.includes('<script') && !code.includes('</script>')) {
                    code = `<script>\n${code}\n</script>`;
                }

                container.innerHTML = code;

                // 插入到指定位置
                if (script.position === 'body-end') {
                    targetElement.appendChild(container);
                } else {
                    if (script.position === 'body-start' && targetElement.firstChild) {
                        targetElement.insertBefore(container, targetElement.firstChild);
                    } else {
                        targetElement.appendChild(container);
                    }
                }

                // 执行脚本
                const scripts = container.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const oldScript = scripts[i];
                    const newScript = document.createElement('script');
                    
                    // 复制属性
                    for (let j = 0; j < oldScript.attributes.length; j++) {
                        const attr = oldScript.attributes[j];
                        newScript.setAttribute(attr.name, attr.value);
                    }
                    
                    // 复制内容
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    
                    // 替换脚本
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }

                console.log('已加载自定义脚本:', script.name);

            } catch (error) {
                console.error('加载脚本失败:', script.name, error);
            }
        });
    }

    // 在页面加载完成后注入脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectScripts);
    } else {
        injectScripts();
    }

    // 为开发和调试提供全局方法
    window.BuyEduScripts = {
        reload: injectScripts,
        getEnabled: getEnabledScripts,
        version: '1.0.0'
    };

})();