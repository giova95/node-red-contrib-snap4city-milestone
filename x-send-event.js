module.exports = function (RED) {

    function XSendEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;
        var { sendXML } = require('./xprotect-analytics.js');

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_token') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = { payload: null };
            var guid = msg.hasOwnProperty('guid') ? msg.guid : config.guid;
            let name = msg.hasOwnProperty('name') ? msg.name : config.name;
            let hostname = msg.hasOwnProperty('hostname') ? msg.hostname : config.hostname;
            let port = msg.hasOwnProperty('port') ? msg.port : config.port;

            let response = await sendXML(access_token, guid, name, hostname, port);
            if (typeof response === 'string') {
                resultMsg.payload = response;
            } else {
                if (response.status === 200) {
                    let result = response;
                    resultMsg.payload = result.statusText;
                }
                else {
                    let result = response;
                    resultMsg.payload = result.statusText + ' GUID not valid';
                }
            }
            node.warn(resultMsg);
            return;
        });

        node.on('close', function () {

        });

    }

    RED.nodes.registerType("xsend-event", XSendEvent);
};