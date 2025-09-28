// Hand 3D Viewer - Gesture Control Module
(function() {
    "use strict";
    
    // 石头剪刀布手势定义
    const GESTURES = {
        rock: {
            name: "石头",
            icon: "✊",
            description: "握拳手势",
            joints: {
                // 拇指：向内握拳
                thumb_CMC_L: 0.8,
                thumb_MP_L: 0.5,
                thumb_IP_L: 0.8,
                
                // 食指：完全弯曲
                index_MCP_L: 1.4,
                index_PIP_L: 1.4, // mimic joint
                index_DIP_L: 1.12, // mimic joint (0.8 * 1.4)
                
                // 中指：完全弯曲
                middle_MCP_L: 1.4,
                middle_PIP_L: 1.4, // mimic joint
                middle_DIP_L: 1.12, // mimic joint (0.8 * 1.4)
                
                // 无名指：完全弯曲
                ring_MCP_L: 1.4,
                ring_PIP_L: 1.4, // mimic joint
                ring_DIP_L: 1.12, // mimic joint (0.8 * 1.4)
                
                // 小指：完全弯曲
                little_MCP_L: 1.4,
                little_PIP_L: 1.4, // mimic joint
                little_DIP_L: 1.12 // mimic joint (0.8 * 1.4)
            }
        },
        
        paper: {
            name: "布",
            icon: "✋",
            description: "张开手掌",
            joints: {
                // 拇指：完全张开
                thumb_CMC_L: -0.3,
                thumb_MP_L: -0.2,
                thumb_IP_L: 0.1,
                
                // 食指：完全伸直
                index_MCP_L: 0,
                index_PIP_L: 0,
                index_DIP_L: 0,
                
                // 中指：完全伸直
                middle_MCP_L: 0,
                middle_PIP_L: 0,
                middle_DIP_L: 0,
                
                // 无名指：完全伸直
                ring_MCP_L: 0,
                ring_PIP_L: 0,
                ring_DIP_L: 0,
                
                // 小指：完全伸直
                little_MCP_L: 0,
                little_PIP_L: 0,
                little_DIP_L: 0
            }
        },
        
        scissors: {
            name: "剪刀",
            icon: "✌️",
            description: "食指和中指伸出",
            joints: {
                // 拇指：稍微收拢
                thumb_CMC_L: 0.5,
                thumb_MP_L: 0.3,
                thumb_IP_L: 0.4,
                
                // 食指：完全伸直
                index_MCP_L: 0,
                index_PIP_L: 0,
                index_DIP_L: 0,
                
                // 中指：完全伸直
                middle_MCP_L: 0,
                middle_PIP_L: 0,
                middle_DIP_L: 0,
                
                // 无名指：完全弯曲
                ring_MCP_L: 1.4,
                ring_PIP_L: 1.4,
                ring_DIP_L: 1.12,
                
                // 小指：完全弯曲
                little_MCP_L: 1.4,
                little_PIP_L: 1.4,
                little_DIP_L: 1.12
            }
        }
    };
    
    // 右手手势定义（关节名称后缀为 _R）
    const RIGHT_HAND_GESTURES = {};
    
    // 为右手生成对应的手势定义
    Object.keys(GESTURES).forEach(gestureKey => {
        const leftGesture = GESTURES[gestureKey];
        const rightGesture = {
            ...leftGesture,
            joints: {}
        };
        
        // 将左手关节名称转换为右手关节名称
        Object.keys(leftGesture.joints).forEach(jointName => {
            const rightJointName = jointName.replace('_L', '_R');
            rightGesture.joints[rightJointName] = leftGesture.joints[jointName];
        });
        
        RIGHT_HAND_GESTURES[gestureKey] = rightGesture;
    });
    
    /**
     * 获取当前手型的手势定义
     */
    function getCurrentHandGestures() {
        const handType = window.Hand3DViewer.currentHandType || 'left';
        return handType === 'left' ? GESTURES : RIGHT_HAND_GESTURES;
    }
    
    /**
     * 应用手势到手部模型
     */
    function applyGesture(gestureName, animationDuration = 1000) {
        const gestures = getCurrentHandGestures();
        const gesture = gestures[gestureName];
        
        if (!gesture) {
            console.warn(`Unknown gesture: ${gestureName}`);
            return false;
        }
        
        console.log(`DEBUG: Applying gesture "${gesture.name}" (${gesture.icon})`);
        
        // 显示手势信息
        showGestureInfo(gesture);
        
        // 获取当前关节角度用于动画插值
        const currentAngles = {};
        const targetAngles = gesture.joints;
        
        // 记录当前角度
        Object.keys(targetAngles).forEach(jointName => {
            currentAngles[jointName] = window.Hand3DViewer.getJointAngle(jointName) || 0;
        });
        
        // 执行动画
        if (animationDuration > 0) {
            animateToGesture(currentAngles, targetAngles, animationDuration);
        } else {
            // 立即应用
            Object.keys(targetAngles).forEach(jointName => {
                window.Hand3DViewer.setJointAngle(jointName, targetAngles[jointName]);
            });
        }
        
        return true;
    }
    
    /**
     * 动画过渡到手势
     */
    function animateToGesture(startAngles, targetAngles, duration) {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数（ease-out）
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // 插值计算当前角度
            Object.keys(targetAngles).forEach(jointName => {
                const startAngle = startAngles[jointName] || 0;
                const targetAngle = targetAngles[jointName];
                const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
                
                window.Hand3DViewer.setJointAngle(jointName, currentAngle);
            });
            
            // 继续动画直到完成
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                console.log("DEBUG: Gesture animation complete");
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    /**
     * 显示手势信息
     */
    function showGestureInfo(gesture) {
        // 创建临时通知显示手势信息
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 18px;
            z-index: 10000;
            pointer-events: none;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        notification.innerHTML = `${gesture.icon} ${gesture.name}`;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * 重置到自然姿态
     */
    function resetToNaturalPose() {
        console.log("DEBUG: Resetting to natural pose");
        
        // 自然姿态：手指微微弯曲
        const naturalPose = {
            // 拇指：自然位置
            thumb_CMC_L: 0.2,
            thumb_MP_L: 0.1,
            thumb_IP_L: 0.2,
            
            // 其他手指：微微弯曲
            index_MCP_L: 0.2,
            middle_MCP_L: 0.2,
            ring_MCP_L: 0.2,
            little_MCP_L: 0.2
        };
        
        // 根据当前手型调整关节名称
        const handType = window.Hand3DViewer.currentHandType || 'left';
        if (handType === 'right') {
            const rightPose = {};
            Object.keys(naturalPose).forEach(jointName => {
                const rightJointName = jointName.replace('_L', '_R');
                rightPose[rightJointName] = naturalPose[jointName];
            });
            naturalPose = rightPose;
        }
        
        // 获取当前角度
        const currentAngles = {};
        Object.keys(naturalPose).forEach(jointName => {
            currentAngles[jointName] = window.Hand3DViewer.getJointAngle(jointName) || 0;
        });
        
        // 执行动画过渡
        animateToGesture(currentAngles, naturalPose, 800);
        
        // 显示信息
        showGestureInfo({
            name: "自然姿态",
            icon: "🖐️",
            description: "手指自然放松"
        });
    }
    
    /**
     * 获取可用手势列表
     */
    function getAvailableGestures() {
        const gestures = getCurrentHandGestures();
        return Object.keys(gestures).map(key => ({
            key: key,
            name: gestures[key].name,
            icon: gestures[key].icon,
            description: gestures[key].description
        }));
    }
    
    /**
     * 手势演示（循环展示所有手势）
     */
    function demonstrateGestures(interval = 3000) {
        const gestureKeys = Object.keys(getCurrentHandGestures());
        let currentIndex = 0;
        
        console.log("DEBUG: Starting gesture demonstration");
        
        function showNextGesture() {
            if (currentIndex < gestureKeys.length) {
                const gestureKey = gestureKeys[currentIndex];
                applyGesture(gestureKey, 1000);
                currentIndex++;
                setTimeout(showNextGesture, interval);
            } else {
                // 演示完成，返回自然姿态
                setTimeout(() => {
                    resetToNaturalPose();
                    console.log("DEBUG: Gesture demonstration complete");
                }, 1000);
            }
        }
        
        showNextGesture();
    }
    
    /**
     * 随机手势
     */
    function randomGesture() {
        const gestureKeys = Object.keys(getCurrentHandGestures());
        const randomKey = gestureKeys[Math.floor(Math.random() * gestureKeys.length)];
        applyGesture(randomKey);
        return randomKey;
    }
    
    // 暴露到全局命名空间
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.Gestures = {
        applyGesture: applyGesture,
        resetToNaturalPose: resetToNaturalPose,
        getAvailableGestures: getAvailableGestures,
        demonstrateGestures: demonstrateGestures,
        randomGesture: randomGesture,
        GESTURES: GESTURES,
        RIGHT_HAND_GESTURES: RIGHT_HAND_GESTURES,
        getCurrentHandGestures: getCurrentHandGestures
    };
    
    console.log("DEBUG: Hand 3D Viewer gestures module initialized");
    
})();