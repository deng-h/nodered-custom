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
                
                <!-- 3D渲染区域 -->
                <div id="robot-3d-container" style="flex: 1; border: 2px solid #ddd; border-radius: 4px; background: #000; position: relative; min-height: 300px;">
                    <div id="loading-indicator" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center;">
                        <i class="fa fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <div>加载3D模型中...</div>
                    </div>
                    
                    <!-- Three.js 风格的右上角GUI设置面板 -->
                    <div id="threejs-gui-panel" style="position: absolute; top: 10px; right: 10px; width: 240px; font-family: 'Lucida Grande', sans-serif; font-size: 11px; z-index: 1000; display: none;">
                        <!-- 主控制折叠按钮 -->
                        <div class="gui-main-header" id="gui-main-toggle">
                            <span>Robot Controls</span>
                            <span class="gui-toggle-icon">▼</span>
                        </div>
                        
                        <!-- 主内容区域（默认折叠） -->
                        <div id="gui-main-content" class="gui-main-content collapsed">
                            <!-- Visibility Controls -->
                            <div class="gui-folder">
                                <div class="gui-folder-title" data-target="gui-visibility">Visibility</div>
                                <div class="gui-folder-content collapsed" id="gui-visibility">
                                    <div class="gui-controller">
                                        <label><input type="checkbox" id="show-model-checkbox" checked> show model</label>
                                    </div>
                                    <div class="gui-controller">
                                        <label><input type="checkbox" id="show-joint-axes-checkbox"> show joint axes</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- View Controls -->
                            <div class="gui-folder">
                                <div class="gui-folder-title" data-target="gui-view-controls">View Controls</div>
                                <div class="gui-folder-content collapsed" id="gui-view-controls">
                                    <div class="gui-controller">
                                        <button id="reset-camera-btn" class="gui-button">reset camera</button>
                                    </div>
                                    <div class="gui-controller">
                                        <label><input type="checkbox" id="auto-rotate-checkbox"> auto rotate</label>
                                    </div>
                                </div>
                            </div>
                        
                            <!-- Model Properties -->
                            <div class="gui-folder">
                                <div class="gui-folder-title" data-target="gui-model-properties">Model Properties</div>
                                <div class="gui-folder-content collapsed" id="gui-model-properties">
                                    <div class="gui-controller gui-slider-container">
                                        <label class="gui-label">transparency</label>
                                        <input type="range" id="transparency-slider" min="0.1" max="1" step="0.05" value="1" class="gui-slider">
                                        <span class="gui-value" id="transparency-value">1.0</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Pose Controls -->
                            <div class="gui-folder">
                                <div class="gui-folder-title" data-target="gui-pose-controls">Pose Controls</div>
                                <div class="gui-folder-content collapsed" id="gui-pose-controls">
                                    <div class="gui-controller gui-slider-container">
                                        <label class="gui-label">roll</label>
                                        <input type="range" id="roll-slider" min="-3.14159" max="3.14159" step="0.01" value="-1.62" class="gui-slider">
                                        <span class="gui-value" id="roll-value">-1.62</span>
                                    </div>
                                    <div class="gui-controller gui-slider-container">
                                        <label class="gui-label">pitch</label>
                                        <input type="range" id="pitch-slider" min="-3.14159" max="3.14159" step="0.01" value="-0.06" class="gui-slider">
                                        <span class="gui-value" id="pitch-value">-0.06</span>
                                    </div>
                                    <div class="gui-controller gui-slider-container">
                                        <label class="gui-label">yaw</label>
                                        <input type="range" id="yaw-slider" min="-3.14159" max="3.14159" step="0.01" value="-0.99" class="gui-slider">
                                        <span class="gui-value" id="yaw-value">-0.99</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Joint Controls -->
                            <div class="gui-folder">
                                <div class="gui-folder-title" data-target="gui-joint-controls">Joint Controls</div>
                                <div class="gui-folder-content collapsed" id="gui-joint-controls">
                                    <div class="gui-controller" style="display: flex; gap: 5px;">
                                        <input type="text" id="joint-name-input" placeholder="joint name" style="flex: 1; padding: 2px 4px; font-size: 10px; background: #1e1e1e; color: #fff; border: 1px solid #555; border-radius: 2px;">
                                        <button id="add-joint-btn" class="gui-button" style="padding: 2px 6px; font-size: 10px;">Add</button>
                                    </div>
                                    <div id="joint-sliders-container" style="max-height: 120px; overflow: auto;"></div>
                                    
                                    <!-- JointState File Controls -->
                                    <div class="gui-controller" style="margin-top: 6px;">
                                        <input type="file" id="jointstate-file-input" accept=".txt,.log,.yaml" style="width: 100%; font-size: 9px; margin-bottom: 3px;">
                                        <div style="display: flex; gap: 3px;">
                                            <button id="jointstate-play-btn" class="gui-button" style="flex: 1; font-size: 10px;">Play</button>
                                            <button id="jointstate-pause-btn" class="gui-button" style="flex: 1; font-size: 10px;">Pause</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        // 触发一次 resize，并在短延迟后再触发一次，以处理可能的布局抖动
                        try {
                            window.Robot3DViewer.onWindowResize();
                        } catch (e) {
                            console.warn('onWindowResize threw:', e);
                        }
                        setTimeout(function() {
                            try {
                                window.Robot3DViewer.onWindowResize();
                                // 强制渲染一次，避免在某些情况下 canvas 没有刷新
                                if (window.Robot3DViewer.renderer && window.Robot3DViewer.renderer.domElement) {
                                    window.Robot3DViewer.renderer.render(window.Robot3DViewer.scene, window.Robot3DViewer.camera);
                                }
                            } catch (e) {
                                console.warn('Deferred onWindowResize/render threw:', e);
                            }
                        }, 120);
                    }
                }
            }
        });
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.addRobot3DSidebar = addRobot3DSidebar;
})();