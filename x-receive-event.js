module.exports = function (RED) {
    function XReceiveEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenSOAP') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }

        });

        node.on('close', function () {

        });

    }

    RED.nodes.registerType("xreceive-event", XReceiveEvent);
};
