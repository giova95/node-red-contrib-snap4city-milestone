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

//Get a bearer access token for the MIP VMS RESTful API gateway.
async function get_token(username, password, serverUrl) {
    const url = `${serverUrl}/API/IDP/connect/token`;
    const payload = {
      grant_type: 'password',
      username:username,
      password: password,
      client_id: 'GrantValidatorClient'
    }
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: JSON.stringify(payload),
    });
  
    const data = await response.json();
    return data;
}

module.exports = { get_token }