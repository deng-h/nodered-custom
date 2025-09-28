// Hand 3D Viewer - Controls and Events
(function() {
    "use strict";
    
    /**
     * 更新手部姿态（从滑块值）
     */
    function updateHandPoseFromSliders() {
        const currentModel = window.Hand3DViewer.currentModel;
        if (!currentModel) return;
        
        const rollSlider = $('#roll-slider');
        const pitchSlider = $('#pitch-slider');
        const yawSlider = $('#yaw-slider');
        
        if (rollSlider.length && pitchSlider.length && yawSlider.length) {
            const roll = parseFloat(rollSlider.val()) || 0;
            const pitch = parseFloat(pitchSlider.val()) || 0;
            const yaw = parseFloat(yawSlider.val()) || 0;
            
            // 应用旋转（XYZ顺序）
            currentModel.rotation.set(roll, pitch, yaw, 'XYZ');
            
            // 更新显示值
            $('#roll-value').text(roll.toFixed(2));
            $('#pitch-value').text(pitch.toFixed(2));
            $('#yaw-value').text(yaw.toFixed(2));
        }
    }
    
    /**
     * 切换手型（左手/右手）
     */
    function switchHand(handType) {
        console.log(`DEBUG: Switching to ${handType} hand`);
        
        $('#loading-indicator').show().find('div').text(`切换到${handType === 'left' ? '左手' : '右手'}模型中...`);
        
        // 更新按钮状态
        $('.hand-switch-btn').removeClass('active');
        $(`#${handType}-hand-btn`).addClass('active');
        
        // 重新加载模型
        setTimeout(() => {
            window.Hand3DViewer.currentHandType = handType;
            window.Hand3DViewer.loadHandModel(handType);
        }, 100);
    }
    
    /**
     * 切换自动旋转（兼容性函数）
     */
    function toggleAutoRotate() {
        window.Hand3DViewer.autoRotate = !window.Hand3DViewer.autoRotate;
        const checkbox = $('#auto-rotate-checkbox');
        if (checkbox.length) {
            checkbox.prop('checked', window.Hand3DViewer.autoRotate);
        }
        console.log(`DEBUG: Auto rotate ${window.Hand3DViewer.autoRotate ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 切换线框模式（兼容性函数）
     */
    function toggleWireframe() {
        const currentModel = window.Hand3DViewer.currentModel;
        if (!currentModel) return;
        
        let wireframeMode = false;
        
        currentModel.traverse(function(child) {
            if (child.isMesh && child.material) {
                child.material.wireframe = !child.material.wireframe;
                wireframeMode = child.material.wireframe;
            }
        });
        
        const checkbox = $('#wireframe-checkbox');
        if (checkbox.length) {
            checkbox.prop('checked', wireframeMode);
        }
        
        console.log(`DEBUG: Wireframe mode ${wireframeMode ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 重置视角
     */
    function resetCamera() {
        const camera = window.Hand3DViewer.camera;
        const controls = window.Hand3DViewer.controls;
        
        if (camera && controls) {
            camera.position.set(0, 0, 0);
            camera.lookAt(0, 0, 1);
            
            controls.target.set(0, 0.1, 0);
            controls.update();
            
            console.log("DEBUG: Camera reset to default position");
        }
    }
    
    /**
     * 重置手部姿态
     */
    function resetHandPose() {
        const initialPose = window.Hand3DViewer.getCurrentHandInitialPose();
        
        // 重置滑块值
        $('#roll-slider').val(initialPose.rotation.roll);
        $('#pitch-slider').val(initialPose.rotation.pitch);
        $('#yaw-slider').val(initialPose.rotation.yaw);
        
        // 应用重置
        updateHandPoseFromSliders();
        
        console.log("DEBUG: Hand pose reset to initial values");
    }
    
    /**
     * 设置关节角度（通过名称）
     */
    function setJointAngle(jointName, angle) {
        const urdfLoader = window.Hand3DViewer.urdfLoader;
        if (urdfLoader && urdfLoader.robot) {
            try {
                urdfLoader.setJointValue(jointName, angle);
                console.log(`DEBUG: Set joint ${jointName} to ${angle}`);
            } catch (e) {
                console.warn(`Failed to set joint ${jointName}:`, e);
            }
        }
    }
    
    /**
     * 获取关节角度
     */
    function getJointAngle(jointName) {
        const urdfLoader = window.Hand3DViewer.urdfLoader;
        if (urdfLoader && urdfLoader.robot) {
            try {
                return urdfLoader.getJointValue(jointName);
            } catch (e) {
                console.warn(`Failed to get joint ${jointName}:`, e);
                return 0;
            }
        }
        return 0;
    }
    
    /**
     * 切换GUI文件夹展开/收起状态
     */
    function toggleGuiFolder(targetId) {
        const content = $(`#${targetId}`);
        if (content.length) {
            content.toggleClass('collapsed');
        }
    }
    
    /**
     * 切换主GUI面板展开/收起状态
     */
    function toggleMainGui() {
        console.log("DEBUG: toggleMainGui called");
        const content = $('#gui-main-content');
        const icon = $('.gui-toggle-icon');
        
        if (content.length && icon.length) {
            content.toggleClass('collapsed');
            
            // 更新箭头方向
            if (content.hasClass('collapsed')) {
                icon.text('▶');
                console.log("DEBUG: GUI collapsed");
            } else {
                icon.text('▼');
                console.log("DEBUG: GUI expanded");
            }
        } else {
            console.warn("DEBUG: GUI elements not found", {
                content: content.length,
                icon: icon.length
            });
        }
    }
    
    /**
     * 初始化控制事件
     */
    function initializeControls() {
        console.log("DEBUG: Initializing controls...");
        
        // 使用事件代理确保事件能正确绑定
        $(document).off('click', '#gui-main-toggle').on('click', '#gui-main-toggle', function() {
            console.log("DEBUG: Main toggle clicked");
            toggleMainGui();
        });
        
        // GUI文件夹折叠控制
        $(document).off('click', '.gui-folder-title').on('click', '.gui-folder-title', function() {
            const target = $(this).data('target');
            console.log("DEBUG: Folder toggle clicked:", target);
            if (target) {
                toggleGuiFolder(target);
            }
        });
        
        // 姿态控制滑块事件（使用事件代理）
        $(document).off('input', '#roll-slider, #pitch-slider, #yaw-slider').on('input', '#roll-slider, #pitch-slider, #yaw-slider', updateHandPoseFromSliders);
        
        // 手型切换按钮（使用事件代理）
        $(document).off('click', '#left-hand-btn').on('click', '#left-hand-btn', () => switchHand('left'));
        $(document).off('click', '#right-hand-btn').on('click', '#right-hand-btn', () => switchHand('right'));
        
        // 功能按钮 - checkbox事件（使用事件代理）
        $(document).off('change', '#auto-rotate-checkbox').on('change', '#auto-rotate-checkbox', function() {
            window.Hand3DViewer.autoRotate = this.checked;
            console.log(`DEBUG: Auto rotate ${window.Hand3DViewer.autoRotate ? 'enabled' : 'disabled'}`);
        });
        
        $(document).off('change', '#wireframe-checkbox').on('change', '#wireframe-checkbox', function() {
            const currentModel = window.Hand3DViewer.currentModel;
            if (!currentModel) return;
            
            const isWireframe = this.checked;
            currentModel.traverse(function(child) {
                if (child.isMesh && child.material) {
                    child.material.wireframe = isWireframe;
                }
            });
            
            console.log(`DEBUG: Wireframe mode ${isWireframe ? 'enabled' : 'disabled'}`);
        });
        
        $(document).off('click', '#reset-camera-btn').on('click', '#reset-camera-btn', resetCamera);
        $(document).off('click', '#reset-pose-btn').on('click', '#reset-pose-btn', resetHandPose);
        
        // 手势控制按钮事件（使用事件代理）
        $(document).off('click', '#rock-gesture-btn').on('click', '#rock-gesture-btn', function() {
            if (window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.applyGesture('rock');
            }
        });
        
        $(document).off('click', '#paper-gesture-btn').on('click', '#paper-gesture-btn', function() {
            if (window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.applyGesture('paper');
            }
        });
        
        $(document).off('click', '#scissors-gesture-btn').on('click', '#scissors-gesture-btn', function() {
            if (window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.applyGesture('scissors');
            }
        });
        
        $(document).off('click', '#natural-pose-btn').on('click', '#natural-pose-btn', function() {
            if (window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.resetToNaturalPose();
            }
        });
        
        $(document).off('click', '#random-gesture-btn').on('click', '#random-gesture-btn', function() {
            if (window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.randomGesture();
            }
        });
        
        $(document).off('click', '#demo-gestures-btn').on('click', '#demo-gestures-btn', function() {
            if (window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.demonstrateGestures();
            }
        });
        
        console.log("DEBUG: Hand control events initialized with gesture controls");
    }
    
    // 暴露给全局命名空间
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.updateHandPoseFromSliders = updateHandPoseFromSliders;
    window.Hand3DViewer.switchHand = switchHand;
    window.Hand3DViewer.toggleAutoRotate = toggleAutoRotate;
    window.Hand3DViewer.toggleWireframe = toggleWireframe;
    window.Hand3DViewer.resetCamera = resetCamera;
    window.Hand3DViewer.resetHandPose = resetHandPose;
    window.Hand3DViewer.setJointAngle = setJointAngle;
    window.Hand3DViewer.getJointAngle = getJointAngle;
    window.Hand3DViewer.toggleGuiFolder = toggleGuiFolder;
    window.Hand3DViewer.toggleMainGui = toggleMainGui;
    window.Hand3DViewer.initializeControls = initializeControls;
    
    console.log("DEBUG: Hand 3D Viewer controls module initialized");
    
})();