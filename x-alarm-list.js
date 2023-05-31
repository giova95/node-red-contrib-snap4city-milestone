module.exports = function (RED) {
    function XAlarmList(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;
        var sessionId;
        var { xml2json } = require('xml-js');
        var { getAlarmList } = require('./xprotect-eventserver.js')

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenSOAP') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            //Get alarm lines
            var list = await getAlarmList(access_token, node);

            //intestazione tabella
            for (let i = 0; i < list.length; i++) {
                let title = '';
                for (let j = 0; j < 24; j++) {
                    let line = list[i].elements[j];
                    title += line.name + ' ';
                    console.log(line.hasOwnProperty(elements))
                    //if (line.hasOwnProperty(elements)) {
                      //  console.log(line.elements[0].name)
                    //}

                }
                //console.log(title + "\n");
            }
        });

        node.on('close', function () {

        });

    }

    RED.nodes.registerType("x-alarm-list", XAlarmList);
};
