module.exports = function (RED) {

    function XLogin(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var { getToken } = require("./xprotect-utility.js");
        var Gateway = require("./xprotect-gateway.js");
        node.on('input', async function (msg) {
            var serverUrl = msg.address; // Hostname of the management server, assuming that the API Gateway has been installed on the same host
            var username = msg.user; //XProtect basic user with the XProtect Administrators role
            var password = msg.password; // Password for basic user

            // Now authenticate using the identity provider and get access token
            const response = await getToken(username, password, serverUrl);
            
            if(response.status===200){
                let tokenResponse = await response.json();
                node.warn(tokenResponse);
                var token = tokenResponse["access_token"];
                node.status({ fill: "green", shape: "dot", text: username + " logged in" });
                
                // Create an API Gateway
                const api_gateway = new Gateway(serverUrl);

                node.context().flow.set('access_token', token);
                node.context().flow.set('api_gateway', api_gateway);
                return;
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "Login Failed" });
                let error = await response.json();
                node.warn(error);
                return;
            }
        });
    }
    RED.nodes.registerType('x-login', XLogin);
};   