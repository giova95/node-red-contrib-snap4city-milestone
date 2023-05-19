/**
 * Copyright 2013,2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function (RED) {

    //TODO: add on close

    function XLogin(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var { getToken, connectWSDL } = require("./xprotect-utility.js");

        login(config);

        async function login() {
            var serverUrl = config.address; // Hostname of the management server, assuming that the API Gateway has been installed on the same host
            var username = config.user; //XProtect basic user with the XProtect Administrators role
            var password = config.password; // Password for basic user

            //Clear the timeout for access token refresh
            if(refresh){
                clearTimeout(refresh);
                console.log(refresh);
                refresh = null;
            }
            // Now authenticate using the identity provider and get access token
            const response = await getToken(username, password, serverUrl);

            if (typeof response === "string") {
                node.status({ fill: "yellow", shape: "ring", text: "Try to login" });
                node.warn("Server Address Not Found, Please verify if it exists");
            } else {
                if (response.status === 200) {
                    let tokenResponse = await response.json();
                    node.warn(tokenResponse);
                    var token = tokenResponse["access_token"];
                    const res = await connectWSDL(username, password, token);
                    var expire = tokenResponse["expires_in"];
                    var refresh = setTimeout(() => login(config, refresh), (expire/2)*1000); //Set a Timer based on access token expire time
                    node.status({ fill: "green", shape: "dot", text: username + " Logged In" });
                    node.context().flow.set('access_token', token);
                    return;
                } else {
                    node.status({ fill: "red", shape: "ring", text: "Login Failed" });
                    let error = await response.json();
                    node.warn(error);
                    return;
                }
            }
        }

    }
    RED.nodes.registerType('x-login', XLogin);
};   