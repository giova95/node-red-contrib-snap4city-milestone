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
            var guid = msg ? msg.guid : config.guid
            let name = msg ? msg.name : config.name;
            let hostname = msg ? msg.hostname : config.hostname;
            let port = msg ? msg.port : config.port;
            console.log(config.hostname, port, name, guid)

            let response = await sendXML(guid, name, hostname, port);
            if (typeof response === 'string') {
                console.log(response);
                resultMsg.payload = response;
            } else {
                if (response.status === 200) {
                    let result = await response;
                    console.log(result);
                    resultMsg.payload = result.statusText;
                }
                else {
                    let result = await response;
                    console.log(result);
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