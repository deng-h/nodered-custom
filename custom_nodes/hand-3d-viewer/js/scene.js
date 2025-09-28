// Hand 3D Viewer - 3D Scene Management
(function() {
    "use strict";
    
    // 3D场景相关变量
    let scene, camera, renderer, controls;
    let currentModel = null;
    let animationId = null;
    
    // 手部模型配置
    const HAND_MODELS = {
        left: {
            name: "左手模型",
            path: "/D6_LEFT_HAND/urdf/D6_LEFT_HAND.urdf",
            workingPath: "/D6_LEFT_HAND/urdf/",
            packages: { "D6_LEFT_HAND": "/D6_LEFT_HAND" }
        },
        right: {
            name: "右手模型", 
            path: "/D6_RIGHT_HAND/urdf/D6_RIGHT_HAND.urdf",
            workingPath: "/D6_RIGHT_HAND/urdf/",
            packages: { "D6_RIGHT_HAND": "/D6_RIGHT_HAND" }
        }
    };
    
    function initThreeJSScene() {
        if (!window.Hand3DViewer.dependenciesLoaded) {
            console.warn("DEBUG: Dependencies not loaded yet. Aborting scene init.");
            $('#loading-indicator').show().find('div').text('正在加载依赖库...');
            // 再次触发加载，以防万一
            window.Hand3DViewer.loadDependencies(function(){
                if ($('#hand-3d-container').is(':visible')) {
                    initThreeJSScene(); // 加载完后重试
                }
            });
            return;
        }

        const container = document.getElementById('hand-3d-container');
        if (!container || !window.Hand3DViewer.isThreeJSLoaded()) {
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
        camera.position.set(0.3, 0.3, 0.3);
        camera.lookAt(0, 0.05, 0); // 稍微向上看，聚焦在手掌中心区域
        
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
        
        // 添加轨道控制器
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, canvas);
            controls.target.set(0, 0.1, 0); // 将焦点设置在手掌中心区域（稍微向上）
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enablePan = true; // 禁止平移
            controls.enableZoom = true;
            controls.enableRotate = true;
            
            // 关键：限制垂直旋转角度，防止拖到地面以下
            const PI90 = Math.PI / 2;
            controls.maxPolarAngle = PI90 - 0.05; // 几乎垂直但不能到地面以下
            
            // 设置距离范围
            controls.minDistance = 0.2;
            controls.maxDistance = 1.0;
            
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
        } else {
            console.warn("OrbitControls not available, using basic camera");
            RED.notify("OrbitControls 未加载，3D视图交互受限。", { type: "warning", timeout: 8000 });
        }
        
        // 添加坐标轴和焦点可视化
        addCoordinateSystem();
        
        // 添加环境增强效果
        if (window.Hand3DViewer && window.Hand3DViewer.Environment) {
            try {
                window.Hand3DViewer.Environment.addVisualEffects(scene, renderer);
                console.log("DEBUG: Visual effects added");
            } catch (e) {
                console.warn("Failed to add visual effects:", e);
            }
        } 
        const defaultHand = window.Hand3DViewer.currentHandType || 'left';
        loadHandModel(defaultHand);
        
        // 开始渲染循环
        animate();
        
        // 处理窗口大小变化
        window.addEventListener('resize', onWindowResize);
    }
    
    // 添加坐标系统和焦点可视化
    function addCoordinateSystem() {
        // 添加世界坐标轴（原点坐标轴）
        const worldAxesHelper = new THREE.AxesHelper(0.1);
        worldAxesHelper.name = 'worldAxes';
        scene.add(worldAxesHelper);
        
        // 添加OrbitControls焦点可视化
        const focusPoint = controls ? controls.target.clone() : new THREE.Vector3(0, 0.05, 0);
        
        // 创建焦点球体标记
        const focusGeometry = new THREE.SphereGeometry(0.005, 16, 16);
        const focusMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.8 
        });
        const focusSphere = new THREE.Mesh(focusGeometry, focusMaterial);
        focusSphere.position.copy(focusPoint);
        focusSphere.name = 'focusPoint';
        scene.add(focusSphere);
        
        // 创建焦点坐标轴
        const focusAxesHelper = new THREE.AxesHelper(0.05);
        focusAxesHelper.position.copy(focusPoint);
        focusAxesHelper.name = 'focusAxes';
        scene.add(focusAxesHelper);
        
        // 添加文字标签（使用简单的几何体表示）
        const labelGeometry = new THREE.RingGeometry(0.008, 0.012, 8);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.6,
            side: THREE.DoubleSide 
        });
        const focusLabel = new THREE.Mesh(labelGeometry, labelMaterial);
        focusLabel.position.copy(focusPoint);
        focusLabel.position.y += 0.02;
        focusLabel.name = 'focusLabel';
        scene.add(focusLabel);
        
        console.log(`DEBUG: Coordinate system and focus visualization added at:`, focusPoint);
        console.log(`DEBUG: World origin axes at (0,0,0), Focus point at (${focusPoint.x.toFixed(3)}, ${focusPoint.y.toFixed(3)}, ${focusPoint.z.toFixed(3)})`);
    }
    
    // 更新焦点可视化
    function updateFocusVisualization() {
        if (!controls || !scene) return;
        
        const focusPoint = controls.target;
        
        // 更新焦点球体位置
        const focusSphere = scene.getObjectByName('focusPoint');
        if (focusSphere) {
            focusSphere.position.copy(focusPoint);
        }
        
        // 更新焦点坐标轴位置
        const focusAxes = scene.getObjectByName('focusAxes');
        if (focusAxes) {
            focusAxes.position.copy(focusPoint);
        }
        
        // 更新焦点标签位置
        const focusLabel = scene.getObjectByName('focusLabel');
        if (focusLabel) {
            focusLabel.position.copy(focusPoint);
            focusLabel.position.y += 0.02;
        }
        
        console.log(`DEBUG: Focus visualization updated to (${focusPoint.x.toFixed(3)}, ${focusPoint.y.toFixed(3)}, ${focusPoint.z.toFixed(3)})`);
    }
    
    function loadHandModel(handType = 'left') {
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
        
        const handConfig = HAND_MODELS[handType];
        if (!handConfig) {
            console.error("Invalid hand type:", handType);
            return;
        }

        const loader = new URDFLoader();

        loader.workingPath = handConfig.workingPath;
        loader.packages = handConfig.packages;
        
        loader.load(
            handConfig.path,
            hand => {
                console.log(`DEBUG: ${handConfig.name} loaded successfully`, hand);
                
                // 计算模型边界并调整位置
                const box = new THREE.Box3().setFromObject(hand);
                const center = box.getCenter(new THREE.Vector3());
                
                // 将手部模型定位，使手掌中心区域在合适的高度
                hand.position.sub(center);
                
                // 动态调整控制器焦点到手掌中心区域
                if (controls) {
                    // 计算手掌中心的大致位置（通常在手部模型的中上部）
                    const handPalmCenter = new THREE.Vector3(0, 0.1, 0);
                    controls.target.copy(handPalmCenter);
                    controls.update();
                    // 更新焦点可视化
                    updateFocusVisualization();
                }
                
                // 启用阴影
                hand.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // 为手部模型设置更合适的材质
                        if (child.material) {
                            child.material.roughness = 0.4;
                            child.material.metalness = 0.1;
                        }
                    }
                });
                
                // 应用初始位置和姿态 - 根据手部类型获取相应的初始姿态
                const initialPose = window.Hand3DViewer.getCurrentHandInitialPose();
                
                hand.position.set(
                    initialPose.position.x,
                    initialPose.position.y,
                    initialPose.position.z
                );
                
                hand.rotation.set(
                    initialPose.rotation.roll,
                    initialPose.rotation.pitch,
                    initialPose.rotation.yaw,
                    'XYZ'
                );

                scene.add(hand);
                currentModel = hand;
                
                // 保存 loader 引用到模型和全局，供外部控制使用
                try {
                    hand.userData = hand.userData || {};
                    hand.userData.urdfLoader = loader;
                    window.Hand3DViewer.urdfLoader = loader;
                } catch (e) {
                    console.warn('Failed to attach urdfLoader to model/userData', e);
                }
                
                // 同步滑块值与模型初始姿态
                $('#roll-slider').val(initialPose.rotation.roll);
                $('#pitch-slider').val(initialPose.rotation.pitch);
                $('#yaw-slider').val(initialPose.rotation.yaw);
                
                // 调用更新函数设置模型的初始姿态和UI显示
                if (window.Hand3DViewer.updateHandPoseFromSliders) {
                    window.Hand3DViewer.updateHandPoseFromSliders();
                }
                                
                $('#loading-indicator').hide();
                $('#threejs-gui-panel').show();

                // 更新UI显示当前手型
                $('.hand-switch-btn').removeClass('active');
                $(`#${handType}-hand-btn`).addClass('active');
                
                console.log(`DEBUG: ${handConfig.name} setup complete`);
            },
            progress => {
                if (progress && progress.total > 0) {
                    const percent = Math.round(progress.loaded / progress.total * 100);
                    $('#loading-indicator div').text(`加载${handConfig.name}中... ${percent}%`);
                } else {
                    $('#loading-indicator div').text(`加载${handConfig.name}中...`);
                }
            },
            error => {
                console.error(`ERROR: Failed to load ${handConfig.name}.`, error);
                RED.notify(`${handConfig.name}加载失败，请检查控制台和文件路径。`, { type: "error", timeout: 8000 });
                $('#loading-indicator div').text('加载失败！');
            }
        );
    }
    
    // 动画循环
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        // 自动旋转
        if (window.Hand3DViewer.autoRotate && currentModel) {
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
    }
    
    // 窗口大小变化处理
    function onWindowResize() {
        const container = document.getElementById('hand-3d-container');
        if (!container) {
            console.warn('DEBUG: Container not found during resize');
            return;
        }
        
        if (!camera || !renderer) {
            console.warn('DEBUG: Camera or renderer not available during resize');
            return;
        }

        // 检查容器是否可见
        if (!$(container).is(':visible')) {
            console.log('DEBUG: Container not visible, skipping resize');
            return;
        }

        const containerRect = container.getBoundingClientRect();
        
        // 防止高度或宽度为0（隐藏或未布局完成）导致的异常
        const width = Math.max(1, Math.floor(containerRect.width));
        const height = Math.max(1, Math.floor(containerRect.height));

        // 如果尺寸太小，可能容器还没准备好
        if (width < 10 || height < 10) {
            console.log('DEBUG: Container too small, deferring resize');
            setTimeout(onWindowResize, 100);
            return;
        }

        try {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            // 同步 canvas 的样式尺寸和渲染器尺寸
            const canvas = renderer.domElement;
            if (canvas) {
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
            }

            renderer.setPixelRatio(window.devicePixelRatio || 1);
            renderer.setSize(width, height, false);

            // 立即触发一次渲染
            if (scene && camera) {
                renderer.render(scene, camera);
            }
            
            // 如果有控制器，也更新一下
            if (controls) {
                controls.update();
            }
        } catch (e) {
            console.warn('DEBUG: Resize operation failed:', e);
        }
    }
    
    // 暴露给全局
    window.Hand3DViewer = window.Hand3DViewer || {};
    window.Hand3DViewer.initThreeJSScene = initThreeJSScene;
    window.Hand3DViewer.loadHandModel = loadHandModel;
    window.Hand3DViewer.onWindowResize = onWindowResize;
    window.Hand3DViewer.updateFocusVisualization = updateFocusVisualization;
    
    // 只读属性
    Object.defineProperty(window.Hand3DViewer, 'scene', {
        get: function() { return scene; }
    });
    Object.defineProperty(window.Hand3DViewer, 'camera', {
        get: function() { return camera; }
    });
    Object.defineProperty(window.Hand3DViewer, 'renderer', {
        get: function() { return renderer; }
    });
    Object.defineProperty(window.Hand3DViewer, 'controls', {
        get: function() { return controls; }
    });
    Object.defineProperty(window.Hand3DViewer, 'currentModel', {
        get: function() { return currentModel; }
    });
    Object.defineProperty(window.Hand3DViewer, 'hand', {
        get: function() { return currentModel; }
    });

})();