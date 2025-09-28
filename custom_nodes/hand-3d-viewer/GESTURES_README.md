# 手部3D查看器 - 石头剪刀布手势功能

## 功能概述

这个Node-RED自定义节点提供了一个3D手部模型查看器，支持石头剪刀布手势控制。可以通过编程方式或用户界面来控制手部做出各种手势。

## 新增功能

### 🎮 手势控制

- **石头** (✊): 握拳手势，所有手指弯曲
- **布** (✋): 张开手掌，所有手指伸直
- **剪刀** (✌️): 食指和中指伸出，其他手指弯曲
- **自然姿态** (🖐️): 手指自然放松的姿态

### 🎯 高级功能

- **随机手势**: 随机选择一个手势
- **手势演示**: 循环展示所有手势
- **动画过渡**: 手势切换时的流畅动画效果
- **双手支持**: 支持左手和右手模型

## 使用方法

### 1. 在Node-RED中使用

1. 将 `hand-3d-viewer` 节点拖拽到流程中
2. 双击节点进行配置
3. 部署流程后，3D查看器会出现在右侧边栏
4. 使用侧边栏中的手势控制按钮

### 2. 编程方式控制

```javascript
// 应用石头手势
window.Hand3DViewer.Gestures.applyGesture('rock');

// 应用布手势
window.Hand3DViewer.Gestures.applyGesture('paper'); 

// 应用剪刀手势
window.Hand3DViewer.Gestures.applyGesture('scissors');

// 重置到自然姿态
window.Hand3DViewer.Gestures.resetToNaturalPose();

// 随机手势
window.Hand3DViewer.Gestures.randomGesture();

// 演示所有手势
window.Hand3DViewer.Gestures.demonstrateGestures();
```

### 3. 关节控制API

```javascript
// 获取关节信息
const joints = window.Hand3DViewer.currentModel.joints;

// 获取可用关节列表
console.log(Object.keys(joints));

// 设置单个关节角度
window.Hand3DViewer.setJointAngle('index_MCP_L', 1.2);

// 获取单个关节角度
const angle = window.Hand3DViewer.getJointAngle('index_MCP_L');

// 批量设置关节角度
window.Hand3DViewer.setJointAngles({
    'index_MCP_L': 1.2,
    'middle_MCP_L': 1.0,
    'ring_MCP_L': 0.8
});
```

## 关节结构

### 左手关节 (_L后缀)
- **拇指**: `thumb_CMC_L`, `thumb_MP_L`, `thumb_IP_L`
- **食指**: `index_MCP_L`, `index_PIP_L`, `index_DIP_L`  
- **中指**: `middle_MCP_L`, `middle_PIP_L`, `middle_DIP_L`
- **无名指**: `ring_MCP_L`, `ring_PIP_L`, `ring_DIP_L`
- **小指**: `little_MCP_L`, `little_PIP_L`, `little_DIP_L`

### 右手关节 (_R后缀)
- **拇指**: `thumb_CMC_R`, `thumb_MP_R`, `thumb_IP_R`
- **食指**: `index_MCP_R`, `index_PIP_R`, `index_DIP_R`
- **中指**: `middle_MCP_R`, `middle_PIP_R`, `middle_DIP_R`
- **无名指**: `ring_MCP_R`, `ring_PIP_R`, `ring_DIP_R`
- **小指**: `little_MCP_R`, `little_PIP_R`, `little_DIP_R`

## 关节类型说明

- **MCP**: 掌指关节 (Metacarpophalangeal)
- **PIP**: 近端指间关节 (Proximal Interphalangeal) 
- **DIP**: 远端指间关节 (Distal Interphalangeal)
- **CMC**: 腕掌关节 (Carpometacarpal) - 仅拇指
- **MP**: 掌指关节 (Metacarpophalangeal) - 拇指专用
- **IP**: 指间关节 (Interphalangeal) - 拇指专用

## 测试功能

打开 `test-gestures.html` 文件可以测试所有手势功能：

1. 在浏览器中打开 `custom_nodes/hand-3d-viewer/test-gestures.html`
2. 确保Node-RED正在运行且手部3D查看器已启动
3. 使用测试页面中的按钮来验证各项功能

## 自定义手势

可以通过修改 `js/gestures.js` 文件来添加自定义手势：

```javascript
const CUSTOM_GESTURE = {
    name: "自定义手势",
    icon: "👋",
    description: "自定义手势描述",
    joints: {
        // 定义各关节的角度值
        thumb_CMC_L: 0.5,
        index_MCP_L: 1.0,
        // ... 其他关节
    }
};
```

## 技术特性

- ✅ 流畅的动画过渡效果
- ✅ 支持左右手模型切换
- ✅ 实时手势预览和反馈
- ✅ 关节角度限制和验证
- ✅ 兼容现有的手部控制API
- ✅ 模块化代码结构，易于扩展

## 兼容性

- Node-RED 1.0+
- 现代浏览器 (Chrome, Firefox, Safari, Edge)
- Three.js r128+
- 支持WebGL的设备

## 故障排除

### 手势不工作
1. 检查浏览器控制台是否有错误信息
2. 确保手部模型已完全加载
3. 验证Three.js和URDF loader是否正确加载

### 关节控制无响应
1. 检查关节名称是否正确（注意左右手后缀）
2. 确保角度值在关节限制范围内
3. 检查URDF loader是否正确初始化

### 动画卡顿
1. 降低动画持续时间
2. 检查浏览器性能和WebGL支持
3. 减少同时控制的关节数量

## 开发者信息

- 版本: 1.1.0
- 更新日期: 2024年12月
- 作者: AI Assistant
- 许可证: MIT

## 更新日志

### v1.1.0 (2024-12-28)
- ✨ 新增石头剪刀布手势功能
- ✨ 添加手势动画过渡效果
- ✨ 支持双手模型手势控制
- ✨ 新增手势演示和随机手势功能
- 🎨 改进用户界面和交互体验
- 📝 完善API文档和示例代码