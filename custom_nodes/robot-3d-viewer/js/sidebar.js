// Robot 3D Viewer - Sidebar Panel
(function() {
    "use strict";
    
    function addRobot3DSidebar() {
        var sidebarContent = $(`
            <div class="robot-3d-viewer-panel" style="padding: 15px; height: 100%; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; color: #333; margin-bottom: 15px;">
                    <i class="fa fa-cube" style="margin-right: 8px;"></i>
                    机器人状态
                </h3>
                
                <!-- 可折叠的设置面板 -->
                <div class="settings-panel" style="margin-bottom: 15px;">
                    <div class="settings-header" style="background: #e9ecef; border-radius: 4px; padding: 8px 12px; cursor: pointer; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; color: #495057;">
                            <i class="fa fa-cog" style="margin-right: 6px;"></i>
                            设置
                        </span>
                        <i id="settings-toggle-icon" class="fa fa-chevron-up" style="color: #6c757d; transition: transform 0.2s;"></i>
                    </div>
                    
                    <div id="settings-content" style="background: #f8f9fa; border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px; padding: 15px; display: none;">
                        <!-- 视图控制 -->
                        <div class="viewer-controls" style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: bold; color: #555; font-size: 13px;">视图控制</span>
                                <button id="reset-camera-btn" class="red-ui-button" style="font-size: 12px; padding: 4px 8px;">
                                    <i class="fa fa-refresh"></i> 重置视角
                                </button>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <button id="rotate-btn" class="red-ui-button toggle-btn" style="flex: 1; margin-right: 5px; font-size: 12px;">
                                    <i class="fa fa-repeat"></i> 自动旋转
                                </button>
                                <button id="wireframe-btn" class="red-ui-button toggle-btn" style="flex: 1; margin-left: 5px; font-size: 12px;">
                                    <i class="fa fa-object-group"></i> 线框模式
                                </button>
                            </div>
                        </div>

                        <!-- 姿态控制 -->
                        <div class="pose-controls">
                            <div style="font-weight: bold; color: #555; margin-bottom: 10px; font-size: 13px;">姿态控制 (RPY)</div>
                            <div class="slider-group" style="display: flex; align-items: center; margin-bottom: 8px;">
                                <label for="roll-slider" style="width: 45px; font-size: 11px; color: #666;">Roll</label>
                                <input type="range" id="roll-slider" min="-3.14159" max="3.14159" step="0.01" value="0.5" style="flex: 1; margin: 0 8px;">
                                <span id="roll-value" style="width: 45px; text-align: right; font-size: 11px; font-family: monospace; color: #666;">0.0°</span>
                            </div>
                            <div class="slider-group" style="display: flex; align-items: center; margin-bottom: 8px;">
                                <label for="pitch-slider" style="width: 45px; font-size: 11px; color: #666;">Pitch</label>
                                <input type="range" id="pitch-slider" min="-3.14159" max="3.14159" step="0.01" value="1.57" style="flex: 1; margin: 0 8px;">
                                <span id="pitch-value" style="width: 45px; text-align: right; font-size: 11px; font-family: monospace; color: #666;">0.0°</span>
                            </div>
                            <div class="slider-group" style="display: flex; align-items: center;">
                                <label for="yaw-slider" style="width: 45px; font-size: 11px; color: #666;">Yaw</label>
                                <input type="range" id="yaw-slider" min="-3.14159" max="3.14159" step="0.01" value="0" style="flex: 1; margin: 0 8px;">
                                <span id="yaw-value" style="width: 45px; text-align: right; font-size: 11px; font-family: monospace; color: #666;">0.0°</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 3D渲染区域 -->
                <div id="robot-3d-container" style="flex: 1; border: 2px solid #ddd; border-radius: 4px; background: #000; position: relative; min-height: 300px;">
                    <div id="loading-indicator" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center;">
                        <i class="fa fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <div>加载3D模型中...</div>
                    </div>
                </div>
            </div>
        `);
        
        RED.sidebar.addTab({
            id: "robot-3d-viewer",
            label: "3D模型",
            name: "机器人3D查看器",
            iconClass: "fa fa-cube",
            content: sidebarContent,
            enableOnEdit: false,
            onchange: function() {
                // 当侧边栏切换到3D查看器时
                if ($('#robot-3d-container').is(':visible') && window.Robot3DViewer.dependenciesLoaded) {
                     // 只有当依赖加载完成且面板可见时，才初始化或重新调整大小
                    if (!window.Robot3DViewer.renderer) { // 如果场景还未初始化
                        window.Robot3DViewer.initThreeJSScene();
                    } else { // 如果已初始化，仅调整大小
                        setTimeout(window.Robot3DViewer.onWindowResize, 100);
                    }
                }
            }
        });
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.addRobot3DSidebar = addRobot3DSidebar;
})();