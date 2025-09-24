/**
 * Node-RED Editor API 扩展功能示例
 * 展示如何使用官方 API 创建更丰富的机器人控制功能
 */

(function() {
    "use strict";
    
    // 扩展功能模块
    window.HumanoidExtensions = {
        
        /**
         * 添加高级控制面板
         */
        addAdvancedControls: function() {
            // 使用 RED.sidebar API 添加高级控制标签页
            var advancedContent = $(`
                <div class="advanced-control-panel" style="padding: 15px;">
                    <h3><i class="fa fa-cogs"></i> 高级控制</h3>
                    
                    <!-- 运动控制区域 -->
                    <div class="motion-controls" style="margin-bottom: 20px;">
                        <h4>运动控制</h4>
                        <div class="control-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                            <button class="motion-btn" data-action="walk-forward">前进</button>
                            <button class="motion-btn" data-action="walk-backward">后退</button>
                            <button class="motion-btn" data-action="turn-left">左转</button>
                            <button class="motion-btn" data-action="turn-right">右转</button>
                        </div>
                        
                        <div style="margin-top: 10px;">
                            <label>速度控制:</label>
                            <input type="range" id="speed-slider" min="0" max="100" value="50" style="width: 100%;">
                            <span id="speed-value">50%</span>
                        </div>
                    </div>
                    
                    <!-- 姿态控制区域 -->
                    <div class="posture-controls" style="margin-bottom: 20px;">
                        <h4>姿态控制</h4>
                        <select id="posture-select" style="width: 100%; margin-bottom: 10px;">
                            <option value="stand">站立</option>
                            <option value="sit">坐下</option>
                            <option value="crouch">蹲下</option>
                            <option value="wave">挥手</option>
                        </select>
                        <button class="red-ui-button" id="execute-posture" style="width: 100%;">
                            执行姿态
                        </button>
                    </div>
                    
                    <!-- 传感器监控 -->
                    <div class="sensor-monitoring">
                        <h4>传感器监控</h4>
                        <div id="sensor-readings" style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                            <!-- 传感器数据将动态填充 -->
                        </div>
                    </div>
                </div>
            `);
            
            // 绑定事件处理器
            this.bindAdvancedControlEvents(advancedContent);
            
            // 添加到侧边栏
            RED.sidebar.addTab({
                id: "humanoid-advanced",
                label: "高级",
                name: "高级控制",
                iconClass: "fa fa-cogs",
                content: advancedContent
            });
            
            console.log("Advanced controls added");
        },
        
        /**
         * 绑定高级控制事件
         */
        bindAdvancedControlEvents: function(content) {
            var self = this;
            
            // 运动控制按钮
            content.find('.motion-btn').on('click', function() {
                var action = $(this).data('action');
                var speed = $('#speed-slider').val();
                self.executeMotionCommand(action, speed);
            });
            
            // 速度滑块
            content.find('#speed-slider').on('input', function() {
                $('#speed-value').text($(this).val() + '%');
            });
            
            // 姿态执行
            content.find('#execute-posture').on('click', function() {
                var posture = $('#posture-select').val();
                self.executePostureCommand(posture);
            });
            
            // 启动传感器监控
            this.startSensorMonitoring();
        },
        
        /**
         * 执行运动命令
         */
        executeMotionCommand: function(action, speed) {
            console.log("Executing motion:", action, "Speed:", speed);
            
            // 注册或调用对应的动作
            var actionName = "humanoid:motion-" + action.replace('-', '_');
            
            if (!RED.actions.list().includes(actionName)) {
                RED.actions.add(actionName, function() {
                    RED.notify(`🤖 执行运动: ${action} (速度: ${speed}%)`, { type: "info" });
                    
                    // 这里可以发送实际的机器人控制命令
                    // 例如通过 WebSocket 或 HTTP API
                    self.sendRobotCommand('motion', {
                        action: action,
                        speed: parseInt(speed)
                    });
                });
            }
            
            RED.actions.invoke(actionName);
        },
        
        /**
         * 执行姿态命令
         */
        executePostureCommand: function(posture) {
            console.log("Executing posture:", posture);
            
            var actionName = "humanoid:posture-" + posture;
            
            if (!RED.actions.list().includes(actionName)) {
                RED.actions.add(actionName, function() {
                    RED.notify(`🎭 执行姿态: ${posture}`, { type: "info" });
                    
                    // 发送姿态命令
                    HumanoidExtensions.sendRobotCommand('posture', {
                        posture: posture
                    });
                });
            }
            
            RED.actions.invoke(actionName);
        },
        
        /**
         * 启动传感器监控
         */
        startSensorMonitoring: function() {
            var self = this;
            
            // 模拟传感器数据更新
            setInterval(function() {
                self.updateSensorReadings();
            }, 2000);
            
            // 监听来自机器人的传感器数据事件
            RED.events.on("humanoid:sensor-data", function(data) {
                self.displaySensorData(data);
            });
        },
        
        /**
         * 更新传感器读数
         */
        updateSensorReadings: function() {
            var sensorData = {
                battery: Math.floor(Math.random() * 100),
                temperature: (Math.random() * 30 + 40).toFixed(1),
                gyroscope: {
                    x: (Math.random() * 2 - 1).toFixed(2),
                    y: (Math.random() * 2 - 1).toFixed(2),
                    z: (Math.random() * 2 - 1).toFixed(2)
                },
                accelerometer: {
                    x: (Math.random() * 20 - 10).toFixed(2),
                    y: (Math.random() * 20 - 10).toFixed(2),
                    z: (Math.random() * 20 + 10).toFixed(2)
                }
            };
            
            this.displaySensorData(sensorData);
        },
        
        /**
         * 显示传感器数据
         */
        displaySensorData: function(data) {
            var sensorElement = $('#sensor-readings');
            if (sensorElement.length > 0) {
                var html = `
                    <div style="margin-bottom: 10px;">
                        <strong>电池电量:</strong> ${data.battery}%
                        <div class="progress" style="height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${data.battery}%; height: 100%; background: ${data.battery > 20 ? '#28a745' : '#dc3545'};"></div>
                        </div>
                    </div>
                    <div><strong>温度:</strong> ${data.temperature}°C</div>
                    <div><strong>陀螺仪:</strong> X:${data.gyroscope.x} Y:${data.gyroscope.y} Z:${data.gyroscope.z}</div>
                    <div><strong>加速计:</strong> X:${data.accelerometer.x} Y:${data.accelerometer.y} Z:${data.accelerometer.z}</div>
                `;
                sensorElement.html(html);
            }
        },
        
        /**
         * 发送机器人控制命令
         */
        sendRobotCommand: function(type, data) {
            console.log("Sending robot command:", type, data);
            
            // 这里可以实现实际的通信逻辑
            // 例如：
            // - WebSocket 连接
            // - HTTP POST 请求
            // - 通过 Node-RED 流程发送消息
            
            // 模拟命令发送
            setTimeout(function() {
                RED.events.emit("humanoid:command-sent", {
                    type: type,
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }, 100);
        },
        
        /**
         * 添加工具栏工具
         */
        addToolbarTools: function() {
            var self = this;
            
            // 等待工具栏准备好
            function waitForToolbar() {
                var toolbar = $('.red-ui-header-toolbar');
                if (toolbar.length > 0) {
                    
                    // 添加机器人连接状态指示器
                    var statusIndicator = $(`
                        <div id="robot-status-indicator" 
                             style="display: inline-block; margin: 0 8px; padding: 4px 8px; border-radius: 3px; font-size: 11px; color: white; background: #6c757d;">
                            <i class="fa fa-circle" style="margin-right: 4px;"></i>
                            未连接
                        </div>
                    `);
                    
                    // 添加快速动作按钮组
                    var quickActions = $(`
                        <div class="btn-group" style="margin-left: 8px;">
                            <button class="red-ui-button quick-action" data-action="connect" title="连接机器人">
                                <i class="fa fa-plug"></i>
                            </button>
                            <button class="red-ui-button quick-action" data-action="calibrate" title="校准">
                                <i class="fa fa-crosshairs"></i>
                            </button>
                            <button class="red-ui-button quick-action" data-action="home" title="回到初始位置">
                                <i class="fa fa-home"></i>
                            </button>
                        </div>
                    `);
                    
                    // 绑定快速动作事件
                    quickActions.find('.quick-action').on('click', function() {
                        var action = $(this).data('action');
                        self.executeQuickAction(action);
                    });
                    
                    // 插入到工具栏
                    toolbar.append(statusIndicator);
                    toolbar.append(quickActions);
                    
                    console.log("Toolbar tools added");
                    
                } else {
                    setTimeout(waitForToolbar, 200);
                }
            }
            
            waitForToolbar();
        },
        
        /**
         * 执行快速动作
         */
        executeQuickAction: function(action) {
            switch(action) {
                case 'connect':
                    this.toggleRobotConnection();
                    break;
                case 'calibrate':
                    this.calibrateRobot();
                    break;
                case 'home':
                    this.returnToHome();
                    break;
            }
        },
        
        /**
         * 切换机器人连接状态
         */
        toggleRobotConnection: function() {
            var indicator = $('#robot-status-indicator');
            var isConnected = indicator.hasClass('connected');
            
            if (isConnected) {
                // 断开连接
                indicator.removeClass('connected')
                         .css('background', '#6c757d')
                         .html('<i class="fa fa-circle" style="margin-right: 4px;"></i>未连接');
                RED.notify("🔌 机器人已断开连接", { type: "warning" });
            } else {
                // 连接
                indicator.addClass('connected')
                         .css('background', '#28a745')
                         .html('<i class="fa fa-circle" style="margin-right: 4px;"></i>已连接');
                RED.notify("🤖 机器人已连接", { type: "success" });
            }
        },
        
        /**
         * 校准机器人
         */
        calibrateRobot: function() {
            RED.notify("⚙️ 开始校准机器人...", { type: "info" });
            
            // 模拟校准过程
            setTimeout(function() {
                RED.notify("✅ 机器人校准完成", { type: "success" });
            }, 3000);
        },
        
        /**
         * 回到初始位置
         */
        returnToHome: function() {
            RED.notify("🏠 机器人返回初始位置", { type: "info" });
            this.sendRobotCommand('home', {});
        },
        
        /**
         * 添加右键菜单扩展
         */
        addContextMenuExtensions: function() {
            // 监听工作区右键菜单事件
            RED.events.on("editor:open", function() {
                // 可以在这里添加自定义的右键菜单项
                // 但这需要更深入的 Node-RED 内部 API 知识
            });
        },
        
        /**
         * 添加键盘快捷键
         */
        addKeyboardShortcuts: function() {
            $(document).on('keydown', function(e) {
                // Ctrl+Shift+R: 快速连接/断开机器人
                if (e.ctrlKey && e.shiftKey && e.keyCode === 82) { // R key
                    e.preventDefault();
                    HumanoidExtensions.toggleRobotConnection();
                }
                
                // Ctrl+Shift+H: 回到初始位置
                if (e.ctrlKey && e.shiftKey && e.keyCode === 72) { // H key
                    e.preventDefault();
                    HumanoidExtensions.returnToHome();
                }
                
                // Ctrl+Shift+C: 校准
                if (e.ctrlKey && e.shiftKey && e.keyCode === 67) { // C key
                    e.preventDefault();
                    HumanoidExtensions.calibrateRobot();
                }
            });
            
            console.log("Keyboard shortcuts registered:");
            console.log("  Ctrl+Shift+R: Toggle robot connection");
            console.log("  Ctrl+Shift+H: Return to home position");
            console.log("  Ctrl+Shift+C: Calibrate robot");
        },
        
        /**
         * 初始化所有扩展功能
         */
        init: function() {
            var self = this;
            
            // 等待 RED 完全加载
            function waitForRED() {
                if (typeof RED !== 'undefined' && RED.actions && RED.sidebar && RED.events) {
                    console.log("Initializing Humanoid Extensions...");
                    
                    self.addAdvancedControls();
                    self.addToolbarTools();
                    self.addContextMenuExtensions();
                    self.addKeyboardShortcuts();
                    
                    console.log("Humanoid Extensions initialized");
                } else {
                    setTimeout(waitForRED, 100);
                }
            }
            
            waitForRED();
        }
    };
    
    // 当 DOM 准备好时自动初始化
    $(document).ready(function() {
        // 延迟初始化以确保主要功能先加载
        setTimeout(function() {
            if (window.HumanoidExtensions) {
                HumanoidExtensions.init();
            }
        }, 1000);
    });
    
})();