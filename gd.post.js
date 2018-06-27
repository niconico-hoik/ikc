const { google } = require('googleapis')
const { createReadStream } = require('fs')
const pathexists = require('path-exists')

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env
const zippath = '.dist.zip'
const name = 'niconico-hoik-media.zip'
const mimeType = 'application/zip'

Promise.resolve()
.then(() =>
  Object
  .entries({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN })
  .forEach(([ key, value ]) =>
    !value &&
    throws(`${key} is undefined`)
  )
)
.then(() =>
  pathexists(zippath).then(isExist =>
    !isExist
    ? throws(`not exist ${zippath}`)
    : google.drive({ version: 'v3', auth: createAuth(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN) })
  )
)
.then(({ files }) =>
  Promise.resolve()
  .then(() =>
    files
    .list({ q: `name = '${name}' and mimeType = '${mimeType}'` })
    .then(({ data }) => Promise.all(data.files.map(file =>
      files
      .delete({ fileId: file.id })
      .then(() => console.log(`deleted: ${file.id}`))
    )))
  )
  .then(() =>
    files
    .create({
      requestBody: { name, mimeType },
      media: { body: createReadStream(zippath) }
    })
    .then(({ data: { id } }) => console.log(`created: ${id}`))
  )
)
.catch(err => {
  console.error(err)
  process.exit(1)
})

function throws(message) {
  throw new Error(message)
}

function createAuth(client_id, client_secret, redirect_uri, refresh_token) {
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uri)
  auth.setCredentials({ refresh_token })
  return auth
}

module.exports = { throws }