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
        const node = this;
        let access_token;
        const { sendXML } = require('./utility.js');

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenREST') || null;
            const serverurl = this.context().flow.get('server_url') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }

            const resultMsg = { 
                payload:{
                    message: null
                } 
            };

            const name = typeof msg.payload !== 'undefined' ? msg.payload.name : config.name;
            const guid = typeof msg.payload !== 'undefined' ? msg.payload.guid : config.guid;
            const hostname = typeof msg.payload !== 'undefined' ? msg.payload.hostname : config.hostname;
            const port = typeof msg.payload !== 'undefined' ? msg.payload.port : config.port;
            const description = typeof msg.payload !== 'undefined' ? msg.payload.description : config.description;
        
            const response = await sendXML(access_token, guid, name, hostname, description, port, serverurl);
            if (typeof response === 'string') {
                resultMsg.payload.message = response;
            } else {
                if (response.status === 200) {
                    resultMsg.payload.message = response.statusText + " Event sent correctly";
                }
                else if(response.status === 405){
                    resultMsg.payload.message = response.statusText + " Port cannot be empty";
                }else{
                    resultMsg.payload.message = response.statusText + ' GUID not valid';
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
