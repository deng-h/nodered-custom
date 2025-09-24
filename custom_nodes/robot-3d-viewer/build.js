#!/usr/bin/env node

/**
 * Robot 3D Viewer Build Script
 * 自动将模块文件合并到主 HTML 文件中
 */

const fs = require('fs');
const path = require('path');

class Robot3DViewerBuilder {
    constructor() {
        this.baseDir = __dirname;
        this.templateFile = path.join(this.baseDir, 'templates', 'node-template.html');
        this.cssFile = path.join(this.baseDir, 'css', 'robot-3d-viewer.css');
        this.jsDir = path.join(this.baseDir, 'js');
        this.outputFile = path.join(this.baseDir, 'robot-3d-viewer.html');
        this.backupFile = path.join(this.baseDir, 'robot-3d-viewer-backup.html');
        
        // JS模块加载顺序（很重要！）
        this.jsModules = [
            'dependencies.js',
            'annotations.js', 
            'controls.js',
            'scene.js',
            'sidebar.js',
            'main.js'
        ];
    }

    /**
     * 读取文件内容
     */
    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error(`❌ 无法读取文件: ${filePath}`);
            console.error(error.message);
            return '';
        }
    }

    /**
     * 写入文件
     */
    writeFile(filePath, content) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        } catch (error) {
            console.error(`❌ 无法写入文件: ${filePath}`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 备份现有文件
     */
    backupExistingFile() {
        if (fs.existsSync(this.outputFile)) {
            try {
                fs.copyFileSync(this.outputFile, this.backupFile);
                console.log(`📦 已备份现有文件到: ${path.basename(this.backupFile)}`);
            } catch (error) {
                console.warn(`⚠️  备份失败: ${error.message}`);
            }
        }
    }

    /**
     * 读取模板文件
     */
    readTemplate() {
        console.log('📖 读取 HTML 模板...');
        return this.readFile(this.templateFile);
    }

    /**
     * 读取CSS文件
     */
    readCSS() {
        console.log('🎨 读取 CSS 样式...');
        return this.readFile(this.cssFile);
    }

    /**
     * 读取所有JS模块
     */
    readJSModules() {
        console.log('📜 读取 JavaScript 模块...');
        const modules = {};
        
        for (const moduleName of this.jsModules) {
            const modulePath = path.join(this.jsDir, moduleName);
            const content = this.readFile(modulePath);
            if (content) {
                modules[moduleName] = content;
                console.log(`  ✅ ${moduleName}`);
            } else {
                console.log(`  ❌ ${moduleName} - 文件不存在或为空`);
            }
        }
        
        return modules;
    }

    /**
     * 生成完整的HTML内容
     */
    generateHTML(template, css, jsModules) {
        console.log('🔧 生成最终 HTML 文件...');
        
        let html = template;
        
        // 插入CSS样式
        const cssSection = `
<!-- CSS Styles -->
<style>
${css}
</style>`;
        
        // 插入JavaScript模块
        let jsSection = `
<!-- JavaScript Modules -->
<script type="text/javascript">
    // 初始化全局命名空间
    window.Robot3DViewer = {};
</script>
`;
        
        // 按顺序添加每个模块
        const moduleNames = {
            'dependencies.js': '依赖加载模块',
            'annotations.js': '注释系统模块', 
            'controls.js': '控制和事件模块',
            'scene.js': '3D场景管理模块',
            'sidebar.js': '侧边栏UI模块',
            'main.js': '主入口模块'
        };
        
        for (const moduleName of this.jsModules) {
            if (jsModules[moduleName]) {
                const moduleTitle = moduleNames[moduleName] || moduleName;
                jsSection += `
<!-- ${moduleTitle} -->
<script type="text/javascript">
${jsModules[moduleName]}
</script>
`;
            }
        }
        
        // 将CSS和JS插入到HTML中
        html = html + cssSection + jsSection;
        
        return html;
    }

    /**
     * 构建主函数
     */
    build() {
        console.log('🚀 开始构建 Robot 3D Viewer...\n');
        
        // 备份现有文件
        this.backupExistingFile();
        
        // 读取所有文件
        const template = this.readTemplate();
        if (!template) {
            console.error('❌ 无法读取模板文件，构建失败');
            return false;
        }
        
        const css = this.readCSS();
        const jsModules = this.readJSModules();
        
        // 检查是否有必需的模块
        const requiredModules = ['main.js', 'dependencies.js'];
        const missingModules = requiredModules.filter(module => !jsModules[module]);
        
        if (missingModules.length > 0) {
            console.error(`❌ 缺少必需的模块: ${missingModules.join(', ')}`);
            return false;
        }
        
        // 生成最终HTML
        const finalHTML = this.generateHTML(template, css, jsModules);
        
        // 写入文件
        const success = this.writeFile(this.outputFile, finalHTML);
        
        if (success) {
            console.log(`\n✅ 构建成功！`);
            console.log(`📄 输出文件: ${path.basename(this.outputFile)}`);
            console.log(`📦 备份文件: ${path.basename(this.backupFile)}`);
            
            // 显示文件大小信息
            try {
                const stats = fs.statSync(this.outputFile);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`📊 文件大小: ${sizeKB} KB`);
            } catch (error) {
                // 忽略文件大小获取错误
            }
            
            console.log('\n🎉 现在可以在 Node-RED 中使用重新构建的模块了！');
            return true;
        } else {
            console.error('\n❌ 构建失败！');
            return false;
        }
    }

    /**
     * 监听文件变化并自动重建
     */
    watch() {
        console.log('👀 开启文件监听模式...');
        console.log('📁 监听目录: js/, css/, templates/');
        console.log('💡 提示: 按 Ctrl+C 退出监听模式\n');
        
        const watchDirs = [this.jsDir, path.dirname(this.cssFile), path.dirname(this.templateFile)];
        
        watchDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.watch(dir, { recursive: true }, (eventType, filename) => {
                    if (filename && (filename.endsWith('.js') || filename.endsWith('.css') || filename.endsWith('.html'))) {
                        console.log(`📝 检测到文件变化: ${filename}`);
                        console.log('🔄 重新构建中...\n');
                        this.build();
                        console.log('\n⏰ 继续监听文件变化...\n');
                    }
                });
            }
        });
        
        // 初始构建
        this.build();
    }
}

// 命令行参数处理
function main() {
    const args = process.argv.slice(2);
    const builder = new Robot3DViewerBuilder();
    
    if (args.includes('--watch') || args.includes('-w')) {
        builder.watch();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Robot 3D Viewer 构建工具

用法:
  node build.js           # 执行一次构建
  node build.js --watch   # 监听文件变化并自动重建
  node build.js --help    # 显示帮助信息

功能:
  - 将模块文件自动合并到单个 HTML 文件中
  - 保持 Node-RED 自定义节点规范兼容
  - 自动备份现有文件
  - 支持文件变化监听和自动重建

目录结构:
  templates/node-template.html  # HTML 模板
  css/robot-3d-viewer.css      # CSS 样式
  js/                          # JavaScript 模块目录
    ├── dependencies.js        # 依赖加载
    ├── annotations.js         # 注释系统
    ├── controls.js            # 控制逻辑
    ├── scene.js              # 3D 场景
    ├── sidebar.js            # 侧边栏 UI
    └── main.js               # 主入口

输出:
  robot-3d-viewer.html         # 最终的 Node-RED 节点文件
  robot-3d-viewer-backup.html  # 自动备份文件
`);
    } else {
        builder.build();
    }
}

// 如果是直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = Robot3DViewerBuilder;