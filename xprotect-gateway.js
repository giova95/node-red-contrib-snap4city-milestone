const fetch = require('node-fetch');
class Gateway {

  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  //API Get for EVENTS
  async getAllEvents(token) {
    const url = this.serverUrl + '/API/rest/v1/analyticsEvents';
    let events = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      const res = await response;
      events = res;
    }).catch(function (error) {
      const msg = 'Failed to retrieve event - ' + error;
      events = msg;
    });
    return events;
  }

  //API Get for CAMERAS
  async getAllCameras(token) {
    const url = this.serverUrl + '/API/rest/v1/cameras';
    let cam = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      const res = await response;
      cam = res;
    }).catch(function (error) {
      const msg = 'Failed to retrieve rules - ' + error;
      cam = msg;
    });
    return cam;
  }

  async getCameraGroups(token) {
    const url = this.serverUrl + '/API/rest/v1/cameraGroups'
    let group = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      const res = await response;
      group = res;
    }).catch(function (error) {
      const msg = 'Failed to retrieve groups - ' + error
      group = msg;
    });
    return group;
  }

  //API Get for RULES
  async getAllRules(token) {
    const url = this.serverUrl + '/API/rest/v1/rules'
    let rules = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function (response) {
      const res = await response;
      rules = res;
    }).catch(function (error) {
      const msg = 'Failed to retrieve rules - ' + error;
      rules = msg;
    });
    return rules
  }
}

module.exports = Gateway;
