// Robot 3D Viewer - Controls and Events
(function() {
    "use strict";
    
    let autoRotate = false;
    let wireframeMode = false;
    
    // 绑定控制按钮事件
    function bindControlEvents() {
        // 设置面板折叠/展开
        $('.settings-header').off('click').on('click', function() {
            const settingsContent = $('#settings-content');
            const toggleIcon = $('#settings-toggle-icon');
            
            if (settingsContent.is(':visible')) {
                // 折叠
                settingsContent.slideUp(200);
                toggleIcon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                toggleIcon.css('transform', 'rotate(0deg)');
            } else {
                // 展开
                settingsContent.slideDown(200);
                toggleIcon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                toggleIcon.css('transform', 'rotate(0deg)');
            }
        });
        
        // 重置相机按钮
        $('#reset-camera-btn').off('click').on('click', function() {
            window.Robot3DViewer.camera.position.set(1, 1, 1);
            window.Robot3DViewer.camera.lookAt(0, 0, 0);
            if (window.Robot3DViewer.controls) {
                window.Robot3DViewer.controls.reset();
            }
            const INITIAL_ROBOT_POSITION = new THREE.Vector3(0, 0, 0);   // (x,y,z)
            const INITIAL_ROBOT_RPY = { roll: -1.98, pitch: -0.411, yaw: -0.96 }; // 角度（弧度制）

            // 应用姿态（roll=X, pitch=Y, yaw=Z，按 XYZ 顺序）
            window.Robot3DViewer.robot.rotation.set(
                INITIAL_ROBOT_RPY.roll,
                INITIAL_ROBOT_RPY.pitch,
                INITIAL_ROBOT_RPY.yaw,
                'XYZ'
            );       
            
            window.Robot3DViewer.robot.position.add(INITIAL_ROBOT_POSITION);            
        });
        
        // 自动旋转按钮
        $('#rotate-btn').off('click').on('click', function() {
            autoRotate = !autoRotate;
            $(this).toggleClass('active', autoRotate);
            if (autoRotate) {
                $(this).css('background-color', '#28a745');
            } else {
                $(this).css('background-color', '');
            }
        });
        
        // 线框模式按钮
        $('#wireframe-btn').off('click').on('click', function() {
            wireframeMode = !wireframeMode;
            $(this).toggleClass('active', wireframeMode);
            if (wireframeMode) {
                $(this).css('background-color', '#ffc107');
            } else {
                $(this).css('background-color', '');
            }
            
            // 切换所有网格的线框模式
            window.Robot3DViewer.scene.traverse(function(object) {
                if (object.isMesh && object.material) {
                    object.material.wireframe = wireframeMode;
                }
            });
        });

        // 新增：为所有姿态滑块绑定 input 事件
        $('#roll-slider, #pitch-slider, #yaw-slider').off('input').on('input', updateRobotPoseFromSliders);
    }
    
    // 更新机器人姿态
    function updateRobotPoseFromSliders() {
        if (!window.Robot3DViewer.currentModel) {
            return;
        }

        // 从滑块获取弧度值
        const roll = parseFloat($('#roll-slider').val());
        const pitch = parseFloat($('#pitch-slider').val());
        const yaw = parseFloat($('#yaw-slider').val());

        // 更新模型姿态 (使用弧度)
        // 'XYZ' 是欧拉角的旋转顺序，对于 RPY 通常是这个顺序
        window.Robot3DViewer.currentModel.rotation.set(roll, pitch, yaw, 'XYZ');

        // 更新UI显示的度数 (弧度 * 180 / PI)
        $('#roll-value').text((roll * 180 / Math.PI).toFixed(1) + '°');
        $('#pitch-value').text((pitch * 180 / Math.PI).toFixed(1) + '°');
        $('#yaw-value').text((yaw * 180 / Math.PI).toFixed(1) + '°');
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 监听侧边栏切换
        RED.events.on("sidebar:resize", function() {
            setTimeout(window.Robot3DViewer.onWindowResize, 100);
        });
        
        console.log("DEBUG: Event listeners setup complete");
    }
    
    // 手动实现基础鼠标控制（当OrbitControls不可用时）
    function setupBasicMouseControls(canvas) {
        let isMouseDown = false;
        let mouseButton = null;
        let previousMousePosition = { x: 0, y: 0 };
        
        canvas.addEventListener('mousedown', function(e) {
            e.preventDefault();
            isMouseDown = true;
            mouseButton = e.button;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mouseup', function(e) {
            e.preventDefault();
            isMouseDown = false;
            mouseButton = null;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('mousemove', function(e) {
            if (!isMouseDown) return;
            e.preventDefault();
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            if (mouseButton === 0) { // 左键旋转
                if (window.Robot3DViewer.currentModel) {
                    window.Robot3DViewer.currentModel.rotation.y += deltaX * 0.01;
                    window.Robot3DViewer.currentModel.rotation.x += deltaY * 0.01;
                }
            } else if (mouseButton === 2) { // 右键平移
                window.Robot3DViewer.camera.position.x -= deltaX * 0.01;
                window.Robot3DViewer.camera.position.y += deltaY * 0.01;
            }
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            window.Robot3DViewer.camera.position.multiplyScalar(delta);
        });
        
        console.log("DEBUG: Basic mouse controls setup complete");
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.bindControlEvents = bindControlEvents;
    window.Robot3DViewer.setupEventListeners = setupEventListeners;
    window.Robot3DViewer.setupBasicMouseControls = setupBasicMouseControls;
    window.Robot3DViewer.updateRobotPoseFromSliders = updateRobotPoseFromSliders;
    Object.defineProperty(window.Robot3DViewer, 'autoRotate', {
        get: function() { return autoRotate; }
    });
})();