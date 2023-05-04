//import axios from 'axios';

class Gateway {
    
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  //CRUD methods for EVENTS

  async getAllEvents(){


  }

  //CRUD methods for CAMERAS
  async getAllCameras(){

  }
  //CRUD methods for RULES

  async getAllRules(token){
    const url = this.serverUrl + '/API/rest/v1/cameras';
    var result = null;
    await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(async function(response) {
      let res = await response;
      result = res;
    }).catch(function(error) {
      let msg = 'Failed to retrieve rules - '+ error;
      console.log(msg);
    });
    return result;
  }
  
  async get(resource_plural, token) {
    const url = this.url(resource_plural);

    
      await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        /*paramsSerializer: params => {
          // dict {'param1': 'value1', 'param2': null} becomes query string 'param1=value1&param2'
          const queryString = Object.keys(params)
            .map(key => (params[key] === null ? key : `${key}=${params[key]}`))
            .join('&');
          return queryString;
        },*/
      }).then(async function (response) {
        await checkResponse(response);

        const json = await response.json();
        return json;
    }).catch(function (error) {
      console.error(error);
      throw error;
    });
  }

  async request(session, verb, url, token, params = {}, payload = '') {
    const tokenstring = `Bearer ${token}`;
    const headers = {
      Authorization: tokenstring,
    };
    const options = {
      method: verb.toLowerCase(),
      url,
      headers,
      paramsSerializer: params => {
        // dict {'param1': 'value1', 'param2': null} becomes query string 'param1=value1&param2'
        const queryString = Object.keys(params)
          .map(key => (params[key] === null ? key : `${key}=${params[key]}`))
          .join('&');
        return queryString;
      },
    };
    if (verb.toLowerCase() === 'get') {
      options.params = params;
    } else {
      options.data = payload;
    }
    try {
      const response = await session.request(options);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
