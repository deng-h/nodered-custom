const fs = require('fs');
const path = require('path');

// 游乐场构建脚本
console.log('🎮 构建 Node-RED 游乐场...');

const playgroundRoot = path.resolve(__dirname, '..');
const targetDir = path.resolve(__dirname, '../../packages/node_modules/@node-red/editor-client/public/red');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
    console.error('❌ 目标目录不存在:', targetDir);
    process.exit(1);
}

// 读取所有 playground 文件
function collectFiles(dir, extension) {
    const files = [];
    
    function walkDir(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walkDir(fullPath);
            } else if (item.endsWith(extension)) {
                files.push(fullPath);
            }
        }
    }
    
    walkDir(dir);
    return files;
}

// 收集 JS 文件
const jsFiles = [
    ...collectFiles(path.join(playgroundRoot, 'ui/js'), '.js'),
    ...collectFiles(path.join(playgroundRoot, 'ui/components'), '.js'),
    ...collectFiles(path.join(playgroundRoot, 'ui/examples'), '.js')
];

// 收集 CSS 文件
const cssFiles = [
    ...collectFiles(path.join(playgroundRoot, 'ui/css'), '.css'),
    ...collectFiles(path.join(playgroundRoot, 'ui/components'), '.css')
];

// 合并 JS 文件
let jsContent = `/**
 * Node-RED Playground - UI 定制开发环境
 * 自动生成文件，请勿直接编辑
 * 构建时间: ${new Date().toISOString()}
 */

;(function() {
    "use strict";
    
    // 创建全局 playground 命名空间
    window.NodeREDPlayground = {
        version: '1.0.0',
        initialized: false,
        debug: true,
        
        // 工具函数
        utils: {
            log: function() {
                if (window.NodeREDPlayground.debug) {
                    console.log('[Playground]', ...arguments);
                }
            },
            
            error: function() {
                console.error('[Playground]', ...arguments);
            },
            
            notify: function(message, type = 'info') {
                if (typeof RED !== 'undefined' && RED.notify) {
                    RED.notify(message, type);
                } else {
                    console.log('[Playground Notify]', type, ':', message);
                }
            },
            
            waitForElement: function(selector, callback, timeout = 5000) {
                const startTime = Date.now();
                
                function check() {
                    const element = document.querySelector(selector);
                    if (element) {
                        callback(element);
                    } else if (Date.now() - startTime < timeout) {
                        setTimeout(check, 100);
                    } else {
                        window.NodeREDPlayground.utils.error('等待元素超时:', selector);
                    }
                }
                
                check();
            },
            
            waitForRED: function(callback) {
                function checkRED() {
                    if (typeof RED !== 'undefined' && RED.events) {
                        callback();
                    } else {
                        setTimeout(checkRED, 100);
                    }
                }
                checkRED();
            }
        },
        
        // 组件注册
        components: {},
        
        registerComponent: function(name, component) {
            this.components[name] = component;
            this.utils.log('注册组件:', name);
        }
    };
    
    // 主初始化函数
    function initPlayground() {
        window.NodeREDPlayground.utils.log('🎮 初始化游乐场...');
        
        // 等待 RED 准备好
        window.NodeREDPlayground.utils.waitForRED(function() {
            window.NodeREDPlayground.utils.log('✅ RED 已准备好');
            
            // 标记为已初始化
            window.NodeREDPlayground.initialized = true;
            
            // 触发初始化完成事件
            if (typeof CustomEvent !== 'undefined') {
                document.dispatchEvent(new CustomEvent('playground-ready'));
            }
            
            window.NodeREDPlayground.utils.log('🎮 游乐场初始化完成!');
        });
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayground);
    } else {
        initPlayground();
    }

`;

// 添加所有 JS 文件内容
for (const jsFile of jsFiles) {
    try {
        const content = fs.readFileSync(jsFile, 'utf8');
        const relativePath = path.relative(playgroundRoot, jsFile);
        
        jsContent += `\n// === ${relativePath} ===\n`;
        jsContent += content;
        jsContent += '\n';
        
        console.log('✅ 添加 JS 文件:', relativePath);
    } catch (error) {
        console.error('❌ 读取 JS 文件失败:', jsFile, error.message);
    }
}

jsContent += '\n})();\n';

// 合并 CSS 文件
let cssContent = `/**
 * Node-RED Playground - 样式文件
 * 自动生成文件，请勿直接编辑
 * 构建时间: ${new Date().toISOString()}
 */

/* 游乐场基础样式 */
.playground-button {
    background: #0094d9 !important;
    color: white !important;
    border: none !important;
    padding: 6px 12px !important;
    margin: 2px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important;
    transition: background-color 0.2s !important;
}

.playground-button:hover {
    background: #0066a0 !important;
}

.playground-button:active {
    background: #004d77 !important;
}

.playground-input {
    border: 1px solid #ccc !important;
    padding: 8px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
}

.playground-status-panel {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    border-radius: 4px !important;
    padding: 10px !important;
    margin: 10px 0 !important;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
    .playground-status-panel {
        background: #2d3748 !important;
        border-color: #4a5568 !important;
        color: #e2e8f0 !important;
    }
    
    .playground-input {
        background: #2d3748 !important;
        border-color: #4a5568 !important;
        color: #e2e8f0 !important;
    }
}

`;

// 添加所有 CSS 文件内容
for (const cssFile of cssFiles) {
    try {
        const content = fs.readFileSync(cssFile, 'utf8');
        const relativePath = path.relative(playgroundRoot, cssFile);
        
        cssContent += `\n/* === ${relativePath} === */\n`;
        cssContent += content;
        cssContent += '\n';
        
        console.log('✅ 添加 CSS 文件:', relativePath);
    } catch (error) {
        console.error('❌ 读取 CSS 文件失败:', cssFile, error.message);
    }
}

// 写入目标文件
try {
    // 写入 JS 文件
    const jsTarget = path.join(targetDir, 'playground.js');
    fs.writeFileSync(jsTarget, jsContent);
    console.log('✅ 生成 playground.js:', jsTarget);
    
    // 写入 CSS 文件
    const cssTarget = path.join(targetDir, 'playground.css');
    fs.writeFileSync(cssTarget, cssContent);
    console.log('✅ 生成 playground.css:', cssTarget);
    
    // 生成统计信息
    console.log('📊 构建统计:');
    console.log('  - JS 文件数:', jsFiles.length);
    console.log('  - CSS 文件数:', cssFiles.length);
    console.log('  - JS 文件大小:', Math.round(jsContent.length / 1024), 'KB');
    console.log('  - CSS 文件大小:', Math.round(cssContent.length / 1024), 'KB');
    
    console.log('🎉 游乐场构建完成!');
    
} catch (error) {
    console.error('❌ 写入文件失败:', error.message);
    process.exit(1);
}