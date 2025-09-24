# Robot 3D Viewer - 重构说明

## 重构概述

原来的 `robot-3d-viewer.html` 文件包含了超过500行的代码，包括HTML模板、CSS样式和JavaScript逻辑。为了提高代码的可维护性和可读性，我们将其重构为模块化结构。

## 新的文件结构

```
robot-3d-viewer/
├── robot-3d-viewer.html          # 主HTML文件（重构后）
├── robot-3d-viewer-backup.html   # 原文件备份
├── robot-3d-viewer-new.html      # 临时文件（可删除）
├── templates/                     # HTML模板文件
│   └── node-template.html
├── css/                          # 样式文件
│   └── robot-3d-viewer.css
└── js/                          # JavaScript模块
    ├── main.js                  # 主入口文件
    ├── dependencies.js          # 依赖库加载模块
    ├── annotations.js           # 关节注释系统
    ├── controls.js              # 控制和事件处理
    ├── scene.js                 # 3D场景管理
    └── sidebar.js               # 侧边栏UI组件
```

## 模块说明

### 1. 主HTML文件 (`robot-3d-viewer.html`)
- 包含Node-RED节点模板
- 内嵌所有CSS样式
- 内嵌所有JavaScript模块（确保Node-RED兼容性）

### 2. JavaScript模块

#### `dependencies.js` - 依赖库加载
- 负责加载Three.js及相关依赖库
- CDN回退机制
- 依赖状态管理

#### `annotations.js` - 关节注释系统
- 3D空间到屏幕坐标的投影
- 关节温度显示
- SVG连线绘制

#### `controls.js` - 控制和事件处理
- 相机控制按钮
- 自动旋转和线框模式
- 姿态滑杆控制
- 鼠标交互处理

#### `scene.js` - 3D场景管理
- Three.js场景初始化
- 机器人模型加载
- 光源设置
- 动画循环

#### `sidebar.js` - 侧边栏UI
- 侧边栏内容生成
- Node-RED侧边栏集成

#### `main.js` - 主入口
- 模块初始化协调
- Node-RED节点注册
- 全局API暴露

## 全局命名空间

所有模块都挂载在 `window.Robot3DViewer` 命名空间下，避免全局变量污染：

```javascript
window.Robot3DViewer = {
    // 依赖管理
    loadDependencies: function,
    dependenciesLoaded: boolean,
    isThreeJSLoaded: function,
    
    // 场景管理
    initThreeJSScene: function,
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.Renderer,
    currentModel: THREE.Object3D,
    
    // 控制系统
    bindControlEvents: function,
    setupEventListeners: function,
    updateRobotPoseFromSliders: function,
    
    // 注释系统
    addJointAnnotation: function,
    updateJointTemperature: function,
    updateAnnotations: function,
    
    // UI组件
    addRobot3DSidebar: function,
    onWindowResize: function
};
```

## 外部API

为方便调试和扩展，提供了简化的全局API：

```javascript
window.Robot3DViewerAPI = {
    addJointAnnotation: function(name, temperature),
    updateJointTemperature: function(name, temperature),
    _debugListJoints: function()  // 调试用：列出所有关节名称
};
```

## 使用方法

### 在Node-RED中使用
1. 确保Node-RED正在运行
2. 在调色板中找到"robot 3d viewer"节点
3. 拖拽到工作区进行配置

### 启动命令
```bash
node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\
```

### 在浏览器控制台中调试
```javascript
// 列出所有关节名称
Robot3DViewerAPI._debugListJoints()

// 添加关节温度注释
Robot3DViewerAPI.addJointAnnotation('HAND_L', 45.6)

// 更新关节温度
Robot3DViewerAPI.updateJointTemperature('HAND_L', 48.2)
```

## 重构优势

1. **代码组织**: 每个模块职责单一，易于理解和维护
2. **可测试性**: 模块化设计便于单元测试
3. **可扩展性**: 新功能可以作为独立模块添加
4. **调试友好**: 清晰的命名空间和API
5. **Node-RED兼容**: 保持与Node-RED自定义节点规范的完全兼容

## 注意事项

1. 由于Node-RED的限制，所有JavaScript代码仍然内嵌在HTML文件中
2. 原始文件已备份为 `robot-3d-viewer-backup.html`
3. `js/` 和 `css/` 目录中的文件主要用于开发和维护，实际运行时使用HTML文件中的内嵌代码
4. 如需修改代码，建议先修改对应的模块文件，然后更新HTML文件中的对应部分

## 未来改进建议

1. 考虑使用构建工具自动合并模块到HTML文件
2. 添加TypeScript支持提高代码质量
3. 增加单元测试覆盖
4. 考虑使用Web Components进一步模块化UI组件