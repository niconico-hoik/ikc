const { google } = require('googleapis')
const { createReadStream } = require('fs')
const pathexists = require('path-exists')
const { throws, assertsObj } = require('./gd.util.js')

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env
const zippath = '.dist.zip'
const name = 'niconico-hoik-media.zip'
const mimeType = 'application/zip'

const createAuth = (client_id, client_secret, redirect_uri, refresh_token) => {
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uri)
  auth.setCredentials({ refresh_token })
  return auth
}

Promise.resolve()
.then(() =>
  assertsObj({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN })
)
.then(() =>
  pathexists(zippath).then(isExist =>
    !isExist
    ? throws(`not exist ${zippath}`)
    : google.drive({ version: 'v3', auth: createAuth(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN) })
  )
)
.then(({ files: client }) =>
  Promise.resolve()
  .then(() =>
    client
    .list({ q: `name = '${name}' and mimeType = '${mimeType}'` })
    .then(({ data: { files } }) =>
      Promise.all(files.map(({ id: fileId }) =>
        client
        .delete({ fileId })
        .then(() => console.log(`deleted: ${fileId}`))
      ))
    )
  )
  .then(() =>
    client
    .create({ requestBody: { name, mimeType }, media: { body: createReadStream(zippath) } })
    .then(({ data: { id } }) => console.log(`created: ${id}`))
  )
)
.catch(err => {
  console.error(err)
  process.exit(1)
})