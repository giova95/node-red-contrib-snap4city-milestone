var fetch = require('node-fetch');
//Get a bearer access token for the MIP VMS RESTful API gateway.
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
      token = msg;
  });

  return token;
}

module.exports = {getToken}