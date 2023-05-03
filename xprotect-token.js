//import {get_event, create_event, update_event, delete_event} from './event_api.js';

/*async function main(){
  const username = 'giova'; // Replace with an XProtect basic user with the XProtect Administrators role
  const password = '.Prova21.'; // Replace with password for basic user
  const serverUrl = 'https://panicucci-pc'; // Replace with the hostname of the management server, assuming that the API Gateway has been installed on the same host

  // First we need a session to ensure that we stay logged in
  const session = fetch.session();

  // Now authenticate using the identity provider and get access token
  const response = await get_token(session, username, password, serverUrl);
  if (response.status === 200) {
    const tokenResponse = await response.json();
    const access_token = tokenResponse.access_token; // The token that we'll use for RESTful API calls
    console.log(`IDP access token response:\n${JSON.stringify(tokenResponse)}\n\n`);

    // Create an API Gateway
    const api_gateway = new Gateway(serverUrl);

    // Demo of get user-defined event through the API Gateway
    await get_event(api_gateway, session, access_token);

    const response = api_gateway.get(session, 'cameras', access_token);  // Get all cameras
    if (response.status === 200) {
         const camerasArray = response.json().array;
         console.log(`Cameras:\n${JSON.stringify(camerasArray, null, 2)}\n\n`);
     } else {
         const error = response.error;
         console.log(error);
         return;
     }
  } else {
    const error = await response.json().error;
    console.log(error);
    return;
  }
}
*/

/*
//Security token have an expiry time, this function updates the token
async function refreshToken() {

  var refreshedToken = await getToken();
  if (token != null && token != refreshedToken) {
      token = refreshedToken;
  }

  var patchTokenData = {
      'token': token
  };

  await fetch(webRtcUrl + "/WebRTCSession/" + sessionId, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(patchTokenData)

  }).then(async function (response) {

      if (await checkResponseFromIdp(response)) {
          console.log('token updated successfully');
      }
      sessionData = await response.json();

  }).catch(function (error) {
      clearAnyRefreshTimers();
      var msg = "Failed to refresh token - " + error;
      console.log(msg);
      log(msg);
  });
}

async function getToken() {
  token = null;
  clearAnyRefreshTimers();

  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var idpUrl = apiGatewayUrl + "/IDP/connect/token";

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "password");
  urlencoded.append("username", username);
  urlencoded.append("password", password);
  urlencoded.append("client_id", "GrantValidatorClient");

  await fetch(idpUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: urlencoded,
  }).then(async function (response) {
      await checkResponseFromIdp(response);
      const json = await response.json();
      token = json["access_token"];

      setupRefreshTokenTimer(json["expires_in"]);
  }).catch(function (error) {
      var msg = "Failed to retrieve token - " + error;
      console.log(msg);
      log(msg);
  });

  return token;
}

//The token should be refreshed before it expires, this methods handles that
function setupRefreshTokenTimer(expiresInSeconds) {
  var refreshTokenIn = (expiresInSeconds - 60) * 1000; //expires_in is in second. We need milliseconds
  refreshTimerId = setTimeout(refreshToken, refreshTokenIn);
}

//The timer does not stop when connection closes. This methods stops any timers
function clearAnyRefreshTimers() {
  if (refreshTimerId) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
  }
}

async function checkResponseFromIdp(response) {
  if (!response.ok) {
      var errorInfo = await response.json();
      //errors from IDP will contain error description
      if (errorInfo.error_description) {
          errorInfo = errorInfo.error_description;
      }
      throw Error(errorInfo);
  }
  return true;
}
*/

var fetch = require('node-fetch');
//Get a bearer access token for the MIP VMS RESTful API gateway
async function getToken(username, password, serverUrl) {
  var token = null;
  var idpUrl = serverUrl + "/API/IDP/connect/token";

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "password");
  urlencoded.append("username", username);
  urlencoded.append("password", password);
  urlencoded.append("client_id", "GrantValidatorClient");

  await fetch(idpUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: urlencoded,
  }).then(async function (response) {
      let res = await response;
      token = res;
  }).catch(function (error) {
      var msg = "Failed to retrieve token - " + error;
      console.log(msg);
      return error;
  });

  return token;
}

module.exports = { getToken }