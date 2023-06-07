const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const { xml2json } = require('xml-js');
const Gateway = require('./xprotect-gateway.js');

//functions to use in node-red blocks
module.exports = {
    //Return JSON of array where each array contains an alarm line
    getAlarmList: async function (tokenSOAP, maxLines, order, target) {
        let list;
        const { sessionId, error } = await startAlarmSession(tokenSOAP);
        if (typeof sessionId !== undefined) {
            const resSession = await getAlarmLines(tokenSOAP, sessionId, maxLines, order, target);
            const xmlList = await resSession.text();
            const jsonList = JSON.parse(xml2json(xmlList));

            if (resSession.status !== 200) {
                const err = jsonList.elements[0].elements[0].elements[0].elements[1].elements[0].text;
                const error = resSession.status + ' ' + resSession.statusText;
                list = {
                    "error": error,
                    "description": err
                };
            } else {
                list = [];
                const alarm = new Map();
                const alarms = jsonList.elements[0].elements[0].elements[0].elements[0].elements;
                for (let k = 0; k < alarms.length; k++) {
                    const line = lookup(alarms[k], 'elements')[1];
                    for (let i = 0; i < line.length; i++) {
                        if (line[i].hasOwnProperty('elements')) {
                            alarm.set((lookup(line[i], 'name')[1].substring(2)), lookup(line[i], 'elements')[1][0].text);
                        }
                    }
                    list.push(Object.fromEntries(alarm));
                }
            }
        } else {
            list = error;
        }
        return list;
    },

    //Get access token for the MIP VMS RESTful API gateway.
    getTokenREST: async function (username, password, serverUrl) {
        let token = null;
        const idpUrl = serverUrl + "/API/IDP/connect/token";

        const urlencoded = new URLSearchParams();
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
            const res = await response;
            token = res;
        }).catch(function (error) {
            const msg = "Failed to retrieve token - " + error;
            token = msg;
        });

        return token;
    },

    //Get access token for the MIPS VMS SOAP service
    getTokenSOAP: async function (username, password, serverUrl) {
        let token = null;
        const idpUrl = serverUrl + "/ManagementServer/ServerCommandService.svc";
        const payload = loginXML();
        const auth = Buffer.from(username + ":" + password).toString('base64')
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        await fetch(idpUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'SOAPAction': 'http://videoos.net/2/XProtectCSServerCommand/IServerCommandService/Login',
                'Authorization': `Basic ${auth}`
            },
            body: payload,
            agent: httpsAgent
        }).then(async function (response) {
            const res = await response;
            token = res;
        }).catch(function (error) {
            const msg = "Failed to retrieve token: " + error;
            token = msg;
        });
        return token;
    },

    //send and trigger an Analytic Event through an XML file
    sendXML: async function (access_token, guid, name, hostname, port, serverUrl) {
        let checkName = false;
        let events;
        let xmlres = null;
        const api_gateway = new Gateway(serverUrl);

        //check if exist an Analytic event with this name
        const res = await api_gateway.getAllEvents(access_token);
        if (res.status === 200) {
            events = await res.json();
        }
        for (let i = 0; i < events.array.length; i++) {
            if (events.array[i].displayName === name) {
                checkName = true;
            }
        }
        if (checkName) {
            const url = "http://" + hostname + ":" + port;
            const xml = eventXML(guid, name);
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml'
                },
                body: xml
            }).then(async function (response) {
                const res = await response;
                xmlres = res;
            }).catch(function (err) {
                const msg = "Connection error: " + err
                xmlres = msg;
            });
        } else {
            xmlres = "Connection error: the event '" + name + "' doesn't exist"
        }
        return xmlres;
    },
};

//utility functions useful for methods above
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
        error = resSession.status + ' ' + resSession.statusText + ' ' + err;
    }
    return { id, error };
}

async function getAlarmLines(tokenSOAP, sessionId, maxLines, order, target) {
    const url = 'http://localhost:22331/Central/AlarmServiceToken';
    const payload = getXML(tokenSOAP, sessionId, maxLines, order, target);
    let lines;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': 'http://videoos.net/2/CentralServerAlarmCommand/IAlarmCommandToken/GetAlarmLines',
        },
        body: payload
    }).then(async function (response) {
        const res = await response;
        lines = res;
    }).catch(function (error) {
        const msg = "Failed to Start Alarm Session: " + error;
        lines = msg;
    });
    return lines;
}

async function getSessionId(tokenSOAP) {
    let sessionId;
    const url = 'http://localhost:22331/Central/AlarmServiceToken';
    const payload = startXML(tokenSOAP);

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': 'http://videoos.net/2/CentralServerAlarmCommand/IAlarmCommandToken/StartAlarmLineSession',
        },
        body: payload
    }).then(async function (response) {
        const res = await response;
        sessionId = res;
    }).catch(function (error) {
        const msg = "Failed to Start Alarm Session: " + error;
        sessionId = msg;
    });
    return sessionId;
}

function startXML(tokenSOAP) {

    const xml = '' +
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
    const xml = '' +
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
function eventXML(guid, name) {
    const timestamp = new Date().toISOString();

    const xml = '' +
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<AnalyticsEvent xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:milestone-systems">' +
        '   <EventHeader>' +
        '       <ID>00000000-0000-0000-0000-000000000000</ID>' +
        '       <Timestamp>' + timestamp + '</Timestamp>' +
        '       <Type>MyType</Type>' +
        '       <!-- Insert Event Message here -->' +
        '       <Message>' + name + '</Message>' +
        '       <CustomTag>TagFromXML</CustomTag>' +
        '       <Source>' +
        '           <!-- Insert camera URI here, if you not have the GUID. -->' +
        '           <!-- (For multichannel devices, URI may contain channel number after ,) -->' +
        '           <!-- <Name>example192.168.0.199</Name> -->' +
        '           <FQID>' +
        '               <!-- Insert camera GUID here, if you have it -->' +
        '               <ObjectId>' + guid + '</ObjectId>' +
        '           </FQID>' +
        '       </Source>' +
        '   </EventHeader>' +
        '   <Description>' +
        '       Analytics event description' +
        '   </Description>' +
        '   <Location>' +
        '       Event location 1' +
        '   </Location>' +
        '   <Vendor>' +
        '       <Name>My Smart Video</Name>' +
        '   </Vendor>' +
        '</AnalyticsEvent>'

    return xml;
}

function loginXML() {
    const istanceID = uuidv4();
    const xml = '' +
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xpr="http://videoos.net/2/XProtectCSServerCommand">' +
        '<soapenv:Header/>' +
        ' <soapenv:Body>' +
        '   <xpr:Login>' +
        '     <xpr:instanceId>' + istanceID + '</xpr:instanceId>' +
        '   </xpr:Login>' +
        ' </soapenv:Body>' +
        '</soapenv:Envelope>'
    return xml;
}

function lookup(obj, k) {
    for (let key in obj) {
        let value = obj[key];

        if (k == key) {
            return [k, value];
        }

        if (typeof (value) === "object" && !Array.isArray(value)) {
            let y = lookup(value, k);
            if (y && y[0] == k) return y;
        }
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; ++i) {
                let x = lookup(value[i], k);
                if (x && x[0] == k) return x;
            }
        }
    }

    return null;
}