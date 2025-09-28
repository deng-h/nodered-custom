// Hand 3D Viewer - Environment Enhancement
(function() {
    "use strict";
    
    /**
     * 设置高质量渲染
     */
    function setupHighQualityRendering(renderer) {
        if (!renderer) return;
        
        // 启用物理正确的光照
        renderer.physicallyCorrectLights = true;
        
        // 启用阴影
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.autoUpdate = true;
        
        // 设置色调映射
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        
        // 设置色彩空间
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        console.log("DEBUG: High quality rendering configured");
    }
    
    /**
     * 设置场景背景
     */
    function setupSceneBackground(scene) {
        if (!scene) return;
        
        // 创建渐变背景
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#2c3e50'); // 深蓝灰色顶部
        gradient.addColorStop(1, '#34495e'); // 略深的底部
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const bgTexture = new THREE.CanvasTexture(canvas);
        bgTexture.colorSpace = THREE.SRGBColorSpace;
        scene.background = bgTexture;
    }
    
    /**
     * 添加专业级光照
     */
    function setupProfessionalLighting(scene) {
        if (!scene) return;
        
        // 清除现有灯光
        const lights = [];
        scene.traverse(function(child) {
            if (child.isLight) {
                lights.push(child);
            }
        });
        lights.forEach(light => scene.remove(light));
        
        // 主光源 - 模拟太阳光
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(10, 10, 5);
        mainLight.target.position.set(0, 0, 0);
        
        // 配置阴影
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        
        scene.add(mainLight);
        scene.add(mainLight.target);
        
        // 补光 - 从侧面照亮
        const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
        fillLight.position.set(-5, 3, 5);
        scene.add(fillLight);
        
        // 环境光 - 提供基础照明
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);
        
        // 顶部柔光
        const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
        topLight.position.set(0, 10, 0);
        scene.add(topLight);
    }
    
    /**
     * 添加视觉增强效果
     */
    function addVisualEffects(scene, renderer) {
        try {
            setupSceneBackground(scene);
            setupHighQualityRendering(renderer);
            setupProfessionalLighting(scene);
            
            console.log("DEBUG: Visual effects added successfully");
        } catch (error) {
            console.warn("Failed to setup visual effects:", error);
        }
    }
    
    // 暴露给全局命名空间
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.Environment = {
        addVisualEffects: addVisualEffects,
        setupHighQualityRendering: setupHighQualityRendering,
        setupSceneBackground: setupSceneBackground,
        setupProfessionalLighting: setupProfessionalLighting
    };
    
    console.log("DEBUG: Hand 3D Viewer environment module initialized");
    
})();