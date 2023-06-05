module.exports = function (RED) {

    function XSendEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;
        var { sendXML } = require('./xprotect-analytics.js');

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenREST') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = { payload: null };
            let name = msg.payload.hasOwnProperty('name') ? msg.payload.name : config.name;
            let guid = msg.payload.hasOwnProperty('guid') ? msg.payload.guid : config.guid;
            let hostname = msg.payload.hasOwnProperty('hostname') ? msg.payload.hostname : config.hostname;
            let port = msg.payload.hasOwnProperty('port') ? msg.payload.port : config.port;

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
            node.send(resultMsg);
            return;
        });

        node.on('close', function () {
        });

    }

    RED.nodes.registerType("x-send-event", XSendEvent);
};