/**
 * 示例：Hello Playground
 * 这是一个简单的示例，展示如何在游乐场中添加基础功能
 */

;(function() {
    "use strict";
    
    // 等待游乐场准备好
    document.addEventListener('playground-ready', function() {
        console.log('📝 [Hello Playground] 初始化示例组件...');
        
        initHelloFeatures();
    });
    
    /**
     * 初始化 Hello 功能
     */
    function initHelloFeatures() {
        // 注册 Hello Playground 组件
        NodeREDPlayground.registerComponent('hello-playground', {
            name: 'Hello Playground',
            version: '1.0.0',
            
            init: function() {
                this.addMenuOption();
                this.addContextMenu();
                this.setupGreeting();
            },
            
            addMenuOption: function() {
                // 等待 RED 准备好后添加菜单选项
                NodeREDPlayground.utils.waitForRED(function() {
                    // 这里可以添加到主菜单，但为了简单起见，我们添加一个工具栏按钮
                    NodeREDPlayground.utils.waitForElement('.red-ui-header-toolbar', function(toolbar) {
                        const helloBtn = document.createElement('button');
                        helloBtn.className = 'playground-button';
                        helloBtn.innerHTML = '👋 Hello';
                        helloBtn.title = '点击打招呼';
                        
                        helloBtn.addEventListener('click', function() {
                            showGreeting();
                        });
                        
                        toolbar.appendChild(helloBtn);
                        
                        NodeREDPlayground.utils.log('✅ Hello 按钮已添加');
                    });
                });
            },
            
            addContextMenu: function() {
                // 这里可以添加右键菜单项
                // Node-RED 的上下文菜单需要特殊处理，这里作为示例
                NodeREDPlayground.utils.log('📋 Hello 上下文菜单已准备');
            },
            
            setupGreeting: function() {
                // 设置问候功能
                NodeREDPlayground.hello = {
                    greet: function(name) {
                        const greetings = [
                            `🎉 你好, ${name}! 欢迎来到 Node-RED 游乐场!`,
                            `🌟 嗨, ${name}! 准备好开始定制 Node-RED 了吗?`,
                            `🚀 Hello, ${name}! 让我们一起探索 Node-RED 的无限可能!`,
                            `💡 ${name}, 欢迎加入 Node-RED 开发者社区!`
                        ];
                        
                        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
                        return greeting;
                    },
                    
                    showTip: function() {
                        const tips = [
                            "💡 提示：使用 Ctrl+Shift+P 打开游乐场信息",
                            "🎯 技巧：在右侧侧边栏查看游乐场面板",
                            "🔧 建议：修改 playground/ui/ 下的文件来定制功能",
                            "📚 学习：查看 playground/docs/ 获取更多文档",
                            "🎮 探索：点击工具栏的游乐场按钮查看功能"
                        ];
                        
                        const tip = tips[Math.floor(Math.random() * tips.length)];
                        RED.notify(tip, {
                            type: "info",
                            timeout: 4000
                        });
                        
                        NodeREDPlayground.addLog(`显示提示: ${tip}`);
                    }
                };
                
                NodeREDPlayground.utils.log('✅ Hello 问候功能已设置');
            }
        });
        
        // 初始化组件
        NodeREDPlayground.components['hello-playground'].init();
        
        NodeREDPlayground.utils.log('✅ Hello Playground 组件初始化完成');
    }
    
    /**
     * 显示问候对话框
     */
    function showGreeting() {
        // 创建一个简单的输入对话框
        const name = prompt('请输入您的名字:', '开发者');
        
        if (name && name.trim()) {
            const greeting = NodeREDPlayground.hello.greet(name.trim());
            
            RED.notify(greeting, {
                type: "success",
                timeout: 3000
            });
            
            NodeREDPlayground.addLog(`问候: ${name}`);
            
            // 3秒后显示一个提示
            setTimeout(() => {
                NodeREDPlayground.hello.showTip();
            }, 3500);
        }
    }
    
    console.log('📝 [Hello Playground] 示例脚本已加载');
    
})();