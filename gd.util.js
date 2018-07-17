const { google } = require('googleapis')

const throws = (message) => { throw new Error(message) }

const assertsObj = (obj) =>
  Object
  .entries(obj)
  .forEach(([ key, value ]) =>
    !value &&
    throws(`${key} is undefined`)
  )

const createAuth = (client_id, client_secret, redirect_uri, refresh_token) => {
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uri)
  auth.setCredentials({ refresh_token })
  return auth
}

const createClientV3 = (client_id, client_secret, redirect_uri, refresh_token) =>
  google
  .drive({
    version: 'v3',
    auth: createAuth(client_id, client_secret, redirect_uri, refresh_token)
  })

module.exports = { throws, assertsObj, createAuth, createClientV3 }