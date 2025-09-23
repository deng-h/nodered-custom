module.exports = function(RED) {
    "use strict";

    // 注册一个节点类型，用于加载相关的HTML文件
    // HTML文件中的<script>标签是实现3D查看器UI注入的关键
    function Robot3DViewerNode(config) {
        RED.nodes.createNode(this, config);
    }

    RED.nodes.registerType("robot-3d-viewer", Robot3DViewerNode);
}