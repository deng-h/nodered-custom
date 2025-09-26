// Robot 3D Viewer - Environment Enhancement
(function() {
    "use strict";
    
    // 添加雾效到场景
    function addFogEffect(scene) {
        const fogColor = 0xeeeeee;
        scene.fog = new THREE.Fog(fogColor, 2, 20);
        // 设置背景色与雾色一致
        scene.background = new THREE.Color(fogColor);
        return scene;
    }
    
    // 创建高质量环境贴图生成器
    function createEnvironmentMap(renderer) {
        // 创建一个更好的环境天空盒
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        
        // 创建一个更真实的渐变环境
        const scene = new THREE.Scene();
        const geometry = new THREE.SphereGeometry(50, 64, 32);
        
        // 创建更精细的渐变材质
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                vec3 color;
                if (h > 0.0) {
                    color = mix(horizonColor, topColor, pow(h, exponent));
                } else {
                    color = mix(horizonColor, bottomColor, pow(-h, exponent * 0.5));
                }
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x87CEEB) }, // 天蓝色
                horizonColor: { value: new THREE.Color(0xD3D3D3) }, // 浅灰色
                bottomColor: { value: new THREE.Color(0x5e5d5d) }, // 深灰色（与雾色一致）
                offset: { value: 0 },
                exponent: { value: 0.8 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(geometry, material);
        scene.add(skybox);
        
        const renderTarget = pmremGenerator.fromScene(scene);
        pmremGenerator.dispose();
        
        return renderTarget.texture;
    }
    
    // 添加环境光遮蔽效果
    function addAmbientOcclusion(scene) {
        // 这里可以添加更复杂的环境光遮蔽逻辑
        // 目前使用简单的环境光设置
        return scene;
    }
    
    // 添加高质量光影和视觉效果（柔和光照版本）
    function addVisualEffects(scene, renderer) {
        // 配置渲染器的高质量设置
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.3; // 提高曝光，让整体更亮
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 强化环境光 - 提供更均匀的基础照明，减少明暗对比
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // 大幅提高环境光
        scene.add(ambientLight);
        
        // 主方向光（降低强度，更柔和）
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5); // 大幅降低主光强度
        dirLight.position.set(2, 4, 3);
        dirLight.castShadow = true;
        
        // 柔和阴影设置
        const cam = dirLight.shadow.camera;
        cam.top = cam.right = 3;
        cam.bottom = cam.left = -3;
        cam.near = 2;
        cam.far = 10;
        dirLight.shadow.mapSize.set(512, 512); // 降低阴影分辨率，更柔和
        dirLight.shadow.radius = 5; // 增加阴影模糊半径
        dirLight.shadow.blurSamples = 8;
        
        scene.add(dirLight);
        
        // 环绕光源系统 - 在机器人周围放置多个柔和光源
        const ringLights = [];
        const numLights = 6; // 6个光源环绕
        const radius = 4;
        const height = 2;
        
        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // 柔和的环绕光源
            const ringLight = new THREE.DirectionalLight(0xffffff, 0.3); // 较弱的强度
            ringLight.position.set(x, height, z);
            ringLight.target.position.set(0, 1, 0); // 都指向机器人中心
            
            scene.add(ringLight);
            scene.add(ringLight.target);
            ringLights.push(ringLight);
        }
        
        // 顶部柔光 - 从上方提供均匀照明
        const topLight = new THREE.DirectionalLight(0xf5f5f5, 0.8);
        topLight.position.set(0, 6, 0);
        topLight.target.position.set(0, 0, 0);
        scene.add(topLight);
        scene.add(topLight.target);
        
        // 底部反射光 - 模拟地面反射，减少底部阴影
        const bottomLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
        bottomLight.position.set(0, -1, 0);
        bottomLight.target.position.set(0, 1, 0);
        scene.add(bottomLight);
        scene.add(bottomLight.target);
        
        // 添加环境效果
        addFogEffect(scene);
        
        console.log("DEBUG: Soft lighting system with ring lights added");
        return scene;
    }
    
    // 暴露函数到全局对象
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.Environment = {
        addFogEffect: addFogEffect,
        createEnvironmentMap: createEnvironmentMap,
        addAmbientOcclusion: addAmbientOcclusion,
        addVisualEffects: addVisualEffects,
    };
})();