/**
 * 示例：自定义侧边栏
 * 展示如何创建和管理自定义侧边栏面板
 */

;(function() {
    "use strict";
    
    // 等待游乐场准备好
    document.addEventListener('playground-ready', function() {
        console.log('📋 [Custom Sidebar] 初始化自定义侧边栏...');
        
        initCustomSidebar();
    });
    
    /**
     * 初始化自定义侧边栏
     */
    function initCustomSidebar() {
        NodeREDPlayground.utils.waitForRED(function() {
            
            // 创建工具侧边栏
            createToolsSidebar();
            
            // 创建信息侧边栏
            createInfoSidebar();
            
            NodeREDPlayground.utils.log('✅ 自定义侧边栏初始化完成');
        });
    }
    
    /**
     * 创建工具侧边栏
     */
    function createToolsSidebar() {
        try {
            // 确保 jQuery 可用
            if (typeof $ === 'undefined') {
                NodeREDPlayground.utils.error('jQuery ($) 不可用于工具侧边栏');
                return;
            }
            
            const toolsContent = $(`
                <div class="playground-status-panel">
                    <h3>🔧 开发工具</h3>
                    
                    <h4>节点操作</h4>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.selectAllNodes()">
                        选择所有节点
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.clearWorkspace()">
                        清空工作区
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.exportFlow()">
                        导出流程
                    </button>
                    
                    <h4>视图操作</h4>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.fitToScreen()">
                        适应屏幕
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.zoomIn()">
                        放大
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.zoomOut()">
                        缩小
                    </button>
                    
                    <h4>开发辅助</h4>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.showGridLines()">
                        显示网格
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.toggleSnapToGrid()">
                        网格对齐
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.measureDistance()">
                        距离测量
                    </button>
                    
                    <h4>快速生成</h4>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.generateTestFlow()">
                        生成测试流程
                    </button>
                    <button class="playground-button" onclick="NodeREDPlayground.tools.addDebugNodes()">
                        添加调试节点
                    </button>
                </div>
            `);
            
            // 检查 RED.sidebar 是否可用
            if (!RED.sidebar || typeof RED.sidebar.addTab !== 'function') {
                NodeREDPlayground.utils.error('RED.sidebar.addTab 不可用于工具面板');
                return;
            }
            
            RED.sidebar.addTab({
                id: "playground-tools",
                label: "工具",
                name: "Tools",
                content: toolsContent,
                iconClass: "fa fa-wrench"
            });
            
            // 初始化工具函数
            initToolsFunctions();
            
            NodeREDPlayground.utils.log('✅ 工具侧边栏已创建');
            
        } catch (error) {
            NodeREDPlayground.utils.error('创建工具侧边栏失败:', error);
        }
    }
    
    /**
     * 创建信息侧边栏
     */
    function createInfoSidebar() {
        try {
            // 确保 jQuery 可用
            if (typeof $ === 'undefined') {
                NodeREDPlayground.utils.error('jQuery ($) 不可用于信息侧边栏');
                return;
            }
            
            const infoContent = $(`
                <div class="playground-status-panel">
                    <h3>📊 系统信息</h3>
                    
                    <h4>运行时信息</h4>
                    <div id="runtime-info">
                        <p>加载中...</p>
                    </div>
                    
                    <h4>节点统计</h4>
                    <div id="node-stats">
                        <p>加载中...</p>
                    </div>
                    
                    <h4>性能监控</h4>
                    <div id="performance-monitor">
                        <p>加载中...</p>
                    </div>
                    
                    <h4>最近活动</h4>
                    <div id="recent-activity" style="max-height: 150px; overflow-y: auto; font-size: 12px;">
                        <p>无活动记录</p>
                    </div>
                    
                    <button class="playground-button" onclick="NodeREDPlayground.info.refresh()">
                        刷新信息
                    </button>
                </div>
            `);
            
            // 检查 RED.sidebar 是否可用
            if (!RED.sidebar || typeof RED.sidebar.addTab !== 'function') {
                NodeREDPlayground.utils.error('RED.sidebar.addTab 不可用于信息面板');
                return;
            }
            
            RED.sidebar.addTab({
                id: "playground-info",
                label: "信息",
                name: "Info",
                content: infoContent,
                iconClass: "fa fa-info-circle"
            });
            
            // 初始化信息函数
            initInfoFunctions();
            
            // 定期更新信息
            setInterval(updateSystemInfo, 5000);
            
            NodeREDPlayground.utils.log('✅ 信息侧边栏已创建');
            
        } catch (error) {
            NodeREDPlayground.utils.error('创建信息侧边栏失败:', error);
        }
    }
    
    /**
     * 初始化工具函数
     */
    function initToolsFunctions() {
        NodeREDPlayground.tools = {
            
            selectAllNodes: function() {
                const allNodes = RED.view.getActiveNodes();
                if (allNodes.length > 0) {
                    RED.view.selectNodes(allNodes);
                    RED.notify(`已选择 ${allNodes.length} 个节点`, "success");
                    NodeREDPlayground.addLog(`选择了 ${allNodes.length} 个节点`);
                } else {
                    RED.notify("当前工作区没有节点", "info");
                }
            },
            
            clearWorkspace: function() {
                if (confirm('确定要清空当前工作区吗？此操作不可撤销。')) {
                    const allNodes = RED.view.getActiveNodes();
                    RED.nodes.remove(allNodes);
                    RED.view.redraw();
                    RED.notify("工作区已清空", "success");
                    NodeREDPlayground.addLog('清空了工作区');
                }
            },
            
            exportFlow: function() {
                const flow = RED.nodes.getAllFlowTabs();
                const exportData = JSON.stringify(flow, null, 2);
                
                // 创建下载链接
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `flow-${new Date().toISOString().slice(0, 19)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                RED.notify("流程已导出", "success");
                NodeREDPlayground.addLog('导出了流程');
            },
            
            fitToScreen: function() {
                RED.view.focus();
                RED.notify("视图已适应屏幕", "info");
                NodeREDPlayground.addLog('适应屏幕');
            },
            
            zoomIn: function() {
                const currentScale = RED.view.scale();
                RED.view.scale(Math.min(currentScale * 1.2, 3));
                RED.notify(`缩放: ${Math.round(RED.view.scale() * 100)}%`, "info");
                NodeREDPlayground.addLog('放大视图');
            },
            
            zoomOut: function() {
                const currentScale = RED.view.scale();
                RED.view.scale(Math.max(currentScale / 1.2, 0.1));
                RED.notify(`缩放: ${Math.round(RED.view.scale() * 100)}%`, "info");
                NodeREDPlayground.addLog('缩小视图');
            },
            
            showGridLines: function() {
                // 这是一个示例功能，实际实现需要更复杂的逻辑
                RED.notify("网格线功能开发中...", "info");
                NodeREDPlayground.addLog('显示网格线');
            },
            
            toggleSnapToGrid: function() {
                // 切换网格对齐
                RED.notify("网格对齐功能开发中...", "info");
                NodeREDPlayground.addLog('切换网格对齐');
            },
            
            measureDistance: function() {
                RED.notify("距离测量功能开发中...", "info");
                NodeREDPlayground.addLog('距离测量工具');
            },
            
            generateTestFlow: function() {
                // 生成一个简单的测试流程
                const injectNode = {
                    id: RED.nodes.id(),
                    type: "inject",
                    x: 100,
                    y: 100,
                    wires: [[]]
                };
                
                const debugNode = {
                    id: RED.nodes.id(),
                    type: "debug",
                    x: 300,
                    y: 100,
                    wires: []
                };
                
                // 连接节点
                injectNode.wires[0].push(debugNode.id);
                
                // 添加到工作区
                RED.nodes.add(injectNode);
                RED.nodes.add(debugNode);
                RED.view.redraw();
                
                RED.notify("测试流程已生成", "success");
                NodeREDPlayground.addLog('生成了测试流程');
            },
            
            addDebugNodes: function() {
                const selectedNodes = RED.view.selection().nodes;
                if (selectedNodes.length === 0) {
                    RED.notify("请先选择节点", "warning");
                    return;
                }
                
                let addedCount = 0;
                selectedNodes.forEach(node => {
                    if (node.outputs && node.outputs > 0) {
                        const debugNode = {
                            id: RED.nodes.id(),
                            type: "debug",
                            x: node.x + 200,
                            y: node.y,
                            wires: []
                        };
                        
                        RED.nodes.add(debugNode);
                        
                        // 连接到节点的第一个输出
                        if (!node.wires) node.wires = [];
                        if (!node.wires[0]) node.wires[0] = [];
                        node.wires[0].push(debugNode.id);
                        
                        addedCount++;
                    }
                });
                
                if (addedCount > 0) {
                    RED.view.redraw();
                    RED.notify(`已添加 ${addedCount} 个调试节点`, "success");
                    NodeREDPlayground.addLog(`添加了 ${addedCount} 个调试节点`);
                } else {
                    RED.notify("所选节点没有输出端口", "warning");
                }
            }
        };
    }
    
    /**
     * 初始化信息函数
     */
    function initInfoFunctions() {
        NodeREDPlayground.info = {
            
            refresh: function() {
                updateSystemInfo();
                RED.notify("信息已刷新", "info");
                NodeREDPlayground.addLog('刷新了系统信息');
            },
            
            addActivity: function(activity) {
                const activityDiv = document.getElementById('recent-activity');
                if (activityDiv) {
                    const time = new Date().toLocaleTimeString();
                    const activityEntry = document.createElement('div');
                    activityEntry.innerHTML = `[${time}] ${activity}`;
                    activityEntry.style.margin = '2px 0';
                    activityEntry.style.padding = '2px';
                    activityEntry.style.borderBottom = '1px solid #eee';
                    
                    activityDiv.insertBefore(activityEntry, activityDiv.firstChild);
                    
                    // 限制显示条数
                    while (activityDiv.children.length > 20) {
                        activityDiv.removeChild(activityDiv.lastChild);
                    }
                }
            }
        };
        
        // 监听节点变化
        RED.events.on("nodes:add", function(node) {
            NodeREDPlayground.info.addActivity(`➕ 添加节点: ${node.type}`);
        });
        
        RED.events.on("nodes:remove", function(node) {
            NodeREDPlayground.info.addActivity(`❌ 删除节点: ${node.type}`);
        });
        
        RED.events.on("deploy", function() {
            NodeREDPlayground.info.addActivity('🚀 部署流程');
        });
    }
    
    /**
     * 更新系统信息
     */
    function updateSystemInfo() {
        // 运行时信息
        const runtimeInfo = document.getElementById('runtime-info');
        if (runtimeInfo) {
            const now = new Date();
            runtimeInfo.innerHTML = `
                <p><strong>当前时间:</strong> ${now.toLocaleString()}</p>
                <p><strong>Node-RED版本:</strong> ${RED.settings.version || '未知'}</p>
                <p><strong>浏览器:</strong> ${navigator.userAgent.split(' ')[0]}</p>
                <p><strong>内存使用:</strong> ${getMemoryUsage()}</p>
            `;
        }
        
        // 节点统计
        const nodeStats = document.getElementById('node-stats');
        if (nodeStats) {
            const allNodes = Object.keys(RED.nodes.getNodeMap());
            const allFlows = RED.nodes.getAllFlowTabs();
            const nodeTypes = {};
            
            allNodes.forEach(nodeId => {
                const node = RED.nodes.node(nodeId);
                if (node && node.type) {
                    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
                }
            });
            
            let statsHTML = `
                <p><strong>总节点数:</strong> ${allNodes.length}</p>
                <p><strong>工作区数:</strong> ${allFlows.length}</p>
                <p><strong>节点类型:</strong></p>
                <ul style="margin: 5px 0; padding-left: 15px; font-size: 11px;">
            `;
            
            Object.entries(nodeTypes).forEach(([type, count]) => {
                statsHTML += `<li>${type}: ${count}</li>`;
            });
            
            statsHTML += '</ul>';
            nodeStats.innerHTML = statsHTML;
        }
        
        // 性能监控
        const performanceMonitor = document.getElementById('performance-monitor');
        if (performanceMonitor) {
            performanceMonitor.innerHTML = `
                <p><strong>页面加载时间:</strong> ${getPageLoadTime()}ms</p>
                <p><strong>DOM节点数:</strong> ${document.querySelectorAll('*').length}</p>
                <p><strong>当前缩放:</strong> ${Math.round(RED.view.scale() * 100)}%</p>
            `;
        }
    }
    
    /**
     * 获取内存使用情况
     */
    function getMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            return `${used}MB / ${total}MB`;
        }
        return '不可用';
    }
    
    /**
     * 获取页面加载时间
     */
    function getPageLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            return Math.round(navigation.loadEventEnd - navigation.fetchStart);
        }
        return 0;
    }
    
    console.log('📋 [Custom Sidebar] 自定义侧边栏脚本已加载');
    
})();