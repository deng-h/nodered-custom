/**
 * Node-RED 机器人控制节点示例
 * 展示如何创建与 Editor API 集成的自定义节点
 */

module.exports = function(RED) {
    "use strict";

    // 机器人运动控制节点
    function HumanoidMotionNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.action = config.action;
        node.speed = config.speed || 50;
        
        node.on('input', function(msg) {
            // 获取动作和速度
            var action = msg.payload.action || node.action;
            var speed = msg.payload.speed || node.speed;
            
            // 更新节点状态
            node.status({fill: "blue", shape: "dot", text: `执行: ${action}`});
            
            // 发送到编辑器事件系统
            RED.events.emit("humanoid:motion-command", {
                nodeId: node.id,
                action: action,
                speed: speed,
                timestamp: new Date()
            });
            
            // 模拟执行时间
            setTimeout(function() {
                node.status({fill: "green", shape: "dot", text: "完成"});
                
                // 输出结果
                msg.payload = {
                    action: action,
                    speed: speed,
                    status: "completed",
                    timestamp: new Date()
                };
                node.send(msg);
                
                // 清除状态
                setTimeout(function() {
                    node.status({});
                }, 2000);
                
            }, 1000);
        });
        
        // 监听急停事件
        RED.events.on("humanoid:emergency-stop", function(event) {
            node.status({fill: "red", shape: "ring", text: "急停"});
            node.error("收到急停信号，运动已停止");
        });
    }
    
    // 机器人传感器节点
    function HumanoidSensorNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.sensorType = config.sensorType;
        node.interval = config.interval || 1000;
        
        var intervalId;
        
        // 启动传感器读取
        function startSensorReading() {
            intervalId = setInterval(function() {
                var sensorData = generateSensorData(node.sensorType);
                
                // 更新节点状态
                node.status({
                    fill: "green", 
                    shape: "dot", 
                    text: `${node.sensorType}: ${JSON.stringify(sensorData).substring(0, 20)}...`
                });
                
                // 发送数据到编辑器
                RED.events.emit("humanoid:sensor-data", {
                    nodeId: node.id,
                    type: node.sensorType,
                    data: sensorData,
                    timestamp: new Date()
                });
                
                // 输出传感器数据
                var msg = {
                    payload: sensorData,
                    topic: node.sensorType,
                    timestamp: new Date()
                };
                node.send(msg);
                
            }, node.interval);
        }
        
        // 生成模拟传感器数据
        function generateSensorData(type) {
            switch(type) {
                case 'battery':
                    return { level: Math.floor(Math.random() * 100), voltage: (Math.random() * 2 + 11).toFixed(2) };
                case 'gyroscope':
                    return { 
                        x: (Math.random() * 4 - 2).toFixed(3),
                        y: (Math.random() * 4 - 2).toFixed(3),
                        z: (Math.random() * 4 - 2).toFixed(3)
                    };
                case 'accelerometer':
                    return {
                        x: (Math.random() * 20 - 10).toFixed(3),
                        y: (Math.random() * 20 - 10).toFixed(3),
                        z: (Math.random() * 20 + 10).toFixed(3)
                    };
                case 'temperature':
                    return { cpu: (Math.random() * 30 + 40).toFixed(1), ambient: (Math.random() * 10 + 20).toFixed(1) };
                default:
                    return { value: Math.random() };
            }
        }
        
        // 启动
        startSensorReading();
        
        // 清理
        node.on('close', function() {
            if (intervalId) {
                clearInterval(intervalId);
            }
        });
    }
    
    // 机器人安全节点
    function HumanoidSafetyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.safetyType = config.safetyType;
        node.threshold = config.threshold || 50;
        
        // 监听传感器数据进行安全检查
        RED.events.on("humanoid:sensor-data", function(event) {
            if (node.safetyType === 'fall-detection' && event.type === 'gyroscope') {
                checkFallDetection(event.data);
            } else if (node.safetyType === 'battery-monitor' && event.type === 'battery') {
                checkBatteryLevel(event.data);
            } else if (node.safetyType === 'temperature-monitor' && event.type === 'temperature') {
                checkTemperature(event.data);
            }
        });
        
        function checkFallDetection(gyroData) {
            var magnitude = Math.sqrt(
                Math.pow(gyroData.x, 2) + 
                Math.pow(gyroData.y, 2) + 
                Math.pow(gyroData.z, 2)
            );
            
            if (magnitude > node.threshold) {
                node.status({fill: "red", shape: "ring", text: "检测到跌倒"});
                
                // 触发急停
                RED.events.emit("humanoid:emergency-stop", {
                    source: "fall-detection",
                    nodeId: node.id,
                    magnitude: magnitude,
                    threshold: node.threshold
                });
                
                // 发送警报消息
                var msg = {
                    payload: {
                        alert: "fall_detected",
                        magnitude: magnitude,
                        threshold: node.threshold,
                        timestamp: new Date()
                    },
                    topic: "safety/fall"
                };
                node.send(msg);
            }
        }
        
        function checkBatteryLevel(batteryData) {
            if (batteryData.level < node.threshold) {
                node.status({fill: "yellow", shape: "ring", text: `电量低: ${batteryData.level}%`});
                
                var msg = {
                    payload: {
                        alert: "low_battery",
                        level: batteryData.level,
                        threshold: node.threshold,
                        timestamp: new Date()
                    },
                    topic: "safety/battery"
                };
                node.send(msg);
            } else {
                node.status({fill: "green", shape: "dot", text: `电量: ${batteryData.level}%`});
            }
        }
        
        function checkTemperature(tempData) {
            if (tempData.cpu > node.threshold) {
                node.status({fill: "red", shape: "ring", text: `温度过高: ${tempData.cpu}°C`});
                
                var msg = {
                    payload: {
                        alert: "high_temperature",
                        temperature: tempData.cpu,
                        threshold: node.threshold,
                        timestamp: new Date()
                    },
                    topic: "safety/temperature"
                };
                node.send(msg);
            } else {
                node.status({fill: "green", shape: "dot", text: `温度: ${tempData.cpu}°C`});
            }
        }
    }
    
    // 注册节点类型
    RED.nodes.registerType("humanoid-motion", HumanoidMotionNode);
    RED.nodes.registerType("humanoid-sensor", HumanoidSensorNode);
    RED.nodes.registerType("humanoid-safety", HumanoidSafetyNode);
    
    // 注册 HTTP API 端点
    RED.httpAdmin.post("/humanoid/emergency-stop", function(req, res) {
        // 触发急停事件
        RED.events.emit("humanoid:emergency-stop", {
            source: "http-api",
            timestamp: new Date(),
            clientIP: req.ip
        });
        
        res.json({ status: "success", message: "Emergency stop activated" });
    });
    
    RED.httpAdmin.get("/humanoid/status", function(req, res) {
        // 返回机器人状态
        res.json({
            status: "operational",
            timestamp: new Date(),
            sensors: {
                battery: 85,
                temperature: 45.2,
                gyroscope: { x: 0.1, y: -0.2, z: 0.05 }
            }
        });
    });
    
    // 在编辑器中添加自定义脚本
    RED.httpAdmin.get("/humanoid/editor-integration.js", function(req, res) {
        res.set('Content-Type', 'application/javascript');
        res.send(`
            // 编辑器集成脚本
            (function() {
                console.log("Humanoid robot editor integration loaded");
                
                // 监听来自节点的事件
                RED.comms.subscribe("humanoid/#", function(topic, msg) {
                    console.log("Received humanoid event:", topic, msg);
                    
                    // 更新 UI 显示
                    if (topic === "humanoid/sensor-data") {
                        updateSensorDisplay(msg);
                    } else if (topic === "humanoid/motion-command") {
                        updateMotionStatus(msg);
                    }
                });
                
                function updateSensorDisplay(data) {
                    // 更新传感器显示面板
                    if (window.HumanoidExtensions) {
                        HumanoidExtensions.displaySensorData(data);
                    }
                }
                
                function updateMotionStatus(data) {
                    // 更新运动状态显示
                    console.log("Motion command:", data);
                }
            })();
        `);
    });
};

// 导出示例流程配置
module.exports.exampleFlow = [
    {
        "id": "humanoid-demo-flow",
        "type": "tab",
        "label": "机器人控制演示",
        "disabled": false,
        "info": "演示机器人控制节点的使用"
    },
    {
        "id": "inject-motion",
        "type": "inject",
        "name": "发送运动命令",
        "props": [
            {
                "p": "payload.action",
                "v": "walk-forward",
                "vt": "str"
            },
            {
                "p": "payload.speed",
                "v": "70",
                "vt": "num"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 140,
        "y": 100,
        "z": "humanoid-demo-flow",
        "wires": [["motion-control"]]
    },
    {
        "id": "motion-control",
        "type": "humanoid-motion",
        "name": "运动控制",
        "action": "walk-forward",
        "speed": 50,
        "x": 340,
        "y": 100,
        "z": "humanoid-demo-flow",
        "wires": [["motion-debug"]]
    },
    {
        "id": "motion-debug",
        "type": "debug",
        "name": "运动结果",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 540,
        "y": 100,
        "z": "humanoid-demo-flow",
        "wires": []
    },
    {
        "id": "battery-sensor",
        "type": "humanoid-sensor",
        "name": "电池传感器",
        "sensorType": "battery",
        "interval": 2000,
        "x": 140,
        "y": 200,
        "z": "humanoid-demo-flow",
        "wires": [["battery-safety"]]
    },
    {
        "id": "battery-safety",
        "type": "humanoid-safety",
        "name": "电池监控",
        "safetyType": "battery-monitor",
        "threshold": 20,
        "x": 340,
        "y": 200,
        "z": "humanoid-demo-flow",
        "wires": [["safety-debug"]]
    },
    {
        "id": "safety-debug",
        "type": "debug",
        "name": "安全警报",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 540,
        "y": 200,
        "z": "humanoid-demo-flow",
        "wires": []
    }
];