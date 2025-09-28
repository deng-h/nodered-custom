// Hand 3D Viewer - Main Entry Point
(function() {
    "use strict";
    
    // 全局初始化标志
    let initialized = false;
    
    function initialize() {
        if (initialized) {
            console.log("DEBUG: Hand 3D Viewer already initialized");
            return;
        }
        
        try {
            // 设置默认配置
            window.Hand3DViewer = window.Hand3DViewer || {};
            window.Hand3DViewer.currentHandType = 'left'; // 默认显示左手
            
            // 初始化侧边栏
            window.Hand3DViewer.initSidebar();
            
            // 加载依赖库
            window.Hand3DViewer.loadDependencies(function() {
                console.log("DEBUG: Dependencies loaded, setting up controls...");
                
                // 延迟初始化控制事件，确保DOM已准备好
                setTimeout(() => {
                    if (window.Hand3DViewer.initializeControls) {
                        window.Hand3DViewer.initializeControls();
                    }
                    
                    // 更新按钮样式
                    if (window.Hand3DViewer.updateButtonStyles) {
                        window.Hand3DViewer.updateButtonStyles();
                    }
                }, 200);
            });
            
            // 显示侧边栏并初始化3D场景
            window.Hand3DViewer.showSidebar();
            
            initialized = true;
            console.log("DEBUG: Hand 3D Viewer initialization complete");
            
        } catch (error) {
            console.error("ERROR: Failed to initialize Hand 3D Viewer:", error);
            RED.notify("手部3D查看器初始化失败", { type: "error", timeout: 5000 });
        }
    }
    
    /**
     * 获取关节信息（为了与robot-3d-viewer兼容）
     */
    function getJointInfo() {
        const urdfLoader = window.Hand3DViewer.urdfLoader;
        if (urdfLoader && urdfLoader.robot) {
            const joints = {};
            urdfLoader.robot.traverse(function(child) {
                if (child.isURDFJoint) {
                    joints[child.name] = {
                        name: child.name,
                        type: child.jointType,
                        axis: child.axis,
                        limit: child.limit
                    };
                }
            });
            return joints;
        }
        return {};
    }
    
    /**
     * 设置多个关节角度（批量操作）
     */
    function setJointAngles(jointAngles) {
        if (typeof jointAngles !== 'object') {
            console.warn("setJointAngles expects an object with joint names as keys");
            return;
        }
        
        Object.keys(jointAngles).forEach(jointName => {
            const angle = jointAngles[jointName];
            if (typeof angle === 'number') {
                window.Hand3DViewer.setJointAngle(jointName, angle);
            }
        });
    }
    
    /**
     * 获取所有关节角度
     */
    function getAllJointAngles() {
        const jointInfo = getJointInfo();
        const angles = {};
        
        Object.keys(jointInfo).forEach(jointName => {
            angles[jointName] = window.Hand3DViewer.getJointAngle(jointName);
        });
        
        return angles;
    }
    
    /**
     * 重置所有关节到初始位置
     */
    function resetAllJoints() {
        const jointInfo = getJointInfo();
        
        Object.keys(jointInfo).forEach(jointName => {
            window.Hand3DViewer.setJointAngle(jointName, 0);
        });
        
        // 同时重置手部整体姿态
        if (window.Hand3DViewer.resetHandPose) {
            window.Hand3DViewer.resetHandPose();
        }
    }
    
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.initialize = initialize;
    window.Hand3DViewer.getJointInfo = getJointInfo;
    window.Hand3DViewer.setJointAngles = setJointAngles;
    window.Hand3DViewer.getAllJointAngles = getAllJointAngles;
    window.Hand3DViewer.resetAllJoints = resetAllJoints;
    
    // 自动初始化（当DOM准备好时）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM已经准备好，直接初始化
        setTimeout(initialize, 100);
    }
    
    console.log("DEBUG: Hand 3D Viewer main module loaded");
    
})();