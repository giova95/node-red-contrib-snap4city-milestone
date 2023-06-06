module.exports = function (RED) {
    function XAlarmList(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;
        var { getAlarmList} = require('./xprotect-eventserver.js')

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenSOAP') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = { payload: null };
            let maxLines = msg.payload.hasOwnProperty('maxLines') ? msg.payload.maxLines : config.maxLines;
            let order = msg.payload.hasOwnProperty('order') ? msg.payload.order : config.order;
            let target = msg.payload.hasOwnProperty('target') ? msg.payload.target : config.target;            
            
            //Get alarm lines
            let res = await getAlarmList(access_token, maxLines, order, target);
            
            //Update JSON output
            resultMsg.payload = res;
            node.send(resultMsg);
            return;
        });

        node.on('close', function (){

        });

    }

    RED.nodes.registerType("x-alarm-list", XAlarmList);
};
