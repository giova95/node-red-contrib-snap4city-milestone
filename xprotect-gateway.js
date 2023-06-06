var fetch = require('node-fetch');
class Gateway {

  constructor(serverUrl) {
    this.serverUrl = 'http://'+serverUrl;
  }

  //API Get for EVENTS
  async getAllEvents(token) {
    const url = this.serverUrl + '/API/rest/v1/analyticsEvents';
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
      let msg = 'Failed to retrieve event - ' + error;
      console.log(msg);
      events = msg;
    });
    return events;
  }

  //API Get for CAMERAS
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

  //API Get for RULES
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
}

module.exports = Gateway;
