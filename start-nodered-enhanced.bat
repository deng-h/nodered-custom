@echo off
echo 启动增强版 Node-RED 机器人3D查看器...
echo.
echo 使用增强的环境效果：
echo - 雾效环境（远处模糊效果）
echo - 高质量光影
echo - 相机控制限制（不能拖到地面以下）
echo - 类似 Three.js webgl_animation_walk 示例的视觉效果
echo.

cd /d "%~dp0"
node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\

pause