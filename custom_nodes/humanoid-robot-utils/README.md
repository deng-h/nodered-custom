# Node-RED 机器人控制工具

这个插件使用 Node-RED 官方的 Editor API 来为人形机器人控制提供安全和监控功能。

## 功能特性

### 🛡️ 安全控制
- **紧急停止按钮**: 在工具栏中添加醒目的急停按钮
- **确认对话框**: 防止误操作的确认机制
- **状态监控**: 实时显示机器人运行状态

### 📊 监控面板
- **侧边栏控制面板**: 集成的机器人控制界面
- **事件日志**: 记录所有操作和状态变化
- **状态指示器**: 可视化的系统状态显示

### 🔧 技术特点
- 完全使用 Node-RED 官方 Editor API
- 事件驱动的架构
- 模块化设计，易于扩展

## 使用的 Node-RED Editor API

### 1. RED.actions API
```javascript
// 注册自定义动作
RED.actions.add("humanoid:emergency-stop", function() {
    // 急停逻辑
});

// 调用动作
RED.actions.invoke("humanoid:emergency-stop");
```

### 2. RED.sidebar API
```javascript
// 添加侧边栏标签页
RED.sidebar.addTab({
    id: "humanoid-control",
    label: "机器人",
    name: "机器人控制",
    iconClass: "fa fa-android",
    content: sidebarContent
});
```

### 3. RED.events API
```javascript
// 监听编辑器事件
RED.events.on("humanoid:emergency-stop", function(event) {
    // 处理急停事件
});

// 发送自定义事件
RED.events.emit("humanoid:emergency-stop", data);
```

### 4. RED.notify API
```javascript
// 显示通知
RED.notify("⚠️ 紧急停止已激活！", {
    type: "warning",
    timeout: 5000,
    fixed: true
});
```

## 扩展功能示例

### 添加新的控制按钮

```javascript
// 在 initHumanoidUtils 函数中添加
function addCustomControl() {
    // 注册新动作
    RED.actions.add("humanoid:move-forward", function() {
        console.log("Moving robot forward");
        RED.notify("🤖 机器人前进", { type: "info" });
        
        // 发送控制命令
        sendRobotCommand("move", { direction: "forward", speed: 0.5 });
    });
    
    // 在侧边栏添加按钮
    var moveBtn = $(`
        <button class="red-ui-button" style="width: 100%; margin-bottom: 5px;">
            <i class="fa fa-arrow-up"></i> 前进
        </button>
    `);
    
    moveBtn.on('click', function() {
        RED.actions.invoke("humanoid:move-forward");
    });
    
    $('.control-section').first().append(moveBtn);
}
```

### 添加传感器数据监控

```javascript
function addSensorMonitoring() {
    // 创建传感器数据显示区域
    var sensorPanel = $(`
        <div class="control-section">
            <h4>传感器数据</h4>
            <div id="sensor-data">
                <div>电池电量: <span id="battery-level">--</span>%</div>
                <div>CPU 温度: <span id="cpu-temp">--</span>°C</div>
                <div>关节角度: <span id="joint-angles">--</span></div>
            </div>
        </div>
    `);
    
    $('.humanoid-control-panel').append(sensorPanel);
    
    // 定期更新传感器数据
    setInterval(updateSensorData, 1000);
}

function updateSensorData() {
    // 模拟传感器数据更新
    $('#battery-level').text(Math.floor(Math.random() * 100));
    $('#cpu-temp').text((Math.random() * 30 + 40).toFixed(1));
    $('#joint-angles').text('正常');
}
```

### 添加键盘快捷键

```javascript
function setupKeyboardShortcuts() {
    // 为急停添加快捷键 (Ctrl+Shift+E)
    $(document).on('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.keyCode === 69) { // E key
            e.preventDefault();
            RED.actions.invoke("humanoid:emergency-stop");
        }
    });
    
    console.log("键盘快捷键已设置: Ctrl+Shift+E = 紧急停止");
}
```

### 与 Node-RED 流程集成

```javascript
function setupFlowIntegration() {
    // 监听特定类型的节点
    RED.events.on("nodes:add", function(node) {
        if (node.type === "humanoid-sensor") {
            addEventLog("添加传感器节点: " + (node.name || node.id));
            
            // 自动连接到监控系统
            connectToMonitoring(node);
        }
    });
    
    // 监听消息流
    RED.events.on("runtime-event", function(event) {
        if (event.id === "node-status" && event.data.source.type.includes("humanoid")) {
            updateNodeStatus(event.data);
        }
    });
}
```

## 最佳实践

### 1. 错误处理
```javascript
function safeApiCall(apiFunction, fallback) {
    try {
        if (typeof apiFunction === 'function') {
            return apiFunction();
        } else {
            console.warn("API function not available, using fallback");
            return fallback();
        }
    } catch (error) {
        console.error("API call failed:", error);
        return fallback();
    }
}
```

### 2. 兼容性检查
```javascript
function checkApiCompatibility() {
    var requiredAPIs = ['actions', 'sidebar', 'events', 'notify'];
    var missingAPIs = [];
    
    requiredAPIs.forEach(function(api) {
        if (!RED[api]) {
            missingAPIs.push(api);
        }
    });
    
    if (missingAPIs.length > 0) {
        console.error("Missing required APIs:", missingAPIs);
        return false;
    }
    
    return true;
}
```

### 3. 资源清理
```javascript
function cleanup() {
    // 移除事件监听器
    RED.events.removeAllListeners("humanoid:emergency-stop");
    
    // 移除动作
    RED.actions.remove("humanoid:emergency-stop");
    RED.actions.remove("humanoid:reset-system");
    
    // 移除侧边栏
    if (RED.sidebar.containsTab("humanoid-control")) {
        RED.sidebar.removeTab("humanoid-control");
    }
    
    // 移除工具栏按钮
    $('#humanoid-estop-btn').remove();
}
```

## 开发调试

### 启用调试模式
```javascript
var DEBUG = true;

function debugLog() {
    if (DEBUG) {
        console.log('[Humanoid Utils]', ...arguments);
    }
}
```

### API 状态检查
```javascript
function apiStatus() {
    return {
        RED: typeof RED !== 'undefined',
        actions: !!(RED && RED.actions),
        sidebar: !!(RED && RED.sidebar),
        events: !!(RED && RED.events),
        notify: !!(RED && RED.notify),
        jQuery: typeof $ !== 'undefined'
    };
}

// 在控制台运行: apiStatus()
```

## 许可证

Apache-2.0

## 贡献

欢迎提交 Pull Request 和 Issue！

## 更新日志

### v0.2.0
- 使用 Node-RED 官方 Editor API 重写
- 添加侧边栏控制面板
- 改进事件处理机制
- 增加状态监控功能

### v0.1.1
- 初始版本
- 基础急停按钮功能