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
    function XAlarmList(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        let access_token;
        const { getAlarmList } = require('./utility.js');

        node.on('input', async function (msg) {
            access_token = this.context().flow.get('access_tokenSOAP') || null;
            if (access_token == null) {
                node.warn("Login to XProtect first!");
                return;
            }
            let resultMsg = { payload: null };
            
            if(typeof msg.payload === 'undefined'){
                msg.payload = {};
            }
            const hostname = msg.payload.hostname ? msg.payload.hostname : config.hostname;
            const port = msg.payload.port ? msg.payload.port : config.port;
            const maxLines = msg.payload.maxLines ? msg.payload.maxLines : config.maxLines;
            const order = msg.payload.order ? msg.payload.order : config.order;
            const target = msg.payload.target ? msg.payload.target : config.target;
            const res = await getAlarmList(access_token, hostname, port, maxLines, order, target);
            
            resultMsg.payload = res;
            node.send(resultMsg);
            return;
        });

        node.on('close', function (){
        });

    }

    RED.nodes.registerType("x-alarm-list", XAlarmList);
};
