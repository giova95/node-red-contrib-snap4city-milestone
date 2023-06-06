/* NODE-RED-CONTRIB-SNAP4CITY-MILESTONE
   Copyright (C) 2023 DISIT Lab http://www.disit.org - University of Florence

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, either version 3 of the
   License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. */
module.exports = function (RED) {

    function XSendEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var access_token;
        var { sendXML } = require('./utility.js');

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenREST') || null;
            var serverurl = this.context().flow.get('server_url') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = { payload: null };
            let name = msg.payload.hasOwnProperty('name') ? msg.payload.name : config.name;
            let guid = msg.payload.hasOwnProperty('guid') ? msg.payload.guid : config.guid;
            let hostname = msg.payload.hasOwnProperty('hostname') ? msg.payload.hostname : config.hostname;
            let port = msg.payload.hasOwnProperty('port') ? msg.payload.port : config.port;

            let response = await sendXML(access_token, guid, name, hostname, port, serverurl);
            if (typeof response === 'string') {
                resultMsg.payload = response;
            } else {
                if (response.status === 200) {
                    let result = response;
                    resultMsg.payload = result.statusText + " Event sent correctly";
                }
                else if(response.status === 405){
                    let result = response;
                    resultMsg.payload = result.statusText + " Port cannot be empty";
                }else{
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