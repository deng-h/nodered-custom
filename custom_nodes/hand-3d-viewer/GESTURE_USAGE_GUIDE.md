# 手部3D查看器手势功能使用指南

## 功能概述
在Node-RED环境中为手部3D查看器添加了石头剪刀布手势功能。系统支持左手和右手模型，通过界面控制按钮或JavaScript API来控制手势。

## 使用步骤

### 1. 访问Node-RED界面
打开浏览器访问：http://127.0.0.1:1880/

### 2. 导入测试流程
1. 点击右上角的菜单按钮（三条线）
2. 选择"导入"(Import)
3. 点击"选择文件"按钮
4. 选择 `test-gesture-flow.json` 文件
5. 点击"导入"

### 3. 部署流程
1. 点击右上角的"部署"(Deploy)按钮
2. 等待部署完成

### 4. 使用手势功能

#### 通过界面控制：
1. 双击"手部3D查看器"节点打开配置
2. 在右侧边栏中找到"手势控制"面板
3. 点击相应按钮：
   - 石头 (Rock)
   - 剪刀 (Scissors)  
   - 布 (Paper)
   - 重置 (Reset)

#### 通过编程控制：
在浏览器控制台中使用以下命令：

```javascript
// 应用石头手势到左手
window.Hand3DViewer.Gestures.applyGesture('rock', 'left');

// 应用剪刀手势到右手
window.Hand3DViewer.Gestures.applyGesture('scissors', 'right');

// 应用布手势（默认左手）
window.Hand3DViewer.Gestures.applyGesture('paper');

// 重置所有手势
window.Hand3DViewer.Gestures.resetGestures();
```

### 5. 可用手势

#### 石头 (Rock)
- 所有手指关节弯曲
- 形成紧握的拳头状态

#### 剪刀 (Scissors)  
- 食指和中指伸直
- 其他手指弯曲

#### 布 (Paper)
- 所有手指伸直
- 手掌完全张开状态

## 技术细节

### 关节数据访问
手势功能通过以下路径访问关节数据：
```javascript
window.Hand3DViewer.currentModel.joints
```

### 支持的手部模型
- D6_LEFT_HAND（左手）
- D6_RIGHT_HAND（右手）

### 动画特性
- 平滑过渡动画（1秒持续时间）
- 支持左右手独立控制
- 实时更新3D显示

## 故障排除

### 如果手势按钮不显示：
1. 确保已正确部署流程
2. 刷新浏览器页面
3. 检查浏览器控制台是否有错误信息

### 如果手势不工作：
1. 确保手部模型已正确加载
2. 检查 `window.Hand3DViewer` 对象是否存在
3. 验证关节数据是否可用

### 调试命令：
```javascript
// 检查Hand3DViewer对象
console.log(window.Hand3DViewer);

// 检查当前模型
console.log(window.Hand3DViewer.currentModel);

// 检查关节数据
console.log(window.Hand3DViewer.currentModel.joints);

// 检查手势模块
console.log(window.Hand3DViewer.Gestures);
```

## 扩展功能
您可以通过修改 `js/gestures.js` 文件来添加自定义手势，只需定义新的关节角度配置即可。

## 注意事项
- 确保3D模型完全加载后再使用手势功能
- 手势切换有1秒的动画时间
- 支持多次连续手势操作