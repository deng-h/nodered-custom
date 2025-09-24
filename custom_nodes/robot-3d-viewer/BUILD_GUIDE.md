# Robot 3D Viewer 构建系统

## 概述

这个构建系统允许您在独立的模块文件中开发代码，然后自动合并到单个 Node-RED 兼容的 HTML 文件中。

## 目录结构

```
robot-3d-viewer/
├── build.js                    # 构建脚本
├── package.json               # 包含构建命令
├── robot-3d-viewer.html       # 生成的最终文件
├── robot-3d-viewer-backup.html # 自动备份
├── templates/
│   └── node-template.html     # HTML 模板
├── css/
│   └── robot-3d-viewer.css    # CSS 样式
└── js/                        # JavaScript 模块
    ├── dependencies.js        # 依赖加载模块
    ├── annotations.js         # 关节注释系统
    ├── controls.js            # 控制和事件处理
    ├── scene.js              # 3D场景管理
    ├── sidebar.js            # 侧边栏UI组件
    └── main.js               # 主入口文件
```

## 使用方法

### 方法 1: 使用 npm 命令 (推荐)

```bash
# 一次性构建
npm run build

# 监听文件变化并自动重建
npm run dev
# 或者
npm run build:watch
```

### 方法 2: 直接使用 Node.js

```bash
# 一次性构建
node build.js

# 监听文件变化并自动重建  
node build.js --watch

# 显示帮助信息
node build.js --help
```

## 开发工作流

### 1. 编辑模块文件
在 `js/` 目录下编辑对应的模块文件，例如：
- 修改 3D 场景逻辑 → 编辑 `js/scene.js`
- 修改控制界面 → 编辑 `js/controls.js`  
- 修改样式 → 编辑 `css/robot-3d-viewer.css`

### 2. 自动构建
如果使用监听模式：
```bash
npm run dev
```
文件会在您保存时自动重新构建。

如果使用手动构建：
```bash
npm run build
```

### 3. 测试
重启 Node-RED 或刷新浏览器来测试更改：
```bash
node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\
```

## 构建脚本功能

### ✅ 自动合并
- 将所有模块文件合并到单个 HTML 文件
- 保持正确的加载顺序
- 自动添加模块注释

### ✅ 备份保护
- 自动备份现有的 HTML 文件
- 防止意外丢失代码

### ✅ 文件监听
- 监听 `js/`、`css/`、`templates/` 目录
- 文件变化时自动重新构建
- 支持热重载开发

### ✅ 错误检查
- 检查必需的模块文件
- 显示详细的构建状态
- 友好的错误提示

## 模块加载顺序

脚本会按以下顺序加载模块（很重要！）：

1. `dependencies.js` - 依赖库加载
2. `annotations.js` - 注释系统  
3. `controls.js` - 控制逻辑
4. `scene.js` - 3D场景管理
5. `sidebar.js` - 侧边栏UI
6. `main.js` - 主入口和初始化

## 示例：添加新功能

### 1. 创建新模块
```javascript
// js/new-feature.js
(function() {
    "use strict";
    
    function myNewFeature() {
        console.log("新功能!");
    }
    
    // 暴露给全局
    window.Robot3DViewer = window.Robot3DViewer || {};
    window.Robot3DViewer.myNewFeature = myNewFeature;
})();
```

### 2. 更新构建脚本
在 `build.js` 中的 `jsModules` 数组中添加新模块：
```javascript
this.jsModules = [
    'dependencies.js',
    'annotations.js', 
    'controls.js',
    'new-feature.js',  // 添加新模块
    'scene.js',
    'sidebar.js',
    'main.js'
];
```

### 3. 重新构建
```bash
npm run build
```

## 调试技巧

### 1. 检查生成的文件
构建后检查 `robot-3d-viewer.html` 确保所有代码都正确合并。

### 2. 使用浏览器开发者工具
- 在 Node-RED 中打开开发者工具
- 查看控制台错误信息
- 使用 `window.Robot3DViewer` 调试全局对象

### 3. 逐个测试模块
暂时注释掉某些模块来隔离问题。

## 常见问题

### Q: 构建后 Node-RED 报错？
A: 检查模块文件语法，确保所有模块都正确导出到 `window.Robot3DViewer`。

### Q: 修改没有生效？
A: 确保运行了构建命令，并重启了 Node-RED。

### Q: 监听模式不工作？
A: 确保文件保存在正确的目录（`js/`、`css/`、`templates/`）。

## 最佳实践

1. **使用监听模式开发** - `npm run dev`
2. **经常备份重要更改** - 构建脚本会自动备份
3. **保持模块职责单一** - 每个模块只负责特定功能
4. **遵循命名约定** - 使用 `window.Robot3DViewer` 命名空间
5. **添加详细注释** - 便于后续维护

---

🎉 现在您可以享受模块化开发，同时保持 Node-RED 兼容性！