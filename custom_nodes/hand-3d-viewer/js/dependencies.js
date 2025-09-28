// Hand 3D Viewer - Dependencies Management
(function() {
    "use strict";
    
    // 全局状态
    let threeJSLoaded = false;
    let urdfLoaderLoaded = false;
    
    const DEPENDENCIES = {
        threeJS: './hand-3d-viewer/static/three.min.js',
        orbitControls: './hand-3d-viewer/static/OrbitControls.js',
        stlLoader: './hand-3d-viewer/static/STLLoader.js',
        urdfLoader: './hand-3d-viewer/static/URDFLoader.js',
        colladaLoader: './hand-3d-viewer/static/ColladaLoader.js'
    };
    
    // 初始姿态常量 - 区分左手和右手
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.LEFT_HAND_INITIAL_POSE = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { roll: -1.571, pitch: 0, yaw: 0 }
    };
    window.Hand3DViewer.RIGHT_HAND_INITIAL_POSE = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { roll: -1.571, pitch: 0, yaw: 0 }
    };
    
    // 获取当前手部类型的初始姿态
    window.Hand3DViewer.getCurrentHandInitialPose = function() {
        const handType = window.Hand3DViewer.currentHandType || 'left';
        return handType === 'left' ? 
            window.Hand3DViewer.LEFT_HAND_INITIAL_POSE : 
            window.Hand3DViewer.RIGHT_HAND_INITIAL_POSE;
    };
    
    // 保持向后兼容性
    Object.defineProperty(window.Hand3DViewer, 'HAND_INITIAL_POSE', {
        get: function() {
            return this.getCurrentHandInitialPose();
        }
    });
    
    // 全局变量控制
    window.Hand3DViewer.autoRotate = false;
    window.Hand3DViewer.showJointAxes = false;
    window.Hand3DViewer.dependenciesLoaded = false;
    
    /**
     * 加载脚本
     */
    function loadScript(url, callback, errorCallback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        
        script.onload = function() {
            console.log(`DEBUG: Loaded ${url}`);
            if (callback) callback();
        };
        
        script.onerror = function() {
            console.error(`ERROR: Failed to load ${url}`);
            if (errorCallback) errorCallback();
        };
        
        script.src = url;
        document.head.appendChild(script);
    }
    
    /**
     * 检查Three.js是否已加载
     */
    function isThreeJSLoaded() {
        return typeof THREE !== 'undefined' && threeJSLoaded;
    }
    
    /**
     * 检查URDF Loader是否已加载
     */
    function isURDFLoaderLoaded() {
        return typeof URDFLoader !== 'undefined' && urdfLoaderLoaded;
    }
    
    function loadDependencies(callback) {
        console.log("DEBUG: Starting dependency loading for Hand 3D Viewer...");
        
        // 检查是否已经加载
        if (window.Hand3DViewer.dependenciesLoaded && isThreeJSLoaded() && isURDFLoaderLoaded()) {
            console.log("DEBUG: Dependencies already loaded");
            if (callback) callback();
            return;
        }
        
        function onError() {
            console.error("ERROR: Failed to load some dependencies");
            RED.notify("依赖库加载失败，3D查看器可能无法正常工作", { type: "error", timeout: 8000 });
        }
        
        // 第一步：先加载 Three.js
        loadScript(DEPENDENCIES.threeJS, function() {
            threeJSLoaded = true;
            console.log("DEBUG: Three.js loaded, loading other dependencies...");
            
            let loadedCount = 0;
            const remainingDeps = 4; // controls, stl loader, urdf loader, collada loader
            
            function checkRemainingComplete() {
                loadedCount++;
                if (loadedCount === remainingDeps) {
                    urdfLoaderLoaded = true;
                    window.Hand3DViewer.dependenciesLoaded = true;
                    console.log("DEBUG: All dependencies loaded successfully");
                    if (callback) callback();
                }
            }
            
            // 第二步：Three.js 加载完成后，并行加载其他依赖
            loadScript(DEPENDENCIES.orbitControls, checkRemainingComplete, onError);
            loadScript(DEPENDENCIES.stlLoader, checkRemainingComplete, onError);
            loadScript(DEPENDENCIES.urdfLoader, checkRemainingComplete, onError);
            loadScript(DEPENDENCIES.colladaLoader, checkRemainingComplete, onError);
            
        }, onError);
    }
    
    window.Hand3DViewer.loadDependencies = loadDependencies;
    window.Hand3DViewer.isThreeJSLoaded = isThreeJSLoaded;
    window.Hand3DViewer.isURDFLoaderLoaded = isURDFLoaderLoaded;
})();