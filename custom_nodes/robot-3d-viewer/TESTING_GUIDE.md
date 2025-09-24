# 查看Robot 3D Viewer修改效果的步骤

## 1. 确认Node-RED正在运行
- Node-RED服务器已经启动，运行在 http://127.0.0.1:1880/

## 2. 访问Node-RED界面
1. 打开浏览器访问: http://127.0.0.1:1880/
2. 等待Node-RED编辑器界面加载完成

## 3. 打开Robot 3D Viewer侧边栏
1. 在Node-RED界面右侧，找到侧边栏标签页
2. 点击 "3D模型" 标签（图标为立方体 🗃️）
3. 侧边栏将显示"机器人3D模型"面板

## 4. 查看修改效果
修改后的效果应该包括：
- ✅ **白色背景**: 3D查看器的背景应该是白色而不是黑色/灰色
- ✅ **地面**: 在机器人模型下方应该有一个半透明的浅灰色地面
- ✅ **机器人模型**: 机器人应该看起来"站"在地面上

## 5. 如果没有看到效果
请尝试以下步骤：

### 5.1 检查浏览器控制台
1. 按F12打开开发者工具
2. 切换到Console标签
3. 查看是否有JavaScript错误信息

### 5.2 强制刷新页面
1. 按Ctrl+F5强制刷新页面
2. 或者按Ctrl+Shift+R清除缓存并刷新

### 5.3 检查依赖库加载
在控制台中输入以下命令检查Three.js是否加载：
```javascript
console.log(window.THREE);
```
应该显示Three.js对象而不是undefined

### 5.4 检查3D容器
在控制台中输入：
```javascript
console.log(document.getElementById('robot-3d-container'));
```
应该显示3D容器DOM元素

## 6. 调试信息
如果需要查看更多调试信息，可以在控制台中运行：
```javascript
// 查看Robot3DViewer对象
console.log(window.Robot3DViewer);

// 查看当前模型
console.log(window.Robot3DViewer.currentModel);

// 查看场景对象
console.log(window.Robot3DViewer.scene);
```

## 7. 预期的控制台输出
正常情况下，控制台应该显示类似以下的调试信息：
```
DEBUG: Starting Robot 3D Viewer initialization
DEBUG: Three.js 加载成功
DEBUG: All 3D dependencies (OrbitControls, ColladaLoader, URDFLoader) loaded successfully.
DEBUG: Three.js scene initialized with custom mouse controls
DEBUG: Starting to load URDF from: /H1_Pro1/urdf/H1_Pro1.urdf
DEBUG: Robot model loaded successfully
```

## 修改说明
- 背景颜色从 `0x222222` (深灰色) 改为 `0xffffff` (白色)
- 在setupLighting函数中添加了10x10单位的地面平面
- 地面材质为半透明浅灰色，可以接收阴影