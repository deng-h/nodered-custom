module.exports = function(RED) {
    "use strict";

    // 注册手部3D查看器节点类型
    // HTML文件中的<script>标签是实现3D查看器UI注入的关键
    function Hand3DViewerNode(config) {
        RED.nodes.createNode(this, config);
        
        // 保存配置
        this.defaultHand = config.defaultHand || 'left';
        
        // 节点状态设置
        this.status({fill:"green", shape:"dot", text:"手部3D查看器已就绪"});
        
        // 当节点被移除时的清理工作
        this.on('close', function() {
            // 这里可以添加清理代码，比如停止3D渲染等
            this.status({});
        });
    }

    RED.nodes.registerType("hand-3d-viewer", Hand3DViewerNode);
}