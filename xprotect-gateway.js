//import axios from 'axios';
var mqtt = require("mqtt")

class Gateway {

  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  //test subscribe mqtt broker
  subscribe(){
    const client = mqtt.connect("mqtt://localhost");
  
    client.subscribe('milestone/events');
  
    client.on('message', function(topic, message){
      console.log(topic, message);
    })
  }

  //CRUD methods for EVENTS

  async getAllEvents(token) {
    const url = this.serverUrl + '/API/rest/v1'
    var events = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      let res = await response;
      events = res;
    }).catch(function (error) {
      let msg = 'Failed to retrieve rules - ' + error;
      console.log(msg);
      events = msg;
    });
    return events;

  }

  //CRUD methods for CAMERAS
  async getAllCameras(token) {
    const url = this.serverUrl + '/API/rest/v1/cameras';
    var cam = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      let res = await response;
      cam = res;
    }).catch(function (error) {
      let msg = 'Failed to retrieve rules - ' + error;
      console.log(msg);
      cam = msg;
    });
    return cam;
  }

  async getCameraGroups(token) {
    const url = this.serverUrl + '/API/rest/v1/cameraGroups'
    var group = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      let res = await response;
      group = res;
    }).catch(function (error) {
      let msg = 'Failed to retrieve groups - ' + error
      group = msg;
    });
    return group;
  }

  //FIXME: non trovo id group giusto
  async addCamera(token, idGroup, camera) {
    const url = this.serverUrl + `/API/rest/v1/${idGroup}/cameras`
    const payload = {
      name: camera.name,
      description: camera.desc
    };

    var ok = null;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    }).then(async function (response) {
      let res = await response.json();
      ok = res; // reminder: status code 201
    }).catch(async function (err) {
      msg = 'Failed to add rule -' + err;
      ok = msg;
    })
    return ok;
  }


  //CRUD methods for RULES

  async getAllRules(token) {
    const url = this.serverUrl + '/API/rest/v1/rules'
    var rules = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      let res = await response;
      rules = res;
    }).catch(function (error) {
      let msg = 'Failed to retrieve rules - ' + error;
      console.log(msg);
      rules = msg;
    });
    return rules
  }

  //FIXME: capire formato input
  async addRule(token) {
    const url = this.serverUrl + '/API/rest/v1/rules'
    const payload = {
      "enabled": true,
      "name": "Default Start Audio Feed Rule",
      "description": "Rule may have a long description",
      "startRuleType": "TimeInterval",
      "stopRuleType": "TimeInterval",
      "always": true,
      "withinTimeProfile": false,
      "outsideTimeProfile": false,
      "timeOfDayBetween": false,
      "daysOfWeek": false,
      "startActions": "StartFeed",
      "stopActions": "StopFeed",
      "relations": {
        "self": {
          "type": "rules",
          "id": "43609ca5-bfdd-4238-88ff-686b6657138f"
        }
      }
    };

    var ok = null;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    }).then(async function (response) {
      let res = await response;
      ok = res; // reminder: status code 201
    }).catch(function (err) {
      msg = 'Failed to add rule -' + err;
      ok = msg;
    })
    return ok;
  }

  async deleteRule(token, idRule) {
    const url = this.serverUrl + '/API/rest/v1/rules/' + idRule;
    var ok = null;

    await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      let res = await response.json();
      ok = res;
    }).catch(function (err) {
      msg = 'Failed to delete rule -' + err;
      ok = msg;
    })
    return ok;
  }

  url(resource_plural, obj_id = null, child_item_type = null) {
    let result = `${this.serverUrl}/api/rest/v1/${resource_plural}`;
    if (obj_id) {
      result += `/${obj_id}`;
    }
    if (child_item_type) {
      result += `/${child_item_type}`;
    }
    return result;
  }
}

module.exports = Gateway;
