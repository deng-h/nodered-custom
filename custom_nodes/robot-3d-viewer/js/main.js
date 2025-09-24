// Robot 3D Viewer - Main Entry Point
// 测试自动构建功能
(function() {
    "use strict";
    
    // 等待 RED 对象完全加载
    function waitForRED(callback) {
        if (typeof RED !== 'undefined' && RED.actions && RED.sidebar && RED.events) {
            callback();
        } else {
            setTimeout(function() { waitForRED(callback); }, 100);
        }
    }
    
    // 主初始化函数
    function mainInit() {
        console.log("DEBUG: Starting Robot 3D Viewer initialization");
        
        window.Robot3DViewer.addRobot3DSidebar();
        window.Robot3DViewer.setupEventListeners();
        
        window.Robot3DViewer.loadDependencies(function() {
            // 所有脚本加载成功后的回调
            // 只有当侧边栏可见时才初始化场景
            if ($('#robot-3d-container').is(':visible')) {
                window.Robot3DViewer.initThreeJSScene();
            }
        });
    }
    
    // 启动逻辑
    waitForRED(mainInit);
    
    // Node-RED 节点注册
    RED.nodes.registerType('robot-3d-viewer', {
        category: 'config',
        color: '#a6bbcf',
        defaults: {
            name: {value: ""}
        },
        inputs: 0,
        outputs: 0,
        icon: "font-awesome/fa-cube",
        label: function() {
            return this.name || "robot 3d viewer";
        }
    });

    // 暴露简易全局 API (可在浏览器控制台或其他脚本中调用)
    window.Robot3DViewerAPI = {
        addJointAnnotation: function(name, temp){ 
            window.Robot3DViewer.addJointAnnotation(name, temp); 
        },
        updateJointTemperature: function(name, temp){ 
            window.Robot3DViewer.updateJointTemperature(name, temp); 
        },
        _debugListJoints: function(){
            if(!window.Robot3DViewer.currentModel){ 
                console.warn('Model not ready'); 
                return; 
            }
            const list = [];
            window.Robot3DViewer.currentModel.traverse(o=>{ 
                if(o.name) list.push(o.name); 
            });
            console.log('Joints / Object names:', list);
            return list;
        }
    };
})();