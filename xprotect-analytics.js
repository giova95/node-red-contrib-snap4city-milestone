var fetch = require('node-fetch');
var Gateway = require('./xprotect-gateway.js');

var api_gateway = new Gateway('http://panicucci-pc');


async function sendXML(access_token, guid, name, hostname, port) {
    var checkName = false;
    var events;
    var xmlres = null;

    //check if exist an Analytic event with this name
    let res = await api_gateway.getAllEvents(access_token);
    if (res.status === 200) {
        events = await res.json();
    }
    for (let i = 0; i < events.array.length; i++) {
        if (events.array[i].displayName === name) {
            checkName = true;
        }
    }
    if (checkName) {
        var url = "http://" + hostname + ":" + port;
        var xml = createXML(guid, name);
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: xml
        }).then(async function (response) {
            let res = await response;
            xmlres = res;
        }).catch(function (err) {
            var msg = "Connection error: " + err
            xmlres = msg;
        });
    } else {
        xmlres = "Connection error: the event '" + name + "' doesn't exist"
    }
    return xmlres;
}

function createXML(guid, name) {
    let timestamp = new Date().toISOString();

    var xml = '' +
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

module.exports = { sendXML };