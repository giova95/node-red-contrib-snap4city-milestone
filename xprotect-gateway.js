import axios from 'axios';

class Gateway {
    
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  async get(session, resource_plural, token) {
    const url = this.url(resource_plural);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await session.request({
        method: 'get',
        url,
        headers,
        paramsSerializer: params => {
          // dict {'param1': 'value1', 'param2': null} becomes query string 'param1=value1&param2'
          const queryString = Object.keys(params)
            .map(key => (params[key] === null ? key : `${key}=${params[key]}`))
            .join('&');
          return queryString;
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
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

export default Gateway;
