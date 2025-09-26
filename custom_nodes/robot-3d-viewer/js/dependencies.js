// Robot 3D Viewer - Dependencies Loader
(function() {
    "use strict";
    
    // 机器人初始姿态常量 - 统一定义
    const ROBOT_INITIAL_POSE = {
        position: { x: 0, y: 0.95, z: 0 },  // 稍微抬高让机器人站在地面上
        rotation: { roll: -1.571, pitch: 0.000000, yaw: -0.99 }  // 角度（弧度制）
    };
    
    let isThreeJSLoaded = false;
    let dependenciesLoaded = false;
    
    function loadThreeJS(callback) {
        if (window.THREE) {
            isThreeJSLoaded = true;
            callback();
            return;
        }
        
        const cdnUrls = [
            'https://unpkg.com/three@0.147.0/build/three.min.js',
            'https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js',
            'https://threejs.org/build/three.min.js',
            './static/three.min.js'  // 本地备选
        ];
        
        let currentIndex = 0;
        
        function tryLoadFromCDN() {
            if (currentIndex >= cdnUrls.length) {
                console.error("All sources failed, using fallback display");
                RED.notify("Three.js库加载失败", { 
                    type: "error", 
                    timeout: 5000 
                });
                return;
            }
            
            const script = document.createElement('script');
            script.src = cdnUrls[currentIndex];
            
            script.onload = function() {
                console.log("DEBUG: Three.js 加载成功");
                isThreeJSLoaded = true;
                callback();
            };
            
            script.onerror = function() {
                console.warn("Failed to load from:", cdnUrls[currentIndex]);
                currentIndex++;
                setTimeout(tryLoadFromCDN, 100); // 延迟重试
            };
            
            document.head.appendChild(script);
        }
        
        tryLoadFromCDN();
    }
    
    function loadDependencies(callback) {
        if (dependenciesLoaded) {
            callback();
            return;
        }

        loadThreeJS(function() {
            loadScript('./static/OrbitControls.js', 'OrbitControls', function() {
                loadScript('./static/ColladaLoader.js', 'ColladaLoader', function() {
                    loadScript('./static/URDFLoader.js', 'URDFLoader', function() {
                        loadEnvironmentScript(function() {
                            console.log("DEBUG: All 3D dependencies (OrbitControls, ColladaLoader, URDFLoader, Environment) loaded successfully.");
                            dependenciesLoaded = true;
                            callback();
                        });
                    });
                });
            });
        });
    }

    // 通用的脚本加载函数
    function loadScript(url, checkObject, callback) {
        // 检查对象是否已存在于 THREE 或 window
        if ((window.THREE && window.THREE[checkObject]) || window[checkObject]) {
            console.log(`DEBUG: ${checkObject} is already loaded.`);
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = false; // 确保脚本按顺序执行

        script.onload = function() {
            console.log(`DEBUG: ${checkObject} loaded successfully from ${url}`);
            callback();
        };

        script.onerror = function() {
            console.error(`ERROR: Failed to load ${checkObject} from ${url}`);
            RED.notify(`依赖库 ${checkObject} 加载失败`, { type: "error", timeout: 5000 });
        };

        document.head.appendChild(script);
    }
    
    // 加载环境增强脚本
    function loadEnvironmentScript(callback) {
        // 检查是否已加载
        if (window.Robot3DViewer && window.Robot3DViewer.Environment) {
            console.log("DEBUG: Environment script is already loaded.");
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = './js/environment.js';
        script.async = false;

        script.onload = function() {
            console.log("DEBUG: Environment script loaded successfully");
            callback();
        };

        script.onerror = function() {
            console.warn("WARN: Failed to load environment.js, continuing without it");
            callback(); // 继续执行，不阻塞主要功能
        };

        document.head.appendChild(script);
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.loadDependencies = loadDependencies;
    window.Robot3DViewer.isThreeJSLoaded = function() { return isThreeJSLoaded; };
    window.Robot3DViewer.ROBOT_INITIAL_POSE = ROBOT_INITIAL_POSE;  // 暴露初始姿态常量
    
    // 添加全局重置函数作为备选方案
    window.Robot3DViewer.resetRobotPose = function() {
        console.log('DEBUG: Global reset function called');
        if (window.Robot3DViewer.currentModel && window.Robot3DViewer.ROBOT_INITIAL_POSE) {
            const initialPose = window.Robot3DViewer.ROBOT_INITIAL_POSE;
            
            window.Robot3DViewer.currentModel.position.set(
                initialPose.position.x,
                initialPose.position.y,
                initialPose.position.z
            );

            window.Robot3DViewer.currentModel.rotation.set(
                initialPose.rotation.roll,
                initialPose.rotation.pitch,
                initialPose.rotation.yaw,
                'XYZ'
            );
            
            // 更新滑块
            if (typeof $ !== 'undefined') {
                $('#roll-slider').val(initialPose.rotation.roll);
                $('#pitch-slider').val(initialPose.rotation.pitch);
                $('#yaw-slider').val(initialPose.rotation.yaw);
                $('#roll-value').text(initialPose.rotation.roll.toFixed(2));
                $('#pitch-value').text(initialPose.rotation.pitch.toFixed(2));
                $('#yaw-value').text(initialPose.rotation.yaw.toFixed(2));
            }
            
            console.log('DEBUG: Global reset completed');
            return true;
        }
        console.warn('WARN: Cannot reset - model or pose not available');
        return false;
    };
    
    // 添加按钮点击处理函数
    window.Robot3DViewer.handleResetClick = function(event) {
        console.log('DEBUG: Reset button clicked via direct event handler');
        event.preventDefault();
        
        const success = window.Robot3DViewer.resetRobotPose();
        if (success && window.Robot3DViewer.updateRobotPoseFromSliders) {
            window.Robot3DViewer.updateRobotPoseFromSliders();
        }
    };
    
    Object.defineProperty(window.Robot3DViewer, 'dependenciesLoaded', {
        get: function() { return dependenciesLoaded; }
    });
})();