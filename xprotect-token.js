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

async function connectWSDL(token) {

    var xmlres;
    var url = "http://panicucci-pc:22331/Central/AlarmServiceToken";
    var xml = createXML(token);

    await fetch(url, {
        method: 'POST',
        headers: {
            'SOAPAction': 'http://videoos.net/2/CentralServerAlarmCommand/IAlarmCommandToken/StartAlarmLineSession',
            'Content-Type': 'text/xml'
        },
        body: xml
    }).then(async function (response) {
        let res = await response.text();
        console.log(res);
        xmlres = res;
    }).catch(function (err) {
        var msg = "Connection error: " + err;
        console.log(msg);
        xmlres = msg;
    });
    return xmlres;

}

function createXML(token) {

    var token1 = ''+token
    var xml = '' +
    '<?xml version="1.0" encoding="utf-8"?>'+
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">'+
    ' <s:Body>'+
    '<StartAlarmLineSession xmlns="http://videoos.net/2/CentralServerAlarmCommand">'+
        '<token>'+token1+'</token>'+
        '<filter xmlns:a="http://schemas.datacontract.org/2004/07/VideoOS.Platform.Proxy.Alarm" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">'+
            '<a:Conditions />'+
            '<a:Orders>'+
               '<a:OrderBy>'+
                  '<a:Order>Descending</a:Order>'+
                  '<a:Target>Timestamp</a:Target>'+
               '</a:OrderBy>'+
            '</a:Orders>'+
         '</filter>'+
      '</StartAlarmLineSession>'+
    ' </s:Body>'+
    '</s:Envelope>'

    return xml;
}

module.exports = {getToken, connectWSDL }