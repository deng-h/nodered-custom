@echo off
echo Starting Node-RED with custom robot 3D viewer...
echo.

REM 设置Node.js环境变量（如果需要）
REM set NODE_ENV=development

REM 启动Node-RED，使用自定义设置和数据目录
node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\

echo.
echo Node-RED server stopped.
pause