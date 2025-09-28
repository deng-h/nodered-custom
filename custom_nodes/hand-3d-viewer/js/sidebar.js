// Hand 3D Viewer - Sidebar UI Module
(function() {
    "use strict";
    
    /**
     * 创建侧边栏内容
     */
    function createSidebarContent() {
        const sidebarContent = `
            <div id="hand-3d-sidebar-content" style="height: 100%; display: flex; flex-direction: column;">
                <!-- 标题栏 -->
                <div style="padding: 10px; background-color: #2e3440; color: white; border-bottom: 1px solid #434c5e;">
                    <h4 style="margin: 0; font-size: 14px;">
                        <i class="fa fa-hand-o-up" style="margin-right: 5px;"></i>
                        手部3D查看器
                    </h4>
                </div>
                
                <!-- 3D容器 -->
                <div id="hand-3d-container" style="flex: 1; min-height: 300px; background-color: #3b4252; position: relative;">
                    <!-- 加载指示器 -->
                    <div id="loading-indicator" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; z-index: 1000;">
                        <i class="fa fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <div>正在初始化3D查看器...</div>
                    </div>
                </div>
                
                <!-- 控制面板 -->
                <div id="threejs-gui-panel" style="display: none; padding: 10px; background-color: #4c566a; color: white; border-top: 1px solid #5e81ac;">
                    
                    <!-- 手型切换 -->
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">手型选择:</div>
                        <div style="display: flex; gap: 5px;">
                            <button id="left-hand-btn" class="hand-switch-btn active" style="flex: 1; padding: 5px; background-color: #5e81ac; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                                左手
                            </button>
                            <button id="right-hand-btn" class="hand-switch-btn" style="flex: 1; padding: 5px; background-color: #434c5e; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                                右手
                            </button>
                        </div>
                    </div>
                    
                    <!-- 姿态控制 -->
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">手部姿态:</div>
                        
                        <!-- Roll控制 -->
                        <div style="margin-bottom: 8px;">
                            <label style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 2px;">
                                <span>Roll (X轴):</span>
                                <span id="roll-value">0.00</span>
                            </label>
                            <input type="range" id="roll-slider" min="-3.14" max="3.14" step="0.01" value="0" 
                                   style="width: 100%; height: 6px; background-color: #3b4252; outline: none;">
                        </div>
                        
                        <!-- Pitch控制 -->
                        <div style="margin-bottom: 8px;">
                            <label style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 2px;">
                                <span>Pitch (Y轴):</span>
                                <span id="pitch-value">0.00</span>
                            </label>
                            <input type="range" id="pitch-slider" min="-3.14" max="3.14" step="0.01" value="0" 
                                   style="width: 100%; height: 6px; background-color: #3b4252; outline: none;">
                        </div>
                        
                        <!-- Yaw控制 -->
                        <div style="margin-bottom: 8px;">
                            <label style="font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 2px;">
                                <span>Yaw (Z轴):</span>
                                <span id="yaw-value">0.00</span>
                            </label>
                            <input type="range" id="yaw-slider" min="-3.14" max="3.14" step="0.01" value="0" 
                                   style="width: 100%; height: 6px; background-color: #3b4252; outline: none;">
                        </div>
                    </div>
                    
                    <!-- 功能按钮 -->
                    <div style="margin-bottom: 10px;">
                        <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">控制选项:</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 8px;">
                            <button id="auto-rotate-btn" style="padding: 4px; background-color: #434c5e; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                                自动旋转
                            </button>
                            <button id="wireframe-btn" style="padding: 4px; background-color: #434c5e; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                                线框模式
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                            <button id="reset-camera-btn" style="padding: 4px; background-color: #434c5e; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                                重置视角
                            </button>
                            <button id="reset-pose-btn" style="padding: 4px; background-color: #434c5e; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                                重置姿态
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return sidebarContent;
    }
    
    /**
     * 初始化侧边栏
     */
    function initSidebar() {
        // 创建侧边栏标签页
        const sidebarTab = {
            id: "hand-3d-viewer",
            label: "手部3D",
            name: "手部3D查看器",
            content: createSidebarContent(),
            closeable: true,
            visible: true,
            icon: "fa fa-hand-o-up"
        };
        
        // 添加到侧边栏
        RED.sidebar.addTab(sidebarTab);
        
        // 激活标签页
        RED.sidebar.show("hand-3d-viewer");
        
        console.log("DEBUG: Hand 3D Viewer sidebar initialized");
    }
    
    /**
     * 显示侧边栏
     */
    function showSidebar() {
        RED.sidebar.show("hand-3d-viewer");
        
        // 延迟初始化3D场景，确保容器已渲染
        setTimeout(() => {
            const container = document.getElementById('hand-3d-container');
            if (container && container.getBoundingClientRect().width > 0) {
                window.Hand3DViewer.initThreeJSScene();
            } else {
                // 如果容器还未准备好，再等一会
                setTimeout(() => {
                    window.Hand3DViewer.initThreeJSScene();
                }, 500);
            }
        }, 100);
    }
    
    /**
     * 隐藏侧边栏
     */
    function hideSidebar() {
        // 这里可以暂停3D渲染以节省性能
        console.log("DEBUG: Hand 3D Viewer sidebar hidden");
    }
    
    /**
     * 设置按钮样式
     */
    function updateButtonStyles() {
        // 为激活状态的按钮添加样式
        const activeButtons = $('.hand-switch-btn.active');
        activeButtons.css({
            'background-color': '#5e81ac',
            'color': 'white'
        });
        
        // 为非激活状态的按钮设置样式
        $('.hand-switch-btn:not(.active)').css({
            'background-color': '#434c5e',
            'color': '#d8dee9'
        });
        
        // 功能按钮的激活状态样式
        $('.active[id$="-btn"]:not(.hand-switch-btn)').css({
            'background-color': '#88c0d0',
            'color': '#2e3440'
        });
    }
    
    // 监听侧边栏事件
    RED.events.on("sidebar:resize", function() {
        // 当侧边栏大小改变时，重新调整3D视图
        setTimeout(() => {
            if (window.Hand3DViewer.onWindowResize) {
                window.Hand3DViewer.onWindowResize();
            }
        }, 100);
    });
    
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.initSidebar = initSidebar;
    window.Hand3DViewer.showSidebar = showSidebar;
    window.Hand3DViewer.hideSidebar = hideSidebar;
    window.Hand3DViewer.updateButtonStyles = updateButtonStyles;
    
    console.log("DEBUG: Hand 3D Viewer sidebar module initialized");
    
})();