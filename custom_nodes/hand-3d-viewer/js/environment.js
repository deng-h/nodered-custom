// Hand 3D Viewer - Environment Enhancement
(function() {
    "use strict";
    
    /**
     * 设置高质量渲染（无阴影版本）
     */
    function setupHighQualityRendering(renderer) {
        if (!renderer) return;
        
        // 禁用物理正确的光照，避免过度真实的阴影效果
        renderer.physicallyCorrectLights = false;
        
        // 完全禁用阴影
        renderer.shadowMap.enabled = false;
        renderer.shadowMap.autoUpdate = false;
        
        // 设置色调映射
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.4;
        
        // 设置色彩空间
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        console.log("DEBUG: High quality rendering configured (shadows disabled)");
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
     * 添加无阴影的均匀光照
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
        
        // 强环境光 - 提供基础均匀照明
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        // 多方向柔光 - 从各个方向照亮，不产生阴影
        const lightPositions = [
            [5, 5, 5],   // 右上前
            [-5, 5, 5],  // 左上前
            [5, 5, -5],  // 右上后
            [-5, 5, -5], // 左上后
            [5, -2, 0],  // 右下
            [-5, -2, 0], // 左下
            [0, 5, 0],   // 正上
            [0, -2, 5],  // 正下前
        ];
        
        lightPositions.forEach((position, index) => {
            const light = new THREE.DirectionalLight(0xffffff, 0.15);
            light.position.set(position[0], position[1], position[2]);
            light.castShadow = false; // 明确禁用阴影
            scene.add(light);
        });
        
        // 添加半球光 - 模拟天空和地面的反射
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.3);
        scene.add(hemisphereLight);
        
        console.log("DEBUG: Shadow-free lighting setup completed");
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