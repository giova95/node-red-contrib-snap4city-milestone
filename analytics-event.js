/*function sendXMLws(analyticXml, guid, payload, hostname, port) {


    ws = new WebSocket('ws://' + hostname + ':' + port);
    ws.onopen = function () {
        console.log('Web Socket connected success');
        try {
            ws.send(analyticXml);
        } catch (error) {
            let msg = "Error sending analytics event to event server: " + error.message;
            console.error(msg);
            return msg;
        }
    };

    ws.onerror = function (event) {
        let msg = 'Web Socket error:' + event.error;
        console.log(msg);
        return msg;
    };

    ws.onclose = function (event) {
        let msg = "Socket closed with code " + event.code + " and reason " + event.reason;
        console.log(msg);
    }
}*/

function sendXMLhttp(guid, name, hostaname, port){

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            return xhr.responseText;
        }
    }

    xhr.open("POST","http://" + hostaname + ":" + port, true);
    xhr.setRequestHeader('Content-Type', 'text/xml');
    var xml = createXML(guid, name);
    xhr.send(escapeXml(xml));
}

function createXML(guid, name){
    let timestamp = new Date();

    var xml = ''+
    '<?xml version="1.0" encoding="utf-8"?>'+
    '<AnalyticsEvent xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:milestone-systems">'+
    '   <EventHeader>'+
    '       <ID>00000000-0000-0000-0000-000000000000</ID>'+
    '       <Timestamp>'+ timestamp +'</Timestamp>'+
    '       <Type>MyType</Type>'+
    '       <!-- Insert Event Message here -->'+
    '       <Message>'+ name +'</Message>'+
    '       <CustomTag>TagFromXML</CustomTag>'+
    '       <Source>'+
    '           <!-- Insert camera URI here, if you not have the GUID. -->'+
    '           <!-- (For multichannel devices, URI may contain channel number after ,) -->'+
    '           <!-- <Name>example192.168.0.199</Name> -->'+
    '           <FQID>'+
    '               <!-- Insert camera GUID here, if you have it -->'+
    '               <ObjectId>'+ guid +'</ObjectId>'+
    '           </FQID>'+
    '       </Source>'+
    '   </EventHeader>'+
    '   <Description>'+
    '       Analytics event description'+
    '   </Description>'+
    '   <Location>'+
    '       Event location 1'+
    '   </Location>'+
    '   <Vendor>'+
    '       <Name>My Smart Video</Name>'+
    '   </Vendor>'+
    '</AnalyticsEvent>'
    
    return xml;
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

module.exports = { sendXMLhttp };