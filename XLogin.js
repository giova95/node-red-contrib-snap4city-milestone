module.exports = function (RED) {

    function XLogin(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var fetch = require('fetch');
        var Xutility = require("./xprotect-utility.js");
        var Gateway = require("./xprotect-gateway.js");
            node.on('input', async function () {
            var username = config.user; // XProtect basic user with the XProtect Administrators role
            var password = config.password; // Password for basic user
            var serverUrl = config.address; // Hostname of the management server, assuming that the API Gateway has been installed on the same host

            // First we need a session to ensure that we stay logged in
            const session = fetch.session();

            // Now authenticate using the identity provider and get access token
            const response = await Xutility.get_token(session, username, password, serverUrl);
            if (response.status === 200) {
                const tokenResponse = await response.json();
                const access_token = tokenResponse.access_token; // The token that we'll use for RESTful API calls
                console.log(`IDP access token response:\n${JSON.stringify(tokenResponse)}\n\n`);
                node.status({fill:"green",shape:"dot",text:"Logged in"});
                
                // Create an API Gateway
                const api_gateway = new Gateway(serverUrl);

                return api_gateway, access_token;
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