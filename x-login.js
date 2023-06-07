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

    function XLogin(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const { getTokenSOAP, getTokenREST } = require("./utility.js");
        const { xml2json } = require('xml-js');
        let refreshREST = null;
        let refreshSOAP = null;
        login(config);

        async function login() {
            const serverUrl = config.address; 
            const username = config.user; 
            const password = config.password;

            let resultMsg = {
                payload: {
                    tokenREST: null,
                    tokenSOAP: null,
                    expireREST: null,
                    expireSOAP: null,
                    error: 'none'
                }
            }

            //Clear the timeout for access tokens refresh
            if(refreshREST){
                clearTimeout(refreshREST);
                refreshREST = null;
            }
            if(refreshSOAP){
                clearTimeout(refreshSOAP);
                refreshSOAP = null;
            }

            const responseSOAP = await getTokenSOAP(username, password, serverUrl);
            const responseREST = await getTokenREST(username, password, serverUrl);

            if (typeof responseREST === "string" && typeof responseSOAP === "string") {
                node.status({ fill: "yellow", shape: "ring", text: "Try to login" });
                const err = "Server Address Not Found, Please verify if it exists";
                resultMsg.payload.error = err;
            } else {
                if (responseREST.status === 200 && responseSOAP.status === 200) {
                    const jsonREST = await responseREST.json();
                    const tokenREST = jsonREST["access_token"];
                    const expireREST = jsonREST["expires_in"];

                    const resSOAP = await responseSOAP.text();
                    const jsonSOAP = JSON.parse(xml2json(resSOAP));
                    const Element = jsonSOAP.elements[0].elements[0].elements[0].elements[0];
                    const tokenSOAP = Element.elements[3].elements[0].text;
                    const expireSOAP = (Element.elements[1].elements[0].elements[0].text)/1000000;

                    //update results JSON
                    resultMsg.payload.tokenREST = tokenREST;
                    resultMsg.payload.expireREST = expireREST;
                    resultMsg.payload.tokenSOAP = tokenSOAP;
                    resultMsg.payload.expireSOAP = expireSOAP

                    //Set a Timer based on access tokens expire time
                    refreshREST = setTimeout(() => login(config, refreshREST), (expireREST/2)*1000); 
                    refreshSOAP = setTimeout(() => login(config, refreshSOAP), (expireSOAP/2)*1000);

                    node.status({ fill: "green", shape: "dot", text: username + " Logged In" });
                    node.context().flow.set('access_tokenREST', tokenREST);
                    node.context().flow.set('access_tokenSOAP', tokenSOAP);
                    node.context().flow.set('server_url', serverUrl.replace("https","http"));
                } else {
                    node.status({ fill: "red", shape: "ring", text: "Login Failed" });
                    const jsonerr = await responseREST.json();
                    const err = jsonerr['error_description'];
                    resultMsg.payload.error = err;
                }
            }
            node.send(resultMsg)
            return;
        }

    }
    RED.nodes.registerType('x-login', XLogin);
};   