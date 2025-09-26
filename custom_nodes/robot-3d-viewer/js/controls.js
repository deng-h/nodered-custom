// Robot 3D Viewer - Controls and Events
(function() {
    "use strict";
    
    let autoRotate = false;
    let showJointAxes = false;
    let modelTransparency = 1.0;
    let jointAxesGroup = null;
    
    // 绑定控制按钮事件
    function bindControlEvents() {
        // 主折叠控制
        $('#gui-main-toggle').off('click').on('click', function() {
            const content = $('#gui-main-content');
            const icon = $(this).find('.gui-toggle-icon');
            
            if (content.hasClass('collapsed')) {
                content.removeClass('collapsed');
                icon.text('▼');
            } else {
                content.addClass('collapsed');
                icon.text('▶');
            }
        });
        
        // GUI 文件夹折叠/展开功能
        $('.gui-folder-title').off('click').on('click', function() {
            const target = $(this).data('target');
            const content = $('#' + target);
            
            if (content.hasClass('collapsed')) {
                content.removeClass('collapsed');
            } else {
                content.addClass('collapsed');
            }
        });
        
        // 显示/隐藏模型
        $('#show-model-checkbox').off('change').on('change', function() {
            if (window.Robot3DViewer.currentModel) {
                window.Robot3DViewer.currentModel.visible = this.checked;
            }
        });
        
        // 显示/隐藏关节坐标系
        $('#show-joint-axes-checkbox').off('change').on('change', function() {
            showJointAxes = this.checked;
            if (showJointAxes) {
                createJointAxes();
            } else {
                removeJointAxes();
            }
        });
        
        // 重置机器人姿态按钮 - 使用事件代理确保绑定成功
        $(document).off('click', '#reset-pose-btn').on('click', '#reset-pose-btn', function() {
            console.log('DEBUG: Reset pose button clicked');
            
            // 优先使用全局重置函数
            if (window.Robot3DViewer && window.Robot3DViewer.resetRobotPose) {
                const success = window.Robot3DViewer.resetRobotPose();
                if (success) {
                    // 调用姿态更新函数
                    if (window.Robot3DViewer.updateRobotPoseFromSliders) {
                        window.Robot3DViewer.updateRobotPoseFromSliders();
                    }
                    return;
                }
            }
            
            // 回退到本地逻辑
            console.log('DEBUG: Using local reset logic');
            
            // 检查必要的对象是否存在
            if (!window.Robot3DViewer.currentModel) {
                console.warn('WARN: No robot model loaded');
                return;
            }
            
            if (!window.Robot3DViewer.ROBOT_INITIAL_POSE) {
                console.warn('WARN: No initial pose defined, using fallback');
                // 提供一个回退的初始姿态
                const fallbackPose = {
                    position: { x: 0, y: 0.95, z: 0 },
                    rotation: { roll: -1.571, pitch: 0.0, yaw: -0.99 }
                };
                window.Robot3DViewer.ROBOT_INITIAL_POSE = fallbackPose;
            }
            
            const initialPose = window.Robot3DViewer.ROBOT_INITIAL_POSE;
            console.log('DEBUG: Using initial pose:', initialPose);
            
            // 重置机器人位置和旋转
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
            
            // 更新滑块值
            $('#roll-slider').val(initialPose.rotation.roll);
            $('#pitch-slider').val(initialPose.rotation.pitch);
            $('#yaw-slider').val(initialPose.rotation.yaw);
            
            // 更新显示值
            $('#roll-value').text(initialPose.rotation.roll.toFixed(2));
            $('#pitch-value').text(initialPose.rotation.pitch.toFixed(2));
            $('#yaw-value').text(initialPose.rotation.yaw.toFixed(2));
            
            // 更新显示
            if (window.Robot3DViewer.updateRobotPoseFromSliders) {
                window.Robot3DViewer.updateRobotPoseFromSliders();
            }
            
            console.log('DEBUG: Robot pose reset completed');
        });
        
        // 自动旋转复选框
        $('#auto-rotate-checkbox').off('change').on('change', function() {
            autoRotate = this.checked;
        });

        // 透明度滑动条
        $('#transparency-slider').off('input').on('input', function() {
            modelTransparency = parseFloat($(this).val());
            $('#transparency-value').text(modelTransparency.toFixed(1));
            updateModelTransparency();
        });

        // 姿态滑块绑定 input 事件
        $('#roll-slider, #pitch-slider, #yaw-slider').off('input').on('input', updateRobotPoseFromSliders);

        // 关节控制 - 添加按钮绑定
        $('#add-joint-btn').off('click').on('click', function() {
            const name = $('#joint-name-input').val().trim();
            if (!name) return;
            addJointSlider(name);
            $('#joint-name-input').val('');
        });
    }
    
    // 更新机器人姿态
    function updateRobotPoseFromSliders() {
        if (!window.Robot3DViewer.currentModel) {
            return;
        }

        // 从滑块获取弧度值
        const roll = parseFloat($('#roll-slider').val());
        const pitch = parseFloat($('#pitch-slider').val());
        const yaw = parseFloat($('#yaw-slider').val());

        // 更新模型姿态 (使用弧度)
        // 'XYZ' 是欧拉角的旋转顺序，对于 RPY 通常是这个顺序
        window.Robot3DViewer.currentModel.rotation.set(roll, pitch, yaw, 'XYZ');

        // 更新UI显示的弧度值（保持3位小数）
        $('#roll-value').text(roll.toFixed(3));
        $('#pitch-value').text(pitch.toFixed(3));
        $('#yaw-value').text(yaw.toFixed(3));
    }

    // 查找 URDF Joint 对象（名字包含）
    function findJointByName(name) {
        if (!window.Robot3DViewer || !window.Robot3DViewer.currentModel) return null;
        let found = null;
        // 首先尝试直接从 URDFLoader 的 joints 字典中查找（如果存在）
        try {
            const loader = window.Robot3DViewer.currentModel.userData && window.Robot3DViewer.currentModel.userData.urdfLoader;
            if (loader && loader.joints && loader.joints[name]) {
                return loader.joints[name];
            }
        } catch (e) {
            // ignore
        }

        // 回退到遍历对象树名称包含匹配
        window.Robot3DViewer.currentModel.traverse(obj => {
            if (found) return;
            if (obj.name && obj.name.toLowerCase().includes(name.toLowerCase())) {
                found = obj;
            }
        });
        return found;
    }

    // 设置命名关节的角度（弧度），返回是否成功
    function setJointByName(name, angle) {
        if (!window.Robot3DViewer || !window.Robot3DViewer.currentModel) return false;
        // 优先使用 URDFLoader 的 setJointValue 接口
        try {
            const loader = window.Robot3DViewer.currentModel.userData && window.Robot3DViewer.currentModel.userData.urdfLoader;
            if (loader && typeof loader.setJointValue === 'function') {
                // 直接尝试按精确名称设置
                if (loader.joints && loader.joints[name]) {
                    return loader.setJointValue(name, angle);
                }
            }
        } catch (e) {
            // ignore
        }

        // 回退到查找对象并设置 quaternion/rotation（适用于简单模型）
        const jointObj = findJointByName(name);
        if (!jointObj) return false;
        try {
            // 如果是 URDFJoint 实例（含 setJointValue），优先调用
            if (typeof jointObj.setJointValue === 'function') {
                return jointObj.setJointValue(angle);
            }
            // 否则直接设置 rotation.z (常见关节轴)
            jointObj.rotation.z = angle;
            return true;
        } catch (e) {
            console.warn('setJointByName failed for', name, e);
            return false;
        }
    }

    // 添加一个关节滑块到容器
    function addJointSlider(jointName) {
        const container = document.getElementById('joint-sliders-container');
        if (!container) return;
        // 防止重复
        if (container.querySelector(`[data-joint-name="${escapeSelector(jointName)}"]`)) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'gui-controller gui-slider-container joint-slider-item';
        wrapper.setAttribute('data-joint-name', jointName);

        const label = document.createElement('label');
        label.className = 'gui-label';
        label.textContent = jointName;

        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'gui-slider';
        input.min = -3.14159;
        input.max = 3.14159;
        input.step = 0.01;
        input.value = 0;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'gui-value';
        valueSpan.textContent = '0.0';

        // 查找 joint 初始角度
        const jointObj = findJointByName(jointName);
        if (jointObj) {
            let initial = 0;
            if (jointObj.jointValue && Array.isArray(jointObj.jointValue)) initial = jointObj.jointValue[0] || 0;
            else if (typeof jointObj.rotation !== 'undefined') initial = jointObj.rotation.z || 0;
            input.value = initial;
            valueSpan.textContent = initial.toFixed(2);
        }

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        wrapper.appendChild(valueSpan);
        container.appendChild(wrapper);

        // 节流：限制调用频率
        let last = 0;
        input.addEventListener('input', function() {
            const now = Date.now();
            const ang = parseFloat(this.value);
            valueSpan.textContent = ang.toFixed(2);
            if (now - last < 40) return; // 简单节流
            last = now;
            setJointByName(jointName, ang);
        });

        // 双击滑块移除
        wrapper.addEventListener('dblclick', function() {
            container.removeChild(wrapper);
        });
    }

    // 转义属性选择器中的字符串
    function escapeSelector(s) {
        return s.replace(/"/g, '\\"').replace(/\]/g, '\\]');
    }

    // ===== JointState 文件解析与播放引擎 =====
    let jointStateFrames = []; // 每帧: {name:[], position:[]}
    let playIndex = 0;
    let playTimer = null;
    let playRateHz = 20; // 默认 20Hz

    // 解析文本（支持由用户上传的txt，文件采用类似 sensor_msgs/JointState 的 YAML-ish 导出或多帧分隔 '---'）
    function parseJointStateText(text) {
        const frames = [];
        // 简单按 '---' 分帧
        const parts = text.split(/^---$/m);
        parts.forEach(part => {
            const trimmed = part.trim();
            if (!trimmed) return;
            try {
                // 尝试把 YAML-like 转成 JSON 结构：一个非常宽松的解析器
                // 我们只需要 name: [..] 和 position: [..]
                const namesMatch = trimmed.match(/name:\s*\n([\s\S]*?)\n(?:velocity|position|effort|$)/);
                const posMatch = trimmed.match(/position:\s*\[([^\]]*)\]/);
                let names = [];
                if (namesMatch) {
                    const block = namesMatch[1];
                    // 每行以 - 开头
                    const lines = block.split(/\n/).map(l=>l.trim()).filter(Boolean);
                    lines.forEach(l=>{
                        const m = l.match(/^-\s*(.*)$/);
                        if (m) names.push(m[1].trim());
                    });
                } else {
                    // 有些导出会是 name: [a,b,c]
                    const oneLineNames = trimmed.match(/name:\s*\[([^\]]*)\]/);
                    if (oneLineNames) {
                        names = oneLineNames[1].split(',').map(s=>s.replace(/['\"]+/g,'').trim()).filter(Boolean);
                    }
                }

                const positions = [];
                if (posMatch) {
                    positions.push(...posMatch[1].split(',').map(s=>parseFloat(s.trim())).filter(v=>!isNaN(v)));
                } else {
                    // 回退到查找 position: 后的多行数组或单行方括号
                    const posBlock = trimmed.match(/position:\s*\n([\s\S]*?)\n(?:velocity|effort|$)/);
                    if (posBlock) {
                        const lines = posBlock[1].split(/\n/).map(l=>l.trim()).filter(Boolean);
                        lines.forEach(l=>{
                            const m = l.match(/^-\s*(.*)$/);
                            if (m) {
                                const v = parseFloat(m[1]);
                                if (!isNaN(v)) positions.push(v);
                            }
                        });
                    }
                }

                if (names.length && positions.length) {
                    frames.push({name: names, position: positions});
                }
            } catch (e) {
                console.warn('Failed to parse jointstate part', e);
            }
        });
        return frames;
    }

    function playJointStateFrames(frames, rateHz) {
        if (!frames || !frames.length) return;
        stopPlay();
        jointStateFrames = frames;
        playIndex = 0;
        const interval = 1000 / (rateHz || playRateHz);
        playTimer = setInterval(()=>{
            if (playIndex >= jointStateFrames.length) { stopPlay(); return; }
            const frame = jointStateFrames[playIndex++];
            applyJointStateFrame(frame);
        }, interval);
    }

    function stopPlay() {
        if (playTimer) {
            clearInterval(playTimer);
            playTimer = null;
        }
    }

    function pausePlay() {
        stopPlay();
    }

    function applyJointStateFrame(frame) {
        if (!frame || !frame.name || !frame.position) return;
        for (let i=0;i<frame.name.length;i++) {
            const n = frame.name[i];
            const p = frame.position[i];
            if (typeof p === 'number') {
                setJointByName(n, p);
            }
        }
    }

    // 绑定文件上传与播放按钮
    function bindJointStateFileControls() {
        const input = document.getElementById('jointstate-file-input');
        const playBtn = document.getElementById('jointstate-play-btn');
        const pauseBtn = document.getElementById('jointstate-pause-btn');

        if (!input) return;
        input.addEventListener('change', function(e){
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const text = ev.target.result;
                try {
                    const frames = parseJointStateText(text);
                    window.Robot3DViewer._parsedJointStateFrames = frames; // debug
                    console.log('Parsed frames:', frames.length);
                } catch (e) {
                    console.error('Failed to parse jointstate file', e);
                }
            };
            reader.readAsText(file);
        });

        if (playBtn) playBtn.addEventListener('click', function(){
            const frames = (window.Robot3DViewer && window.Robot3DViewer._parsedJointStateFrames) || jointStateFrames;
            if (!frames || !frames.length) { console.warn('No parsed frames to play'); return; }
            playJointStateFrames(frames, playRateHz);
        });
        if (pauseBtn) pauseBtn.addEventListener('click', function(){ pausePlay(); });
    }

    // 自动绑定（如果 DOM 元素已存在）
    setTimeout(bindJointStateFileControls, 500);

    // ===== 关节坐标系显示功能 =====
    
    // 创建关节坐标系
    function createJointAxes() {
        if (!window.Robot3DViewer.currentModel || !window.Robot3DViewer.scene) return;
        
        // 移除旧的坐标系
        removeJointAxes();
        
        // 创建坐标系组
        jointAxesGroup = new THREE.Group();
        jointAxesGroup.name = 'JointAxesGroup';
        
        // 遍历机器人模型，为每个关节创建坐标系
        window.Robot3DViewer.currentModel.traverse(function(child) {
            if (child.isObject3D && child.name && (
                child.name.includes('joint') || 
                child.name.includes('Joint') ||
                child.name.includes('link') ||
                child.name.includes('Link') ||
                (child.children && child.children.length > 0)
            )) {
                createAxesHelper(child);
            }
        });
        
        window.Robot3DViewer.scene.add(jointAxesGroup);
        console.log('关节坐标系已创建');
    }
    
    // 移除关节坐标系
    function removeJointAxes() {
        if (jointAxesGroup && window.Robot3DViewer.scene) {
            window.Robot3DViewer.scene.remove(jointAxesGroup);
            // 清理几何体和材质
            jointAxesGroup.traverse(function(child) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            jointAxesGroup = null;
        }
    }
    
    // 为指定对象创建坐标系辅助器
    function createAxesHelper(object) {
        if (!object || !jointAxesGroup) return;
        
        const axesLength = 0.1; // 坐标系轴长度
        const axesGroup = new THREE.Group();
        
        // 创建X轴（红色）
        const xGeometry = new THREE.CylinderGeometry(0.002, 0.002, axesLength);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const xAxis = new THREE.Mesh(xGeometry, xMaterial);
        xAxis.rotation.z = -Math.PI / 2;
        xAxis.position.x = axesLength / 2;
        
        // X轴箭头
        const xArrowGeometry = new THREE.ConeGeometry(0.005, 0.02);
        const xArrow = new THREE.Mesh(xArrowGeometry, xMaterial);
        xArrow.rotation.z = -Math.PI / 2;
        xArrow.position.x = axesLength;
        
        // 创建Y轴（绿色）
        const yGeometry = new THREE.CylinderGeometry(0.002, 0.002, axesLength);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const yAxis = new THREE.Mesh(yGeometry, yMaterial);
        yAxis.position.y = axesLength / 2;
        
        // Y轴箭头
        const yArrowGeometry = new THREE.ConeGeometry(0.005, 0.02);
        const yArrow = new THREE.Mesh(yArrowGeometry, yMaterial);
        yArrow.position.y = axesLength;
        
        // 创建Z轴（蓝色）
        const zGeometry = new THREE.CylinderGeometry(0.002, 0.002, axesLength);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const zAxis = new THREE.Mesh(zGeometry, zMaterial);
        zAxis.rotation.x = Math.PI / 2;
        zAxis.position.z = axesLength / 2;
        
        // Z轴箭头
        const zArrowGeometry = new THREE.ConeGeometry(0.005, 0.02);
        const zArrow = new THREE.Mesh(zArrowGeometry, zMaterial);
        zArrow.rotation.x = Math.PI / 2;
        zArrow.position.z = axesLength;
        
        // 将所有轴添加到组中
        axesGroup.add(xAxis, xArrow, yAxis, yArrow, zAxis, zArrow);
        
        // 将坐标系定位到对象的世界位置
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);
        axesGroup.position.copy(worldPosition);
        
        // 复制对象的世界旋转
        const worldQuaternion = new THREE.Quaternion();
        object.getWorldQuaternion(worldQuaternion);
        axesGroup.quaternion.copy(worldQuaternion);
        
        jointAxesGroup.add(axesGroup);
    }
    
    // ===== 模型透明度控制功能 =====
    
    // 更新模型透明度
    function updateModelTransparency() {
        if (!window.Robot3DViewer.currentModel) return;
        
        window.Robot3DViewer.currentModel.traverse(function(child) {
            if (child.isMesh && child.material) {
                // 处理数组材质
                if (Array.isArray(child.material)) {
                    child.material.forEach(function(material) {
                        setMaterialTransparency(material, modelTransparency);
                    });
                } else {
                    setMaterialTransparency(child.material, modelTransparency);
                }
            }
        });
    }
    
    // 设置材质透明度
    function setMaterialTransparency(material, transparency) {
        if (!material) return;
        
        // 启用透明度
        material.transparent = transparency < 1.0;
        material.opacity = transparency;
        
        // 如果完全不透明，禁用透明度以提高性能
        if (transparency >= 1.0) {
            material.transparent = false;
        }
        
        // 标记材质需要更新
        material.needsUpdate = true;
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 监听侧边栏切换
        RED.events.on("sidebar:resize", function() {
            setTimeout(window.Robot3DViewer.onWindowResize, 100);
        });
        
        console.log("DEBUG: Event listeners setup complete");
    }
    
    // 手动实现基础鼠标控制（当OrbitControls不可用时）
    function setupBasicMouseControls(canvas) {
        let isMouseDown = false;
        let mouseButton = null;
        let previousMousePosition = { x: 0, y: 0 };
        
        canvas.addEventListener('mousedown', function(e) {
            e.preventDefault();
            isMouseDown = true;
            mouseButton = e.button;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mouseup', function(e) {
            e.preventDefault();
            isMouseDown = false;
            mouseButton = null;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('mousemove', function(e) {
            if (!isMouseDown) return;
            e.preventDefault();
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            if (mouseButton === 0) { // 左键旋转
                if (window.Robot3DViewer.currentModel) {
                    window.Robot3DViewer.currentModel.rotation.y += deltaX * 0.01;
                    window.Robot3DViewer.currentModel.rotation.x += deltaY * 0.01;
                }
            } else if (mouseButton === 2) { // 右键平移
                window.Robot3DViewer.camera.position.x -= deltaX * 0.01;
                window.Robot3DViewer.camera.position.y += deltaY * 0.01;
            }
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            window.Robot3DViewer.camera.position.multiplyScalar(delta);
        });
        
        console.log("DEBUG: Basic mouse controls setup complete");
    }
    

    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.bindControlEvents = bindControlEvents;
    window.Robot3DViewer.setupEventListeners = setupEventListeners;
    window.Robot3DViewer.setupBasicMouseControls = setupBasicMouseControls;
    window.Robot3DViewer.updateRobotPoseFromSliders = updateRobotPoseFromSliders;
    window.Robot3DViewer.setJointByName = setJointByName;
    window.Robot3DViewer.addJointSlider = addJointSlider;
    window.Robot3DViewer.createJointAxes = createJointAxes;
    window.Robot3DViewer.removeJointAxes = removeJointAxes;
    window.Robot3DViewer.updateModelTransparency = updateModelTransparency;

    Object.defineProperty(window.Robot3DViewer, 'autoRotate', {
        get: function() { return autoRotate; }
    });
    Object.defineProperty(window.Robot3DViewer, 'showJointAxes', {
        get: function() { return showJointAxes; }
    });
    Object.defineProperty(window.Robot3DViewer, 'modelTransparency', {
        get: function() { return modelTransparency; }
    });
})();