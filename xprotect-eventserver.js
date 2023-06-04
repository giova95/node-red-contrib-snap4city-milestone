var fetch = require('node-fetch');
var { v4: uuidv4 } = require('uuid');
const https = require('https');
var { xml2json } = require('xml-js');



//TODO:gestire response come negli altri blocchi, error propagati come stringhe e poi error e send resultMsg come JSON
async function getAlarmList(tokenSOAP, node, maxLines, order, target) {
    var sessionId = await startAlarmSession(tokenSOAP, node);
    if (sessionId !== null) {
        const resList = await getAlarmLines(tokenSOAP, sessionId,  maxLines, order, target);
        const xmlList = await resList.text();
        const jsonList = JSON.parse(xml2json(xmlList));

        if(resList.status === 200){
            return jsonList.elements[0].elements[0].elements[0].elements[0].elements;
        }else{
            const err = jsonList.elements[0].elements[0].elements[0].elements[1].elements[0].text;
            let error = new Error(resSession.status + ' ' + resSession.statusText + ' ' + err);
            node.error(error);
        }

    }
}

async function startAlarmSession(tokenSOAP, node) {
    let id = null;
    const resSession = await getSessionId(tokenSOAP);
    const xmlSession = await resSession.text();
    const jsonSession = JSON.parse(xml2json(xmlSession));

    if (resSession.status === 200) {
        id = jsonSession.elements[0].elements[0].elements[0].elements[0].elements[0].text;
    }else{
        const err = jsonSession.elements[0].elements[0].elements[0].elements[1].elements[0].text;
        let error = new Error(resSession.status + ' ' + resSession.statusText + ' ' + err);
        node.error(error);
    }
    return id;
}


async function getAlarmLines(tokenSOAP, sessionId,  maxLines, order, target) {
    let url = 'http://localhost:22331/Central/AlarmServiceToken';
    let payload = getXML(tokenSOAP, sessionId,  maxLines, order, target);

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': 'http://videoos.net/2/CentralServerAlarmCommand/IAlarmCommandToken/GetAlarmLines',
        },
        body: payload
    }).then(async function (response) {
        let res = await response;
        sessionId = res;
    }).catch(function (error) {
        var msg = "Failed to Start Alarm Session: " + error;
        sessionId = msg;
    });
    return sessionId;

}

async function getSessionId(tokenSOAP) {
    var sessionId;
    let url = 'http://localhost:22331/Central/AlarmServiceToken';
    let payload = startXML(tokenSOAP);


    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': 'http://videoos.net/2/CentralServerAlarmCommand/IAlarmCommandToken/StartAlarmLineSession',
        },
        body: payload
    }).then(async function (response) {
        let res = await response;
        sessionId = res;
    }).catch(function (error) {
        var msg = "Failed to Start Alarm Session: " + error;
        sessionId = msg;
    });
    return sessionId;

}

function  startXML(tokenSOAP) {

    var xml = '' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">' +
        ' <s:Body>' +
        '   <StartAlarmLineSession  xmlns="http://videoos.net/2/CentralServerAlarmCommand">' +
        '     <token>' + tokenSOAP + '</token>' +
        '   </StartAlarmLineSession>' +
        ' </s:Body>' +
        '</s:Envelope>'

    return xml;
}

function getXML(tokenSOAP, sessionId,  maxLines, order, target) {
    var xml = '' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">' +
        ' <s:Body>' +
        '   <GetAlarmLines xmlns="http://videoos.net/2/CentralServerAlarmCommand">' +
        '     <token>' + tokenSOAP + '</token>' +
        '     <sessionId>' + sessionId + '</sessionId>' +
        '     <from>0</from>' +
        '     <maxCount>'+ maxLines +'</maxCount>' +
        '     <filter xmlns:a="http://schemas.datacontract.org/2004/07/VideoOS.Platform.Proxy.Alarm" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
        '        <a:Conditions />' +
        '        <a:Orders>' +
        '           <a:OrderBy>' +
        '              <a:Order>'+ order +'</a:Order>' +
        '              <a:Target>'+ target +'</a:Target>' +
        '           </a:OrderBy>' +
        '        </a:Orders>' +
        '     </filter>' +
        '   </GetAlarmLines>' +
        ' </s:Body>' +
        '</s:Envelope>'

    return xml;
}


module.exports = { getAlarmList }
