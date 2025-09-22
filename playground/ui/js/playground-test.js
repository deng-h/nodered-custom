/**
 * 简化的 Playground 测试脚本
 * 确保基本功能可以工作
 */

;(function() {
    "use strict";
    
    console.log('🎮 [Playground Test] 脚本已加载');
    
    // 创建简化的全局对象
    window.NodeREDPlayground = {
        version: '1.0.0-test',
        initialized: false
    };
    
    // 简单的初始化函数
    function initPlayground() {
        console.log('🎮 [Playground Test] 开始初始化...');
        
        // 等待 RED 对象
        function waitForRED() {
            if (typeof RED !== 'undefined' && RED.events) {
                console.log('✅ [Playground Test] RED 对象已准备好');
                
                // 添加一个简单的工具栏按钮
                addTestButton();
                
                // 添加一个简单的侧边栏
                addTestSidebar();
                
                window.NodeREDPlayground.initialized = true;
                console.log('🎉 [Playground Test] 初始化完成!');
            } else {
                console.log('⏳ [Playground Test] 等待 RED 对象...');
                setTimeout(waitForRED, 500);
            }
        }
        
        waitForRED();
    }
    
    // 添加测试按钮
    function addTestButton() {
        console.log('🔧 [Playground Test] 添加测试按钮...');
        
        function addButton() {
            const toolbar = document.querySelector('.red-ui-header-toolbar');
            if (toolbar) {
                const btn = document.createElement('button');
                btn.style.cssText = `
                    background: #0094d9;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    margin: 2px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                `;
                btn.innerHTML = '🎮 测试';
                btn.onclick = function() {
                    if (typeof RED !== 'undefined' && RED.notify) {
                        RED.notify('Playground 测试按钮工作正常！', 'success');
                    } else {
                        alert('Playground 测试按钮工作正常！');
                    }
                };
                toolbar.appendChild(btn);
                console.log('✅ [Playground Test] 测试按钮已添加');
            } else {
                console.log('⏳ [Playground Test] 等待工具栏...');
                setTimeout(addButton, 500);
            }
        }
        
        addButton();
    }
    
    // 添加测试侧边栏
    function addTestSidebar() {
        console.log('📋 [Playground Test] 添加测试侧边栏...');
        
        if (typeof $ === 'undefined') {
            console.error('❌ [Playground Test] jQuery 不可用');
            return;
        }
        
        if (!RED.sidebar || typeof RED.sidebar.addTab !== 'function') {
            console.error('❌ [Playground Test] RED.sidebar.addTab 不可用');
            return;
        }
        
        try {
            const content = $(`
                <div style="padding: 15px; font-family: Arial, sans-serif;">
                    <h3 style="color: #333; margin-top: 0;">🎮 Playground 测试</h3>
                    <p>如果您能看到这个面板，说明 Playground 基本功能正常！</p>
                    <button style="background: #0094d9; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer;" onclick="alert('测试侧边栏按钮工作正常！')">
                        测试按钮
                    </button>
                    <hr style="margin: 15px 0;">
                    <p style="font-size: 12px; color: #666;">
                        版本: ${window.NodeREDPlayground.version}<br>
                        时间: ${new Date().toLocaleString()}
                    </p>
                </div>
            `);
            
            RED.sidebar.addTab({
                id: "playground-test",
                label: "测试",
                name: "Test",
                content: content,
                iconClass: "fa fa-flask"
            });
            
            console.log('✅ [Playground Test] 测试侧边栏已添加');
            
        } catch (error) {
            console.error('❌ [Playground Test] 添加测试侧边栏失败:', error);
        }
    }
    
    // 启动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayground);
    } else {
        initPlayground();
    }
    
})();