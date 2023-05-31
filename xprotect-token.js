var fetch = require('node-fetch');
var {v4: uuidv4} = require('uuid');
const https = require('https');

//Get access token for the MIP VMS RESTful API gateway.
async function getTokenREST(username, password, serverUrl) {
    var token = null;
    var idpUrl = serverUrl + "/API/IDP/connect/token";

    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "password");
    urlencoded.append("username", username);
    urlencoded.append("password", password);
    urlencoded.append("client_id", "GrantValidatorClient");
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    await fetch(idpUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded,
        agent: httpsAgent
    }).then(async function (response) {
        let res = await response;
        token = res;
    }).catch(function (error) {
        var msg = "Failed to retrieve token - " + error;
        token = msg;
    });

    return token;
}

//Get access token for the MIPS VMS SOAP service
async function getTokenSOAP(username, password, serverUrl){
    var token = null;
    var idpUrl = serverUrl + "/ManagementServer/ServerCommandService.svc";
    var payload = createXML();
    let auth = Buffer.from(username + ":" + password).toString('base64')
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    await fetch(idpUrl, {
        method: 'POST',
        headers:{
            'Content-Type': 'text/xml',
            'SOAPAction': 'http://videoos.net/2/XProtectCSServerCommand/IServerCommandService/Login',
            'Authorization': `Basic ${auth}`
        },
        body: payload,
        agent: httpsAgent
    }).then(async function(response){
        let res = await response;
        token = res;
    }).catch(function(error){
        var msg = "Failed to retrieve token: " + error;
        token = msg;
    });
    return token;
}

function createXML(){
    let istanceID = uuidv4();
    var xml = ''+
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xpr="http://videoos.net/2/XProtectCSServerCommand">'+
    '<soapenv:Header/>'+
    ' <soapenv:Body>'+
    '   <xpr:Login>'+
    '     <xpr:instanceId>'+istanceID+'</xpr:instanceId>'+
    '   </xpr:Login>'+
    ' </soapenv:Body>'+
    '</soapenv:Envelope>'
    return xml;

}

module.exports = {getTokenREST, getTokenSOAP}