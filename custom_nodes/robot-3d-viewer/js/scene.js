// Robot 3D Viewer - 3D Scene Management
(function() {
    "use strict";
    
    // 3D场景相关变量
    let scene, camera, renderer, controls;
    let currentModel = null;
    let animationId = null;
    
    function initThreeJSScene() {
        if (!window.Robot3DViewer.dependenciesLoaded) {
            console.warn("DEBUG: Dependencies not loaded yet. Aborting scene init.");
            $('#loading-indicator').show().find('div').text('正在加载依赖库...');
            // 再次触发加载，以防万一
            window.Robot3DViewer.loadDependencies(function(){
                if ($('#robot-3d-container').is(':visible')) {
                    initThreeJSScene(); // 加载完后重试
                }
            });
            return;
        }

        const container = document.getElementById('robot-3d-container');
        if (!container || !window.Robot3DViewer.isThreeJSLoaded()) {
            console.log("DEBUG: Container not ready or Three.js not loaded");
            return;
        }
        
        $('#loading-indicator').hide();
        
        // 如果已经初始化过，清理旧的场景
        if (renderer) {
            container.removeChild(renderer.domElement);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
        
        // 创建场景（背景将由环境模块设置）
        scene = new THREE.Scene();
        
        // 创建相机
        const containerRect = container.getBoundingClientRect();
        camera = new THREE.PerspectiveCamera(45, containerRect.width / containerRect.height, 0.1, 1000);
        camera.position.set(2, 2, 3);
        camera.lookAt(0, 1, 0);
        
        // 创建渲染器（高质量设置将由environment模块配置）
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(containerRect.width, containerRect.height);
        container.appendChild(renderer.domElement);
        
        // 阻止浏览器默认的鼠标事件
        const canvas = renderer.domElement;
        canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        canvas.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        canvas.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 添加轨道控制器（如果可用）- 使用webgl_animation_walk的控制风格
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, canvas);
            controls.target.set(0, 1, 0);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enablePan = false; // 禁用平移，更像webgl_animation_walk
            controls.enableZoom = true;
            controls.enableRotate = true;
            
            // 关键：限制垂直旋转角度，防止拖到地面以下
            const PI90 = Math.PI / 2;
            controls.maxPolarAngle = PI90 - 0.05; // 几乎垂直但不能到地面以下
            
            // 设置距离范围
            controls.minDistance = 2;
            controls.maxDistance = 20;
            
            // 自定义鼠标按键映射
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
            
            // 触控设备支持
            controls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
            };
            
            controls.update();
            
            console.log("DEBUG: OrbitControls configured with webgl_animation_walk style settings");
        } else {
            console.warn("OrbitControls not available, using basic camera");
            // 手动实现基础的鼠标控制
            window.Robot3DViewer.setupBasicMouseControls(canvas);
        }
        
        // 添加光源
        setupLighting();
        
        // 添加环境增强效果
        if (window.Robot3DViewer && window.Robot3DViewer.Environment) {
            try {
                window.Robot3DViewer.Environment.addVisualEffects(scene, renderer);
                console.log("DEBUG: Visual effects added");
            } catch (e) {
                console.warn("Failed to add visual effects:", e);
            }
        }
        
        // 创建模型
        createRobotModel();
        
        // 绑定控制按钮事件
        window.Robot3DViewer.bindControlEvents();
        
        // 开始渲染循环
        animate();
        
        // 处理窗口大小变化
        window.addEventListener('resize', onWindowResize);
        
        console.log("DEBUG: Three.js scene initialized with custom mouse controls");
    }
    
    // 设置光源和地面（简化版，主要光源由environment.js处理）
    function setupLighting() {
        // 添加地面（类似webgl_animation_walk的风格）
        const size = 200;
        const repeat = 16;
        
        // 创建地面纹理（使用程序生成的棋盘格纹理）
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // 绘制棋盘格图案
        const tileSize = 32;
        for (let x = 0; x < canvas.width; x += tileSize) {
            for (let y = 0; y < canvas.height; y += tileSize) {
                const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
                context.fillStyle = isEven ? '#f5f5f5' : '#888888';
                context.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        const floorTexture = new THREE.CanvasTexture(canvas);
        floorTexture.colorSpace = THREE.SRGBColorSpace;
        floorTexture.repeat.set(repeat, repeat);
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            map: floorTexture,
            color: 0x404040,
            roughness: 0.85,
            metalness: 0.1,
            depthWrite: false
        });
        
        const groundGeometry = new THREE.PlaneGeometry(size, size, 50, 50);
        groundGeometry.rotateX(-Math.PI / 2);
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.receiveShadow = true;
        ground.position.y = -0.01;
        scene.add(ground);
        
        console.log("DEBUG: Ground and accent lighting setup complete");
    }
    
    function createRobotModel() {
        // 清除旧模型
        if (currentModel) {
            scene.remove(currentModel);
            currentModel.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (child.material.isMaterial) {
                        // 清理材质引用的纹理等
                        Object.values(child.material).forEach(value => {
                            if (value && typeof value.dispose === 'function') {
                                value.dispose();
                            }
                        });
                        child.material.dispose();
                    }
                }
            });
        }

        $('#loading-indicator').show();

        const loader = new URDFLoader();

        loader.workingPath = '/H1_Pro1/urdf/';
        loader.packages = { '': '/H1_Pro1' };
        const urdfPath = '/H1_Pro1/urdf/H1_Pro1.urdf';
        console.log("DEBUG: Starting to load URDF from:", urdfPath);

        loader.load(
            urdfPath,
            robot => {
                console.log("DEBUG: Robot model loaded successfully", robot);
                const box = new THREE.Box3().setFromObject(robot);
                const center = box.getCenter(new THREE.Vector3());
                robot.position.sub(center);
                
                // 打造金属质感和硬质装甲效果
                robot.traverse(function(child) {
                    if (child.isMesh) {
                        // 启用阴影投射和接收
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // 应用环境增强材质效果
                if (window.Robot3DViewer && window.Robot3DViewer.Environment) {
                    try {
                        window.Robot3DViewer.Environment.enhanceMaterials(robot);
                        console.log("DEBUG: Material enhancements applied");
                    } catch (e) {
                        console.warn("Failed to enhance materials:", e);
                    }
                }
                
                const INITIAL_ROBOT_POSITION = new THREE.Vector3(0, 0.95, 0);   // 稍微抬高让机器人站在地面上
                const INITIAL_ROBOT_RPY = { roll: -1.62, pitch: 0.0, yaw: -0.99 }; // 角度（弧度制）

                // 应用姿态（roll=X, pitch=Y, yaw=Z，按 XYZ 顺序）
                robot.rotation.set(
                    INITIAL_ROBOT_RPY.roll,
                    INITIAL_ROBOT_RPY.pitch,
                    INITIAL_ROBOT_RPY.yaw,
                    'XYZ'
                );       
                
                robot.position.add(INITIAL_ROBOT_POSITION);

                scene.add(robot);
                currentModel = robot;
                // 保存 loader 引用到模型和全局，供外部控制使用（例如按名称设置关节值）
                try {
                    robot.userData = robot.userData || {};
                    robot.userData.urdfLoader = loader;
                    window.Robot3DViewer = window.Robot3DViewer || {};
                    window.Robot3DViewer.urdfLoader = loader;
                } catch (e) {
                    console.warn('Failed to attach urdfLoader to model/userData', e);
                }
                 // 新增：加载模型后，将滑块的初始值与模型的初始姿态同步
                $('#roll-slider').val(INITIAL_ROBOT_RPY.roll);
                $('#pitch-slider').val(INITIAL_ROBOT_RPY.pitch);
                $('#yaw-slider').val(INITIAL_ROBOT_RPY.yaw);
                
                // 新增：调用一次更新函数，来设置模型的初始姿态和UI显示
                window.Robot3DViewer.updateRobotPoseFromSliders();                   
                $('#loading-indicator').hide();
                
                // 显示 Three.js 风格的GUI面板
                $('#threejs-gui-panel').show();

                // 如果关节坐标系显示已启用，重新创建坐标系
                if (window.Robot3DViewer.showJointAxes) {
                    window.Robot3DViewer.createJointAxes();
                }

                // 假设关节名包含 HAND_L（需与模型节点名称匹配，可调试 console 输出）
                window.Robot3DViewer.addJointAnnotation('HAND_L', 42.3);
                window.Robot3DViewer.addJointAnnotation('HAND_R', 42.3);
                window.Robot3DViewer.addJointAnnotation('Shoulder_Y_L', 42.3);
                window.Robot3DViewer.addJointAnnotation('Shoulder_X_L', 42.3);
                window.Robot3DViewer.addJointAnnotation('Shoulder_Z_L', 42.3);
            },
            progress => {
                if (progress && progress.total > 0) {
                    const percent = Math.round(progress.loaded / progress.total * 100);
                    $('#loading-indicator div').text(`加载3D模型中... ${percent}%`);
                } else {
                    $('#loading-indicator div').text('加载3D模型中...');
                }
            },
            error => {
                console.error("ERROR: Failed to load URDF model.", error);
                RED.notify("机器人模型加载失败，请检查控制台和文件路径。", { type: "error", timeout: 8000 });
                $('#loading-indicator div').text('加载失败！');
            }
        );
    }
    
    // 动画循环
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        // 自动旋转
        if (window.Robot3DViewer.autoRotate && currentModel) {
            currentModel.rotation.z += 0.01;
        }
        
        // 更新控制器
        if (controls) {
            controls.update();
        }
        
        // 渲染场景
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        // 更新注释
        window.Robot3DViewer.updateAnnotations();
    }
    
    // 窗口大小变化处理
    function onWindowResize() {
        const container = document.getElementById('robot-3d-container');
        if (!container || !camera || !renderer) return;

        const containerRect = container.getBoundingClientRect();
        // 防止高度或宽度为0（隐藏或未布局完成）导致的异常
        const width = Math.max(1, Math.floor(containerRect.width));
        const height = Math.max(1, Math.floor(containerRect.height));

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // 同步 canvas 的样式尺寸和渲染器尺寸，确保绘制区域真实可见
        const canvas = renderer.domElement;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height, false);

        // 立即触发一次渲染，避免在某些浏览器/情况下留下黑屏
        try {
            renderer.render(scene, camera);
        } catch (e) {
            console.warn('Renderer render failed during resize:', e);
        }
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.initThreeJSScene = initThreeJSScene;
    window.Robot3DViewer.onWindowResize = onWindowResize;
    Object.defineProperty(window.Robot3DViewer, 'scene', {
        get: function() { return scene; }
    });
    Object.defineProperty(window.Robot3DViewer, 'camera', {
        get: function() { return camera; }
    });
    Object.defineProperty(window.Robot3DViewer, 'renderer', {
        get: function() { return renderer; }
    });
    Object.defineProperty(window.Robot3DViewer, 'controls', {
        get: function() { return controls; }
    });
    Object.defineProperty(window.Robot3DViewer, 'currentModel', {
        get: function() { return currentModel; }
    });
    Object.defineProperty(window.Robot3DViewer, 'robot', {
        get: function() { return currentModel; }
    });
})();