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
     * 切换自动旋转
     */
    function toggleAutoRotate() {
        window.Hand3DViewer.autoRotate = !window.Hand3DViewer.autoRotate;
        const button = $('#auto-rotate-btn');
        
        if (window.Hand3DViewer.autoRotate) {
            button.addClass('active').text('停止旋转');
        } else {
            button.removeClass('active').text('自动旋转');
        }
        
        console.log(`DEBUG: Auto rotate ${window.Hand3DViewer.autoRotate ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 切换线框模式
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
        
        const button = $('#wireframe-btn');
        if (wireframeMode) {
            button.addClass('active').text('实体模式');
        } else {
            button.removeClass('active').text('线框模式');
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
     * 初始化控制事件
     */
    function initializeControls() {
        // 姿态控制滑块事件
        $('#roll-slider, #pitch-slider, #yaw-slider').on('input', updateHandPoseFromSliders);
        
        // 手型切换按钮
        $('#left-hand-btn').on('click', () => switchHand('left'));
        $('#right-hand-btn').on('click', () => switchHand('right'));
        
        // 功能按钮
        $('#auto-rotate-btn').on('click', toggleAutoRotate);
        $('#wireframe-btn').on('click', toggleWireframe);
        $('#reset-camera-btn').on('click', resetCamera);
        $('#reset-pose-btn').on('click', resetHandPose);
        
        console.log("DEBUG: Hand control events initialized");
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
    window.Hand3DViewer.initializeControls = initializeControls;
    
    console.log("DEBUG: Hand 3D Viewer controls module initialized");
    
})();