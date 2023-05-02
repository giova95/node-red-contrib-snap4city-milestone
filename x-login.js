module.exports = function (RED) {

    function XLogin(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var {getToken} = require("./xprotect-token.js");
        var Gateway = require("./xprotect-gateway.js");
            node.on('input', async function (msg) {
            var username = config.user; // XProtect basic user with the XProtect Administrators role
            var password = config.password; // Password for basic user
            var serverUrl = config.address; // Hostname of the management server, assuming that the API Gateway has been installed on the same host
            
            node.log(RED._("input = ", msg.payload));

            // Now authenticate using the identity provider and get access token
            const token = await getToken(username, password, serverUrl);
            node.warn(result);
            if (token != null) {
                const access_token = token; // The token that we'll use for RESTful API calls
                const api_gateway = new Gateway(serverUrl); // Create an API Gateway
                console.log(`IDP access token response:\n${JSON.stringify(tokenResponse)}\n\n`);
                node.status({fill:"green",shape:"dot",text:"Logged in"});

                node.context().set('access_token', access_token); 
                node.context().set('api_gateway', api_gateway);

                return;
            } else {
                node.status({fill:"red",shape:"ring",text:"Login Failed"});
                const error = await response.json().error;
                console.log(error);
                return;
            } 

        });
    }




    RED.nodes.registerType('x-login', XLogin);
}   