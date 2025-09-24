module.exports = function(RED) {
    "use strict";

    // 我们仍然需要注册一个节点类型，即使它在功能上是空的。
    // 这样做是为了让Node-RED加载并解析相关的HTML文件，
    // HTML文件中的<script>标签才是我们实现UI注入的关键。
    function HumanoidUtilsNode(config) {
        RED.nodes.createNode(this, config);
    }

    // 后端API (RED.httpAdmin.post) 的部分已完全移除。
    RED.nodes.registerType("humanoid-utils", HumanoidUtilsNode);
}