// Robot 3D Viewer - Annotations System
(function() {
    "use strict";
    
    // ===== 注释(关节状态)相关全局 =====
    // 保存关节注释对象: { name, jointObject, labelEl, lineEl, temperature }
    let jointAnnotations = [];
    let annotationOverlay = null; // div 容器
    let annotationSVG = null;     // svg 容器 (画线)
    // 控制标签距离的参数 - 值越大距离越远
    const LABEL_DISTANCE_FACTOR = 90;
    
    // 初始化注释 overlay (只需一次)
    function ensureAnnotationOverlay() {
        if (annotationOverlay) return;
        const container = document.getElementById('robot-3d-container');
        if (!container) return;
        annotationOverlay = document.createElement('div');
        annotationOverlay.className = 'robot-annotation-overlay';
        Object.assign(annotationOverlay.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // 允许鼠标穿透到 Three.js 画布
            overflow: 'hidden'
        });
        // SVG 用于画连线
        annotationSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        annotationSVG.setAttribute('width', '100%');
        annotationSVG.setAttribute('height', '100%');
        annotationSVG.style.position = 'absolute';
        annotationSVG.style.top = '0';
        annotationSVG.style.left = '0';
        annotationOverlay.appendChild(annotationSVG);

        container.appendChild(annotationOverlay);
    }

    // 添加一个关节注释
    function addJointAnnotation(jointName, temperature) {
        if (!window.Robot3DViewer.currentModel) {
            console.warn('addJointAnnotation: model not ready');
            return;
        }
        ensureAnnotationOverlay();
        const jointObj = findJointObject(jointName);
        if (!jointObj) {
            console.warn('Joint not found for annotation:', jointName);
            return;
        }
        // 创建标签元素
        const label = document.createElement('div');
        label.className = 'joint-annotation-label';
        label.innerHTML = `<strong>${jointName}</strong><br><span class="temp">${formatTemperature(temperature)}</span>`;
        Object.assign(label.style, {
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontSize: '11px',
            lineHeight: '14px',
            padding: '4px 6px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
            pointerEvents: 'auto', // 允许未来添加交互
            cursor: 'default'
        });

        annotationOverlay.appendChild(label);

        // 创建线条元素 (SVG line)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', '#ffcc00');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('marker-end', 'url(#arrowhead)');

        // 定义一次 marker (如果还没有)
        if (!annotationSVG.querySelector('marker#arrowhead')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '6');
            marker.setAttribute('markerHeight', '6');
            marker.setAttribute('refX', '5');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            markerPath.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
            markerPath.setAttribute('fill', '#ffcc00');
            marker.appendChild(markerPath);
            defs.appendChild(marker);
            annotationSVG.appendChild(defs);
        }

        annotationSVG.appendChild(line);

        const ann = { name: jointName, jointObject: jointObj, labelEl: label, lineEl: line, temperature };
        jointAnnotations.push(ann);
        updateAnnotations();
    }

    function updateJointTemperature(jointName, temperature) {
        const ann = jointAnnotations.find(a => a.name === jointName);
        if (!ann) return;
        ann.temperature = temperature;
        const tempEl = ann.labelEl.querySelector('.temp');
        if (tempEl) tempEl.textContent = formatTemperature(temperature);
    }

    function formatTemperature(t) {
        if (t == null || isNaN(t)) return 'N/A';
        return t.toFixed(1) + '°C';
    }

    // 遍历查找关节对象 (名称包含)
    function findJointObject(jointName) {
        let found = null;
        if (!window.Robot3DViewer.currentModel) return null;
        window.Robot3DViewer.currentModel.traverse(obj => {
            if (found) return; // 已找到
            if (obj.name && obj.name.toLowerCase().includes(jointName.toLowerCase())) {
                found = obj;
            }
        });
        return found;
    }

    // 更新所有注释的屏幕位置 & 连线
    function updateAnnotations() {
        if (!window.Robot3DViewer.camera || !window.Robot3DViewer.renderer || !annotationOverlay || jointAnnotations.length === 0) return;
        const rect = window.Robot3DViewer.renderer.domElement.getBoundingClientRect();
        const centerX = rect.width / 2;  // 容器中心点X
        const centerY = rect.height / 2; // 容器中心点Y
        
        jointAnnotations.forEach(ann => {
            if (!ann.jointObject) return;
            const worldPos = new THREE.Vector3();
            ann.jointObject.getWorldPosition(worldPos);
            // 投影到标准化设备坐标
            worldPos.project(window.Robot3DViewer.camera);
            // 转换为屏幕像素坐标
            const x = (worldPos.x * 0.5 + 0.5) * rect.width;
            const y = (-worldPos.y * 0.5 + 0.5) * rect.height;

            // 视锥裁剪(在后面或超出范围隐藏)
            const visible = worldPos.z < 1 && worldPos.z > -1 && worldPos.x >= -1 && worldPos.x <= 1 && worldPos.y >= -1 && worldPos.y <= 1;
            ann.labelEl.style.display = visible ? 'block' : 'none';
            ann.lineEl.style.display = visible ? 'block' : 'none';
            if (!visible) return;

            // 计算从容器中心到关节点的方向向量
            const dirX = x - centerX;
            const dirY = y - centerY;
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            
            // 标准化方向向量
            let normX = 0;
            let normY = 0;
            if (distance > 0) {
                normX = dirX / distance;
                normY = dirY / distance;
            } else {
                // 如果关节在中心，默认向上放置标签
                normY = -1;
            }
            
            // 计算标签位置 - 远离关节点一定距离
            const labelX = x + normX * LABEL_DISTANCE_FACTOR;
            const labelY = y + normY * LABEL_DISTANCE_FACTOR;

            ann.labelEl.style.left = labelX + 'px';
            ann.labelEl.style.top = labelY + 'px';

            // 线条从关节点连接到标签
            ann.lineEl.setAttribute('x1', x);
            ann.lineEl.setAttribute('y1', y);
            ann.lineEl.setAttribute('x2', labelX);
            ann.lineEl.setAttribute('y2', labelY);
        });
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.addJointAnnotation = addJointAnnotation;
    window.Robot3DViewer.updateJointTemperature = updateJointTemperature;
    window.Robot3DViewer.updateAnnotations = updateAnnotations;
})();
