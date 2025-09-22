/**
 * Node-RED Playground - 主初始化脚本
 * 这是游乐场的入口文件，包含基础功能和示例代码
 */

;(function() {
    "use strict";
    
    // 等待游乐场准备好
    document.addEventListener('playground-ready', function() {
        console.log('🎮 [Playground Init] 开始初始化游乐场功能...');
        
        // 初始化所有功能
        initToolbarButton();
        initSidebarTab();
        initCustomActions();
        initEventListeners();
        
        console.log('✅ [Playground Init] 所有功能初始化完成!');
    });
    
    /**
     * 添加工具栏按钮
     */
    function initToolbarButton() {
        NodeREDPlayground.utils.waitForElement('.red-ui-header-toolbar', function(toolbar) {
            // 创建游乐场按钮
            const playgroundBtn = document.createElement('button');
            playgroundBtn.className = 'playground-button';
            playgroundBtn.innerHTML = '🎮 Playground';
            playgroundBtn.title = '游乐场 - 查看自定义功能';
            
            playgroundBtn.addEventListener('click', function() {
                // 显示游乐场信息
                showPlaygroundInfo();
            });
            
            // 插入到工具栏末尾
            toolbar.appendChild(playgroundBtn);
            
            NodeREDPlayground.utils.log('✅ 工具栏按钮已添加');
        });
    }
    
    /**
     * 添加侧边栏标签页
     */
    function initSidebarTab() {
        NodeREDPlayground.utils.waitForRED(function() {
            try {
                // 确保 jQuery 可用
                if (typeof $ === 'undefined') {
                    NodeREDPlayground.utils.error('jQuery ($) 不可用');
                    return;
                }
                
                // 创建侧边栏内容
                const content = $(`
                    <div class="playground-status-panel">
                        <h3>🎮 Node-RED 游乐场</h3>
                        <p>欢迎来到 Node-RED UI 定制开发环境！</p>
                        
                        <h4>📊 状态信息</h4>
                        <ul>
                            <li>版本: <strong>${NodeREDPlayground.version}</strong></li>
                            <li>状态: <strong style="color: green;">已启用</strong></li>
                            <li>调试模式: <strong>${NodeREDPlayground.debug ? '开启' : '关闭'}</strong></li>
                        </ul>
                        
                        <h4>🛠️ 快速操作</h4>
                        <button class="playground-button" onclick="NodeREDPlayground.examples.showNotification()">
                            显示通知
                        </button>
                        <button class="playground-button" onclick="NodeREDPlayground.examples.highlightNodes()">
                            高亮节点
                        </button>
                        <button class="playground-button" onclick="NodeREDPlayground.examples.showWorkspaceInfo()">
                            工作区信息
                        </button>
                        
                        <h4>📝 开发日志</h4>
                        <div id="playground-log" style="background: #f9f9f9; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px;">
                            <div>[${new Date().toLocaleTimeString()}] 游乐场已启动</div>
                        </div>
                        
                        <h4>🔗 有用链接</h4>
                        <p style="font-size: 12px;">
                            <a href="https://nodered.org/docs/api/ui/" target="_blank">Node-RED UI API</a> |
                            <a href="#" onclick="NodeREDPlayground.examples.openDocs()">本地文档</a>
                        </p>
                    </div>
                `);
                
                // 检查 RED.sidebar 是否可用
                if (!RED.sidebar || typeof RED.sidebar.addTab !== 'function') {
                    NodeREDPlayground.utils.error('RED.sidebar.addTab 不可用');
                    return;
                }
                
                // 添加侧边栏标签页
                RED.sidebar.addTab({
                    id: "playground",
                    label: "游乐场",
                    name: "Playground",
                    content: content,
                    iconClass: "fa fa-gamepad"
                });
                
                NodeREDPlayground.utils.log('✅ 侧边栏标签页已添加');
                
            } catch (error) {
                NodeREDPlayground.utils.error('添加侧边栏失败:', error);
            }
        });
    }
    
    /**
     * 注册自定义动作
     */
    function initCustomActions() {
        NodeREDPlayground.utils.waitForRED(function() {
            // 注册显示游乐场信息的动作
            RED.actions.add("playground:show-info", showPlaygroundInfo);
            
            // 注册快捷键 Ctrl+Shift+P (Playground)
            RED.keyboard.add("ctrl-shift-p", "playground:show-info");
            
            NodeREDPlayground.utils.log('✅ 自定义动作已注册');
        });
    }
    
    /**
     * 初始化事件监听器
     */
    function initEventListeners() {
        NodeREDPlayground.utils.waitForRED(function() {
            // 监听部署事件
            RED.events.on("deploy", function() {
                addLog('🚀 流程已部署');
                NodeREDPlayground.utils.notify("游乐场检测到流程部署", "info");
            });
            
            // 监听节点添加事件
            RED.events.on("nodes:add", function(node) {
                addLog(`➕ 添加节点: ${node.type} (${node.id})`);
            });
            
            // 监听节点删除事件
            RED.events.on("nodes:remove", function(node) {
                addLog(`❌ 删除节点: ${node.type} (${node.id})`);
            });
            
            NodeREDPlayground.utils.log('✅ 事件监听器已初始化');
        });
    }
    
    /**
     * 显示游乐场信息对话框
     */
    function showPlaygroundInfo() {
        const nodeCount = RED.nodes.getAllFlowTabs().length;
        const totalNodes = Object.keys(RED.nodes.getNodeMap()).length;
        
        RED.notify(`
            🎮 Node-RED 游乐场信息<br>
            版本: ${NodeREDPlayground.version}<br>
            工作区数量: ${nodeCount}<br>
            节点总数: ${totalNodes}<br>
            状态: 运行中
        `, {
            type: "info",
            timeout: 5000
        });
    }
    
    /**
     * 添加日志到游乐场面板
     */
    function addLog(message) {
        const logElement = document.getElementById('playground-log');
        if (logElement) {
            const time = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `[${time}] ${message}`;
            logElement.appendChild(logEntry);
            
            // 自动滚动到底部
            logElement.scrollTop = logElement.scrollHeight;
            
            // 限制日志条数
            while (logElement.children.length > 50) {
                logElement.removeChild(logElement.firstChild);
            }
        }
    }
    
    // 创建示例功能命名空间
    NodeREDPlayground.examples = {
        
        /**
         * 显示示例通知
         */
        showNotification: function() {
            const messages = [
                "🎉 这是一个成功通知!",
                "⚠️ 这是一个警告通知!",
                "❌ 这是一个错误通知!",
                "ℹ️ 这是一个信息通知!"
            ];
            
            const types = ["success", "warning", "error", "info"];
            const index = Math.floor(Math.random() * messages.length);
            
            RED.notify(messages[index], types[index]);
            addLog(`通知: ${messages[index]}`);
        },
        
        /**
         * 高亮所有节点
         */
        highlightNodes: function() {
            const allNodes = RED.view.getActiveNodes();
            
            if (allNodes.length === 0) {
                RED.notify("当前工作区没有节点", "info");
                return;
            }
            
            // 临时高亮样式
            const style = document.createElement('style');
            style.innerHTML = `
                .red-ui-flow-node {
                    box-shadow: 0 0 10px #0094d9 !important;
                    animation: playground-pulse 2s infinite;
                }
                
                @keyframes playground-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
            
            // 3秒后移除效果
            setTimeout(() => {
                document.head.removeChild(style);
            }, 3000);
            
            RED.notify(`高亮了 ${allNodes.length} 个节点`, "success");
            addLog(`高亮了 ${allNodes.length} 个节点`);
        },
        
        /**
         * 显示工作区信息
         */
        showWorkspaceInfo: function() {
            const activeWorkspace = RED.workspaces.active();
            const allWorkspaces = RED.workspaces.list();
            const activeNodes = RED.view.getActiveNodes();
            
            const info = `
                当前工作区: ${activeWorkspace ? activeWorkspace.label : '无'}<br>
                工作区总数: ${allWorkspaces.length}<br>
                当前节点数: ${activeNodes.length}<br>
                缩放级别: ${Math.round(RED.view.scale() * 100)}%
            `;
            
            RED.notify(info, {
                type: "info",
                timeout: 4000
            });
            
            addLog(`工作区信息已显示`);
        },
        
        /**
         * 打开文档
         */
        openDocs: function() {
            RED.notify("文档功能开发中...", "info");
            addLog('用户点击了文档链接');
        }
    };
    
    // 将示例功能添加到全局对象
    NodeREDPlayground.addLog = addLog;
    
    console.log('📝 [Playground Init] 初始化脚本已加载');
    
})();