module.exports = function (RED) {

    function XSendEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;
        var {sendXMLhttp} = require('./analytics-event.js');

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_token') || null;
            
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = {payload : null};
            let guid = msg?msg.guid:config.guid;
            let name = msg?msg.name:config.name;
            let hostname = msg?msg.hostname:config.hostname;
            let port = msg?msg.port:config.port;
            console.log(hostname, port, name, guid)
            //function who send event and return result
            var res = sendXMLhttp(guid, name, hostname, port);
            console.log(res);

            node.warn(res); 
            return;    
        });

        node.on('close', function () {

        });

    }

    RED.nodes.registerType("xsend-event", XSendEvent);
};