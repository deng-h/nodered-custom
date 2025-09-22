# 🎮 Node-RED 游乐场 (Playground) 使用指南

## 🌟 概述

Node-RED 游乐场是一个专为学习和定制 Node-RED UI 而设计的开发环境。它让您可以在不修改原有源码的情况下：

- ✨ 添加自定义 UI 组件
- 🔧 扩展编辑器功能  
- 🎨 测试新的界面设计
- 📦 开发自定义工具

## 📁 目录结构

```
playground/
├── README.md                           # 使用指南
├── ui/                                # UI 相关代码
│   ├── js/                           # JavaScript 文件
│   │   └── playground-init.js        # 主初始化脚本
│   ├── css/                          # 样式文件
│   │   └── playground.css            # 主样式文件
│   ├── components/                   # 自定义组件目录
│   └── examples/                     # 示例代码
│       ├── hello-playground.js       # 基础示例
│       └── custom-sidebar.js         # 侧边栏示例
├── config/                           # 配置文件
│   └── build.js                      # 构建配置
└── docs/                             # 开发文档
    └── DEVELOPMENT_GUIDE.md          # 详细开发指南
```

## 🚀 快速开始

### 1. 构建 playground 代码

```bash
# 构建 playground（推荐开发时使用）
node playground\\config\\build.js
```

### 2. 启动 Node-RED

```bash
# 使用指定命令启动（按您的要求）
node .\\packages\\node_modules\\node-red\\red.js -s .\\packages\\node_modules\\node-red\\settings.js -u .\\data\\
```

### 3. 查看效果

1. 打开浏览器访问 `http://localhost:1880`
2. 进入编辑器界面
3. 您应该能看到：
   - 🎮 工具栏中的 "🎮 Playground" 按钮
   - 👋 工具栏中的 "👋 Hello" 按钮
   - 📋 右侧侧边栏中的 "游乐场"、"工具"、"信息" 标签页
   - 📝 控制台中的 playground 初始化日志

## ✨ 已包含的功能

### 🎮 主游乐场面板
- **状态信息**：显示游乐场版本和运行状态
- **快速操作**：提供常用的测试按钮
- **开发日志**：实时显示操作日志
- **有用链接**：快速访问相关文档

### 👋 Hello 示例
- **问候功能**：点击按钮输入姓名获得个性化问候
- **随机提示**：自动显示使用技巧
- **组件注册示例**：展示如何注册自定义组件

### 🔧 工具面板
- **节点操作**：选择所有节点、清空工作区、导出流程
- **视图操作**：适应屏幕、缩放控制
- **开发辅助**：网格显示、对齐等辅助功能
- **快速生成**：自动生成测试流程和调试节点

### 📊 信息面板
- **运行时信息**：显示系统时间、版本、浏览器信息
- **节点统计**：统计节点数量和类型分布
- **性能监控**：监控页面性能指标
- **最近活动**：记录用户操作历史

## 🛠️ 开发指南

### 添加新功能

1. **在相应目录创建文件**：
   - JavaScript: `playground/ui/js/` 或 `playground/ui/components/`
   - CSS: `playground/ui/css/` 或 `playground/ui/components/`
   - 示例: `playground/ui/examples/`

2. **重新构建**：
   ```bash
   node playground\\config\\build.js
   ```

3. **刷新浏览器查看效果**

### 示例：添加自定义按钮

```javascript
// playground/ui/components/my-button.js
;(function() {
    "use strict";
    
    document.addEventListener('playground-ready', function() {
        NodeREDPlayground.utils.waitForElement('.red-ui-header-toolbar', function(toolbar) {
            const myBtn = document.createElement('button');
            myBtn.className = 'playground-button';
            myBtn.innerHTML = '🌟 我的功能';
            myBtn.onclick = function() {
                RED.notify("我的自定义功能!", "success");
            };
            toolbar.appendChild(myBtn);
        });
    });
})();
```

### 示例：添加自定义样式

```css
/* playground/ui/components/my-styles.css */
.my-custom-element {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
    color: white !important;
    padding: 10px !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
}
```

## 🎯 常用 API

### 全局对象

```javascript
// NodeREDPlayground 全局对象
NodeREDPlayground.version          // 版本信息
NodeREDPlayground.initialized      // 是否已初始化
NodeREDPlayground.utils.log()      // 日志输出
NodeREDPlayground.utils.notify()   // 显示通知
NodeREDPlayground.addLog()         // 添加到游乐场日志
```

### Node-RED API

```javascript
// 显示通知
RED.notify("消息内容", "success");

// 添加侧边栏
RED.sidebar.addTab({
    id: "my-tab",
    label: "我的标签",
    content: $('<div>内容</div>'),
    iconClass: "fa fa-star"
});

// 注册动作和快捷键
RED.actions.add("my-action", function() { /* 动作代码 */ });
RED.keyboard.add("ctrl-shift-x", "my-action");

// 监听事件
RED.events.on("deploy", function() { /* 部署时执行 */ });
```

## 🎨 样式系统

游乐场提供了统一的样式类：

```css
.playground-button      /* 按钮样式 */
.playground-input       /* 输入框样式 */
.playground-status-panel /* 状态面板样式 */
.playground-success     /* 成功状态颜色 */
.playground-warning     /* 警告状态颜色 */
.playground-error       /* 错误状态颜色 */
.playground-info        /* 信息状态颜色 */
```

## 🔍 调试技巧

1. **查看日志**：
   - 浏览器控制台中查找 `[Playground]` 标记的日志
   - 游乐场面板中的开发日志

2. **实时调试**：
   ```javascript
   // 在浏览器控制台中测试
   NodeREDPlayground.utils.log("测试日志");
   RED.notify("测试通知", "info");
   ```

3. **文件更新流程**：
   - 修改 playground 文件
   - 运行 `node playground\\config\\build.js`
   - 刷新浏览器页面

## 🚀 高级功能

### 组件注册系统

```javascript
// 注册自定义组件
NodeREDPlayground.registerComponent('my-component', {
    name: '我的组件',
    version: '1.0.0',
    init: function() {
        // 初始化代码
    }
});
```

### 事件系统

```javascript
// 监听游乐场准备就绪
document.addEventListener('playground-ready', function() {
    // 游乐场初始化完成后执行
});
```

### 主题适配

游乐场支持深色主题和高对比度模式，所有样式都会自动适配。

## 🆘 故障排除

### 常见问题

1. **游乐场按钮没有出现**
   - 检查控制台是否有 JavaScript 错误
   - 确认已运行构建命令
   - 确认 playground.js 和 playground.css 文件已生成

2. **样式没有应用**
   - 检查 CSS 语法错误
   - 确认使用了 `!important` 声明
   - 检查浏览器开发者工具中的样式冲突

3. **功能无响应**
   - 检查是否等待了 `playground-ready` 事件
   - 确认 RED 对象已准备好
   - 检查元素选择器是否正确

### 调试命令

```bash
# 重新构建
node playground\\config\\build.js

# 检查生成的文件
dir packages\\node_modules\\@node-red\\editor-client\\public\\red\\playground.*

# 启动 Node-RED（调试模式）
set DEBUG=* && node .\\packages\\node_modules\\node-red\\red.js -s .\\packages\\node_modules\\node-red\\settings.js -u .\\data\\
```

## 📚 参考资源

- [Node-RED 官方文档](https://nodered.org/docs/)
- [Node-RED 编辑器 API](https://nodered.org/docs/api/ui/)
- [jQuery 文档](https://api.jquery.com/)
- [Font Awesome 图标](https://fontawesome.com/icons)

## 💡 贡献指南

1. 在 `playground/ui/examples/` 中添加您的示例
2. 更新相关文档
3. 分享您的使用经验和技巧

---

🎉 **享受您的 Node-RED 定制开发之旅！**

如果您有任何问题或建议，请查看 `playground/docs/DEVELOPMENT_GUIDE.md` 获取更详细的开发指南。