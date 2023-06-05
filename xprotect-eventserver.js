var fetch = require('node-fetch');
var { v4: uuidv4 } = require('uuid');
const https = require('https');
var { xml2json } = require('xml-js');



//TODO:gestire response come negli altri blocchi, error propagati come stringhe e poi error e send resultMsg come JSON
async function getAlarmList(tokenSOAP, maxLines, order, target) {
    var list;
    var { sessionId, error } = await startAlarmSession(tokenSOAP);
    if (typeof sessionId !== undefined) {
        const resSession = await getAlarmLines(tokenSOAP, sessionId, maxLines, order, target);
        const xmlList = await resSession.text();
        const jsonList = JSON.parse(xml2json(xmlList));

        if (resSession.status !== 200) {
            const err = jsonList.elements[0].elements[0].elements[0].elements[1].elements[0].text;
            let error = resSession.status + ' ' + resSession.statusText;
            list = {
                "error": error,
                "description": err
            };
        } else {
            list = {
                "label": null,
                "data": null
            }
            //trovare modo di inserire tutto il JSON in list
            //fare for ciclando su questo lookup
            var element = lookup(jsonList.elements[0].elements[0].elements[0].elements[0].elements[0], 'elements')[1];
            for(let i = 0; i<element.length; i++) {
                list.label[i] = (lookup(element[i], 'name')[1]);
                if(element[i].hasOwnProperty('elements')){
                    list.data = lookup(element[i], 'elements')[1];
                }
            }
            console.log(list);
        }

    } else {
        list = error;
    }
    return list;
}

async function startAlarmSession(tokenSOAP) {
    let id = null;
    let error = null;
    const resSession = await getSessionId(tokenSOAP);
    const xmlSession = await resSession.text();
    const jsonSession = JSON.parse(xml2json(xmlSession));

    if (resSession.status === 200) {
        id = jsonSession.elements[0].elements[0].elements[0].elements[0].elements[0].text;
    } else {
        const err = jsonSession.elements[0].elements[0].elements[0].elements[1].elements[0].text;
        error = resSession.status + ' ' + resSession.statusText;
    }
    return { id, error };
}


async function getAlarmLines(tokenSOAP, sessionId, maxLines, order, target) {
    let url = 'http://localhost:22331/Central/AlarmServiceToken';
    let payload = getXML(tokenSOAP, sessionId, maxLines, order, target);
    var lines;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': 'http://videoos.net/2/CentralServerAlarmCommand/IAlarmCommandToken/GetAlarmLines',
        },
        body: payload
    }).then(async function (response) {
        let res = await response;
        lines = res;
    }).catch(function (error) {
        var msg = "Failed to Start Alarm Session: " + error;
        lines = msg;
    });
    return lines;
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

function startXML(tokenSOAP) {

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

function getXML(tokenSOAP, sessionId, maxLines, order, target) {
    var xml = '' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">' +
        ' <s:Body>' +
        '   <GetAlarmLines xmlns="http://videoos.net/2/CentralServerAlarmCommand">' +
        '     <token>' + tokenSOAP + '</token>' +
        '     <sessionId>' + sessionId + '</sessionId>' +
        '     <from>0</from>' +
        '     <maxCount>' + maxLines + '</maxCount>' +
        '     <filter xmlns:a="http://schemas.datacontract.org/2004/07/VideoOS.Platform.Proxy.Alarm" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
        '        <a:Conditions />' +
        '        <a:Orders>' +
        '           <a:OrderBy>' +
        '              <a:Order>' + order + '</a:Order>' +
        '              <a:Target>' + target + '</a:Target>' +
        '           </a:OrderBy>' +
        '        </a:Orders>' +
        '     </filter>' +
        '   </GetAlarmLines>' +
        ' </s:Body>' +
        '</s:Envelope>'

    return xml;
}

function lookup(obj, k) {
    for (var key in obj) {
        var value = obj[key];

        if (k == key) {
            return [k, value];
        }

        if (typeof (value) === "object" && !Array.isArray(value)) {
            var y = lookup(value, k);
            if (y && y[0] == k) return y;
        }
        if (Array.isArray(value)) {
            // for..in doesn't work the way you want on arrays in some browsers
            //
            for (var i = 0; i < value.length; ++i) {
                var x = lookup(value[i], k);
                if (x && x[0] == k) return x;
            }
        }
    }

    return null;
}


module.exports = { getAlarmList, getSessionId }
