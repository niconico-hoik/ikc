const { google } = require('googleapis')
const opn = require('opn')
const readline = require('readline')
const writeFile = require('util').promisify(require('fs').writeFile)
const { throws } = require('./gd.post.js')

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

Promise.resolve()
.then(() =>
  Object
  .entries({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI })
  .forEach(([ key, value ]) =>
    !value &&
    throws(`${key} is undefined`)
  )
)
.then(() =>
  opn(auth.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive'
    ]
  }))
)
.then(() =>
  new Promise((resolve) =>
    rl.question('Enter the code from that page here: ', resolve)
  )
)
.then(code =>
  auth
  .getToken(code)
  .then(({ tokens: { refresh_token } }) => ({
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    REFRESH_TOKEN: refresh_token
  }))
)
.then(envars =>
  writeFile(
    '.env',
    Object
    .keys(envars)
    .map(key => `${key}=${envars[key]}`)
    .join('\n')
  )
  .then(() =>
    console.log(`REFRESH_TOKEN: ${REFRESH_TOKEN} => ${envars.REFRESH_TOKEN}`)
  )
)
.then(() => rl.close())
.catch(err => {
  rl.close()
  console.error(err)
  process.exit(1)
})