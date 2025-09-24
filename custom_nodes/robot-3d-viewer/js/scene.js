// Robot 3D Viewer - 3D Scene Management
(function() {
    "use strict";
    
    // 3D场景相关变量
    let scene, camera, renderer, controls;
    let currentModel = null;
    let animationId = null;
    let robot = null;
    
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
        
        // 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xaaaaaa);
        
        // 创建相机
        const containerRect = container.getBoundingClientRect();
        camera = new THREE.PerspectiveCamera(75, containerRect.width / containerRect.height, 0.1, 1000);
        camera.position.set(1, 1, 1);
        camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRect.width, containerRect.height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
        
        // 添加轨道控制器（如果可用）
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, canvas);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enablePan = true;
            controls.enableZoom = true;
            controls.enableRotate = true;
            
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
            
            console.log("DEBUG: OrbitControls configured with custom mouse mapping");
        } else {
            console.warn("OrbitControls not available, using basic camera");
            // 手动实现基础的鼠标控制
            window.Robot3DViewer.setupBasicMouseControls(canvas);
        }
        
        // 添加光源
        setupLighting();
        
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
    
    // 设置光源
    function setupLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        // 主光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);
        
        // 补充光源
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, -10, -5);
        scene.add(fillLight);
        
        // 添加地面
        /*const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f0f0,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // 旋转90度使其水平
        ground.position.y = -1; // 稍微下移，让机器人站在上面
        ground.receiveShadow = true; // 接收阴影
        scene.add(ground);*/
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
                
                const INITIAL_ROBOT_POSITION = new THREE.Vector3(0, 0, 0);   // (x,y,z)
                const INITIAL_ROBOT_RPY = { roll: -1.98, pitch: -0.411, yaw: -0.96 }; // 角度（弧度制）

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
                 // 新增：加载模型后，将滑块的初始值与模型的初始姿态同步
                $('#roll-slider').val(INITIAL_ROBOT_RPY.roll);
                $('#pitch-slider').val(INITIAL_ROBOT_RPY.pitch);
                $('#yaw-slider').val(INITIAL_ROBOT_RPY.yaw);
                
                // 新增：调用一次更新函数，来设置模型的初始姿态和UI显示
                window.Robot3DViewer.updateRobotPoseFromSliders();                   
                $('#loading-indicator').hide();

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
        camera.aspect = containerRect.width / containerRect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRect.width, containerRect.height);
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
        get: function() { return robot; }
    });
})();