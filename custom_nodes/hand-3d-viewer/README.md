# Hand 3D Viewer

一个用于在 Node-RED 中显示3D手部模型的插件，基于 Three.js 和 URDF 加载器构建。支持石头剪刀布手势控制！

## 功能特性

- **3D手部模型显示**: 支持加载和显示左手、右手的 URDF 模型
- **🎮 石头剪刀布手势**: 支持石头、布、剪刀手势以及自然姿态
- **🎯 高级手势功能**: 随机手势、手势演示、流畅动画过渡
- **交互式视角控制**: 鼠标旋转、缩放和平移
- **手型切换**: 轻松在左手和右手模型间切换
- **姿态控制**: 实时调整手部的 Roll、Pitch、Yaw 角度
- **关节精确控制**: 可控制每个手指的各个关节
- **视觉效果**: 高质量渲染、阴影、专业光照
- **控制选项**: 自动旋转、线框模式、重置功能
- **响应式设计**: 适配不同尺寸的侧边栏

## 支持的模型

- **D6_LEFT_HAND**: 左手机械手模型
- **D6_RIGHT_HAND**: 右手机械手模型

模型文件位置：
- `data/public/D6_LEFT_HAND/urdf/D6_LEFT_HAND.urdf`
- `data/public/D6_RIGHT_HAND/urdf/D6_RIGHT_HAND.urdf`

## 安装和使用

1. 将此目录放置在 Node-RED 的 `custom_nodes` 文件夹中
2. 运行构建命令：`npm run build`
3. 重启 Node-RED
4. 在流程编辑器中添加 "hand-3d-viewer" 节点
5. 部署流程，3D查看器将出现在右侧边栏

## 构建

```bash
# 一次性构建
npm run build

# 监听文件变化自动构建
npm run build:watch
```

## API

### 全局对象：window.Hand3DViewer

#### 🎮 手势控制 API

```javascript
// 应用石头剪刀布手势
Hand3DViewer.Gestures.applyGesture('rock');      // 石头 ✊
Hand3DViewer.Gestures.applyGesture('paper');     // 布 ✋
Hand3DViewer.Gestures.applyGesture('scissors');  // 剪刀 ✌️

// 重置到自然姿态
Hand3DViewer.Gestures.resetToNaturalPose();      // 自然姿态 🖐️

// 高级手势功能
Hand3DViewer.Gestures.randomGesture();           // 随机手势 🎲
Hand3DViewer.Gestures.demonstrateGestures();     // 演示所有手势 🎭

// 获取可用手势列表
const gestures = Hand3DViewer.Gestures.getAvailableGestures();
```

#### 🔧 关节控制 API

```javascript
// 切换手型
Hand3DViewer.switchHand('left');   // 或 'right'

// 设置关节角度
Hand3DViewer.setJointAngle('joint_name', angle);

// 获取关节角度
const angle = Hand3DViewer.getJointAngle('joint_name');

// 批量设置关节角度
Hand3DViewer.setJointAngles({
    'index_MCP_L': 1.2,
    'middle_MCP_L': 1.0
});

// 获取所有关节信息
const joints = Hand3DViewer.getJointInfo();

// 通过模型直接访问关节
const modelJoints = Hand3DViewer.currentModel.joints;

// 重置所有关节
Hand3DViewer.resetAllJoints();

// 控制功能
Hand3DViewer.toggleAutoRotate();
Hand3DViewer.toggleWireframe();
Hand3DViewer.resetCamera();
Hand3DViewer.resetHandPose();
```

## 文件结构

```
hand-3d-viewer/
├── package.json              # NPM 包配置
├── config.json              # 查看器配置
├── build.js                 # 构建脚本
├── hand-3d-viewer.js        # Node-RED 节点定义
├── hand-3d-viewer.html      # 生成的最终文件
├── templates/
│   └── node-template.html   # HTML 模板
├── js/                      # JavaScript 模块
│   ├── dependencies.js      # 依赖管理
│   ├── environment.js       # 环境增强
│   ├── controls.js          # 控制逻辑
│   ├── scene.js            # 3D 场景管理
│   ├── sidebar.js          # 侧边栏 UI
│   ├── gestures.js         # 手势控制 🎮
│   └── main.js             # 主入口
├── examples/               # 示例代码
│   └── gesture-examples.js # 手势控制示例
├── css/
│   └── hand-3d-viewer.css  # 样式表
└── static/                 # 静态依赖
    ├── three.min.js        # Three.js 库
    ├── OrbitControls.js    # 轨道控制器
    ├── URDFLoader.js       # URDF 加载器
    └── ColladaLoader.js    # Collada 加载器
```

## 技术栈

- **Three.js**: 3D 图形渲染
- **URDF Loader**: 机器人模型加载
- **Node-RED**: 流程编程平台
- **JavaScript ES6+**: 现代 JavaScript
- **CSS3**: 现代样式和动画

## 开发

### 模块化设计

代码采用模块化设计，每个功能独立成模块：

- `dependencies.js`: 处理 Three.js 等外部库的加载
- `environment.js`: 场景背景、光照、渲染质量设置
- `controls.js`: 用户交互控制和事件处理
- `scene.js`: 3D 场景管理和 URDF 模型加载
- `sidebar.js`: Node-RED 侧边栏 UI 创建和管理
- `gestures.js`: 石头剪刀布手势控制和动画 🎮
- `main.js`: 主入口和全局 API 暴露

### 🎮 手势功能

支持的手势：
- **石头** (✊): 握拳状态，所有手指弯曲
- **布** (✋): 手掌张开，所有手指伸直
- **剪刀** (✌️): 食指和中指伸出，其他手指弯曲
- **自然姿态** (🖐️): 手指自然放松的状态

特性：
- 🎯 流畅的动画过渡效果
- 🔄 支持左右手模型
- 🎲 随机手势生成
- 🎭 所有手势演示模式
- 📱 直观的用户界面控制
- 🔧 完整的编程API接口

测试：
- 打开 `test-gestures.html` 进行功能测试
- 运行 `examples/gesture-examples.js` 中的示例代码
- 查看 `GESTURES_README.md` 获取详细文档

### 自定义配置

可以通过修改 `config.json` 来自定义：

- 默认手型（左手或右手）
- 相机初始位置
- 背景颜色
- 模型路径配置
- 功能开关

## 兼容性

- Node-RED 1.0+
- 现代浏览器（Chrome 60+, Firefox 55+, Safari 11+）
- WebGL 支持必需

## 许可证

Apache-2.0

## 贡献

欢迎提交 Issue 和 Pull Request！