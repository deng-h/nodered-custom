# 柔和光照系统改进说明

## 🌟 改进概述

根据您的需求，我对Robot 3D Viewer的光照系统进行了全面优化，解决了机器人正面过亮、背面过暗的问题，实现了更加柔和、均匀的光影效果。

## 💡 主要改进点

### 1. 强化环境光照明
```javascript
// 从之前的弱环境光
const ambientLight = new THREE.AmbientLight(0x000000, 0.4);

// 改为强环境光，提供均匀的基础照明
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
```
**效果**: 大幅减少明暗对比，消除过暗的阴影区域

### 2. 降低主方向光强度
```javascript
// 从强烈的主光源
const dirLight = new THREE.DirectionalLight(0xf0f0f0, 5);

// 改为柔和的主光源
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
```
**效果**: 避免正面过度曝光，减少刺眼感

### 3. 环绕光源系统
新增了6个环绕光源，围绕机器人360度布置：
```javascript
const numLights = 6; // 6个光源环绕
const radius = 4;
const height = 2;

for (let i = 0; i < numLights; i++) {
    const angle = (i / numLights) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const ringLight = new THREE.DirectionalLight(0xffffff, 0.3);
    ringLight.position.set(x, height, z);
    ringLight.target.position.set(0, 1, 0);
    // ...
}
```
**效果**: 确保机器人各个角度都有足够光照，消除背面过暗问题

### 4. 顶部和底部补充光
- **顶部光**: 从上方提供均匀照明
- **底部反射光**: 模拟地面反射，减少底部阴影

```javascript
// 顶部柔光
const topLight = new THREE.DirectionalLight(0xf5f5f5, 0.8);
topLight.position.set(0, 6, 0);

// 底部反射光
const bottomLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
bottomLight.position.set(0, -1, 0);
```

### 5. 渲染器优化
```javascript
// 提高整体曝光，让场景更亮
renderer.toneMappingExposure = 0.8; // 从 0.5 提高到 0.8

// 更柔和的阴影设置
dirLight.shadow.radius = 5;
dirLight.shadow.blurSamples = 8;
dirLight.shadow.mapSize.set(512, 512); // 降低分辨率增加柔和度
```

## 📊 对比效果

| 方面 | 改进前 | 改进后 |
|------|--------|--------|
| 正面亮度 | 过亮刺眼 | 柔和适中 |
| 背面亮度 | 过暗阴沉 | 明亮清晰 |
| 光影变化 | 强烈对比 | 渐进柔和 |
| 环绕照明 | 单向照明 | 360度均匀 |
| 阴影效果 | 硬边阴影 | 柔和渐变 |
| 整体感觉 | 戏剧性强 | 自然柔和 |

## 🎨 光源布局示意

```
        顶部光 (0,6,0)
           ↓
    光源2     光源1
      ↘   机器人   ↙
光源3 → ◯ 机器人 ◯ ← 光源6
      ↗           ↖
    光源4     光源5
           ↑
      底部反射光 (0,-1,0)
```

## 🚀 使用方法

1. **重新构建模块**:
   ```bash
   cd custom_nodes/robot-3d-viewer
   node build.js
   ```

2. **启动Node-RED**:
   ```bash
   node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\
   ```

3. **访问**: http://127.0.0.1:1880/

## 🔧 技术细节

### 光照强度分配
- **环境光**: 1.2 (主要基础照明)
- **主方向光**: 1.5 (适中的方向性照明)
- **环绕光源**: 0.3 × 6 = 1.8 (总计环绕照明)
- **顶部光**: 0.8 (顶部补充)
- **底部反射**: 0.4 (底部填充)

### 颜色温度
- 主光源: 纯白色 `0xffffff`
- 顶部光: 暖白色 `0xf5f5f5`
- 底部光: 冷白色 `0xe8e8e8`

## 🎯 预期效果

现在的机器人3D视图应该展现：
- ✅ 正面不再过度曝光
- ✅ 背面有充足的光照
- ✅ 光影变化柔和自然
- ✅ 360度视角都有良好的可见性
- ✅ 保持高质量的材质表现

这种光照系统更适合产品展示和技术演示，让观众能够清楚地看到机器人的每个细节，而不会被强烈的明暗对比所干扰。