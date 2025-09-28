# Hand 3D Viewer 快速开始指南

## 🚀 快速部署

### 1. 确认文件结构
确保 `hand-3d-viewer` 目录位于 `custom_nodes` 目录中，并且包含以下文件：

```
custom_nodes/hand-3d-viewer/
├── hand-3d-viewer.html    ✅ (已生成，50.23 KB)
├── hand-3d-viewer.js      ✅ 
├── package.json           ✅
├── config.json            ✅
└── static/                ✅ (包含 Three.js 依赖)
```

### 2. 验证手部模型文件
确保以下模型文件存在：
- `data/public/D6_LEFT_HAND/urdf/D6_LEFT_HAND.urdf`
- `data/public/D6_RIGHT_HAND/urdf/D6_RIGHT_HAND.urdf`

### 3. 重启 Node-RED
重启 Node-RED 服务以加载新的自定义节点。

### 4. 添加节点
1. 在 Node-RED 编辑器的节点面板中查找 "hand-3d-viewer"
2. 将节点拖拽到流程画布中
3. 双击节点进行配置（可选择默认手型：左手/右手）
4. 点击 "Deploy" 部署流程

### 5. 查看3D模型
部署完成后，右侧边栏会出现 "手部3D" 标签页，点击即可查看3D手部模型。

## 🎮 使用说明

### 基本操作
- **旋转视角**: 鼠标左键拖拽
- **缩放**: 鼠标滚轮
- **平移**: 鼠标中键拖拽

### 功能控制
- **手型切换**: 点击"左手"或"右手"按钮
- **姿态调整**: 使用 Roll、Pitch、Yaw 滑块
- **自动旋转**: 点击"自动旋转"按钮
- **线框模式**: 切换实体/线框显示
- **重置功能**: 重置视角或手部姿态

## 🔧 编程接口

### 在 Node-RED 函数节点中控制手部模型

```javascript
// 示例：控制手部姿态
msg.payload = {
    action: "setHandPose",
    roll: 0.5,
    pitch: -0.3,
    yaw: 1.2
};
return msg;
```

```javascript
// 示例：切换手型
msg.payload = {
    action: "switchHand",
    handType: "right"  // 或 "left"
};
return msg;
```

```javascript
// 示例：设置关节角度
msg.payload = {
    action: "setJointAngle",
    jointName: "index_Link1_L",
    angle: 0.8
};
return msg;
```

## 🛠️ 故障排除

### 问题：侧边栏中没有出现 "手部3D" 标签
**解决方案**:
1. 确认已重启 Node-RED
2. 检查浏览器控制台是否有错误
3. 验证 `hand-3d-viewer.html` 文件是否存在且完整

### 问题：3D模型无法加载
**解决方案**:
1. 检查浏览器控制台中的网络请求错误
2. 确认手部模型文件路径正确
3. 验证 Node-RED 可以访问 `data/public/` 目录

### 问题：Three.js 依赖加载失败
**解决方案**:
1. 检查 `static/` 目录中的文件是否完整
2. 验证网络连接
3. 查看浏览器控制台的详细错误信息

### 问题：控制功能不响应
**解决方案**:
1. 等待模型完全加载完成
2. 刷新浏览器页面
3. 检查是否有 JavaScript 错误

## 📝 开发和自定义

### 修改代码后重新构建
```bash
cd custom_nodes/hand-3d-viewer
npm run build
```

### 监听文件变化自动构建
```bash
npm run build:watch
```

### 自定义配置
编辑 `config.json` 文件来修改：
- 默认手型
- 相机位置
- 背景颜色
- 模型路径

## 📚 更多信息

查看完整的 README.md 文件了解详细的 API 文档和技术细节。

---

🎉 现在您可以在 Node-RED 中使用手部3D查看器了！