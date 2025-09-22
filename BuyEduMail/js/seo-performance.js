/**
 * SEO和性能优化脚本
 * 包含图片懒加载、预加载关键资源、页面性能监控等功能
 */

// 图片懒加载
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// 预加载关键资源
function preloadCriticalResources() {
    const criticalResources = [
        '/css/styles.css',
        '/js/main.js'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// 页面性能监控
function trackPagePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                
                // 发送性能数据到分析服务（这里只是示例）
                console.log('页面加载时间:', loadTime + 'ms');
                
                // 如果页面加载时间超过3秒，记录警告
                if (loadTime > 3000) {
                    console.warn('页面加载时间过长，可能影响SEO排名');
                }
            }, 0);
        });
    }
}

// Core Web Vitals 监控
function trackCoreWebVitals() {
    // 监控 Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
                
                // LCP应该小于2.5秒
                if (lastEntry.startTime > 2500) {
                    console.warn('LCP超过2.5秒，需要优化');
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.log('LCP监控不支持');
        }

        // 监控 First Input Delay (FID)
        try {
            const fidObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    
                    // FID应该小于100ms
                    if (entry.processingStart - entry.startTime > 100) {
                        console.warn('FID超过100ms，需要优化JavaScript执行');
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.log('FID监控不支持');
        }
    }
}

// 添加结构化数据
function addStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

// 优化页面标题和描述
function optimizePageMeta(title, description, keywords) {
    // 更新页面标题
    if (title) {
        document.title = title;
        
        // 更新Open Graph标题
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.content = title;
        }
    }

    // 更新页面描述
    if (description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = description;
        }
        
        // 更新Open Graph描述
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.content = description;
        }
    }

    // 更新关键词
    if (keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.content = keywords;
        }
    }
}

// 初始化所有SEO优化功能
function initSEOOptimizations() {
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLazyLoading();
            trackPagePerformance();
            trackCoreWebVitals();
        });
    } else {
        initLazyLoading();
        trackPagePerformance();
        trackCoreWebVitals();
    }
    
    // 预加载关键资源
    preloadCriticalResources();
}

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initLazyLoading,
        preloadCriticalResources,
        trackPagePerformance,
        trackCoreWebVitals,
        addStructuredData,
        optimizePageMeta,
        initSEOOptimizations
    };
}

// 自动初始化
initSEOOptimizations();