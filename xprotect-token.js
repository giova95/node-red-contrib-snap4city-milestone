var fetch = require('node-fetch');
//Get a bearer access token for the MIP VMS RESTful API gateway.
async function getToken(username, password, serverUrl) {
    var token = null;
    var idpUrl = serverUrl + "/API/IDP/connect/token";

    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "password");
    urlencoded.append("username", username);
    urlencoded.append("password", password);
    urlencoded.append("client_id", "GrantValidatorClient");

    await fetch(idpUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
    }).then(async function (response) {
        let res = await response;
        token = res;
    }).catch(function (error) {
        var msg = "Failed to retrieve token - " + error;
        console.log(msg);
        token = msg;
    });

    return token;
}

async function connectWSDL(username, password, token) {

    var xmlres;
    var url = "http://localhost:22331/Central/AlarmServiceToken?singleWsdl";

    await fetch(url, {
        method: 'GET',
        headers: {
            'SOAPAction': 'GetAlarmLinesResponse',
            'Authorization': 'Bearer ' + token
        },
    }).then(async function (response) {
        let res = await response;
        console.log(res);
        xmlres = res;
    }).catch(function (err) {
        var msg = "Connection error: " + err;
        console.log(msg);
        xmlres = msg;
    });
    return xmlres;

}

module.exports = { getToken, connectWSDL }