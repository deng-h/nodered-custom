// Hand 3D Viewer - Sidebar UI Module
(function() {
    "use strict";
    
    /**
     * 创建侧边栏内容
     */
    function createSidebarContent() {
        const sidebarContent = `
            <div id="hand-3d-sidebar-content" style="height: 100%; display: flex; flex-direction: column;">
                <!-- 3D容器 -->
                <div id="hand-3d-container" style="flex: 1; min-height: 300px; background-color: #3b4252; position: relative;">
                    <!-- 加载指示器 -->
                    <div id="loading-indicator" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; z-index: 1000;">
                        <i class="fa fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <div>正在初始化3D查看器...</div>
                    </div>
                </div>
                
                <!-- Three.js 风格的右上角GUI设置面板 -->
                <div id="threejs-gui-panel" style="position: absolute; top: 10px; right: 10px; width: 240px; font-family: 'Lucida Grande', sans-serif; font-size: 11px; z-index: 1000; display: none;">
                    <!-- 主控制折叠按钮 -->
                    <div class="gui-main-header" id="gui-main-toggle">
                        <span>手部设置</span>
                        <span class="gui-toggle-icon">▶</span>
                    </div>
                    
                    <!-- 主内容区域（默认折叠） -->
                    <div id="gui-main-content" class="gui-main-content collapsed">
                        <!-- Hand Selection -->
                        <div class="gui-folder">
                            <div class="gui-folder-title" data-target="gui-hand-selection">手型选择</div>
                            <div class="gui-folder-content collapsed" id="gui-hand-selection">
                                <div class="gui-controller">
                                    <div style="display: flex; gap: 5px; width: 100%;">
                                        <button id="left-hand-btn" class="gui-button hand-switch-btn active" style="flex: 1;">左手</button>
                                        <button id="right-hand-btn" class="gui-button hand-switch-btn" style="flex: 1;">右手</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pose Controls -->
                        <div class="gui-folder">
                            <div class="gui-folder-title" data-target="gui-pose-controls">手部姿态</div>
                            <div class="gui-folder-content collapsed" id="gui-pose-controls">
                                <div class="gui-controller gui-slider-container">
                                    <label class="gui-label">Roll (X)</label>
                                    <input type="range" id="roll-slider" min="-3.14" max="3.14" step="0.01" value="0" class="gui-slider">
                                    <span class="gui-value" id="roll-value">0.00</span>
                                </div>
                                <div class="gui-controller gui-slider-container">
                                    <label class="gui-label">Pitch (Y)</label>
                                    <input type="range" id="pitch-slider" min="-3.14" max="3.14" step="0.01" value="0" class="gui-slider">
                                    <span class="gui-value" id="pitch-value">0.00</span>
                                </div>
                                <div class="gui-controller gui-slider-container">
                                    <label class="gui-label">Yaw (Z)</label>
                                    <input type="range" id="yaw-slider" min="-3.14" max="3.14" step="0.01" value="0" class="gui-slider">
                                    <span class="gui-value" id="yaw-value">0.00</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Gesture Controls -->
                        <div class="gui-folder">
                            <div class="gui-folder-title" data-target="gui-gesture-controls">手势控制 🎮</div>
                            <div class="gui-folder-content collapsed" id="gui-gesture-controls">
                                <div class="gui-controller">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;">
                                        <button id="rock-gesture-btn" class="gui-button" title="石头手势">✊ 石头</button>
                                        <button id="paper-gesture-btn" class="gui-button" title="布手势">✋ 布</button>
                                        <button id="scissors-gesture-btn" class="gui-button" title="剪刀手势">✌️ 剪刀</button>
                                    </div>
                                </div>
                                <div class="gui-controller">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                                        <button id="natural-pose-btn" class="gui-button" title="自然姿态">🖐️ 自然</button>
                                        <button id="random-gesture-btn" class="gui-button" title="随机手势">🎲 随机</button>
                                    </div>
                                </div>
                                <div class="gui-controller">
                                    <button id="demo-gestures-btn" class="gui-button" title="演示所有手势" style="width: 100%;">🎭 演示手势</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- View Controls -->
                        <div class="gui-folder">
                            <div class="gui-folder-title" data-target="gui-view-controls">视图控制</div>
                            <div class="gui-folder-content collapsed" id="gui-view-controls">
                                <div class="gui-controller">
                                    <label><input type="checkbox" id="auto-rotate-checkbox"> 自动旋转</label>
                                </div>
                                <div class="gui-controller">
                                    <label><input type="checkbox" id="wireframe-checkbox"> 线框模式</label>
                                </div>
                                <div class="gui-controller">
                                    <button id="reset-camera-btn" class="gui-button">重置视角</button>
                                </div>
                                <div class="gui-controller">
                                    <button id="reset-pose-btn" class="gui-button">重置姿态</button>
                                </div>
                            </div>
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