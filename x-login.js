module.exports = function (RED) {

    function XLogin(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var { getTokenSOAP, getTokenREST } = require("./xprotect-token.js");
        var { xml2json } = require('xml-js');
        login(config);

        async function login() {
            var serverUrl = config.address; // Hostname of the management server
            var username = config.user; // XProtect basic user with the XProtect Administrators role
            var password = config.password; // Password for basic user

            var resultMsg = {
                payload: null
            }

            //Clear the timeout for access tokens refresh
            if(refreshREST){
                clearTimeout(refreshREST);
                refresh = null;
            }
            if(refreshSOAP){
                clearTimeout(refreshSOAP);
                refreshSOAP = null;
            }

            //send request for both SOAP and REST to get access tokens
            const responseSOAP = await getTokenSOAP(username, password, serverUrl);
            const responseREST = await getTokenREST(username, password, serverUrl);

            if (typeof responseREST === "string" && typeof responseSOAP === "string") {
                node.status({ fill: "yellow", shape: "ring", text: "Try to login" });
                let err = "Server Address Not Found, Please verify if it exists";
                resultMsg.payload = err;
                let error = new Error(err);
                node.error(error);
            } else {
                if (responseREST.status === 200 && responseSOAP.status === 200) {
                    // manage REST response
                    let jsonREST = await responseREST.json();
                    const tokenREST = jsonREST["access_token"];
                    const expireREST = jsonREST["expires_in"];

                    //manage SOAP response
                    let resSOAP = await responseSOAP.text();
                    let jsonSOAP = JSON.parse(xml2json(resSOAP));
                    const Element = jsonSOAP.elements[0].elements[0].elements[0].elements[0];
                    const tokenSOAP = Element.elements[3].elements[0].text;
                    const expireSOAP = (Element.elements[1].elements[0].elements[0].text)/1000;
                    resultMsg.payload = jsonREST+tokenSOAP+expireSOAP;
                    console.log(resultMsg);

                    //Set a Timer based on access tokens expire time
                    var refreshREST = setTimeout(() => login(config, refresh), (expireREST/2)*1000); 
                    var refreshSOAP = setTimeout(() => login(config, refresh), (expireSOAP/2));

                    node.status({ fill: "green", shape: "dot", text: username + " Logged In" });
                    node.context().flow.set('access_tokenREST', tokenREST);
                    node.context().flow.set('access_tokenSOAP', tokenSOAP);
                } else {
                    node.status({ fill: "red", shape: "ring", text: "Login Failed" });
                    let err = await responseREST.text();
                    resultMsg.payload = err;
                    let error = new Error(err);
                    node.error(error);
                }
            }
            node.send(resultMsg)
            return;
        }

    }
    RED.nodes.registerType('x-login', XLogin);
};   