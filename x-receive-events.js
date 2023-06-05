module.exports = function (RED) {
    function XReceiveEvents(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenSOAP') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = { payload: null };
            let timer = msg.payload.hasOwnProperty('timer') ? msg.payload.timer : config.timer;
            let order = msg.payload.hasOwnProperty('order') ? msg.payload.order : config.order;
            let target = msg.payload.hasOwnProperty('target') ? msg.payload.target : config.target;

            var res = await getEvents(access_token, node, timer, order, target)

            node.send(resultMsg);
            return;
        });

        node.on('close', function () {

        });

    }

    RED.nodes.registerType("x-receive-events", XReceiveEvents);
};
