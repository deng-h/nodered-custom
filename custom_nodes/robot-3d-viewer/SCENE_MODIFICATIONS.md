# Robot 3D Viewer 场景修改说明

## 修改内容

### 1. 背景颜色修改
- **文件**: `custom_nodes/robot-3d-viewer/js/scene.js`
- **修改**: 将场景背景从深灰色 (`0x222222`) 改为白色 (`0xffffff`)
- **位置**: `initThreeJSScene()` 函数中的场景创建部分

### 2. 地面添加
- **文件**: `custom_nodes/robot-3d-viewer/js/scene.js`
- **修改**: 在 `setupLighting()` 函数中添加了地面
- **地面特性**:
  - 尺寸: 10x10 单位的平面
  - 颜色: 浅灰色 (`0xf0f0f0`)
  - 材质: MeshLambertMaterial，带有透明度
  - 位置: Y轴向下偏移1个单位，让机器人看起来站在地面上
  - 功能: 可以接收阴影

### 3. 启动脚本
- **文件**: `start-robot-viewer.bat`
- **功能**: 使用指定的命令启动Node-RED服务器
- **命令**: `node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\`

## 使用方法

1. 运行启动脚本:
   ```
   .\start-robot-viewer.bat
   ```

2. 或者直接使用命令行:
   ```
   node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\
   ```

3. 打开浏览器访问: http://127.0.0.1:1880/

4. 在Node-RED界面中打开Robot 3D Viewer侧边栏即可看到白色背景和地面效果

## 技术说明

- 地面使用Three.js的PlaneGeometry创建
- 地面材质使用MeshLambertMaterial，支持光照和阴影
- 地面旋转90度使其水平放置
- 透明度设为0.8，使地面看起来更自然
- 启用了阴影接收功能，机器人的阴影会投射到地面上

## 修改日期
2025年9月24日