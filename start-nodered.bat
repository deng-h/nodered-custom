@echo off
REM Node-RED 启动脚本
REM 使用自定义的设置文件和数据目录

echo 启动 Node-RED...
echo 设置文件: packages\node_modules\node-red\settings.js
echo 数据目录: data\
echo.

node .\packages\node_modules\node-red\red.js -s .\packages\node_modules\node-red\settings.js -u .\data\

pause