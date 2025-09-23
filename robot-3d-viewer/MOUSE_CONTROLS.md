# 🖱️ 鼠标控制问题修复指南

## 🎯 问题解决

我已经修复了鼠标右键被浏览器劫持的问题。现在的3D查看器支持完整的鼠标控制，不会被浏览器的上下文菜单干扰。

## 🖱️ 鼠标操作说明

### 标准操作模式 (有 OrbitControls)
- **左键拖拽**: 🔄 旋转3D模型视角
- **右键拖拽**: ↔️ 平移视角位置  
- **中键/滚轮**: 🔍 缩放视角距离
- **触屏设备**: 
  - 单指滑动: 旋转
  - 双指捏合: 缩放

### 备选操作模式 (无 OrbitControls)
- **左键拖拽**: 🔄 直接旋转模型
- **右键拖拽**: ↔️ 移动相机位置
- **滚轮**: 🔍 缩放相机距离

## 🔧 技术修复内容

### 1. 事件阻止
```javascript
// 阻止浏览器默认的右键菜单
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

// 阻止文本选择
canvas.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});
```

### 2. CSS 样式改进
```css
canvas {
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
}

canvas:active {
    cursor: grabbing;
}
```

### 3. 自定义鼠标映射
```javascript
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,   // 左键旋转
    MIDDLE: THREE.MOUSE.DOLLY,  // 中键缩放  
    RIGHT: THREE.MOUSE.PAN      // 右键平移
};
```

## 🚀 启动命令更新

按照您的要求，现在使用以下命令启动 Node-RED：

```bash
node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\
```

### 便捷启动
我创建了 `start-nodered.bat` 脚本文件，双击即可启动。

## 🧪 测试步骤

1. **启动 Node-RED**:
   ```bash
   cd d:\myCode\13-nodered-dev
   .\start-nodered.bat
   ```

2. **打开3D查看器**:
   - 访问 `http://127.0.0.1:1880/`
   - 点击右侧侧边栏的 "3D模型" 标签

3. **测试鼠标控制**:
   - ✅ 右键拖拽不会弹出浏览器菜单
   - ✅ 左键可以自由旋转模型
   - ✅ 滚轮缩放工作正常
   - ✅ 中键平移功能正常

## 🔍 故障排除

### 如果鼠标控制仍有问题

1. **检查浏览器兼容性**:
   - Chrome/Edge: 完全支持 ✅
   - Firefox: 完全支持 ✅  
   - Safari: 基本支持 ⚠️

2. **检查 Three.js 加载**:
   - 打开开发者工具 (F12)
   - 查看 Console 是否有错误
   - 确认看到 "OrbitControls configured" 消息

3. **备选方案**:
   - 如果 OrbitControls 加载失败，会自动启用基础鼠标控制
   - 基础控制同样阻止了浏览器默认行为

### 性能优化建议

- **小屏幕设备**: 自动降低渲染质量
- **触屏设备**: 优化触控响应
- **低性能设备**: 建议关闭自动旋转

## 📱 移动设备支持

- **触屏旋转**: 单指滑动旋转模型
- **触屏缩放**: 双指捏合缩放
- **触屏平移**: 双指拖拽平移
- **防误触**: 禁用了文本选择和长按菜单

---

现在您可以在3D查看器中自由使用鼠标进行各种操作，不会再被浏览器的默认行为干扰！🎉